// MyLogical App: navegação pelas tabelas do banco, consulta e edição de registros.
// Telas (pelo endereço após o #):
//   #/                lista de tabelas
//   #/t/NOME?...      registros de uma tabela (busca, filtros, ordem, página)
//   #/r/NOME?k=...    um registro (ver / editar / excluir)
//   #/n/NOME          novo registro

const app = document.getElementById('app');
const elConexao = document.getElementById('conexao');
const elSair = document.getElementById('sair');
const elAviso = document.getElementById('aviso');

// ───────────────────────── Utilitários ─────────────────────────

/** Cria elementos sem usar innerHTML (todo texto do banco entra como texto puro). */
function h(tag, attrs = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k in el && k !== 'list' && k !== 'form') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat(Infinity)) if (f !== null && f !== undefined && f !== false) el.append(f instanceof Node ? f : String(f));
  return el;
}

let avisoTimer;
function avisar(msg, tipo = 'ok') {
  elAviso.textContent = msg;
  elAviso.className = 'aviso ' + tipo;
  elAviso.hidden = false;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => (elAviso.hidden = true), tipo === 'erro' ? 7000 : 3500);
}

async function api(caminho, opcoes = {}) {
  const r = await fetch(caminho, {
    ...opcoes,
    headers: opcoes.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
    credentials: 'same-origin',
  });
  let dados = null;
  try {
    dados = await r.json();
  } catch {
    /* sem corpo */
  }
  if (r.status === 401 && dados?.login) {
    telaLogin();
    throw new Error('login');
  }
  if (!r.ok) throw new Error(dados?.erro || `Erro ${r.status}`);
  return dados;
}

const enc = encodeURIComponent;
function ir(hash) {
  if (location.hash === hash) rota();
  else location.hash = hash;
}

function lerHash() {
  const [caminho, qs = ''] = location.hash.slice(1).split('?');
  const partes = caminho.split('/').filter(Boolean).map(decodeURIComponent);
  return { partes, params: new URLSearchParams(qs) };
}

const NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 });

function formatar(valor, col) {
  if (valor === null || valor === undefined || valor === '') return h('span', { class: 'nulo' }, '—');
  switch (col?.tipo) {
    case 'date': {
      const [a, m, d] = valor.split('-');
      return `${d}/${m}/${a}`;
    }
    case 'timestamp': {
      const [data, hora = ''] = valor.split(' ');
      const [a, m, d] = data.split('-');
      return `${d}/${m}/${a} ${hora.slice(0, 5)}`.trim();
    }
    case 'bool':
      return valor ? 'Sim' : 'Não';
    case 'decimal':
      return Number.isFinite(Number(valor))
        ? Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: col.escala, maximumFractionDigits: col.escala })
        : String(valor);
    case 'float':
      return NUM.format(Number(valor));
    default:
      return String(valor);
  }
}

const estruturas = new Map();
async function estrutura(nome) {
  if (!estruturas.has(nome)) estruturas.set(nome, await api(`/api/tabelas/${enc(nome)}`));
  return estruturas.get(nome);
}

const chaveDe = (est, linha) => Object.fromEntries(est.chave.map((n) => [n, linha[n]]));
const linkRegistro = (est, linha) => `#/r/${enc(est.nome)}?k=${enc(JSON.stringify(chaveDe(est, linha)))}`;

function carregando() {
  app.replaceChildren(h('div', { class: 'carregando' }, h('span', { class: 'spinner' }), 'Carregando…'));
}

function erroNaTela(e, tentar) {
  if (e.message === 'login') return;
  app.replaceChildren(
    h('div', { class: 'vazio erro' },
      h('p', {}, e.message),
      tentar && h('button', { class: 'btn', onclick: tentar }, 'Tentar de novo'),
      h('p', {}, h('a', { href: '#/' }, 'Voltar ao início')),
    ),
  );
}

