// Acesso ao banco Firebird do MyLogical: conexão, leitura da estrutura
// (tabelas, colunas, chaves) e consultas/gravações genéricas e seguras.
import Firebird from 'node-firebird';
import { config } from './config.js';

const pool = Firebird.pool(5, {
  host: config.fb.host,
  port: config.fb.port,
  database: config.fb.database,
  user: config.fb.user,
  password: config.fb.password,
  role: config.fb.role,
  encoding: config.fb.encoding,
  lowercase_keys: false,
  blobAsText: true,
  numericMode: 'safe',
  retryConnectionInterval: 1000,
});

async function comBanco(fn) {
  const db = await pool.getAsync();
  try {
    return await fn(db);
  } finally {
    db.detach();
  }
}

async function comTransacao(fn) {
  return comBanco(async (db) => {
    const tx = await db.transactionAsync(Firebird.ISOLATION_READ_COMMITTED);
    try {
      const r = await fn(tx);
      await tx.commitAsync();
      return r;
    } catch (e) {
      await tx.rollbackAsync().catch(() => {});
      throw e;
    }
  });
}

export class ErroApp extends Error {
  constructor(status, msg) {
    super(msg);
    this.status = status;
  }
}

/** Coloca o nome entre aspas do Firebird ("NOME"), escapando aspas internas. */
const q = (nome) => '"' + String(nome).replace(/"/g, '""') + '"';

// ───────────────────────── Estrutura do banco ─────────────────────────

const TIPOS = {
  7: 'int', 8: 'int', 16: 'int', 26: 'int',
  10: 'float', 27: 'float', 24: 'float', 25: 'float',
  12: 'date', 13: 'time', 28: 'time',
  35: 'timestamp', 29: 'timestamp',
  14: 'text', 37: 'text', 40: 'text',
  23: 'bool',
  261: 'blob',
};

function tipoDaColuna(c) {
  let tipo = TIPOS[c.TIPO] ?? 'other';
  if (tipo === 'int' && c.ESCALA < 0) tipo = 'decimal';
  if (tipo === 'blob') tipo = c.SUBTIPO === 1 ? 'memo' : 'binary';
  return tipo;
}

let cacheTabelas = null;
const cacheEstrutura = new Map();

export function limparCache() {
  cacheTabelas = null;
  cacheEstrutura.clear();
}

export async function listarTabelas() {
  if (cacheTabelas) return cacheTabelas;
  const rows = await comBanco((db) =>
    db.queryAsync(`
      SELECT TRIM(r.RDB$RELATION_NAME) AS NOME,
             CASE WHEN r.RDB$VIEW_BLR IS NULL THEN 0 ELSE 1 END AS VISAO
      FROM RDB$RELATIONS r
      WHERE COALESCE(r.RDB$SYSTEM_FLAG, 0) = 0
      ORDER BY 1`),
  );
  cacheTabelas = rows.map((r) => ({ nome: r.NOME, visao: r.VISAO === 1 }));
  return cacheTabelas;
}

export async function estrutura(tabela) {
  const nome = String(tabela);
  if (cacheEstrutura.has(nome)) return cacheEstrutura.get(nome);
  const info = (await listarTabelas()).find((t) => t.nome === nome);
  if (!info) throw new ErroApp(404, `Tabela ${nome} não existe no banco.`);

  const est = await comBanco(async (db) => {
    const cols = await db.queryAsync(
      `SELECT TRIM(rf.RDB$FIELD_NAME) AS NOME,
              f.RDB$FIELD_TYPE AS TIPO,
              f.RDB$FIELD_SUB_TYPE AS SUBTIPO,
              f.RDB$FIELD_SCALE AS ESCALA,
              COALESCE(f.RDB$CHARACTER_LENGTH, f.RDB$FIELD_LENGTH) AS TAMANHO,
              COALESCE(rf.RDB$NULL_FLAG, f.RDB$NULL_FLAG, 0) AS OBRIGATORIO,
              CASE WHEN f.RDB$COMPUTED_BLR IS NULL THEN 0 ELSE 1 END AS CALCULADO,
              CASE WHEN rf.RDB$DEFAULT_SOURCE IS NULL AND f.RDB$DEFAULT_SOURCE IS NULL THEN 0 ELSE 1 END AS TEM_PADRAO
       FROM RDB$RELATION_FIELDS rf
       JOIN RDB$FIELDS f ON f.RDB$FIELD_NAME = rf.RDB$FIELD_SOURCE
       WHERE rf.RDB$RELATION_NAME = ?
       ORDER BY rf.RDB$FIELD_POSITION`,
      [nome],
    );

    // Chave primária; se não houver, usa uma UNIQUE cujas colunas sejam todas obrigatórias.
    const restricoes = await db.queryAsync(
      `SELECT TRIM(rc.RDB$CONSTRAINT_NAME) AS RESTRICAO,
              TRIM(rc.RDB$CONSTRAINT_TYPE) AS TIPO,
              TRIM(s.RDB$FIELD_NAME) AS COLUNA
       FROM RDB$RELATION_CONSTRAINTS rc
       JOIN RDB$INDEX_SEGMENTS s ON s.RDB$INDEX_NAME = rc.RDB$INDEX_NAME
       WHERE rc.RDB$RELATION_NAME = ? AND rc.RDB$CONSTRAINT_TYPE IN ('PRIMARY KEY', 'UNIQUE')
       ORDER BY CASE WHEN rc.RDB$CONSTRAINT_TYPE = 'PRIMARY KEY' THEN 0 ELSE 1 END,
                rc.RDB$CONSTRAINT_NAME, s.RDB$FIELD_POSITION`,
      [nome],
    );

    const fks = await db.queryAsync(
      `SELECT TRIM(rc.RDB$CONSTRAINT_NAME) AS RESTRICAO,
              TRIM(s.RDB$FIELD_NAME) AS COLUNA,
              TRIM(rc2.RDB$RELATION_NAME) AS TABELA_REF,
              TRIM(s2.RDB$FIELD_NAME) AS COLUNA_REF
       FROM RDB$RELATION_CONSTRAINTS rc
       JOIN RDB$REF_CONSTRAINTS ref ON ref.RDB$CONSTRAINT_NAME = rc.RDB$CONSTRAINT_NAME
       JOIN RDB$RELATION_CONSTRAINTS rc2 ON rc2.RDB$CONSTRAINT_NAME = ref.RDB$CONST_NAME_UQ
       JOIN RDB$INDEX_SEGMENTS s ON s.RDB$INDEX_NAME = rc.RDB$INDEX_NAME
       JOIN RDB$INDEX_SEGMENTS s2 ON s2.RDB$INDEX_NAME = rc2.RDB$INDEX_NAME
                                 AND s2.RDB$FIELD_POSITION = s.RDB$FIELD_POSITION
       WHERE rc.RDB$RELATION_NAME = ? AND rc.RDB$CONSTRAINT_TYPE = 'FOREIGN KEY'`,
      [nome],
    );
    return { cols, restricoes, fks };
  });

  const colunas = est.cols.map((c) => ({
    nome: c.NOME,
    tipo: tipoDaColuna(c),
    tamanho: c.TAMANHO,
    escala: -(c.ESCALA || 0),
    obrigatorio: c.OBRIGATORIO === 1,
    calculado: c.CALCULADO === 1,
    temPadrao: c.TEM_PADRAO === 1,
  }));
  const porNome = new Map(colunas.map((c) => [c.nome, c]));

  const grupos = new Map();
  for (const r of est.restricoes) {
    if (!grupos.has(r.RESTRICAO)) grupos.set(r.RESTRICAO, { tipo: r.TIPO, colunas: [] });
    grupos.get(r.RESTRICAO).colunas.push(r.COLUNA);
  }
  let chave = [];
  for (const g of grupos.values()) {
    if (g.tipo === 'PRIMARY KEY' || g.colunas.every((n) => porNome.get(n)?.obrigatorio)) {
      chave = g.colunas;
      break;
    }
  }

  // Ligações para outras tabelas (só as de uma coluna, que dá para abrir com um toque).
  const contagem = new Map();
  for (const f of est.fks) contagem.set(f.RESTRICAO, (contagem.get(f.RESTRICAO) || 0) + 1);
  for (const f of est.fks) {
    if (contagem.get(f.RESTRICAO) !== 1) continue;
    const c = porNome.get(f.COLUNA);
    if (c) c.ref = { tabela: f.TABELA_REF, coluna: f.COLUNA_REF };
  }

  const resultado = {
    nome,
    visao: info.visao,
    colunas,
    chave,
    editavel: !info.visao && chave.length > 0,
  };
  cacheEstrutura.set(nome, resultado);
  return resultado;
}

// ───────────────────────── Conversões ─────────────────────────

const pad = (n, t = 2) => String(n).padStart(t, '0');

/** Converte o valor vindo do banco para JSON (datas no horário local, sem fuso). */
function paraJson(valor, tipo) {
  if (valor === null || valor === undefined) return null;
  if (valor instanceof Date) {
    const d = `${valor.getFullYear()}-${pad(valor.getMonth() + 1)}-${pad(valor.getDate())}`;
    const h = `${pad(valor.getHours())}:${pad(valor.getMinutes())}:${pad(valor.getSeconds())}`;
    if (tipo === 'date') return d;
    if (tipo === 'time') return h;
    return `${d} ${h}`;
  }
  if (typeof valor === 'bigint') return valor.toString();
  if (Buffer.isBuffer(valor)) return null;
  if (typeof valor === 'function') return null; // blob binário não lido
  if (typeof valor === 'string' && tipo === 'text') return valor.replace(/\s+$/, ''); // CHAR vem com espaços
  return valor;
}

function linhaParaJson(row, colunas) {
  const out = {};
  for (const c of colunas) if (c.nome in row) out[c.nome] = paraJson(row[c.nome], c.tipo);
  return out;
}

/** Converte o valor digitado no app para o parâmetro do banco. */
function paraBanco(valor, col) {
  if (valor === null || valor === undefined) return null;
  if (col.tipo === 'bool') return valor === true || valor === 'true' || valor === 1;
  let s = String(valor);
  if (col.tipo !== 'text' && col.tipo !== 'memo') {
    s = s.trim();
    if (s === '') return null;
  }
  switch (col.tipo) {
    case 'int':
      if (!/^-?\d+$/.test(s)) throw new ErroApp(400, `${col.nome}: número inteiro inválido.`);
      return s;
    case 'decimal':
    case 'float':
      s = s.replace(',', '.');
      if (!/^-?\d*\.?\d+(e[-+]?\d+)?$/i.test(s)) throw new ErroApp(400, `${col.nome}: número inválido.`);
      return s;
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new ErroApp(400, `${col.nome}: data inválida.`);
      return s;
    case 'timestamp':
      s = s.replace('T', ' ');
      if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2}(\.\d+)?)?)?$/.test(s)) throw new ErroApp(400, `${col.nome}: data/hora inválida.`);
      return s;
    case 'time':
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(s)) throw new ErroApp(400, `${col.nome}: hora inválida.`);
      return s;
    default:
      if (col.tipo === 'text' && col.tamanho && s.length > col.tamanho)
        throw new ErroApp(400, `${col.nome}: máximo de ${col.tamanho} caracteres.`);
      return s;
  }
}

