/** Ferrus OS — contexto da demonstração e componentes de interface reaproveitados pelos módulos. */
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Banco, Unidade } from "./dados";
import { baixarArquivo, fmt, iniciais, paraCSV } from "./nucleo";
import { Sparkline } from "./graficos";

// ---------------------------------------------------------------- contexto
export type Ctx = {
  db: Banco;
  mudar: (fn: (b: Banco) => Banco) => void;
  avisar: (msg: string) => void;
  unidade: Unidade | "todas";
  ir: (modulo: string) => void;
};
export const FerrusCtx = createContext<Ctx | null>(null);
export function useFerrus() {
  const c = useContext(FerrusCtx);
  if (!c) throw new Error("useFerrus fora do FerrusCtx");
  return c;
}
/** filtra uma lista pela unidade escolhida no topo */
export function usePorUnidade<T extends { unidade: string }>(lista: T[]) {
  const { unidade } = useFerrus();
  return useMemo(() => (unidade === "todas" ? lista : lista.filter((x) => x.unidade === unidade)), [lista, unidade]);
}

/** aba atual guardada no endereço (/projetos/ferrus/<módulo>/<aba>): o menu em árvore e o voltar do navegador funcionam */
export function useAba<T extends string>(validas: readonly T[]): [T, (a: T) => void] {
  const { modulo = "visao", aba } = useParams();
  const navegar = useNavigate();
  const atual = (validas as readonly string[]).includes(aba ?? "") ? (aba as T) : validas[0]!;
  return [atual, (a: T) => navegar(`/projetos/ferrus/${modulo}${a === validas[0] ? "" : `/${a}`}`)];
}

// ---------------------------------------------------------------- ícones (traço 1.8, 24x24)
const P: Record<string, ReactNode> = {
  visao: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  producao: <><path d="M3 21V10l5 3V10l5 3V6l8 4v11z" /><path d="M7 17h2M12 17h2M17 17h1" /></>,
  qualidade: <><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>,
  engenharia: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  compras: <><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.5L21 8H6" /><circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></>,
  logistica: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  manutencao: <path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
  metrologia: <><path d="M3 17L17 3l4 4L7 21z" /><path d="M7 13l2 2M10 10l2 2M13 7l2 2" /></>,
  laboratorio: <><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 006 21h12a1.7 1.7 0 001.5-2.5L14 9V3" /><path d="M7 15h10" /></>,
  ambiental: <><path d="M5 21c0-9 5-14 15-16-1 10-6 15-15 16z" /><path d="M5 21l8-8" /></>,
  seguranca: <><path d="M4 15a8 8 0 0116 0z" /><path d="M2 15h20M12 7V4M9 7.6V5.5M15 7.6V5.5" /></>,
  ti: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  acesso: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6.5 6.5 0 013.5 6" /></>,
  busca: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  sino: <><path d="M6 16V11a6 6 0 1112 0v5l2 2H4z" /><path d="M10 21h4" /></>,
  sol: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  lua: <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  sair: <><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  mais: <path d="M12 5v14M5 12h14" />,
  baixar: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  voltar: <path d="M19 12H5M11 6l-6 6 6 6" />,
  fechar: <path d="M6 6l12 12M18 6L6 18" />,
  alerta: <><path d="M12 3l9.5 17h-19z" /><path d="M12 10v4M12 17.5v.5" /></>,
  ok: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  raio: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  gota: <path d="M12 3s7 7.5 7 12a7 7 0 01-14 0c0-4.5 7-12 7-12z" />,
  folha: <path d="M5 21c0-9 5-14 15-16-1 10-6 15-15 16z" />,
  restaurar: <><path d="M4 4v6h6" /><path d="M20 12A8 8 0 006.3 6.3L4 10" /><path d="M4 12a8 8 0 0013.7 5.7" /></>,
  filtro: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  teclado: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></>,
};
export type NomeIcone = keyof typeof P;
export function Icone({ n, tam = 18 }: { n: string; tam?: number }) {
  return (
    <svg className="fx-ico" width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[n] ?? P.visao}
    </svg>
  );
}

// ---------------------------------------------------------------- número que conta até o valor
export function Contador({ valor, formatar = (n: number) => fmt(n) }: { valor: number; formatar?: (n: number) => string }) {
  const [v, setV] = useState(0);
  const de = useRef(0);
  useEffect(() => {
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduzir) { setV(valor); de.current = valor; return; }
    const ini = performance.now(), origem = de.current, dur = 900;
    let raf = 0;
    const passo = (t: number) => {
      const p = Math.min(1, (t - ini) / dur);
      const e = 1 - (1 - p) ** 4;
      setV(origem + (valor - origem) * e);
      if (p < 1) raf = requestAnimationFrame(passo);
      else de.current = valor;
    };
    raf = requestAnimationFrame(passo);
    return () => { cancelAnimationFrame(raf); de.current = valor; };
  }, [valor]);
  return <>{formatar(v)}</>;
}

// ---------------------------------------------------------------- blocos
export type Tom = "ok" | "warn" | "bad" | "info" | "neutro" | "accent";
export function Etiqueta({ tom = "neutro", children }: { tom?: Tom; children: ReactNode }) {
  return <span className={`fx-tag t-${tom}`}>{children}</span>;
}