// ───────────────────────── Login ─────────────────────────

function telaLogin() {
  elSair.hidden = true;
  elConexao.className = 'conexao';
  const entrada = h('input', { type: 'password', inputMode: 'numeric', autocomplete: 'current-password', required: true, id: 'pin', placeholder: 'PIN' });
  const msg = h('p', { class: 'erro-form', role: 'alert' });
  const form = h('form', {
    class: 'login',
    onsubmit: async (ev) => {
      ev.preventDefault();
      msg.textContent = '';
      try {
        await api('/api/login', { method: 'POST', body: { pin: entrada.value } });
        iniciar();
      } catch (e) {
        if (e.message !== 'login') msg.textContent = e.message;
        entrada.select();
      }
    },
  },
    h('img', { src: '/icons/icon.svg', alt: '', width: 56, height: 56 }),
    h('h1', {}, 'MyLogical App'),
    h('label', { for: 'pin' }, 'PIN de acesso'),
    entrada,
    msg,
    h('button', { class: 'btn primario', type: 'submit' }, 'Entrar'),
  );
  app.replaceChildren(form);
  entrada.focus();
}

// ───────────────────────── Início: lista de tabelas ─────────────────────────

let statusInfo = null;

async function telaInicio() {
  carregando();
  const [tabelas] = await Promise.all([api('/api/tabelas'), statusInfo ? null : carregarStatus()]);
  const filtro = h('input', { type: 'search', placeholder: `Procurar entre ${tabelas.length} tabelas…`, class: 'busca', autocomplete: 'off' });
  const lista = h('div');

  const desenhar = () => {
    const t = filtro.value.trim().toUpperCase();
    const achadas = tabelas.filter((x) => x.nome.includes(t));
    const grupo = (titulo, itens) =>
      itens.length &&
      h('section', {},
        h('h2', {}, titulo, h('span', { class: 'qtd' }, itens.length)),
        h('ul', { class: 'lista-tabelas' }, itens.map((x) => h('li', {}, h('a', { href: `#/t/${enc(x.nome)}` }, x.nome)))),
      );
    lista.replaceChildren(
      grupo('Tabelas', achadas.filter((x) => !x.visao)) || '',
      grupo('Visões (só consulta)', achadas.filter((x) => x.visao)) || '',
      achadas.length ? '' : h('p', { class: 'vazio' }, 'Nenhuma tabela com esse nome.'),
    );
  };
  filtro.addEventListener('input', desenhar);
  desenhar();

  app.replaceChildren(
    h('div', { class: 'cabecalho' },
      h('div', {},
        h('h1', {}, 'Banco de dados'),
        statusInfo && h('p', { class: 'sub' }, `${statusInfo.banco} em ${statusInfo.servidor} · Firebird ${statusInfo.versao} · ${statusInfo.gravacao ? 'gravação ligada' : 'somente consulta'}`),
      ),
      h('button', {
        class: 'btn', title: 'Recarregar a lista de tabelas e campos (use se o MyLogical foi atualizado)',
        onclick: async () => {
          await api('/api/atualizar-estrutura', { method: 'POST' });
          estruturas.clear();
          statusInfo = null;
          avisar('Estrutura do banco recarregada.');
          telaInicio().catch((e) => erroNaTela(e));
        },
      }, '↻ Atualizar'),
    ),
    filtro,
    lista,
  );
}

async function carregarStatus() {
  try {
    statusInfo = await api('/api/status');
    elConexao.className = 'conexao ok';
    elConexao.title = 'Conectado ao banco';
  } catch (e) {
    elConexao.className = 'conexao falha';
    elConexao.title = e.message;
    throw e;
  }
}

// ───────────────────────── Registros de uma tabela ─────────────────────────