function colunasLegiveis(est, comMemo) {
  return est.colunas.filter((c) => c.tipo !== 'binary' && c.tipo !== 'other' && (comMemo || c.tipo !== 'memo'));
}

function whereChave(est, chave) {
  if (!est.chave.length) throw new ErroApp(400, 'Esta tabela não tem chave primária; não dá para identificar o registro.');
  const params = [];
  const partes = est.chave.map((n) => {
    const col = est.colunas.find((c) => c.nome === n);
    const v = chave?.[n];
    if (v === undefined || v === null || v === '') throw new ErroApp(400, `Chave incompleta: falta ${n}.`);
    params.push(paraBanco(v, col));
    return `${q(n)} = ?`;
  });
  return { sql: partes.join(' AND '), params };
}

// ───────────────────────── Leitura ─────────────────────────

export async function listarLinhas(tabela, { busca = '', filtros = {}, ordem, desc = false, pagina = 0, porPagina = 50 }) {
  const est = await estrutura(tabela);
  const cols = colunasLegiveis(est, false);
  const limite = Math.min(Math.max(Number(porPagina) || 50, 1), 500);
  const pular = Math.max(Number(pagina) || 0, 0) * limite;

  const where = [];
  const params = [];
  for (const [nome, valor] of Object.entries(filtros)) {
    const col = est.colunas.find((c) => c.nome === nome);
    if (!col) throw new ErroApp(400, `Coluna ${nome} não existe.`);
    if (valor === null || valor === '') where.push(`${q(nome)} IS NULL`);
    else {
      where.push(`${q(nome)} = ?`);
      params.push(paraBanco(valor, col));
    }
  }
  const termo = String(busca).trim();
  if (termo) {
    const ou = [];
    for (const c of cols) {
      if (c.tipo === 'text') {
        // CAST: sem ele o Firebird assume o tamanho da coluna (ex.: CHAR(1)) e recusa termos maiores
        ou.push(`${q(c.nome)} CONTAINING CAST(? AS VARCHAR(200))`);
        params.push(termo);
      } else if (c.tipo === 'int' && /^-?\d{1,15}$/.test(termo)) {
        ou.push(`${q(c.nome)} = ?`);
        params.push(termo);
      }
    }
    where.push(ou.length ? `(${ou.join(' OR ')})` : '1 = 0');
  }

  let ordenarPor = est.chave.length ? est.chave : [];
  if (ordem) {
    if (!est.colunas.some((c) => c.nome === ordem)) throw new ErroApp(400, `Coluna ${ordem} não existe.`);
    ordenarPor = [ordem];
  }
  const orderSql = ordenarPor.length ? ` ORDER BY ${ordenarPor.map((n) => q(n) + (desc ? ' DESC' : '')).join(', ')}` : '';

  const sql =
    `SELECT FIRST ${limite + 1} SKIP ${pular} ${cols.map((c) => q(c.nome)).join(', ')} FROM ${q(est.nome)}` +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    orderSql;

  const rows = await comBanco((db) => db.queryAsync(sql, params));
  return {
    linhas: rows.slice(0, limite).map((r) => linhaParaJson(r, cols)),
    temMais: rows.length > limite,
    pagina: Math.floor(pular / limite),
    porPagina: limite,
  };
}

