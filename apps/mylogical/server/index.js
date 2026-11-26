// Servidor do MyLogical App: entrega o app (PWA) e a API que conversa com o Firebird.
// Roda no PC que enxerga o banco; o celular acessa pelo Wi-Fi da mesma rede.
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync, appendFileSync, statSync } from 'node:fs';
import { config, validarConfig } from './config.js';
import * as db from './db.js';

const erros = validarConfig();
if (erros.length) {
  console.error('\n  Não dá para iniciar ainda:\n');
  for (const e of erros) console.error('   - ' + e);
  console.error('\n  Edite o arquivo .env na pasta do app e rode de novo.\n');
  process.exit(1);
}
mkdirSync(config.dataDir, { recursive: true });

// ───────────────────────── Sessões (login por PIN) ─────────────────────────

const SESSAO_DIAS = 30;
const sessoes = new Map(); // token -> expira em (ms)
const tentativas = new Map(); // ip -> { falhas, bloqueadoAte }
const hash = (s) => crypto.createHash('sha256').update(String(s)).digest();

function lerCookie(req, nome) {
  for (const parte of String(req.headers.cookie || '').split(';')) {
    const [k, ...v] = parte.trim().split('=');
    if (k === nome) return decodeURIComponent(v.join('='));
  }
  return null;
}

function logado(req) {
  const t = lerCookie(req, 'ml_sessao');
  const exp = t && sessoes.get(t);
  if (!exp) return false;
  if (exp < Date.now()) {
    sessoes.delete(t);
    return false;
  }
  return true;
}

function login(req, res, corpo) {
  const ip = req.socket.remoteAddress;
  const t = tentativas.get(ip) || { falhas: 0, bloqueadoAte: 0 };
  if (t.bloqueadoAte > Date.now()) {
    const s = Math.ceil((t.bloqueadoAte - Date.now()) / 1000);
    return json(res, 429, { erro: `Muitas tentativas. Aguarde ${s} segundos.` });
  }
  const ok = crypto.timingSafeEqual(hash(corpo?.pin ?? ''), hash(config.pin));
  if (!ok) {
    t.falhas += 1;
    if (t.falhas >= 5) {
      t.bloqueadoAte = Date.now() + 60_000 * Math.min(2 ** (t.falhas - 5), 30);
    }
    tentativas.set(ip, t);
    return json(res, 401, { erro: 'PIN incorreto.' });
  }
  tentativas.delete(ip);
  const token = crypto.randomBytes(32).toString('base64url');
  sessoes.set(token, Date.now() + SESSAO_DIAS * 86_400_000);
  const seguro = req.socket.encrypted ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `ml_sessao=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSAO_DIAS * 86400}${seguro}`,
  );
  json(res, 200, { ok: true });
}

// ───────────────────────── Histórico de alterações ─────────────────────────

function registrar(req, acao, tabela, dados) {
  const linha = JSON.stringify({
    quando: new Date().toISOString(),
    ip: req.socket.remoteAddress,
    acao,
    tabela,
    ...dados,
  });
  appendFileSync(path.join(config.dataDir, 'alteracoes.log'), linha + '\n', 'utf8');
}

// ───────────────────────── Utilitários HTTP ─────────────────────────

function json(res, status, obj) {
  const corpo = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(corpo);
}

async function lerCorpo(req) {
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
    throw new db.ErroApp(415, 'Envie os dados como JSON.');
  }
  let tam = 0;
  const partes = [];
  for await (const p of req) {
    tam += p.length;
    if (tam > 2_000_000) throw new db.ErroApp(413, 'Dados grandes demais.');
    partes.push(p);
  }
  try {
    return JSON.parse(Buffer.concat(partes).toString('utf8') || '{}');
  } catch {
    throw new db.ErroApp(400, 'JSON inválido.');
  }
}

function lerChave(url) {
  try {
    return JSON.parse(url.searchParams.get('chave') || '{}');
  } catch {
    throw new db.ErroApp(400, 'Chave inválida.');
  }
}

