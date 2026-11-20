import { useState, type FormEvent } from "react";
import type { OrdemServico, StatusOS } from "../dados";
import { Colunas, Linhas, MapaCalor } from "../graficos";
import { br, brCurta, compacto, diasAte, fmt, iso, pct, ultimosMeses } from "../nucleo";
import { Abas, Cartao, Etiqueta, Icone, Kanban, Kpi, Modal, Progresso, Tabela, useAba, useFerrus, usePorUnidade, type Tom } from "../ui";

const COLS = [
  { id: "Aberta", titulo: "Aberta", tom: "warn" }, { id: "Em execução", titulo: "Em execução", tom: "info" },
  { id: "Aguardando peça", titulo: "Aguardando peça", tom: "bad" }, { id: "Concluída", titulo: "Concluída", tom: "ok" },
] as const satisfies readonly { id: StatusOS; titulo: string; tom: Tom }[];
const TOM_PRI: Record<OrdemServico["prioridade"], Tom> = { Baixa: "neutro", Média: "info", Alta: "warn", Crítica: "bad" };

export default function Manutencao() {
  const { db } = useFerrus();
  const [aba, setAba] = useAba(["painel", "os", "moldes"] as const);
  return (
    <>
      <Abas atual={aba} mudar={setAba} abas={[["painel", "Painel"], ["os", "Ordens de serviço", db.ordens.filter((o) => o.status !== "Concluída").length], ["moldes", "Preventiva de moldes", db.moldes.length]] as const} />
      {aba === "painel" && <Painel />}
      {aba === "os" && <Ordens />}
      {aba === "moldes" && <Moldes />}
    </>
  );
}

function Painel() {
  const { db } = useFerrus();
  const meses = ultimosMeses(12);
  const ordens = usePorUnidade(db.ordens);
  const tipos = (["Corretiva", "Preventiva", "Preditiva"] as const).map((t) => ordens.filter((o) => o.tipo === t).length);
  const semanas = ["sem 1", "sem 2", "sem 3", "sem 4", "sem 5", "sem 6"];
  const setores = ["Estamparia", "Soldagem", "Usinagem", "Injeção", "Pintura", "Montagem"];
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="relogio" rotulo="MTBF" valor={db.mtbf[11]!} formatar={(n) => fmt(n) + " h"} delta="tempo médio entre falhas" spark={db.mtbf} tom="ok" />
        <Kpi indice={1} icone="manutencao" rotulo="MTTR" valor={2.6} formatar={(n) => fmt(n, 1) + " h"} delta="-0,4 h no trimestre" tom="info" />
        <Kpi indice={2} icone="producao" rotulo="Disponibilidade" valor={94.2} formatar={(n) => pct(n)} delta="meta 93%" tom="ok" />
        <Kpi indice={3} icone="compras" rotulo="Custo no mês" valor={db.custoManutencao[11]!} formatar={(n) => "R$ " + compacto(n)} delta={`${pct((tipos[1]! + tipos[2]!) / (ordens.length || 1) * 100, 0)} planejada`} tom="warn" spark={db.custoManutencao} />
      </div>
      <div className="fx-grade-2">
        <Cartao titulo="MTBF" sub="Horas entre falhas · quanto maior, melhor">
          <Linhas rotulos={meses} formatar={(n) => fmt(n) + " h"} series={[{ nome: "MTBF", valores: db.mtbf, cor: "var(--ok)" }]} />
        </Cartao>
        <Cartao titulo="Corretiva x planejada" sub="Horas de manutenção por mês">
          <Colunas empilhar rotulos={meses.slice(-6)} series={[
            { nome: "Preventiva", valores: [180, 196, 204, 188, 214, 120], cor: "var(--c2)" },
            { nome: "Preditiva", valores: [40, 44, 52, 56, 61, 34], cor: "var(--c5)" },
            { nome: "Corretiva", valores: [132, 118, 104, 99, 87, 41], cor: "var(--bad)" },
          ]} formatar={(n) => fmt(n) + " h"} />
        </Cartao>
      </div>
      <Cartao titulo="Horas paradas por setor" sub="Últimas 6 semanas · quanto mais escuro, mais tempo parado">
        <MapaCalor linhas={setores} colunas={semanas} formatar={(n) => fmt(n, 0) + "h"} valor={(l, c) => Math.round(4 + ((l * 7 + c * 13) % 17) + (l === 3 ? 9 : 0) - c * 0.6)} />
      </Cartao>
    </>
  );
}