export async function contar(tabela) {
  const est = await estrutura(tabela);
  const [r] = await comBanco((db) => db.queryAsync(`SELECT COUNT(*) AS N FROM ${q(est.nome)}`));
  return Number(r.N);
}

export async function lerLinha(tabela, chave) {
  const est = await estrutura(tabela);
  const cols = colunasLegiveis(est, true);
  const w = whereChave(est, chave);
  const rows = await comBanco((db) =>
    db.queryAsync(`SELECT FIRST 2 ${cols.map((c) => q(c.nome)).join(', ')} FROM ${q(est.nome)} WHERE ${w.sql}`, w.params),
  );
  if (rows.length === 0) throw new ErroApp(404, 'Registro não encontrado (pode ter sido apagado).');
  return linhaParaJson(rows[0], cols);
}

/** Percorre todas as linhas (para exportar CSV) sem carregar tudo na memória. */
export async function percorrer(tabela, aoLer) {
  const est = await estrutura(tabela);
  const cols = colunasLegiveis(est, false);
  const orderSql = est.chave.length ? ` ORDER BY ${est.chave.map(q).join(', ')}` : '';
  await comBanco((db) =>
    db.sequentiallyAsync(
      `SELECT ${cols.map((c) => q(c.nome)).join(', ')} FROM ${q(est.nome)}${orderSql}`,
      [],
      (row) => aoLer(linhaParaJson(row, cols)),
    ),
  );
  return cols;
}