function traduzirErro(e) {
  if (e instanceof db.ErroApp) return { status: e.status, msg: e.message };
  const m = String(e?.message || e);
  if (/ECONNREFUSED|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH/.test(m))
    return { status: 503, msg: `Não consegui conectar no servidor do banco (${config.fb.host}:${config.fb.port}). O PC está na rede da empresa?` };
  if (/password|user name|login|authentication|Your user name and password/i.test(m))
    return { status: 503, msg: 'O Firebird recusou usuário/senha. Confira FB_USER e FB_PASSWORD no .env.' };
  if (/I\/O error|database.*not found|unavailable database/i.test(m))
    return { status: 503, msg: `Banco "${config.fb.database}" não encontrado no servidor. Confira FB_DATABASE no .env.` };
  if (/transliterat/i.test(m))
    return { status: 500, msg: 'Problema de acentuação. Troque FB_CHARSET no .env para WIN1252 e reinicie.' };
  if (/lock conflict|deadlock|update conflicts/i.test(m))
    return { status: 409, msg: 'Este registro está sendo alterado por outra pessoa agora. Tente de novo em instantes.' };
  if (/violation of PRIMARY or UNIQUE/i.test(m)) return { status: 409, msg: 'Já existe um registro com essa chave.' };
  if (/FOREIGN KEY/i.test(m)) return { status: 409, msg: 'Não é possível: o registro está ligado a outros dados (chave estrangeira).' };
  if (/validation error|null/i.test(m)) return { status: 400, msg: 'Faltou preencher um campo obrigatório ou há um valor inválido. ' + m.split('\n')[0] };
  return { status: 500, msg: m.split('\n')[0] };
}

// ───────────────────────── API ─────────────────────────

async function api(req, res, url) {
  const p = url.pathname;
  const m = req.method;

  if (p === '/api/login' && m === 'POST') return login(req, res, await lerCorpo(req));
  if (p === '/api/logout' && m === 'POST') {
    const t = lerCookie(req, 'ml_sessao');
    if (t) sessoes.delete(t);
    res.setHeader('Set-Cookie', 'ml_sessao=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    return json(res, 200, { ok: true });
  }
  if (!logado(req)) return json(res, 401, { erro: 'Entre com o PIN.', login: true });

  if (p === '/api/status' && m === 'GET') {
    const s = await db.status();
    return json(res, 200, { ...s, banco: config.fb.database, servidor: config.fb.host, gravacao: config.allowWrite });
  }
  if (p === '/api/atualizar-estrutura' && m === 'POST') {
    db.limparCache();
    return json(res, 200, { ok: true });
  }
  if (p === '/api/tabelas' && m === 'GET') return json(res, 200, await db.listarTabelas());

  const rota = p.match(/^\/api\/tabelas\/([^/]+)(\/[a-z-]+)?$/);
  if (!rota) return json(res, 404, { erro: 'Rota não encontrada.' });
  const tabela = decodeURIComponent(rota[1]);
  const acao = rota[2] || '';

  if (acao === '' && m === 'GET') {
    const est = await db.estrutura(tabela);
    return json(res, 200, { ...est, editavel: est.editavel && config.allowWrite });
  }
  if (acao === '/contar' && m === 'GET') return json(res, 200, { total: await db.contar(tabela) });

  if (acao === '/linhas' && m === 'GET') {
    let filtros = {};
    try {
      filtros = JSON.parse(url.searchParams.get('filtros') || '{}');
    } catch {
      throw new db.ErroApp(400, 'Filtros inválidos.');
    }
    return json(
      res,
      200,
      await db.listarLinhas(tabela, {
        busca: url.searchParams.get('busca') || '',
        filtros,
        ordem: url.searchParams.get('ordem') || undefined,
        desc: url.searchParams.get('desc') === '1',
        pagina: url.searchParams.get('pagina'),
        porPagina: url.searchParams.get('porPagina'),
      }),
    );
  }

  if (acao === '/linha' && m === 'GET') return json(res, 200, await db.lerLinha(tabela, lerChave(url)));

  if (acao === '/csv' && m === 'GET') return exportarCsv(res, tabela);

  if (acao === '/linha' && ['POST', 'PUT', 'DELETE'].includes(m)) {
    if (!config.allowWrite)
      return json(res, 403, { erro: 'Gravação desligada. Para ligar, mude ALLOW_WRITE=sim no .env e reinicie o app.' });
    const corpo = m === 'DELETE' ? {} : await lerCorpo(req);
    if (m === 'POST') {
      const chave = await db.inserir(tabela, corpo.valores || {});
      registrar(req, 'inclusao', tabela, { chave, valores: corpo.valores });
      return json(res, 201, { chave });
    }
    const chave = lerChave(url);
    if (m === 'PUT') {
      const { antes } = await db.atualizar(tabela, chave, corpo.valores || {});
      registrar(req, 'alteracao', tabela, { chave, antes, depois: corpo.valores });
      return json(res, 200, { ok: true });
    }
    const { antes } = await db.apagar(tabela, chave);
    registrar(req, 'exclusao', tabela, { chave, antes });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { erro: 'Método não permitido.' });
}

async function exportarCsv(res, tabela) {
  const est = await db.estrutura(tabela);
  const nomeArq = est.nome.replace(/[^\w.-]/g, '_') + '.csv';
  const celula = (v) => {
    if (v === null || v === undefined) return '';
    let s = typeof v === 'number' ? String(v).replace('.', ',') : String(v);
    if (/^[=+\-@\t\r]/.test(s) && typeof v !== 'number') s = "'" + s; // evita fórmulas no Excel
    return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  let cabecalho = false;
  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${nomeArq}"`,
    'Cache-Control': 'no-store',
  });
  res.write('﻿'); // BOM: Excel abre com acentos certos
  const cols = est.colunas.filter((c) => !['binary', 'other', 'memo'].includes(c.tipo));
  res.write(cols.map((c) => celula(c.nome)).join(';') + '\r\n');
  cabecalho = true;
  try {
    await db.percorrer(tabela, (linha) => {
      res.write(cols.map((c) => celula(linha[c.nome])).join(';') + '\r\n');
    });
  } catch (e) {
    if (cabecalho) res.write('\r\nERRO NA EXPORTAÇÃO: ' + traduzirErro(e).msg + '\r\n');
  }
  res.end();
}