function Ordens() {
  const { db, mudar, avisar } = useFerrus();
  const ordens = usePorUnidade(db.ordens);
  const [aberto, setAberto] = useState(false);
  const [nova, setNova] = useState({ maquina: db.maquinas[0]!.nome, tipo: "Corretiva" as OrdemServico["tipo"], prioridade: "Alta" as OrdemServico["prioridade"], desc: "" });
  const mover = (o: OrdemServico, para: StatusOS) => {
    mudar((b) => ({ ...b, ordens: b.ordens.map((x) => (x.id === o.id ? { ...x, status: para } : x)) }));
    avisar(`${o.id} → ${para}`);
  };
  const abrir = (e: FormEvent) => {
    e.preventDefault();
    const m = db.maquinas.find((x) => x.nome === nova.maquina)!;
    mudar((b) => ({ ...b, ordens: [{ ...nova, desc: nova.desc.trim().slice(0, 160), id: "OS-" + (Math.max(...b.ordens.map((o) => +o.id.slice(3))) + 1), unidade: m.unidade, abertura: iso(new Date()), status: "Aberta", tecnico: "A definir", horas: 0 }, ...b.ordens] }));
    setAberto(false);
    setNova({ ...nova, desc: "" });
    avisar("Ordem de serviço aberta");
  };
  return (
    <>
      <div className="fx-barra-acoes">
        <p className="fx-dica-txt">Arraste as ordens para atualizar o andamento.</p>
        <button className="fx-btn primario" onClick={() => setAberto(true)}><Icone n="mais" tam={16} />Abrir OS</button>
      </div>
      <Kanban colunas={COLS} itens={ordens} chave={(o) => o.id} coluna={(o) => o.status} mover={mover}
        render={(o) => (
          <>
            <div className="fx-kc-top"><span className="mono">{o.id}</span><Etiqueta tom={TOM_PRI[o.prioridade]}>{o.prioridade}</Etiqueta></div>
            <p className="fx-kc-txt">{o.desc}</p>
            <p className="fx-kc-sub">{o.maquina} · {o.tipo}</p>
            <div className="fx-kc-pe"><span>{o.tecnico}</span><time>{brCurta(o.abertura)}</time></div>
          </>
        )} />
      <Modal aberto={aberto} fechar={() => setAberto(false)} titulo="Abrir ordem de serviço">
        <form className="fx-form" onSubmit={abrir}>
          <div className="fx-form-grade">
            <label>Máquina<select value={nova.maquina} onChange={(e) => setNova({ ...nova, maquina: e.target.value })}>{db.maquinas.map((m) => <option key={m.id}>{m.nome}</option>)}</select></label>
            <label>Tipo<select value={nova.tipo} onChange={(e) => setNova({ ...nova, tipo: e.target.value as OrdemServico["tipo"] })}><option>Corretiva</option><option>Preventiva</option><option>Preditiva</option></select></label>
            <label>Prioridade<select value={nova.prioridade} onChange={(e) => setNova({ ...nova, prioridade: e.target.value as OrdemServico["prioridade"] })}><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></label>
          </div>
          <label>Descrição do problema<textarea rows={3} required maxLength={160} value={nova.desc} onChange={(e) => setNova({ ...nova, desc: e.target.value })} placeholder="Ex.: ruído anormal no motor principal" /></label>
          <div className="fx-form-pe"><span /><button className="fx-btn primario" type="submit">Abrir OS</button></div>
        </form>
      </Modal>
    </>
  );
}

function Moldes() {
  const { db, mudar, avisar } = useFerrus();
  const fazer = (cod: string) => {
    mudar((b) => ({ ...b, moldes: b.moldes.map((m) => (m.cod === cod ? { ...m, ciclos: 0, proxima: iso(new Date(Date.now() + 30 * 864e5)) } : m)) }));
    avisar(`Preventiva do ${cod} registrada`);
  };
  return (
    <Cartao titulo="Preventiva de moldes" sub="Troca por ciclos acumulados ou por data, o que vier primeiro">
      <Tabela linhas={[...db.moldes].sort((a, b) => b.ciclos / b.limite - a.ciclos / a.limite)} chave={(m) => m.cod} porPagina={12} colunas={[
        { k: "cod", titulo: "Molde", mono: true }, { k: "nome", titulo: "Peça" }, { k: "maquina", titulo: "Máquina", esconderCelular: true },
        { k: "ciclos", titulo: "Ciclos", valor: (m) => m.ciclos / m.limite, render: (m) => (
          <div className="fx-ciclos"><Progresso valor={(m.ciclos / m.limite) * 100} tom={m.ciclos >= m.limite ? "bad" : m.ciclos > m.limite * 0.85 ? "warn" : "ok"} /><span>{fmt(m.ciclos)} / {fmt(m.limite)}</span></div>
        ) },
        { k: "proxima", titulo: "Próxima", render: (m) => <span className={diasAte(m.proxima) < 0 ? "t-bad" : ""}>{br(m.proxima)}</span> },
        { k: "acao", titulo: "", alinhar: "dir", render: (m) => (m.ciclos >= m.limite * 0.85 || diasAte(m.proxima) < 7) ? <button className="fx-btn fino" onClick={() => fazer(m.cod)}>Registrar preventiva</button> : <Etiqueta tom="ok">Em dia</Etiqueta> },
      ]} />
    </Cartao>
  );
}
