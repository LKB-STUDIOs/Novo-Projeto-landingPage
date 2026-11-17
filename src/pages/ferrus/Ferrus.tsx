import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { Link } from "react-router";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./ferrus.css";
import {
  aprovacao, br, carregar, DEFEITOS, diasAtras, fmt, iso, paraCSV, salvar, SETORES, UNIDADES,
  type Banco, type Registro, type StatusNC,
} from "./dados";
import { GraficoBarras, GraficoLinha } from "./Graficos";

type Visao = "painel" | "apontamento" | "registros" | "qualidade" | "calibracao" | "usuarios";
const TITULOS: Record<Visao, string> = {
  painel: "Painel", apontamento: "Apontar produção", registros: "Registros de produção",
  qualidade: "Qualidade", calibracao: "Calibração", usuarios: "Usuários",
};
const MENU: [Visao, string][] = [
  ["painel", "▦"], ["apontamento", "＋"], ["registros", "☰"], ["qualidade", "◎"], ["calibracao", "⌖"], ["usuarios", "☺"],
];
const PROXIMO: Partial<Record<StatusNC, StatusNC>> = { "Em análise": "Ação corretiva", "Ação corretiva": "Encerrada" };
const COR_NC: Record<StatusNC, string> = { "Em análise": "warn", "Ação corretiva": "bad", Encerrada: "ok" };

function Pill({ r }: { r: Pick<Registro, "inspecionada" | "reprovada"> }) {
  const p = aprovacao(r);
  return <span className={`pill ${p >= 97 ? "ok" : p >= 94 ? "warn" : "bad"}`}>{p.toFixed(1)}%</span>;
}