// ───────────────────────── Arquivos do app ─────────────────────────

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function estatico(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const arq = path.normalize(path.join(config.publicDir, rel));
  if (!arq.startsWith(config.publicDir + path.sep) || !existsSync(arq) || !statSync(arq).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Não encontrado');
  }
  const ext = path.extname(arq);
  res.writeHead(200, {
    'Content-Type': TIPOS[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.png' ? 'public, max-age=604800' : 'no-cache',
  });
  createReadStream(arq).pipe(res);
}

// ───────────────────────── Servidor ─────────────────────────

async function tratar(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; manifest-src 'self'",
  );
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else if (req.method === 'GET' || req.method === 'HEAD') estatico(req, res, url);
    else json(res, 405, { erro: 'Método não permitido.' });
  } catch (e) {
    const { status, msg } = traduzirErro(e);
    if (status >= 500) console.error(new Date().toLocaleString('pt-BR'), e?.message || e);
    if (!res.headersSent) json(res, status, { erro: msg });
    else res.end();
  }
}

function enderecosLocais() {
  const lista = [];
  for (const ifs of Object.values(os.networkInterfaces()))
    for (const i of ifs || []) if (i.family === 'IPv4' && !i.internal) lista.push(i.address);
  return lista;
}

http.createServer(tratar).listen(config.port, '0.0.0.0', () => {
  console.log('\n  MyLogical App rodando\n');
  console.log(`   Neste PC:      http://localhost:${config.port}`);
  for (const ip of enderecosLocais()) console.log(`   No celular:    http://${ip}:${config.port}`);
  console.log(`\n   Banco:         ${config.fb.host}:${config.fb.port} / ${config.fb.database}`);
  console.log(`   Gravação:      ${config.allowWrite ? 'LIGADA (alterações vão para o banco do MyLogical)' : 'desligada (só consulta)'}`);
  console.log(`   Histórico:     ${path.join(config.dataDir, 'alteracoes.log')}`);
});

const cert = path.join(config.certDir, 'cert.pem');
const key = path.join(config.certDir, 'key.pem');
if (existsSync(cert) && existsSync(key)) {
  https.createServer({ cert: readFileSync(cert), key: readFileSync(key) }, tratar).listen(config.httpsPort, '0.0.0.0', () => {
    for (const ip of enderecosLocais()) console.log(`   HTTPS:         https://${ip}:${config.httpsPort}`);
  });
}

db.status()
  .then((s) => console.log(`   Conexão:       OK (Firebird ${s.versao})\n\n  Deixe esta janela aberta enquanto usar o app.\n`))
  .catch((e) => console.log(`   Conexão:       FALHOU - ${traduzirErro(e).msg}\n`));

for (const sinal of ['SIGINT', 'SIGTERM'])
  process.on(sinal, async () => {
    await db.fecharConexoes();
    process.exit(0);
  });
