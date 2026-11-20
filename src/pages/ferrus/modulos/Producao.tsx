import { motion } from "motion/react";
import { useMemo, useState, type FormEvent } from "react";
import { aprovacao, DEFEITOS, PECAS, SETORES, UNIDADES, type Maquina, type Registro, type StatusMaquina, type Unidade } from "../dados";
import { Colunas, Linhas, Medidor, Pareto } from "../graficos";
import { br, brCurta, diasAte, fmt, iso, media, pct, soma, ultimosDias } from "../nucleo";
import { Abas, Cartao, Etiqueta, Kpi, Progresso, Tabela, tomPorLimite, useAba, useFerrus, usePorUnidade, type Tom } from "../ui";

const TOM_MAQ: Record<StatusMaquina, Tom> = { Produzindo: "ok", Setup: "info", Parada: "bad", Manutenção: "warn" };

export default function Producao() {
  const { db } = useFerrus();
  const [aba, setAba] = useAba(["painel", "maquinas", "apontar", "registros"] as const);
  const maquinas = usePorUnidade(db.maquinas);
  return (
    <>
      <Abas atual={aba} mudar={setAba} abas={[["painel", "Painel"], ["maquinas", "Máquinas", maquinas.length], ["apontar", "Apontar produção"], ["registros", "Registros"]] as const} />
      {aba === "painel" && <Painel />}
      {aba === "maquinas" && <Maquinas maquinas={maquinas} />}
      {aba === "apontar" && <Apontar voltar={() => setAba("registros")} />}
      {aba === "registros" && <Registros />}
    </>
  );
}

function Painel() {
  const { db } = useFerrus();
  const registros = usePorUnidade(db.registros);
  const maquinas = usePorUnidade(db.maquinas);
  const semana = registros.filter((r) => diasAte(r.data) >= -6);
  const insp = soma(semana.map((r) => r.inspecionada));
  const rep = soma(semana.map((r) => r.reprovada));
  const dias = ultimosDias(14);
  const porDia = dias.map((d) => registros.filter((r) => r.data === d));
  const defeitos = useMemo(() => {
    const c: Record<string, number> = {};
    semana.forEach((r) => r.defeitos.forEach((d) => (c[d] = (c[d] ?? 0) + r.reprovada)));
    return Object.entries(c).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v).slice(0, 8);
  }, [semana]);
  const disp = media(maquinas.map((m) => m.disp)), perf = media(maquinas.map((m) => m.perf)), qual = media(maquinas.map((m) => m.qual));
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="producao" rotulo="Peças produzidas (7 dias)" valor={insp - rep} delta="+6,9% x semana anterior" spark={porDia.map((d) => soma(d.map((r) => r.inspecionada - r.reprovada)))} />
        <Kpi indice={1} icone="qualidade" rotulo="Aprovação" valor={insp ? ((insp - rep) / insp) * 100 : 0} formatar={(n) => pct(n)} delta="meta 97%" bom={(insp - rep) / insp >= 0.97} tom="ok" />
        <Kpi indice={2} icone="alerta" rotulo="Refugo (7 dias)" valor={rep} delta={`${fmt((rep / (insp || 1)) * 1e6, 0)} PPM`} bom={false} tom="bad" />
        <Kpi indice={3} icone="relogio" rotulo="Ordens de produção" valor={new Set(semana.map((r) => r.op)).size} delta="em 3 turnos" tom="info" />
      </div>
      <div className="fx-grade-main">
        <Cartao titulo="Produção diária" sub="Peças boas e refugo · últimos 14 dias">
          <Colunas empilhar rotulos={dias.map(brCurta)} series={[
            { nome: "Aprovadas", valores: porDia.map((d) => soma(d.map((r) => r.inspecionada - r.reprovada))), cor: "var(--c1)" },
            { nome: "Refugo", valores: porDia.map((d) => soma(d.map((r) => r.reprovada))), cor: "var(--bad)" },
          ]} />
        </Cartao>
        <Cartao titulo="OEE da planta" sub="Disponibilidade × performance × qualidade">
          <Medidor valor={(disp * perf * qual) / 10000} rotulo="OEE médio" meta={75} />
          <div className="fx-oee-fatores">
            {([["Disponibilidade", disp], ["Performance", perf], ["Qualidade", qual]] as const).map(([k, v]) => (
              <div key={k}><span>{k}</span><b>{pct(v)}</b><Progresso valor={v} /></div>
            ))}
          </div>
        </Cartao>
      </div>
      <div className="fx-grade-2">
        <Cartao titulo="Pareto de defeitos" sub="Peças refugadas por defeito · 7 dias"><Pareto dados={defeitos} /></Cartao>
        <Cartao titulo="Aprovação por setor" sub="Índice de aprovação diário">
          <Linhas rotulos={dias.map(brCurta)} formatar={(n) => fmt(n, 0) + "%"} min={90} max={100} faixa={[97, 100]} series={(["Pintura", "Injeção", "Soldagem"] as const).map((s, k) => ({
            nome: s, area: false, cor: `var(--c${k + 1})`, valores: dias.map((d) => +aprovacao(registros.filter((r) => r.data === d && r.setor === s)).toFixed(2)),
          }))} />
        </Cartao>
      </div>
    </>
  );
}

