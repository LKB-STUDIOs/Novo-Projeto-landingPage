import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { AnimatePresence, motion } from "motion/react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/unbounded";
import "@fontsource/ibm-plex-mono/500.css";
import "./ferrus.css";
import { carregar, EMPRESA, limparSalvo, salvar, semear, UNIDADES, type Banco, type Unidade } from "./dados";
import { diasAte } from "./nucleo";
import { FerrusCtx, Icone, type Ctx } from "./ui";
import Visao from "./modulos/Visao";
import Producao from "./modulos/Producao";
import Qualidade from "./modulos/Qualidade";
import Engenharia from "./modulos/Engenharia";
import Compras from "./modulos/Compras";
import Logistica from "./modulos/Logistica";
import Manutencao from "./modulos/Manutencao";
import { Laboratorio, Metrologia } from "./modulos/Metrologia";
import { Ambiental, Seguranca } from "./modulos/Ambiental";
import { Acesso, TI } from "./modulos/TI";

type Modulo = { id: string; nome: string; desc: string; comp: () => ReactNode; abas?: [string, string][] };
gsap.registerPlugin(useGSAP);
const GRUPOS: { nome: string; mods: Modulo[] }[] = [
  { nome: "Gestão", mods: [{ id: "visao", nome: "Visão geral", desc: "Indicadores de todas as áreas", comp: Visao }] },
  {
    nome: "Operação", mods: [
      { id: "producao", nome: "Produção", desc: "OEE, máquinas, apontamentos", comp: Producao, abas: [["painel", "Painel"], ["maquinas", "Máquinas"], ["apontar", "Apontar produção"], ["registros", "Registros"]] },
      { id: "qualidade", nome: "Qualidade", desc: "NCs, CEP, reclamações 8D", comp: Qualidade, abas: [["painel", "Painel"], ["ncs", "Não conformidades"], ["8d", "Reclamações 8D"]] },
      { id: "engenharia", nome: "Engenharia", desc: "PPAP, mudanças, estrutura", comp: Engenharia, abas: [["ppap", "Projetos PPAP"], ["ecn", "Mudanças"], ["bom", "Estrutura de produto"]] },
      { id: "manutencao", nome: "Manutenção", desc: "OS, MTBF, moldes", comp: Manutencao, abas: [["painel", "Painel"], ["os", "Ordens de serviço"], ["moldes", "Moldes"]] },
    ],
  },
  {
    nome: "Suprimentos", mods: [
      { id: "compras", nome: "Compras", desc: "Pedidos, requisições, IQF", comp: Compras, abas: [["painel", "Painel"], ["pedidos", "Pedidos"], ["fornecedores", "Fornecedores"]] },
      { id: "logistica", nome: "Logística", desc: "Expedição e estoque", comp: Logistica, abas: [["expedicao", "Expedição"], ["estoque", "Estoque"]] },
    ],
  },
  {
    nome: "Medição e ensaios", mods: [
      { id: "metrologia", nome: "Metrologia", desc: "Calibração e MSA", comp: Metrologia, abas: [["instrumentos", "Instrumentos"], ["msa", "Estudos de MSA"]] },
      { id: "laboratorio", nome: "Laboratório", desc: "Ensaios e resultados", comp: Laboratorio },
    ],
  },
  {
    nome: "ESG e pessoas", mods: [
      { id: "ambiental", nome: "Ambiental", desc: "Água, energia, resíduos", comp: Ambiental },
      { id: "seguranca", nome: "Segurança do trabalho", desc: "Ocorrências e NRs", comp: Seguranca, abas: [["painel", "Painel"], ["ocorrencias", "Ocorrências"], ["treinamentos", "Treinamentos NR"]] },
    ],
  },
  {
    nome: "Tecnologia", mods: [
      { id: "ti", nome: "TI", desc: "Chamados, inventário, SGSI", comp: TI, abas: [["chamados", "Chamados"], ["ativos", "Inventário"], ["sgsi", "Segurança da informação"]] },
      { id: "acesso", nome: "Usuários e acesso", desc: "Perfis, permissões, auditoria", comp: Acesso, abas: [["usuarios", "Usuários"], ["permissoes", "Permissões"], ["auditoria", "Auditoria"]] },
    ],
  },
];
const MODULOS = GRUPOS.flatMap((g) => g.mods);

function lerTema(): "escuro" | "claro" {
  try { return localStorage.getItem("ferrus-tema") === "claro" ? "claro" : "escuro"; } catch { return "escuro"; }
}