export function Kpi({
  rotulo, valor, formatar, delta, bom = true, spark, icone, tom = "accent", indice = 0, sub,
}: {
  rotulo: string; valor: number; formatar?: (n: number) => string; delta?: string; bom?: boolean; spark?: number[];
  icone?: string; tom?: Tom; indice?: number; sub?: string;
}) {
  return (
    <motion.div className={`fx-kpi k-${tom}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: indice * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
      <div className="fx-kpi-top">
        {icone && <span className="fx-kpi-ico"><Icone n={icone} tam={16} /></span>}
        <p>{rotulo}</p>
      </div>
      <strong><Contador valor={valor} formatar={formatar} /></strong>
      <div className="fx-kpi-pe">
        {delta && <span className={`fx-delta ${bom ? "sobe" : "desce"}`}>{delta}</span>}
        {sub && <span className="fx-kpi-sub">{sub}</span>}
      </div>
      {spark && <Sparkline valores={spark} cor={`var(--${tom === "accent" ? "accent" : tom === "info" ? "c2" : tom})`} />}
    </motion.div>
  );
}

export function Cartao({ titulo, sub, acao, children, className = "", span }: { titulo?: ReactNode; sub?: ReactNode; acao?: ReactNode; children: ReactNode; className?: string; span?: 1 | 2 | 3 }) {
  return (
    <section className={`fx-card ${span ? `span-${span}` : ""} ${className}`}>
      {(titulo || acao) && (
        <header className="fx-card-head">
          <div>{titulo && <h3>{titulo}</h3>}{sub && <p>{sub}</p>}</div>
          {acao && <div className="fx-card-acao">{acao}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Abas<T extends string>({ abas, atual, mudar }: { abas: readonly (readonly [T, string, number?])[]; atual: T; mudar: (a: T) => void }) {
  return (
    <div className="fx-abas" role="tablist">
      {abas.map(([id, nome, cont]) => (
        <button key={id} role="tab" aria-selected={atual === id} className={atual === id ? "on" : ""} onClick={() => mudar(id)}>
          <b>{nome}</b>{cont !== undefined && <span>{cont}</span>}
          {atual === id && <motion.i layoutId="fx-aba" className="fx-abas-marca" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
        </button>
      ))}
    </div>
  );
}

export function Progresso({ valor, tom }: { valor: number; tom?: Tom }) {
  const t = tom ?? (valor >= 85 ? "ok" : valor >= 50 ? "warn" : "bad");
  return <div className={`fx-prog t-${t}`}><i style={{ width: `${Math.max(2, Math.min(100, valor))}%` }} /></div>;
}

export function Avatar({ nome, tam = 30 }: { nome: string; tam?: number }) {
  let h = 0;
  for (const ch of nome) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return <span className="fx-avatar" style={{ width: tam, height: tam, background: `oklch(0.62 0.13 ${h})` }} aria-hidden="true">{iniciais(nome)}</span>;
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="fx-vazio">{children}</p>;
}

// ---------------------------------------------------------------- tabela com busca, ordenação, paginação e CSV
export type Coluna<T> = {
  k: string; titulo: string; render?: (l: T) => ReactNode; valor?: (l: T) => string | number; alinhar?: "dir" | "centro"; mono?: boolean; esconderCelular?: boolean;
};
export function Tabela<T>({
  linhas, colunas, chave, busca, porPagina = 10, vazio = "Nada por aqui.", csv, filtros, aoClicar,
}: {
  linhas: T[]; colunas: Coluna<T>[]; chave: (l: T) => string | number; busca?: (l: T) => string; porPagina?: number; vazio?: string;
  csv?: { nome: string; colunas: string[] }; filtros?: ReactNode; aoClicar?: (l: T) => void;
}) {
  const [q, setQ] = useState("");
  const [ord, setOrd] = useState<{ k: string; asc: boolean } | null>(null);
  const [pag, setPag] = useState(0);
  const filtradas = useMemo(() => {
    const termo = q.trim().toLowerCase();
    let r = termo && busca ? linhas.filter((l) => busca(l).toLowerCase().includes(termo)) : linhas;
    if (ord) {
      const c = colunas.find((x) => x.k === ord.k);
      const v = c?.valor ?? ((l: T) => String((l as Record<string, unknown>)[ord.k] ?? ""));
      r = [...r].sort((a, b) => {
        const va = v(a), vb = v(b);
        const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "pt-BR", { numeric: true });
        return ord.asc ? cmp : -cmp;
      });
    }
    return r;
  }, [linhas, q, ord, busca, colunas]);
  const paginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const p = Math.min(pag, paginas - 1);
  const visiveis = filtradas.slice(p * porPagina, p * porPagina + porPagina);
  return (
    <div className="fx-tabela">
      {(busca || csv || filtros) && (
        <div className="fx-tabela-barra">
          {busca && (
            <label className="fx-busca">
              <Icone n="busca" tam={16} />
              <input value={q} onChange={(e) => { setQ(e.target.value); setPag(0); }} placeholder="Buscar…" aria-label="Buscar na tabela" />
            </label>
          )}
          {filtros}
          <span className="fx-tabela-total">{fmt(filtradas.length)} {filtradas.length === 1 ? "registro" : "registros"}</span>
          {csv && (
            <button className="fx-btn" onClick={() => baixarArquivo(`${csv.nome}.csv`, paraCSV(filtradas as Record<string, unknown>[], csv.colunas))}>
              <Icone n="baixar" tam={15} />CSV
            </button>
          )}
        </div>
      )}
      <div className="fx-tabela-rolagem">
        <table>
          <thead>
            <tr>
              {colunas.map((c) => (
                <th key={c.k} className={`${c.alinhar ? "a-" + c.alinhar : ""} ${c.esconderCelular ? "so-largo" : ""}`}>
                  <button onClick={() => setOrd((o) => (o?.k === c.k ? { k: c.k, asc: !o.asc } : { k: c.k, asc: true }))}>
                    {c.titulo}<i aria-hidden="true">{ord?.k === c.k ? (ord.asc ? "↑" : "↓") : ""}</i>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr key={chave(l)} onClick={aoClicar ? () => aoClicar(l) : undefined} className={aoClicar ? "clicavel" : ""}>
                {colunas.map((c) => (
                  <td key={c.k} className={`${c.alinhar ? "a-" + c.alinhar : ""} ${c.mono ? "mono" : ""} ${c.esconderCelular ? "so-largo" : ""}`}>
                    {c.render ? c.render(l) : String((l as Record<string, unknown>)[c.k] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!visiveis.length && <Vazio>{vazio}</Vazio>}
      </div>
      {paginas > 1 && (
        <div className="fx-pag">
          <button className="fx-btn" disabled={p === 0} onClick={() => setPag(p - 1)}>Anterior</button>
          <span>Página {p + 1} de {paginas}</span>
          <button className="fx-btn" disabled={p >= paginas - 1} onClick={() => setPag(p + 1)}>Próxima</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- quadro kanban
export function Kanban<T, S extends string>({
  colunas, itens, chave, coluna, render, mover,
}: {
  colunas: readonly { id: S; titulo: string; tom: Tom }[]; itens: T[]; chave: (i: T) => string; coluna: (i: T) => S;
  render: (i: T) => ReactNode; mover?: (i: T, para: S) => void;
}) {
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<S | null>(null);
  return (
    <div className="fx-kanban" style={{ gridTemplateColumns: `repeat(${colunas.length}, minmax(230px, 1fr))` }}>
      {colunas.map((c, ci) => {
        const doCol = itens.filter((i) => coluna(i) === c.id);
        const prox = colunas[ci + 1]?.id;
        return (
          <div key={c.id} className={`fx-kanban-col ${sobre === c.id ? "sobre" : ""}`}
            onDragOver={(e) => { if (mover) { e.preventDefault(); setSobre(c.id); } }}
            onDragLeave={() => setSobre(null)}
            onDrop={() => {
              const it = itens.find((i) => chave(i) === arrastando);
              if (it && mover && coluna(it) !== c.id) mover(it, c.id);
              setArrastando(null); setSobre(null);
            }}>
            <header><i className={`fx-ponto t-${c.tom}`} />{c.titulo}<span>{doCol.length}</span></header>
            <div className="fx-kanban-lista">
              {doCol.map((i) => (
                <motion.article layout layoutId={`kb-${chave(i)}`} key={chave(i)} className="fx-kanban-card" draggable={!!mover}
                  onDragStart={() => setArrastando(chave(i))} onDragEnd={() => { setArrastando(null); setSobre(null); }}>
                  {render(i)}
                  {mover && prox && (
                    <button className="fx-kanban-mover" onClick={() => mover(i, prox)} aria-label={`Mover para ${colunas[ci + 1]!.titulo}`}>
                      {colunas[ci + 1]!.titulo}<Icone n="seta" tam={13} />
                    </button>
                  )}
                </motion.article>
              ))}
              {!doCol.length && <p className="fx-kanban-vazio">{mover ? "Arraste um cartão para cá" : "Vazio"}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- janela modal
export function Modal({ aberto, fechar, titulo, children }: { aberto: boolean; fechar: () => void; titulo: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);
  return (
    <dialog ref={ref} className="fx-modal" onClose={fechar} onClick={(e) => { if (e.target === ref.current) fechar(); }}>
      <div className="fx-modal-corpo">
        <header><h3>{titulo}</h3><button className="fx-icobtn" onClick={fechar} aria-label="Fechar"><Icone n="fechar" /></button></header>
        {aberto && children}
      </div>
    </dialog>
  );
}

export function Grade({ children, cols = "kpis" }: { children: ReactNode; cols?: "kpis" | "2" | "3" | "main" }) {
  return <div className={`fx-grade-${cols}`}>{children}</div>;
}

export const tomPorLimite = (v: number, bom: number, atencao: number, maiorMelhor = true): Tom =>
  maiorMelhor ? (v >= bom ? "ok" : v >= atencao ? "warn" : "bad") : v <= bom ? "ok" : v <= atencao ? "warn" : "bad";