function Maquinas({ maquinas }: { maquinas: Maquina[] }) {
  const { mudar, avisar } = useFerrus();
  const [filtro, setFiltro] = useState<StatusMaquina | "todas">("todas");
  const lista = filtro === "todas" ? maquinas : maquinas.filter((m) => m.status === filtro);
  const proximo: Record<StatusMaquina, StatusMaquina> = { Produzindo: "Setup", Setup: "Produzindo", Parada: "Produzindo", Manutenção: "Produzindo" };
  const alternar = (m: Maquina) => {
    const novo = proximo[m.status];
    mudar((b) => ({ ...b, maquinas: b.maquinas.map((x) => (x.id === m.id ? { ...x, status: novo } : x)) }));
    avisar(`${m.nome}: ${novo}`);
  };
  return (
    <>
      <div className="fx-chips">
        {(["todas", "Produzindo", "Setup", "Parada", "Manutenção"] as const).map((s) => (
          <button key={s} className={filtro === s ? "on" : ""} onClick={() => setFiltro(s)}>
            {s !== "todas" && <i className={`fx-ponto t-${TOM_MAQ[s]}`} />}{s === "todas" ? "Todas" : s}
            <span>{s === "todas" ? maquinas.length : maquinas.filter((m) => m.status === s).length}</span>
          </button>
        ))}
      </div>
      <div className="fx-maquinas">
        {lista.map((m, i) => (
          <motion.article key={m.id} className={`fx-maquina b-${TOM_MAQ[m.status]}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}>
            <header>
              <div><b>{m.nome}</b><span>{m.setor} · {m.unidade.replace("Unidade ", "")}</span></div>
              <Etiqueta tom={TOM_MAQ[m.status]}>{m.status}</Etiqueta>
            </header>
            <div className="fx-maquina-oee">
              <strong className={`t-${tomPorLimite(m.oee, 75, 60)}`}>{fmt(m.oee, 1)}<small>% OEE</small></strong>
              <div className="fx-maquina-fatores"><span>D {fmt(m.disp, 0)}</span><span>P {fmt(m.perf, 0)}</span><span>Q {fmt(m.qual, 0)}</span></div>
            </div>
            <p className="fx-maquina-op"><span className="mono">{m.op}</span> · {m.peca}</p>
            <div className="fx-maquina-meta"><Progresso valor={(m.produzidas / m.meta) * 100} tom="accent" /><span>{fmt(m.produzidas)} / {fmt(m.meta)}</span></div>
            <button className="fx-btn fino" onClick={() => alternar(m)}>{m.status === "Produzindo" ? "Iniciar setup" : "Liberar produção"}</button>
          </motion.article>
        ))}
      </div>
    </>
  );
}

function Apontar({ voltar }: { voltar: () => void }) {
  const { mudar, avisar, unidade } = useFerrus();
  const [f, setF] = useState({
    unidade: (unidade === "todas" ? UNIDADES[0] : unidade) as Unidade, setor: SETORES[0] as string, turno: "A" as Registro["turno"],
    op: "", codigo: PECAS[0][0] as string, operador: "", inspecionada: 0, reprovada: 0, defeitos: [] as string[],
  });
  const erro = f.reprovada > f.inspecionada ? "A quantidade reprovada não pode passar da inspecionada." : f.reprovada > 0 && !f.defeitos.length ? "Marque pelo menos um defeito." : "";
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (erro) return;
    mudar((b) => ({
      ...b,
      registros: [{ ...f, id: Math.max(...b.registros.map((r) => r.id)) + 1, data: iso(new Date()), op: f.op.trim().slice(0, 20) || "OP-31999", operador: f.operador.trim().slice(0, 60) || "Marina Alves" }, ...b.registros],
      auditoria: [{ quando: new Date().toISOString(), quem: "Marina Alves", acao: "apontou produção", modulo: "Produção" }, ...b.auditoria],
    }));
    avisar("Apontamento registrado");
    voltar();
  };
  const aprov = f.inspecionada ? ((f.inspecionada - f.reprovada) / f.inspecionada) * 100 : 0;
  return (
    <Cartao titulo="Novo apontamento" sub="Registre a produção e a inspeção de um lote">
      <form className="fx-form" onSubmit={enviar}>
        <div className="fx-form-grade">
          <label>Unidade<select value={f.unidade} onChange={(e) => setF({ ...f, unidade: e.target.value as Unidade })}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select></label>
          <label>Setor<select value={f.setor} onChange={(e) => setF({ ...f, setor: e.target.value })}>{SETORES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Turno<select value={f.turno} onChange={(e) => setF({ ...f, turno: e.target.value as Registro["turno"] })}><option value="A">A · 06h às 14h</option><option value="B">B · 14h às 22h</option><option value="C">C · 22h às 06h</option></select></label>
          <label>Ordem de produção<input value={f.op} maxLength={20} placeholder="OP-31540" onChange={(e) => setF({ ...f, op: e.target.value })} /></label>
          <label>Peça<select value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value })}>{PECAS.map(([c, n]) => <option key={c} value={c}>{c} · {n}</option>)}</select></label>
          <label>Operador<input value={f.operador} maxLength={60} placeholder="Nome do operador" onChange={(e) => setF({ ...f, operador: e.target.value })} /></label>
          <label>Inspecionadas<input type="number" min={1} max={100000} required value={f.inspecionada || ""} onChange={(e) => setF({ ...f, inspecionada: Math.max(0, Math.floor(+e.target.value)) })} /></label>
          <label>Reprovadas<input type="number" min={0} max={100000} value={f.reprovada || ""} onChange={(e) => setF({ ...f, reprovada: Math.max(0, Math.floor(+e.target.value)) })} /></label>
        </div>
        <fieldset className="fx-defeitos">
          <legend>Defeitos encontrados</legend>
          {DEFEITOS.map((d) => (
            <label key={d} className={f.defeitos.includes(d) ? "on" : ""}>
              <input type="checkbox" checked={f.defeitos.includes(d)} onChange={() => setF({ ...f, defeitos: f.defeitos.includes(d) ? f.defeitos.filter((x) => x !== d) : [...f.defeitos, d] })} />{d}
            </label>
          ))}
        </fieldset>
        <div className="fx-form-pe">
          <div className="fx-form-resumo">
            Aprovação do lote: <b className={`t-${tomPorLimite(aprov, 97, 94)}`}>{f.inspecionada ? pct(aprov) : "—"}</b>
            {erro && <span className="t-bad">{erro}</span>}
          </div>
          <button className="fx-btn primario" type="submit" disabled={!!erro}>Registrar apontamento</button>
        </div>
      </form>
    </Cartao>
  );
}

function Registros() {
  const { db } = useFerrus();
  const registros = usePorUnidade(db.registros);
  const [setor, setSetor] = useState("todos");
  const linhas = setor === "todos" ? registros : registros.filter((r) => r.setor === setor);
  return (
    <Cartao titulo="Registros de produção" sub="Últimos 14 dias · clique no título da coluna para ordenar">
      <Tabela linhas={linhas} chave={(r) => r.id} porPagina={12}
        busca={(r) => `${r.op} ${r.codigo} ${r.operador} ${r.setor} ${r.defeitos.join(" ")}`}
        csv={{ nome: "ferrus-registros", colunas: ["data", "turno", "unidade", "setor", "op", "codigo", "operador", "inspecionada", "reprovada", "defeitos"] }}
        filtros={<select className="fx-select" value={setor} onChange={(e) => setSetor(e.target.value)} aria-label="Filtrar por setor"><option value="todos">Todos os setores</option>{SETORES.map((s) => <option key={s}>{s}</option>)}</select>}
        colunas={[
          { k: "data", titulo: "Data", render: (r) => br(r.data) },
          { k: "turno", titulo: "Turno", alinhar: "centro", esconderCelular: true },
          { k: "unidade", titulo: "Unidade", render: (r) => r.unidade.replace("Unidade ", ""), esconderCelular: true },
          { k: "setor", titulo: "Setor" },
          { k: "op", titulo: "OP", mono: true },
          { k: "codigo", titulo: "Peça", mono: true, esconderCelular: true },
          { k: "operador", titulo: "Operador", esconderCelular: true },
          { k: "inspecionada", titulo: "Insp.", alinhar: "dir", valor: (r) => r.inspecionada, render: (r) => fmt(r.inspecionada) },
          { k: "reprovada", titulo: "Rep.", alinhar: "dir", valor: (r) => r.reprovada },
          { k: "aprov", titulo: "Aprovação", alinhar: "dir", valor: (r) => aprovacao([r]), render: (r) => { const a = aprovacao([r]); return <Etiqueta tom={tomPorLimite(a, 97, 94)}>{pct(a)}</Etiqueta>; } },
        ]} />
    </Cartao>
  );
}