export async function status() {
  const [r] = await comBanco((db) =>
    db.queryAsync(`SELECT rdb$get_context('SYSTEM', 'ENGINE_VERSION') AS VERSAO FROM RDB$DATABASE`),
  );
  return { versao: r.VERSAO };
}

// ───────────────────────── Gravação ─────────────────────────

function exigirEditavel(est) {
  if (est.visao) throw new ErroApp(400, 'Visões (views) são só para consulta.');
  if (!est.chave.length) throw new ErroApp(400, 'Tabela sem chave primária: só consulta.');
}

function colunasGravaveis(est) {
  return est.colunas.filter((c) => !c.calculado && c.tipo !== 'binary' && c.tipo !== 'other');
}

/** Confere que a chave aponta para exatamente 1 registro e devolve ele (para o histórico). */
async function travarUm(tx, est, w) {
  const cols = colunasLegiveis(est, true);
  const rows = await tx.queryAsync(
    `SELECT FIRST 2 ${cols.map((c) => q(c.nome)).join(', ')} FROM ${q(est.nome)} WHERE ${w.sql} WITH LOCK`,
    w.params,
  );
  if (rows.length === 0) throw new ErroApp(404, 'Registro não encontrado (pode ter sido apagado).');
  if (rows.length > 1) throw new ErroApp(409, 'A chave encontrou mais de um registro; nada foi alterado.');
  return linhaParaJson(rows[0], cols);
}

