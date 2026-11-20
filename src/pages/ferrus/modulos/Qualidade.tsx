import { useState, type FormEvent } from "react";
import { aprovacao, SETORES, UNIDADES, type NC, type StatusNC, type Unidade } from "../dados";
import { CartaControle, Colunas, Ranking, Rosca } from "../graficos";
import { br, brCurta, diasAte, fmt, iso, pct, soma, ultimosDias } from "../nucleo";
import { Abas, Avatar, Cartao, Etiqueta, Icone, Kanban, Kpi, Modal, useAba, useFerrus, usePorUnidade, type Tom } from "../ui";

const COLS = [
  { id: "Em análise", titulo: "Em análise", tom: "warn" },
  { id: "Ação corretiva", titulo: "Ação corretiva", tom: "bad" },
  { id: "Verificação", titulo: "Verificação de eficácia", tom: "info" },
  { id: "Encerrada", titulo: "Encerrada", tom: "ok" },
] as const satisfies readonly { id: StatusNC; titulo: string; tom: Tom }[];
const GRAV: Record<NC["grav"], Tom> = { Baixa: "neutro", Média: "warn", Alta: "bad" };
const ETAPAS_8D = ["Equipe", "Problema", "Contenção", "Causa raiz", "Ações", "Implementação", "Prevenção", "Encerramento"];

export default function Qualidade() {
  const { db } = useFerrus();
  const [aba, setAba] = useAba(["painel", "ncs", "8d"] as const);
  return (
    <>
      <Abas atual={aba} mudar={setAba} abas={[["painel", "Painel"], ["ncs", "Não conformidades", db.ncs.filter((n) => n.status !== "Encerrada").length], ["8d", "Reclamações de clientes", db.reclamacoes.length]] as const} />
      {aba === "painel" && <Painel />}
      {aba === "ncs" && <NCs />}
      {aba === "8d" && <Reclamacoes />}
    </>
  );
}

function Painel() {
  const { db } = useFerrus();
  const registros = usePorUnidade(db.registros);
  const ncs = usePorUnidade(db.ncs);
  const insp = soma(registros.map((r) => r.inspecionada));
  const rep = soma(registros.map((r) => r.reprovada));
  const dias = ultimosDias(14);
  const origem = (["Interna", "Cliente", "Fornecedor"] as const).map((o, i) => ({ k: o, v: ncs.filter((n) => n.origem === o).length, cor: `var(--c${i + 1})` }));
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="qualidade" rotulo="Aprovação (14 dias)" valor={aprovacao(registros)} formatar={(n) => pct(n)} delta="+0,4 p.p." tom="ok" spark={dias.map((d) => aprovacao(registros.filter((r) => r.data === d)))} />
        <Kpi indice={1} icone="alerta" rotulo="PPM interno" valor={(rep / (insp || 1)) * 1e6} formatar={(n) => fmt(n)} delta="meta 25.000" bom={rep / insp < 0.025} tom="warn" />
        <Kpi indice={2} icone="relogio" rotulo="NCs abertas" valor={ncs.filter((n) => n.status !== "Encerrada").length} delta={`${ncs.filter((n) => n.grav === "Alta" && n.status !== "Encerrada").length} de gravidade alta`} bom={false} tom="bad" />
        <Kpi indice={3} icone="compras" rotulo="PPM de clientes" valor={soma(db.reclamacoes.map((r) => r.ppm)) / db.reclamacoes.length} formatar={(n) => fmt(n)} delta="-18% no trimestre" tom="info" />
      </div>
      <div className="fx-grade-main">
        <Cartao titulo="Carta de controle · espessura de camada (µm)" sub="Cabine de pintura 02 · 30 últimas amostras · especificação 22 a 26 µm" acao={<Etiqueta tom="warn">tendência de alta</Etiqueta>}>
          <CartaControle valores={db.cep} lie={22} lse={26} rotulo="Espessura de camada" />
        </Cartao>
        <Cartao titulo="Origem das NCs" sub="Período atual">
          <Rosca dados={origem} centro={String(ncs.length)} sub="não conformidades" />
        </Cartao>
      </div>
      <div className="fx-grade-main">
        <Cartao titulo="Refugo por setor" sub="Peças reprovadas · últimos 14 dias">
          <Colunas rotulos={[...SETORES]} series={[{ nome: "Reprovadas", valores: SETORES.map((s) => soma(registros.filter((r) => r.setor === s).map((r) => r.reprovada))), cor: "var(--c3)" }]} />
        </Cartao>
        <Cartao titulo="NCs por setor" sub="Abertas e encerradas">
          <Ranking dados={SETORES.map((s, i) => ({ k: s, v: ncs.filter((n) => n.setor === s).length, cor: `var(--c${(i % 6) + 1})` })).filter((d) => d.v).sort((a, b) => b.v - a.v)} />
        </Cartao>
      </div>
    </>
  );
}