async function telaTabela(nome, params) {
  carregando();
  const est = await estrutura(nome);
  const busca = params.get('busca') || '';
  const pagina = Number(params.get('pagina') || 0);
  const ordem = params.get('ordem') || '';
  const desc = params.get('desc') === '1';
  let filtros = {};
  try {
    filtros = JSON.parse(params.get('f') || '{}');
  } catch {
    /* ignora */
  }

  const navegar = (mudar) => {
    const p = new URLSearchParams({ busca, pagina: String(pagina), ordem, desc: desc ? '1' : '', f: Object.keys(filtros).length ? JSON.stringify(filtros) : '' });
    for (const [k, v] of Object.entries(mudar)) p.set(k, v);
    for (const [k, v] of [...p]) if (!v || (k === 'pagina' && v === '0')) p.delete(k);
    ir(`#/t/${enc(nome)}${p.size ? '?' + p : ''}`);
  };

  const qs = new URLSearchParams({ pagina: String(pagina), porPagina: '50' });
  if (busca) qs.set('busca', busca);
  if (ordem) qs.set('ordem', ordem);
  if (desc) qs.set('desc', '1');
  if (Object.keys(filtros).length) qs.set('filtros', JSON.stringify(filtros));
  const dados = await api(`/api/tabelas/${enc(nome)}/linhas?${qs}`);

  const colsLista = est.colunas.filter((c) => !['memo', 'binary', 'other'].includes(c.tipo));
  const campoBusca = h('input', { type: 'search', value: busca, placeholder: 'Buscar (texto ou código)…', class: 'busca', autocomplete: 'off' });
  const totalEl = h('button', {
    class: 'link', onclick: async () => {
      totalEl.textContent = 'contando…';
      try {
        const { total } = await api(`/api/tabelas/${enc(nome)}/contar`);
        totalEl.textContent = `${total.toLocaleString('pt-BR')} registros no total`;
      } catch (e) {
        totalEl.textContent = e.message;
      }
    },
  }, 'contar registros');

  const filtrosAtivos = Object.entries(filtros).map(([k, v]) =>
    h('span', { class: 'chip' }, `${k} = ${v ?? 'vazio'}`, h('button', {
      'aria-label': `Remover filtro ${k}`,
      onclick: () => {
        delete filtros[k];
        navegar({ pagina: '0', f: Object.keys(filtros).length ? JSON.stringify(filtros) : '' });
      },
    }, '×')),
  );

  const conteudo = dados.linhas.length === 0
    ? h('p', { class: 'vazio' }, busca || filtrosAtivos.length ? 'Nada encontrado com essa busca.' : 'Esta tabela está vazia.')
    : modoCartoes()
      ? h('ul', { class: 'cartoes' }, dados.linhas.map((l) => cartao(est, colsLista, l)))
      : h('div', { class: 'grade-rolagem' }, grade(est, colsLista, dados.linhas, ordem, desc, navegar));

  app.replaceChildren(
    h('nav', { class: 'trilha' }, h('a', { href: '#/' }, '← Tabelas')),
    h('div', { class: 'cabecalho' },
      h('div', {},
        h('h1', {}, nome),
        h('p', { class: 'sub' },
          est.visao ? 'Visão · só consulta' : !est.chave.length ? 'Sem chave primária · só consulta' : est.editavel ? `Chave: ${est.chave.join(', ')}` : 'Somente consulta',
          ' · ', totalEl),
      ),
      h('div', { class: 'acoes' },
        h('a', { class: 'btn', href: `/api/tabelas/${enc(nome)}/csv`, download: '' }, '⇩ CSV'),
        est.editavel && h('a', { class: 'btn primario', href: `#/n/${enc(nome)}` }, '+ Novo'),
      ),
    ),
    h('form', { class: 'linha-busca', onsubmit: (ev) => { ev.preventDefault(); navegar({ busca: campoBusca.value.trim(), pagina: '0' }); } },
      campoBusca, h('button', { class: 'btn', type: 'submit' }, 'Buscar'),
    ),
    filtrosAtivos.length ? h('div', { class: 'chips' }, filtrosAtivos) : '',
    conteudo,
    h('div', { class: 'paginacao' },
      h('button', { class: 'btn', disabled: pagina === 0, onclick: () => navegar({ pagina: String(pagina - 1) }) }, '‹ Anterior'),
      h('span', {}, `Página ${pagina + 1}`),
      h('button', { class: 'btn', disabled: !dados.temMais, onclick: () => navegar({ pagina: String(pagina + 1) }) }, 'Próxima ›'),
    ),
  );
}