export async function inserir(tabela, valores) {
  const est = await estrutura(tabela);
  exigirEditavel(est);
  const nomes = [];
  const params = [];
  for (const col of colunasGravaveis(est)) {
    if (!(col.nome in valores)) continue;
    const v = paraBanco(valores[col.nome], col);
    if (v === null) continue; // deixa o banco aplicar padrão/gatilho (ex.: código automático)
    nomes.push(q(col.nome));
    params.push(v);
  }
  if (!nomes.length) throw new ErroApp(400, 'Preencha pelo menos um campo.');
  const sql =
    `INSERT INTO ${q(est.nome)} (${nomes.join(', ')}) VALUES (${nomes.map(() => '?').join(', ')})` +
    ` RETURNING ${est.chave.map(q).join(', ')}`;
  const r = await comTransacao((tx) => tx.queryAsync(sql, params));
  const row = Array.isArray(r) ? r[0] : r;
  const chave = {};
  for (const n of est.chave) chave[n] = paraJson(row?.[n], est.colunas.find((c) => c.nome === n).tipo);
  return chave;
}

export async function atualizar(tabela, chave, valores) {
  const est = await estrutura(tabela);
  exigirEditavel(est);
  const w = whereChave(est, chave);
  const sets = [];
  const params = [];
  for (const col of colunasGravaveis(est)) {
    if (!(col.nome in valores) || est.chave.includes(col.nome)) continue;
    sets.push(`${q(col.nome)} = ?`);
    params.push(paraBanco(valores[col.nome], col));
  }
  if (!sets.length) throw new ErroApp(400, 'Nada para alterar.');
  return comTransacao(async (tx) => {
    const antes = await travarUm(tx, est, w);
    await tx.queryAsync(`UPDATE ${q(est.nome)} SET ${sets.join(', ')} WHERE ${w.sql}`, [...params, ...w.params]);
    return { antes };
  });
}

export async function apagar(tabela, chave) {
  const est = await estrutura(tabela);
  exigirEditavel(est);
  const w = whereChave(est, chave);
  return comTransacao(async (tx) => {
    const antes = await travarUm(tx, est, w);
    await tx.queryAsync(`DELETE FROM ${q(est.nome)} WHERE ${w.sql}`, w.params);
    return { antes };
  });
}

export function fecharConexoes() {
  return new Promise((res) => pool.destroy(() => res()));
}