function NCs() {
  const { db, mudar, avisar } = useFerrus();
  const ncs = usePorUnidade(db.ncs);
  const [aberto, setAberto] = useState(false);
  const [nova, setNova] = useState({ setor: SETORES[0] as string, unidade: UNIDADES[0] as Unidade, desc: "", grav: "Média" as NC["grav"], origem: "Interna" as NC["origem"] });
  const mover = (n: NC, para: StatusNC) => {
    mudar((b) => ({ ...b, ncs: b.ncs.map((x) => (x.id === n.id ? { ...x, status: para } : x)) }));
    avisar(`${n.id} → ${para}`);
  };
  const abrir = (e: FormEvent) => {
    e.preventDefault();
    const num = Math.max(0, ...db.ncs.map((n) => Number(n.id.slice(3)) || 0)) + 1;
    mudar((b) => ({ ...b, ncs: [{ ...nova, id: "NC-" + String(num).padStart(4, "0"), desc: nova.desc.trim().slice(0, 200), status: "Em análise", data: iso(new Date()), resp: "Marina Alves" }, ...b.ncs] }));
    setAberto(false);
    setNova({ ...nova, desc: "" });
    avisar("Não conformidade aberta");
  };
  return (
    <>
      <div className="fx-barra-acoes">
        <p className="fx-dica-txt">Arraste os cartões entre as colunas ou use o botão de cada cartão.</p>
        <button className="fx-btn primario" onClick={() => setAberto(true)}><Icone n="mais" tam={16} />Abrir NC</button>
      </div>
      <Kanban colunas={COLS} itens={ncs} chave={(n) => n.id} coluna={(n) => n.status} mover={mover}
        render={(n) => (
          <>
            <div className="fx-kc-top"><span className="mono">{n.id}</span><Etiqueta tom={GRAV[n.grav]}>{n.grav}</Etiqueta></div>
            <p className="fx-kc-txt">{n.desc}</p>
            <div className="fx-kc-pe"><Avatar nome={n.resp} tam={22} /><span>{n.setor} · {n.origem}</span><time>{brCurta(n.data)}</time></div>
          </>
        )} />
      <Modal aberto={aberto} fechar={() => setAberto(false)} titulo="Abrir não conformidade">
        <form className="fx-form" onSubmit={abrir}>
          <div className="fx-form-grade">
            <label>Setor<select value={nova.setor} onChange={(e) => setNova({ ...nova, setor: e.target.value })}>{SETORES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Unidade<select value={nova.unidade} onChange={(e) => setNova({ ...nova, unidade: e.target.value as Unidade })}>{UNIDADES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Gravidade<select value={nova.grav} onChange={(e) => setNova({ ...nova, grav: e.target.value as NC["grav"] })}><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
            <label>Origem<select value={nova.origem} onChange={(e) => setNova({ ...nova, origem: e.target.value as NC["origem"] })}><option>Interna</option><option>Cliente</option><option>Fornecedor</option></select></label>
          </div>
          <label>Descrição<textarea rows={3} required maxLength={200} value={nova.desc} onChange={(e) => setNova({ ...nova, desc: e.target.value })} placeholder="O que aconteceu, onde e em qual lote?" /></label>
          <div className="fx-form-pe"><span /><button className="fx-btn primario" type="submit">Abrir NC</button></div>
        </form>
      </Modal>
    </>
  );
}

function Reclamacoes() {
  const { db, mudar, avisar } = useFerrus();
  return (
    <Cartao titulo="Reclamações de clientes" sub="Acompanhamento pelo método 8D">
      <div className="fx-8d-lista">
        {db.reclamacoes.map((r) => (
          <article key={r.id} className="fx-8d">
            <header>
              <div><span className="mono">{r.id}</span><b>{r.cliente}</b><span className="fx-8d-peca">{r.peca}</span></div>
              <div className="fx-8d-dir"><Etiqueta tom={r.etapa === 8 ? "ok" : diasAte(r.data) < -20 ? "bad" : "warn"}>{r.etapa === 8 ? "Encerrada" : `D${r.etapa} · ${ETAPAS_8D[r.etapa - 1]}`}</Etiqueta><span>{fmt(r.ppm)} PPM · {br(r.data)}</span></div>
            </header>
            <p>{r.desc}</p>
            <ol className="fx-8d-etapas">
              {ETAPAS_8D.map((e, i) => <li key={e} className={i < r.etapa ? "feito" : ""} title={`D${i + 1}: ${e}`}><span>D{i + 1}</span></li>)}
            </ol>
            {r.etapa < 8 && (
              <button className="fx-btn fino" onClick={() => { mudar((b) => ({ ...b, reclamacoes: b.reclamacoes.map((x) => (x.id === r.id ? { ...x, etapa: x.etapa + 1 } : x)) })); avisar(`${r.id}: etapa D${r.etapa + 1} concluída`); }}>
                Concluir D{r.etapa + 1} · {ETAPAS_8D[r.etapa]}
              </button>
            )}
          </article>
        ))}
      </div>
    </Cartao>
  );
}