const modoCartoes = () => window.matchMedia('(max-width: 720px)').matches;

function grade(est, cols, linhas, ordem, desc, navegar) {
  const abrivel = est.chave.length > 0;
  return h('table', { class: 'grade' },
    h('thead', {}, h('tr', {}, cols.map((c) =>
      h('th', { scope: 'col', class: ['int', 'decimal', 'float'].includes(c.tipo) ? 'num' : '' },
        h('button', {
          class: 'ordenar', title: 'Ordenar',
          onclick: () => navegar({ ordem: c.nome, desc: ordem === c.nome && !desc ? '1' : '', pagina: '0' }),
        }, c.nome, ordem === c.nome ? (desc ? ' ▾' : ' ▴') : ''),
      ),
    ))),
    h('tbody', {}, linhas.map((l) =>
      h('tr', abrivel ? { class: 'clicavel', tabIndex: 0, onclick: () => ir(linkRegistro(est, l)), onkeydown: (e) => e.key === 'Enter' && ir(linkRegistro(est, l)) } : {},
        cols.map((c) => h('td', { class: ['int', 'decimal', 'float'].includes(c.tipo) ? 'num' : '' }, formatar(l[c.nome], c))),
      ),
    )),
  );
}

function cartao(est, cols, linha) {
  const titulo = cols.find((c) => c.tipo === 'text' && !est.chave.includes(c.nome) && linha[c.nome]);
  const outros = cols.filter((c) => c !== titulo).slice(0, 4);
  const corpo = [
    h('strong', { class: 'titulo' }, titulo ? linha[titulo.nome] : est.chave.map((n) => linha[n]).join(' / ') || '(registro)'),
    h('dl', {}, outros.map((c) => [h('dt', {}, c.nome), h('dd', {}, formatar(linha[c.nome], c))])),
  ];
  return h('li', {}, est.chave.length ? h('a', { href: linkRegistro(est, linha), class: 'cartao' }, corpo) : h('div', { class: 'cartao' }, corpo));
}

// ───────────────────────── Um registro: ver / editar ─────────────────────────

function campoEntrada(col, valor) {
  const id = 'c_' + col.nome;
  const base = { id, name: col.nome };
  const v = valor ?? '';
  switch (col.tipo) {
    case 'int':
      return h('input', { ...base, type: 'text', inputMode: 'numeric', pattern: '-?[0-9]*', value: v });
    case 'decimal':
    case 'float':
      return h('input', { ...base, type: 'text', inputMode: 'decimal', value: v === '' ? '' : String(v) });
    case 'date':
      return h('input', { ...base, type: 'date', value: v });
    case 'timestamp':
      return h('input', { ...base, type: 'datetime-local', step: 1, value: v ? v.replace(' ', 'T').slice(0, 19) : '' });
    case 'time':
      return h('input', { ...base, type: 'time', step: 1, value: v });
    case 'bool':
      return h('select', base,
        h('option', { value: '', selected: v === '' }, '—'),
        h('option', { value: 'true', selected: v === true }, 'Sim'),
        h('option', { value: 'false', selected: v === false }, 'Não'));
    case 'memo':
      return h('textarea', { ...base, rows: 5, value: v });
    default:
      return col.tamanho > 120
        ? h('textarea', { ...base, rows: 3, maxLength: col.tamanho, value: v })
        : h('input', { ...base, type: 'text', maxLength: col.tamanho || undefined, value: v });
  }
}