export default function Ferrus() {
  const { modulo = "visao", aba } = useParams();
  const navRef = useRef<HTMLElement>(null);
  const navegar = useNavigate();
  const atual = MODULOS.find((m) => m.id === modulo) ?? MODULOS[0]!;
  const [logado, setLogado] = useState(() => {
    try { return sessionStorage.getItem("ferrus-auth") === "1"; } catch { return false; }
  });
  const [db, setDb] = useState<Banco>(carregar);
  const [tema, setTema] = useState(lerTema);
  const [unidade, setUnidade] = useState<Unidade | "todas">("todas");
  const [menu, setMenu] = useState(false);
  const [paleta, setPaleta] = useState(false);
  const [sino, setSino] = useState(false);
  const [toast, setToast] = useState<{ id: number; txt: string } | null>(null);
  const timer = useRef(0);

  useEffect(() => { document.title = `${atual.nome} · Ferrus OS`; }, [atual]);
  useEffect(() => salvar(db), [db]);
  useEffect(() => { try { localStorage.setItem("ferrus-tema", tema); } catch { /* ok */ } }, [tema]);
  useEffect(() => {
    // a cor do navegador no celular acompanha o tema
    const m = document.querySelector('meta[name="theme-color"]');
    const antes = m?.getAttribute("content");
    m?.setAttribute("content", tema === "claro" ? "#f4f5f7" : "#0b0c10");
    return () => { if (m && antes) m.setAttribute("content", antes); };
  }, [tema]);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaleta((v) => !v); }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const mover = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest?.<HTMLElement>(".fx-card, .fx-kpi, .fx-maquina, .fx-saude-item, .fx-kanban-card, .fx-acao");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => window.removeEventListener("pointermove", mover);
  }, []);

  const avisar = useCallback((txt: string) => {
    setToast({ id: Date.now(), txt });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);
  const ir = useCallback((id: string, sub?: string) => {
    navegar(id === "visao" ? "/projetos/ferrus" : `/projetos/ferrus/${id}${sub ? `/${sub}` : ""}`);
    setMenu(false);
    setPaleta(false);
    setSino(false);
    document.querySelector(".fx-conteudo")?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [navegar]);
  const mudar = useCallback((fn: (b: Banco) => Banco) => setDb(fn), []);
  const restaurar = () => { limparSalvo(); setDb(semear()); avisar("Dados de demonstração restaurados"); setPaleta(false); };
  const ctx = useMemo<Ctx>(() => ({ db, mudar, avisar, unidade, ir: (id: string) => ir(id) }), [db, mudar, avisar, unidade, ir]);

  const notificacoes = useMemo(() => [
    ...db.instrumentos.filter((i) => diasAte(i.venc) < 0).map((i) => ({ mod: "metrologia", tom: "bad", txt: `${i.cod}: calibração vencida` })),
    ...db.pendentes.map((p) => ({ mod: "acesso", tom: "info", txt: `${p.nome} pediu acesso ao sistema` })),
    ...db.estoque.filter((e) => e.saldo < e.minimo).map((e) => ({ mod: "logistica", tom: "warn", txt: `${e.item}: abaixo do mínimo` })),
    ...db.requisicoes.filter((r) => r.urgencia === "Urgente").map((r) => ({ mod: "compras", tom: "warn", txt: `${r.id} urgente aguardando aprovação` })),
  ], [db]);

  const entrar = (e: FormEvent) => {
    e.preventDefault();
    try { sessionStorage.setItem("ferrus-auth", "1"); } catch { /* ok */ }
    setLogado(true);
  };
  const sair = () => {
    try { sessionStorage.removeItem("ferrus-auth"); } catch { /* ok */ }
    setLogado(false);
  };
  const Comp = atual.comp;
  const abaAtual = atual.abas?.some(([id]) => id === aba) ? aba : atual.abas?.[0]?.[0];

  // menu em árvore: grupos entram em cascata ao abrir o painel; os galhos da área atual crescem ao trocar de área
  useGSAP(() => {
    if (!logado) return;
    gsap.from(".fx-nav-grupo", { opacity: 0, x: -16, duration: 0.55, stagger: 0.06, ease: "power3.out", clearProps: "all" });
  }, { scope: navRef, dependencies: [logado] });
  useGSAP(() => {
    const g = navRef.current?.querySelector("[data-galhos]");
    if (!g) return;
    gsap.fromTo(g, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out" });
    gsap.fromTo(g.querySelectorAll("li"), { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, stagger: 0.05, delay: 0.12, ease: "power2.out" });
  }, { scope: navRef, dependencies: [atual.id, logado] });

  return (
    <div className="fx" data-tema={tema}>
      <AnimatePresence mode="wait">
        {!logado ? (
          <Login key="login" entrar={entrar} />
        ) : (
          <motion.div key="app" className="fx-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <aside className={`fx-lado ${menu ? "aberto" : ""}`}>
              <div className="fx-lado-topo">
                <Marca />
                <button className="fx-icobtn so-celular" onClick={() => setMenu(false)} aria-label="Fechar menu"><Icone n="fechar" /></button>
              </div>
              <button className="fx-busca-lado" onClick={() => setPaleta(true)}>
                <Icone n="busca" tam={16} /><span>Buscar ou ir para…</span><kbd>⌘K</kbd>
              </button>
              <nav className="fx-nav" aria-label="Módulos" ref={navRef}>
                {GRUPOS.map((g) => (
                  <div key={g.nome} className="fx-nav-grupo">
                    <p>{g.nome}</p>
                    {g.mods.map((m) => (
                      <div key={m.id} className={`fx-ramo ${atual.id === m.id ? "aberto" : ""}`}>
                      <button className={atual.id === m.id ? "on" : ""} onClick={() => ir(m.id)} aria-current={atual.id === m.id && !m.abas ? "page" : undefined} aria-expanded={m.abas ? atual.id === m.id : undefined}>
                        {atual.id === m.id && <motion.span layoutId="fx-nav-marca" className="fx-nav-marca" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                        <Icone n={m.id} /><span>{m.nome}</span>
                        {m.id === "acesso" && db.pendentes.length > 0 && <em>{db.pendentes.length}</em>}
                        {m.id === "qualidade" && <em className="neutro">{db.ncs.filter((n) => n.status === "Em análise").length}</em>}
                        {m.abas && <i className="fx-seta" aria-hidden="true" />}
                      </button>
                      {m.abas && atual.id === m.id && (
                        <ul className="fx-galhos" data-galhos>
                          {m.abas.map(([id, nome], k) => (
                            <li key={id}>
                              <button className={abaAtual === id ? "on" : ""} aria-current={abaAtual === id ? "page" : undefined} onClick={() => ir(m.id, k ? id : undefined)}>{nome}</button>
                            </li>
                          ))}
                        </ul>
                      )}
                      </div>
                    ))}
                  </div>
                ))}
              </nav>
              <div className="fx-lado-pe">
                <div className="fx-eu">
                  <span className="fx-eu-foto">MA</span>
                  <div><b>Marina Alves</b><small>Diretoria industrial</small></div>
                  <button className="fx-icobtn" onClick={sair} aria-label="Sair" title="Sair"><Icone n="sair" tam={17} /></button>
                </div>
              </div>
            </aside>
            {menu && <div className="fx-veu" onClick={() => setMenu(false)} />}

            <div className="fx-principal">
              <header className="fx-topo">
                <button className="fx-icobtn so-celular" onClick={() => setMenu(true)} aria-label="Abrir menu"><Icone n="menu" /></button>
                <div className="fx-titulo">
                  <p>{EMPRESA}<span>/</span>{GRUPOS.find((g) => g.mods.includes(atual))?.nome}</p>
                  <h1>{atual.nome}{atual.abas && abaAtual !== atual.abas[0]![0] && <span className="fx-sub"> / {atual.abas.find(([id]) => id === abaAtual)?.[1]}</span>}</h1>
                </div>
                <div className="fx-topo-acoes">
                  <label className="fx-unidade">
                    <span className="sr">Unidade</span>
                    <select value={unidade} onChange={(e) => { setUnidade(e.target.value as Unidade | "todas"); avisar(e.target.value === "todas" ? "Mostrando todas as unidades" : `Filtrando: ${e.target.value}`); }}>
                      <option value="todas">Todas as unidades</option>
                      {UNIDADES.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </label>
                  <button className="fx-icobtn so-largo" onClick={() => setPaleta(true)} aria-label="Buscar"><Icone n="busca" /></button>
                  <div className="fx-sino">
                    <button className="fx-icobtn" onClick={() => setSino((v) => !v)} aria-label={`Notificações (${notificacoes.length})`} aria-expanded={sino}>
                      <Icone n="sino" />{notificacoes.length > 0 && <i>{notificacoes.length}</i>}
                    </button>
                    <AnimatePresence>
                      {sino && (
                        <motion.div className="fx-pop" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}>
                          <header>Notificações<span>{notificacoes.length}</span></header>
                          <ul>
                            {notificacoes.map((n, i) => (
                              <li key={i}><button onClick={() => ir(n.mod)}><i className={`fx-ponto t-${n.tom}`} />{n.txt}</button></li>
                            ))}
                            {!notificacoes.length && <li className="fx-vazio">Tudo em dia.</li>}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button className="fx-icobtn" onClick={() => setTema((t) => (t === "escuro" ? "claro" : "escuro"))} aria-label={tema === "escuro" ? "Usar tema claro" : "Usar tema escuro"}>
                    <Icone n={tema === "escuro" ? "sol" : "lua"} />
                  </button>
                  <Link className="fx-btn so-largo" to="/"><Icone n="voltar" tam={15} />Portfólio</Link>
                </div>
              </header>

              <main className="fx-conteudo">
                <FerrusCtx.Provider value={ctx}>
                  <AnimatePresence mode="wait">
                    <motion.div key={atual.id} className="fx-vista" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                      <Comp />
                    </motion.div>
                  </AnimatePresence>
                </FerrusCtx.Provider>
                <footer className="fx-rodape">
                  <span>Ferrus OS · demonstração com dados fictícios, salvos só neste navegador.</span>
                  <button className="fx-link" onClick={restaurar}><Icone n="restaurar" tam={14} />Restaurar dados</button>
                  <span>© {new Date().getFullYear()} LBK Studio. Todos os direitos reservados.</span>
                </footer>
              </main>
            </div>

            <Paleta aberta={paleta} fechar={() => setPaleta(false)} ir={ir}
              acoes={[
                { nome: tema === "escuro" ? "Usar tema claro" : "Usar tema escuro", icone: tema === "escuro" ? "sol" : "lua", fazer: () => { setTema((t) => (t === "escuro" ? "claro" : "escuro")); setPaleta(false); } },
                { nome: "Restaurar dados de demonstração", icone: "restaurar", fazer: restaurar },
                { nome: "Sair", icone: "sair", fazer: () => { setPaleta(false); sair(); } },
              ]} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.id} className="fx-toast" role="status" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}>
            <Icone n="ok" tam={17} />{toast.txt}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Marca({ grande = false }: { grande?: boolean }) {
  return (
    <div className={`fx-marca ${grande ? "grande" : ""}`}>
      <span className="fx-marca-simbolo" aria-hidden="true">
        <svg viewBox="0 0 32 32"><path d="M6 4h20v6H13v5h11v6H13v7H6z" /></svg>
      </span>
      <b>Ferrus</b><small>OS</small>
    </div>
  );
}

function Letras({ txt }: { txt: string }) {
  return <>{txt.split(" ").map((p, i) => <Fragment key={i}>{i > 0 && " "}<span className="fx-palavra">{[...p].map((l, j) => <span key={j} className="fx-letra">{l}</span>)}</span></Fragment>)}</>;
}

function Login({ entrar }: { entrar: (e: FormEvent) => void }) {
  const arte = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(".fx-letra", { yPercent: 110, opacity: 0, rotate: 6, duration: 0.8, stagger: 0.025, ease: "power4.out", delay: 0.25 });
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzir || !window.matchMedia("(pointer: fine)").matches) return;
    const cx = gsap.quickTo(".fx-login-cards", "x", { duration: 0.8, ease: "power3" });
    const cy = gsap.quickTo(".fx-login-cards", "y", { duration: 0.8, ease: "power3" });
    const gx = gsap.quickTo(".fx-login-grade", "x", { duration: 1.2, ease: "power3" });
    const gy = gsap.quickTo(".fx-login-grade", "y", { duration: 1.2, ease: "power3" });
    const mover = (e: PointerEvent) => {
      const r = arte.current!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      cx(x * -36); cy(y * -26); gx(x * 18); gy(y * 18);
      arte.current!.style.setProperty("--lx", `${(x + 0.5) * 100}%`);
      arte.current!.style.setProperty("--ly", `${(y + 0.5) * 100}%`);
    };
    arte.current!.addEventListener("pointermove", mover);
    return () => arte.current?.removeEventListener("pointermove", mover);
  }, { scope: arte });
  const cards = [
    { r: "OEE global", v: "78,4%", d: "+1,8 p.p.", c: "c1" },
    { r: "Aprovação", v: "97,2%", d: "+0,4 p.p.", c: "ok" },
    { r: "Entregas no prazo", v: "95,1%", d: "meta 95%", c: "c2" },
  ];
  return (
    <motion.section className="fx-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.99 }}>
      <div className="fx-login-arte" ref={arte}>
        <div className="fx-login-brasa" aria-hidden="true" />
        <div className="fx-login-luz" aria-hidden="true" />
        <div className="fx-login-grade" aria-hidden="true" />
        <div className="fx-login-cards" aria-hidden="true">
          {cards.map((c, i) => (
            <motion.div key={c.r} className="fx-login-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 0.3 + i * 0.15 }, y: { delay: 0.3 + i * 0.15, duration: 5 + i, repeat: Infinity, ease: "easeInOut" } }}>
              <span>{c.r}</span><strong>{c.v}</strong><em className={`t-${c.c}`}>{c.d}</em>
            </motion.div>
          ))}
        </div>
        <motion.div className="fx-login-frase" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <Marca grande />
          <h2 aria-label="A fábrica inteira, em uma tela."><span aria-hidden="true"><Letras txt="A fábrica inteira," /></span><br /><span className="fx-quente" aria-hidden="true"><Letras txt="em uma tela." /></span></h2>
          <p>Produção, qualidade, engenharia, compras, logística, manutenção, laboratório, meio ambiente, segurança e TI conectados em tempo real.</p>
          <ul><li>13 módulos</li><li>3 unidades</li><li>Multiusuário</li></ul>
        </motion.div>
      </div>
      <form className="fx-login-form" onSubmit={entrar}>
        <Marca />
        <div>
          <h1>Entrar</h1>
          <p className="fx-muted">Ambiente de demonstração. Os campos já estão preenchidos: é só entrar.</p>
        </div>
        <label>E-mail<input type="email" defaultValue="marina@aurora.ind.br" required autoComplete="off" /></label>
        <label>Senha<input type="password" defaultValue="demonstracao" required autoComplete="off" /></label>
        <button className="fx-btn primario grande" type="submit">Acessar painel<Icone n="seta" tam={17} /></button>
        <p className="fx-login-aviso"><Icone n="qualidade" tam={15} />Dados fictícios. Nada sai do seu navegador.</p>
        <Link className="fx-link" to="/"><Icone n="voltar" tam={14} />Voltar ao portfólio LBK Studio</Link>
      </form>
    </motion.section>
  );
}

type Acao = { nome: string; icone: string; fazer: () => void };
function Paleta({ aberta, fechar, ir, acoes }: { aberta: boolean; fechar: () => void; ir: (id: string, sub?: string) => void; acoes: Acao[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const entrada = useRef<HTMLInputElement>(null);
  useEffect(() => { if (aberta) { setQ(""); setSel(0); setTimeout(() => entrada.current?.focus(), 30); } }, [aberta]);
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const itens = useMemo(() => {
    const t = norm(q.trim());
    const mods = MODULOS.flatMap((m) => [{ nome: m.nome, sub: m.desc, icone: m.id, fazer: () => ir(m.id) }, ...(m.abas ?? []).slice(1).map(([id, n]) => ({ nome: `${m.nome} › ${n}`, sub: "Tela", icone: m.id, fazer: () => ir(m.id, id) }))]);
    const todos = [...mods, ...acoes.map((a) => ({ ...a, sub: "Ação" }))];
    return t ? todos.filter((i) => norm(`${i.nome} ${i.sub}`).includes(t)) : todos;
  }, [q, acoes, ir]);
  useEffect(() => setSel(0), [q]);
  return (
    <AnimatePresence>
      {aberta && (
        <motion.div className="fx-paleta-fundo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fechar}>
          <motion.div className="fx-paleta" role="dialog" aria-label="Buscar" initial={{ y: -16, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <label className="fx-paleta-busca">
              <Icone n="busca" />
              <input ref={entrada} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar módulo ou ação…" aria-label="Buscar módulo ou ação"
                onKeyDown={(e) => {
                  if (e.key === "Escape") fechar();
                  if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(itens.length - 1, s + 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
                  if (e.key === "Enter") itens[sel]?.fazer();
                }} />
              <kbd>esc</kbd>
            </label>
            <ul>
              {itens.map((i, k) => (
                <li key={i.nome}>
                  <button className={k === sel ? "on" : ""} onMouseEnter={() => setSel(k)} onClick={i.fazer}>
                    <span className="fx-paleta-ico"><Icone n={i.icone} tam={17} /></span><b>{i.nome}</b><small>{i.sub}</small>
                  </button>
                </li>
              ))}
              {!itens.length && <li className="fx-vazio">Nada encontrado para “{q}”.</li>}
            </ul>
            <footer><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>enter</kbd> abrir</span><span><kbd>⌘K</kbd> abrir/fechar</span></footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