export default function Ferrus() {
  const [logado, setLogado] = useState(() => {
    try { return sessionStorage.getItem("ferrus-auth") === "1"; } catch { return false; }
  });
  const [db, setDb] = useState<Banco>(carregar);
  const [visao, setVisao] = useState<Visao>("painel");
  const [unidade, setUnidade] = useState("todas");
  const [menuAberto, setMenuAberto] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef<number>(0);

  useEffect(() => { document.title = "Ferrus OS — Gestão industrial · LBK Studio"; }, []);
  useEffect(() => salvar(db), [db]);

  const avisar = (m: string) => {
    setToast(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(""), 2600);
  };
  const ir = (v: Visao) => { setVisao(v); setMenuAberto(false); };
  const registros = useMemo(() => (unidade === "todas" ? db.registros : db.registros.filter((r) => r.unidade === unidade)), [db, unidade]);

  const entrar = (e: FormEvent) => {
    e.preventDefault();
    try { sessionStorage.setItem("ferrus-auth", "1"); } catch { /* ok */ }
    setLogado(true);
  };
  const sair = () => {
    try { sessionStorage.removeItem("ferrus-auth"); } catch { /* ok */ }
    setLogado(false);
  };

  return (
    <div className="fx">
      <AnimatePresence mode="wait">
        {!logado ? (
          <motion.section key="login" className="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="login-art" aria-hidden="true">
              <div className="login-grid" />
              <motion.div className="login-quote" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                <span className="brand-mark lg">Fe</span>
                <h2>Toda a fábrica<br />em uma tela.</h2>
                <p>Produção, qualidade e indicadores em tempo real, em todas as unidades.</p>
              </motion.div>
            </div>
            <form className="login-card" onSubmit={entrar}>
              <div className="brand"><span className="brand-mark">Fe</span><b>Ferrus</b><small>OS</small></div>
              <h1>Entrar</h1>
              <p className="muted">Ambiente de demonstração. Use qualquer e-mail e senha.</p>
              <label>E-mail<input type="email" defaultValue="demo@aurora.ind.br" required autoComplete="off" /></label>
              <label>Senha<input type="password" defaultValue="demonstracao" required autoComplete="off" /></label>
              <button className="btn primary" type="submit">Acessar painel</button>
              <Link className="muted small" to="/">← Voltar ao portfólio LBK Studio</Link>
            </form>
          </motion.section>
        ) : (
          <motion.div key="app" className="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <aside className={`sidebar ${menuAberto ? "open" : ""}`}>
              <div className="brand"><span className="brand-mark">Fe</span><b>Ferrus</b><small>OS</small></div>
              <label className="unit-select">Unidade
                <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
                  <option value="todas">Todas as unidades</option>
                  {UNIDADES.map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
              <nav className="menu" aria-label="Módulos">
                {MENU.map(([v, ic]) => (
                  <button key={v} className={visao === v ? "active" : ""} onClick={() => ir(v)} aria-current={visao === v ? "page" : undefined}>
                    <i aria-hidden="true">{ic}</i>{TITULOS[v].replace(" de produção", "")}
                    {v === "usuarios" && db.pendentes.length > 0 && <span className="badge">{db.pendentes.length}</span>}
                  </button>
                ))}
              </nav>
              <div className="side-foot">
                <div className="me"><span>MA</span><div><b>Marina Alves</b><small>Gestora de qualidade</small></div></div>
                <button className="link" onClick={sair}>Sair</button>
              </div>
            </aside>

            <div className="main">
              <header className="topbar">
                <button className="menu-toggle" onClick={() => setMenuAberto((v) => !v)} aria-label="Abrir menu" aria-expanded={menuAberto}>☰</button>
                <div>
                  <p className="crumb">Metalúrgica Aurora{unidade !== "todas" && ` · ${unidade}`}</p>
                  <h1>{TITULOS[visao]}</h1>
                </div>
                <div className="top-actions">
                  <span className="live"><i />Ao vivo</span>
                  <Link className="btn" to="/">Portfólio</Link>
                </div>
              </header>

              <AnimatePresence mode="wait">
                <motion.section
                  key={visao}
                  className="view"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {visao === "painel" && <Painel db={db} registros={registros} ir={ir} />}
                  {visao === "apontamento" && <Apontamento setDb={setDb} avisar={avisar} ir={ir} />}
                  {visao === "registros" && <Registros registros={registros} avisar={avisar} />}
                  {visao === "qualidade" && <Qualidade db={db} setDb={setDb} avisar={avisar} />}
                  {visao === "calibracao" && <Calibracoes db={db} />}
                  {visao === "usuarios" && <Usuarios db={db} setDb={setDb} avisar={avisar} />}
                </motion.section>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

type SetDb = Dispatch<SetStateAction<Banco>>;

function Painel({ db, registros, ir }: { db: Banco; registros: Registro[]; ir: (v: Visao) => void }) {
  const insp = registros.reduce((s, r) => s + r.inspecionada, 0);
  const rep = registros.reduce((s, r) => s + r.reprovada, 0);
  const abertas = db.ncs.filter((n) => n.status !== "Encerrada").length;
  const porSetor = SETORES.map((k) => ({ k, v: registros.filter((r) => r.setor === k).reduce((s, r) => s + r.inspecionada - r.reprovada, 0) }));
  const dias = [...Array(7)].map((_, i) => diasAtras(6 - i)).map((k) => {
    const d = registros.filter((r) => r.data === k);
    const a = d.reduce((s, r) => s + r.inspecionada, 0);
    const b = d.reduce((s, r) => s + r.reprovada, 0);
    return { k, v: a ? ((a - b) / a) * 100 : 100 };
  });
  const cont: Record<string, number> = {};
  registros.forEach((r) => r.defeitos.forEach((d) => (cont[d] = (cont[d] ?? 0) + 1)));
  const top = Object.entries(cont).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const mx = top[0]?.[1] ?? 1;

  return (
    <>
      <div className="kpis">
        {([
          ["Peças inspecionadas", fmt(insp), "+8,2%", ""],
          ["Peças aprovadas", fmt(insp - rep), "+6,9%", ""],
          ["Índice de aprovação", (insp ? ((insp - rep) / insp) * 100 : 0).toFixed(1) + "%", "+0,4 p.p.", ""],
          ["NCs abertas", String(abertas), abertas > 2 ? "atenção" : "ok", abertas > 2 ? "down" : ""],
        ] as const).map(([l, v, d, c], i) => (
          <motion.div className="kpi" key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <p>{l}</p><strong>{v}</strong><span className={`delta ${c}`}>{d}</span>
          </motion.div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Produção por setor</h3><span className="muted small">peças aprovadas · últimos 7 dias</span></div>
          <div className="chart"><GraficoBarras dados={porSetor} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Índice de aprovação</h3><span className="muted small">% por dia</span></div>
          <div className="chart"><GraficoLinha dados={dias} /></div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Principais defeitos</h3><span className="muted small">ocorrências</span></div>
          <ul className="defects">
            {top.length ? top.map(([k, v]) => (
              <li key={k}><span>{k}</span><div className="track"><motion.span initial={{ width: 0 }} animate={{ width: `${(v / mx) * 100}%` }} transition={{ duration: 0.8 }} /></div><b>{v}</b></li>
            )) : <li className="muted">Nenhum defeito registrado.</li>}
          </ul>
        </div>
        <div className="card">
          <div className="card-head"><h3>Últimos apontamentos</h3><button className="link" onClick={() => ir("registros")}>Ver todos →</button></div>
          <div className="table-wrap">
            <table className="table compact">
              <thead><tr><th>Data</th><th>Setor</th><th>OP</th><th>Aprov.</th></tr></thead>
              <tbody>{registros.slice(0, 6).map((r) => <tr key={r.id}><td>{br(r.data)}</td><td>{r.setor}</td><td className="mono">{r.op}</td><td><Pill r={r} /></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Apontamento({ setDb, avisar, ir }: { setDb: SetDb; avisar: (m: string) => void; ir: (v: Visao) => void }) {
  const [f, setF] = useState({ unidade: UNIDADES[0]!, setor: SETORES[0]!, op: "", codigo: "", data: iso(new Date()), operador: "", inspecionada: "", reprovada: "0", obs: "" });
  const [defs, setDefs] = useState<string[]>([]);
  const a = Number(f.inspecionada), b = Number(f.reprovada);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (b > a) return avisar("A quantidade reprovada não pode ser maior que a inspecionada");
    if (b > 0 && !defs.length) return avisar("Marque pelo menos um defeito para as peças reprovadas");
    setDb((db) => ({
      ...db,
      registros: [{ id: Date.now(), data: f.data, unidade: f.unidade, setor: f.setor, op: f.op.trim().slice(0, 30), codigo: f.codigo.trim().slice(0, 30), operador: f.operador.trim().slice(0, 60), inspecionada: a, reprovada: b, defeitos: defs, obs: f.obs.trim().slice(0, 500) }, ...db.registros],
    }));
    avisar("Apontamento salvo com sucesso");
    ir("registros");
  };

  return (
    <form className="card form" onSubmit={enviar}>
      <div className="card-head"><h3>Novo apontamento de produção</h3><span className="muted small">os campos com * são obrigatórios</span></div>
      <div className="form-grid">
        <label>Unidade *<select value={f.unidade} onChange={set("unidade")}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select></label>
        <label>Setor *<select value={f.setor} onChange={set("setor")}>{SETORES.map((u) => <option key={u}>{u}</option>)}</select></label>
        <label>Ordem de produção *<input required maxLength={30} value={f.op} onChange={set("op")} placeholder="Ex.: OP-24871" /></label>
        <label>Código da peça *<input required maxLength={30} value={f.codigo} onChange={set("codigo")} placeholder="Ex.: AUR-3320" /></label>
        <label>Data *<input type="date" required value={f.data} onChange={set("data")} /></label>
        <label>Operador *<input required maxLength={60} value={f.operador} onChange={set("operador")} placeholder="Nome do operador" /></label>
        <label>Quantidade inspecionada *<input type="number" min={1} max={1000000} required value={f.inspecionada} onChange={set("inspecionada")} /></label>
        <label>Quantidade reprovada *<input type="number" min={0} max={1000000} required value={f.reprovada} onChange={set("reprovada")} /></label>
      </div>
      <fieldset className="defect-pick">
        <legend>Defeitos encontrados</legend>
        <div className="chips">
          {DEFEITOS.map((d) => (
            <label key={d}>
              <input type="checkbox" checked={defs.includes(d)} onChange={(e) => setDefs(e.target.checked ? [...defs, d] : defs.filter((x) => x !== d))} />{d}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="full">Observações<textarea rows={3} maxLength={500} value={f.obs} onChange={set("obs")} placeholder="Algo que a qualidade precisa saber?" /></label>
      <div className="form-foot">
        <p className="muted small">{a ? `Aprovadas: ${fmt(Math.max(0, a - b))} · Aprovação: ${(((a - b) / a) * 100).toFixed(1)}%` : "Aprovadas: —"}</p>
        <button className="btn primary" type="submit">Salvar apontamento</button>
      </div>
    </form>
  );
}

function Registros({ registros, avisar }: { registros: Registro[]; avisar: (m: string) => void }) {
  const [q, setQ] = useState("");
  const [setor, setSetor] = useState("");
  const termo = q.trim().toLowerCase();
  const lista = registros.filter((r) => (!setor || r.setor === setor) && (!termo || [r.op, r.codigo, r.operador].some((x) => x.toLowerCase().includes(termo))));

  const exportar = () => {
    const url = URL.createObjectURL(new Blob(["﻿" + paraCSV(lista)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ferrus-registros-${iso(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    avisar(`${lista.length} registros exportados`);
  };

  return (
    <div className="card">
      <div className="filters">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por OP, código ou operador" maxLength={60} />
        <select value={setor} onChange={(e) => setSetor(e.target.value)}><option value="">Todos os setores</option>{SETORES.map((s) => <option key={s}>{s}</option>)}</select>
        <button className="btn" onClick={exportar}>Exportar CSV</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Data</th><th>Unidade</th><th>Setor</th><th>OP</th><th>Código</th><th>Operador</th><th>Insp.</th><th>Reprov.</th><th>Aprovação</th><th>Defeitos</th></tr></thead>
          <tbody>
            {lista.length ? lista.slice(0, 200).map((r) => (
              <tr key={r.id}><td>{br(r.data)}</td><td>{r.unidade}</td><td>{r.setor}</td><td className="mono">{r.op}</td><td className="mono">{r.codigo}</td><td>{r.operador}</td><td>{fmt(r.inspecionada)}</td><td>{fmt(r.reprovada)}</td><td><Pill r={r} /></td><td className="muted">{r.defeitos.join(", ") || "—"}</td></tr>
            )) : <tr><td colSpan={10} className="muted">Nenhum registro encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Qualidade({ db, setDb, avisar }: { db: Banco; setDb: SetDb; avisar: (m: string) => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [nova, setNova] = useState({ setor: SETORES[0]!, desc: "", grav: "Média" });
  const contar = (s: StatusNC) => db.ncs.filter((n) => n.status === s).length;

  const avancar = (i: number) => {
    const n = db.ncs[i]!;
    const prox = PROXIMO[n.status];
    if (!prox) return;
    setDb({ ...db, ncs: db.ncs.map((x, j) => (j === i ? { ...x, status: prox } : x)) });
    avisar(`${n.id} movida para "${prox}"`);
  };
  const abrir = (e: FormEvent) => {
    e.preventDefault();
    const num = Math.max(0, ...db.ncs.map((n) => Number(n.id.slice(3)) || 0)) + 1;
    setDb({ ...db, ncs: [{ id: "NC-" + String(num).padStart(4, "0"), setor: nova.setor, desc: nova.desc.trim().slice(0, 200), grav: nova.grav, status: "Em análise", data: iso(new Date()) }, ...db.ncs] });
    dlg.current?.close();
    setNova({ setor: SETORES[0]!, desc: "", grav: "Média" });
    avisar("Não conformidade aberta");
  };

  return (
    <>
      <div className="kpis small-kpis">
        {(["Em análise", "Ação corretiva", "Encerrada"] as StatusNC[]).map((s) => <div className="kpi" key={s}><p>{s === "Encerrada" ? "Encerradas" : s}</p><strong>{contar(s)}</strong></div>)}
      </div>
      <div className="card">
        <div className="card-head"><h3>Não conformidades</h3><button className="btn primary" onClick={() => dlg.current?.showModal()}>Abrir NC</button></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Nº</th><th>Abertura</th><th>Setor</th><th>Descrição</th><th>Gravidade</th><th>Status</th><th /></tr></thead>
            <tbody>
              {db.ncs.map((n, i) => (
                <tr key={n.id}><td className="mono">{n.id}</td><td>{br(n.data)}</td><td>{n.setor}</td><td>{n.desc}</td><td>{n.grav}</td><td><span className={`pill ${COR_NC[n.status]}`}>{n.status}</span></td>
                  <td>{PROXIMO[n.status] && <button className="link" onClick={() => avancar(i)}>Avançar →</button>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <dialog ref={dlg}>
        <form className="form" onSubmit={abrir}>
          <h3>Abrir não conformidade</h3>
          <label>Setor<select value={nova.setor} onChange={(e) => setNova({ ...nova, setor: e.target.value })}>{SETORES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Descrição<textarea rows={3} required maxLength={200} value={nova.desc} onChange={(e) => setNova({ ...nova, desc: e.target.value })} placeholder="O que aconteceu?" /></label>
          <label>Gravidade<select value={nova.grav} onChange={(e) => setNova({ ...nova, grav: e.target.value })}><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
          <div className="form-foot">
            <button className="btn" type="button" onClick={() => dlg.current?.close()}>Cancelar</button>
            <button className="btn primary" type="submit">Abrir NC</button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function Calibracoes({ db }: { db: Banco }) {
  const hoje = new Date(iso(new Date())).getTime();
  return (
    <div className="card">
      <div className="card-head"><h3>Instrumentos de medição</h3><span className="muted small">vencimento da calibração</span></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Código</th><th>Instrumento</th><th>Local</th><th>Vencimento</th><th>Situação</th></tr></thead>
          <tbody>
            {[...db.calibracoes].sort((a, b) => a.venc.localeCompare(b.venc)).map((c) => {
              const dias = Math.round((new Date(c.venc).getTime() - hoje) / 864e5);
              const [cls, txt] = dias < 0 ? ["bad", `Vencida há ${-dias} dia(s)`] : dias <= 15 ? ["warn", `Vence em ${dias} dia(s)`] : ["ok", "Em dia"];
              return <tr key={c.cod}><td className="mono">{c.cod}</td><td>{c.nome}</td><td>{c.local}</td><td>{br(c.venc)}</td><td><span className={`pill ${cls}`}>{txt}</span></td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Usuarios({ db, setDb, avisar }: { db: Banco; setDb: SetDb; avisar: (m: string) => void }) {
  const liberar = (i: number) => {
    const p = db.pendentes[i]!;
    setDb({ ...db, pendentes: db.pendentes.filter((_, j) => j !== i), usuarios: [...db.usuarios, { nome: p.nome, email: p.email, perfil: "Operador", unidade: p.unidade }] });
    avisar(`Acesso liberado para ${p.nome}`);
  };
  const recusar = (i: number) => {
    const p = db.pendentes[i]!;
    setDb({ ...db, pendentes: db.pendentes.filter((_, j) => j !== i) });
    avisar(`Cadastro de ${p.nome} recusado`);
  };
  return (
    <>
      <div className="card">
        <div className="card-head"><h3>Aguardando liberação</h3></div>
        <div className="pending">
          <AnimatePresence initial={false}>
            {db.pendentes.map((p, i) => (
              <motion.div className="pending-item" key={p.email} exit={{ opacity: 0, x: 40 }} layout>
                <div><b>{p.nome}</b><span className="muted small">{p.email} · {p.unidade} · pediu em {br(p.pediu)}</span></div>
                <div className="acts"><button className="btn" onClick={() => recusar(i)}>Recusar</button><button className="btn primary" onClick={() => liberar(i)}>Liberar acesso</button></div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!db.pendentes.length && <p className="muted">Nenhum cadastro aguardando liberação.</p>}
        </div>
      </div>
      <div className="card">
        <div className="card-head"><h3>Usuários ativos</h3></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Unidade</th></tr></thead>
            <tbody>{db.usuarios.map((u) => <tr key={u.email}><td>{u.nome}</td><td>{u.email}</td><td>{u.perfil}</td><td>{u.unidade}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