function lerCampo(el, col) {
  const v = el.value;
  if (col.tipo === 'bool') return v === '' ? null : v === 'true';
  if (v === '') return col.tipo === 'text' && col.obrigatorio ? '' : null;
  if (col.tipo === 'timestamp') return v.replace('T', ' ');
  return v;
}

/** Normaliza o valor original para comparar com o digitado e só enviar o que mudou. */
function original(col, v) {
  if (v === null || v === undefined) return null;
  if (col.tipo === 'timestamp') return String(v).slice(0, 19);
  return col.tipo === 'bool' ? v : String(v);
}

async function telaRegistro(nome, params, novo = false) {
  carregando();
  const est = await estrutura(nome);
  let chave = {};
  let linha = {};
  if (!novo) {
    try {
      chave = JSON.parse(params.get('k') || '{}');
    } catch {
      throw new Error('Endereço do registro inválido.');
    }
    linha = await api(`/api/tabelas/${enc(nome)}/linha?chave=${enc(JSON.stringify(chave))}`);
  }
  let editando = novo;

  const desenhar = () => {
    const cols = est.colunas.filter((c) => (novo ? !c.calculado && c.tipo !== 'binary' && c.tipo !== 'other' : true));
    const campos = new Map();
    const lista = h('div', { class: 'campos' }, cols.map((c) => {
      const ehChave = est.chave.includes(c.nome);
      const podeEditar = editando && !c.calculado && !['binary', 'other'].includes(c.tipo) && (novo || !ehChave);
      let valorEl;
      if (podeEditar) {
        valorEl = campoEntrada(c, linha[c.nome]);
        campos.set(c.nome, valorEl);
      } else if (c.tipo === 'binary') valorEl = h('span', { class: 'nulo' }, '(arquivo/imagem, não exibido)');
      else if (c.tipo === 'memo') valorEl = h('div', { class: 'memo' }, formatar(linha[c.nome], c));
      else {
        valorEl = h('span', {}, formatar(linha[c.nome], c));
        if (c.ref && linha[c.nome] !== null && linha[c.nome] !== undefined) {
          valorEl = h('span', {}, valorEl, ' ', h('a', {
            class: 'ref',
            href: `#/t/${enc(c.ref.tabela)}?f=${enc(JSON.stringify({ [c.ref.coluna]: linha[c.nome] }))}`,
          }, `ver em ${c.ref.tabela} →`));
        }
      }
      const dicas = [
        ehChave && 'chave',
        c.calculado && 'calculado',
        novo && c.temPadrao && 'tem valor padrão',
        novo && ehChave && 'deixe vazio se for automático',
        editando && c.obrigatorio && !c.temPadrao && !ehChave && 'obrigatório',
      ].filter(Boolean);
      return h('div', { class: 'campo' + (ehChave ? ' chave' : '') },
        h('label', { for: podeEditar ? 'c_' + c.nome : undefined }, c.nome, dicas.length ? h('small', {}, ' · ' + dicas.join(' · ')) : ''),
        valorEl,
      );
    }));

    const salvar = async (ev) => {
      ev.preventDefault();
      const valores = {};
      for (const [n, el] of campos) {
        const col = est.colunas.find((c) => c.nome === n);
        const v = lerCampo(el, col);
        if (novo) {
          if (v !== null) valores[n] = v;
        } else if (v !== original(col, linha[n]) && !(v === '' && linha[n] === null)) {
          valores[n] = v;
        }
      }
      if (!Object.keys(valores).length) {
        if (novo) return avisar('Preencha pelo menos um campo.', 'erro');
        avisar('Nada foi alterado.');
        editando = false;
        return desenhar();
      }
      const btn = ev.submitter;
      if (btn) btn.disabled = true;
      try {
        if (novo) {
          const r = await api(`/api/tabelas/${enc(nome)}/linha`, { method: 'POST', body: { valores } });
          avisar('Registro incluído.');
          ir(`#/r/${enc(nome)}?k=${enc(JSON.stringify(r.chave))}`);
        } else {
          await api(`/api/tabelas/${enc(nome)}/linha?chave=${enc(JSON.stringify(chave))}`, { method: 'PUT', body: { valores } });
          avisar(`Salvo (${Object.keys(valores).length} campo(s) alterado(s)).`);
          linha = await api(`/api/tabelas/${enc(nome)}/linha?chave=${enc(JSON.stringify(chave))}`);
          editando = false;
          desenhar();
        }
      } catch (e) {
        if (e.message !== 'login') avisar(e.message, 'erro');
        if (btn) btn.disabled = false;
      }
    };

    const excluir = async () => {
      const desc = est.chave.map((n) => `${n} = ${chave[n]}`).join(', ');
      if (!confirm(`Excluir de verdade o registro ${desc} da tabela ${nome}?\n\nIsso apaga no banco do MyLogical.`)) return;
      try {
        await api(`/api/tabelas/${enc(nome)}/linha?chave=${enc(JSON.stringify(chave))}`, { method: 'DELETE' });
        avisar('Registro excluído.');
        ir(`#/t/${enc(nome)}`);
      } catch (e) {
        if (e.message !== 'login') avisar(e.message, 'erro');
      }
    };

    const titulo = novo ? `Novo em ${nome}` : est.chave.map((n) => `${n} ${chave[n]}`).join(' · ');
    const botoes = editando
      ? [
          h('button', { class: 'btn primario', type: 'submit' }, novo ? 'Incluir' : 'Salvar'),
          h('button', { class: 'btn', type: 'button', onclick: () => (novo ? history.back() : ((editando = false), desenhar())) }, 'Cancelar'),
        ]
      : est.editavel
        ? [
            h('button', { class: 'btn primario', type: 'button', onclick: () => ((editando = true), desenhar()) }, 'Editar'),
            h('button', { class: 'btn perigo', type: 'button', onclick: excluir }, 'Excluir'),
          ]
        : [];

    app.replaceChildren(
      h('nav', { class: 'trilha' }, h('a', { href: `#/t/${enc(nome)}` }, `← ${nome}`)),
      h('form', { class: 'registro', onsubmit: salvar, novalidate: true },
        h('div', { class: 'cabecalho' }, h('div', {}, h('h1', {}, titulo), editando && !novo && h('p', { class: 'sub' }, 'Editando · só os campos alterados serão gravados'))),
        lista,
        botoes.length ? h('div', { class: 'barra-acoes' }, botoes) : '',
      ),
    );
    if (editando) campos.values().next().value?.focus();
  };
  desenhar();
}

// ───────────────────────── Roteamento ─────────────────────────

async function rota() {
  const { partes, params } = lerHash();
  window.scrollTo(0, 0);
  try {
    if (partes[0] === 't' && partes[1]) await telaTabela(partes[1], params);
    else if (partes[0] === 'r' && partes[1]) await telaRegistro(partes[1], params);
    else if (partes[0] === 'n' && partes[1]) await telaRegistro(partes[1], params, true);
    else await telaInicio();
    app.focus({ preventScroll: true });
  } catch (e) {
    erroNaTela(e, rota);
  }
}

let larguraCartoes = modoCartoes();
window.addEventListener('resize', () => {
  if (modoCartoes() !== larguraCartoes && lerHash().partes[0] === 't') {
    larguraCartoes = modoCartoes();
    rota();
  }
});

elSair.addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST' }).catch(() => {});
  telaLogin();
});

function iniciar() {
  elSair.hidden = false;
  if (!window.__rotaLigada) {
    window.addEventListener('hashchange', rota);
    window.__rotaLigada = true;
  }
  rota();
}

if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

iniciar();
