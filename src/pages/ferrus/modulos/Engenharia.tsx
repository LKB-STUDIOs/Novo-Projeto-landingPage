import { useState } from "react";
import type { ECN, ItemBOM, ProjetoPPAP, StatusECN, StatusPPAP } from "../dados";
import { Colunas, Rosca } from "../graficos";
import { br, brCurta, diasAte, fmt } from "../nucleo";
import { Abas, Avatar, Cartao, Etiqueta, Kanban, Kpi, Progresso, Tabela, useAba, useFerrus, type Tom } from "../ui";

const TOM_PPAP: Record<StatusPPAP, Tom> = { "No prazo": "ok", Atenção: "warn", Atrasado: "bad", Aprovado: "info" };
const FASES = ["Planejamento", "Projeto do produto", "Projeto do processo", "Validação", "Aprovação"];
const ELEMENTOS = [
  "Registros de projeto", "Alterações de engenharia", "Aprovação de engenharia", "DFMEA", "Fluxograma do processo", "PFMEA",
  "Plano de controle", "MSA", "Resultados dimensionais", "Ensaios de material", "Estudos iniciais de processo", "Laboratório qualificado",
  "Aprovação de aparência", "Amostras de produção", "Amostra padrão", "Dispositivos de controle", "Requisitos do cliente", "PSW",
];
const COLS_ECN = [
  { id: "Solicitada", titulo: "Solicitada", tom: "neutro" }, { id: "Em análise", titulo: "Em análise", tom: "warn" },
  { id: "Aprovada", titulo: "Aprovada", tom: "info" }, { id: "Implementada", titulo: "Implementada", tom: "ok" },
] as const satisfies readonly { id: StatusECN; titulo: string; tom: Tom }[];

export default function Engenharia() {
  const { db } = useFerrus();
  const [aba, setAba] = useAba(["ppap", "ecn", "bom"] as const);
  return (
    <>
      <Abas atual={aba} mudar={setAba} abas={[["ppap", "Projetos PPAP", db.ppap.length], ["ecn", "Mudanças de engenharia", db.ecns.filter((e) => e.status !== "Implementada").length], ["bom", "Estrutura de produto"]] as const} />
      {aba === "ppap" && <PPAP />}
      {aba === "ecn" && <ECNs />}
      {aba === "bom" && <BOM raiz={db.bom} />}
    </>
  );
}

function PPAP() {
  const { db, mudar, avisar } = useFerrus();
  const [sel, setSel] = useState<ProjetoPPAP | null>(null);
  const contagem = (s: StatusPPAP) => db.ppap.filter((p) => p.status === s).length;
  const avancar = (p: ProjetoPPAP) => {
    const elementos = Math.min(18, p.elementos + 1);
    const status: StatusPPAP = elementos === 18 ? "Aprovado" : p.status;
    const fase = Math.min(5, Math.ceil(elementos / 3.6));
    mudar((b) => ({ ...b, ppap: b.ppap.map((x) => (x.id === p.id ? { ...x, elementos, status, fase } : x)) }));
    setSel({ ...p, elementos, status, fase });
    avisar(elementos === 18 ? `${p.id} aprovado pelo cliente` : `${ELEMENTOS[p.elementos]} aprovado`);
  };
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="engenharia" rotulo="Projetos ativos" valor={db.ppap.filter((p) => p.status !== "Aprovado").length} delta={`${contagem("Aprovado")} aprovados no ano`} />
        <Kpi indice={1} icone="ok" rotulo="No prazo" valor={contagem("No prazo")} tom="ok" delta="cronograma em dia" />
        <Kpi indice={2} icone="alerta" rotulo="Em atenção" valor={contagem("Atenção")} tom="warn" delta="risco de atraso" bom={false} />
        <Kpi indice={3} icone="relogio" rotulo="Atrasados" valor={contagem("Atrasado")} tom="bad" delta="prazo vencido" bom={false} />
      </div>
      <div className="fx-grade-main">
        <Cartao titulo="Pipeline APQP" sub="Projetos por fase · clique para ver os 18 elementos do PPAP">
          <div className="fx-ppap">
            {db.ppap.map((p) => (
              <button key={p.id} className={`fx-ppap-linha ${sel?.id === p.id ? "on" : ""}`} onClick={() => setSel(p)}>
                <div className="fx-ppap-nome"><b>{p.peca}</b><span><span className="mono">{p.codigo}</span> · {p.cliente} · nível {p.nivel}</span></div>
                <div className="fx-ppap-fases">{FASES.map((f, i) => <i key={f} className={i < p.fase ? "feito" : ""} title={f} />)}</div>
                <span className="fx-ppap-num">{p.elementos}/18</span>
                <Etiqueta tom={TOM_PPAP[p.status]}>{p.status}</Etiqueta>
              </button>
            ))}
          </div>
        </Cartao>
        <Cartao titulo={sel ? sel.peca : "Elementos do PPAP"} sub={sel ? `${sel.id} · entrega ${br(sel.prazo)} (${diasAte(sel.prazo) >= 0 ? `faltam ${diasAte(sel.prazo)} dias` : `${-diasAte(sel.prazo)} dias de atraso`})` : "Selecione um projeto"}
          acao={sel && sel.elementos < 18 && <button className="fx-btn primario fino" onClick={() => avancar(sel)}>Aprovar próximo</button>}>
          {sel ? (
            <>
              <Progresso valor={(sel.elementos / 18) * 100} tom={TOM_PPAP[sel.status]} />
              <ol className="fx-elementos">
                {ELEMENTOS.map((e, i) => <li key={e} className={i < sel.elementos ? "feito" : i === sel.elementos ? "atual" : ""}><span>{i + 1}</span>{e}</li>)}
              </ol>
            </>
          ) : (
            <Rosca dados={(["No prazo", "Atenção", "Atrasado", "Aprovado"] as const).map((s) => ({ k: s, v: contagem(s), cor: `var(--${TOM_PPAP[s] === "info" ? "c2" : TOM_PPAP[s]})` }))} centro={String(db.ppap.length)} sub="projetos" />
          )}
        </Cartao>
      </div>
    </>
  );
}

function ECNs() {
  const { db, mudar, avisar } = useFerrus();
  const mover = (e: ECN, para: StatusECN) => {
    mudar((b) => ({ ...b, ecns: b.ecns.map((x) => (x.id === e.id ? { ...x, status: para } : x)) }));
    avisar(`${e.id} → ${para}`);
  };
  return (
    <>
      <Kanban colunas={COLS_ECN} itens={db.ecns} chave={(e) => e.id} coluna={(e) => e.status} mover={mover}
        render={(e) => (
          <>
            <div className="fx-kc-top"><span className="mono">{e.id}</span><Etiqueta tom={e.impacto === "Alto" ? "bad" : e.impacto === "Médio" ? "warn" : "neutro"}>Impacto {e.impacto.toLowerCase()}</Etiqueta></div>
            <p className="fx-kc-txt">{e.titulo}</p>
            <p className="fx-kc-sub">{e.peca} · {e.motivo}</p>
            <div className="fx-kc-pe"><Avatar nome={e.resp} tam={22} /><span>{e.resp}</span><time>{brCurta(e.data)}</time></div>
          </>
        )} />
      <Cartao titulo="Mudanças por mês" sub="Solicitações de alteração de engenharia">
        <Colunas rotulos={["jun", "jul", "ago", "set", "out", "nov"]} series={[
          { nome: "Solicitadas", valores: [6, 4, 7, 5, 8, 7], cor: "var(--c2)" }, { nome: "Implementadas", valores: [5, 4, 5, 6, 6, 2], cor: "var(--c1)" },
        ]} />
      </Cartao>
    </>
  );
}

function custo(i: ItemBOM): number {
  return i.filhos ? i.filhos.reduce((s, f) => s + custo(f) * f.qtd, 0) : i.custo;
}
type LinhaBOM = { item: ItemBOM; nivel: number; caminho: string };
function achatar(i: ItemBOM, nivel = 0, caminho = "1"): LinhaBOM[] {
  return [{ item: i, nivel, caminho }, ...(i.filhos ?? []).flatMap((f, k) => achatar(f, nivel + 1, `${caminho}.${k + 1}`))];
}

function BOM({ raiz }: { raiz: ItemBOM }) {
  const linhas = achatar(raiz);
  const total = custo(raiz);
  const dist = (raiz.filhos ?? []).map((f, i) => ({ k: f.nome, v: +(custo(f) * f.qtd).toFixed(2), cor: `var(--c${(i % 6) + 1})` }));
  return (
    <div className="fx-grade-main">
      <Cartao titulo={raiz.nome} sub={`${raiz.cod} · estrutura com ${linhas.length - 1} itens`} acao={<Etiqueta tom="accent">custo R$ {fmt(total, 2)}</Etiqueta>}>
        <Tabela linhas={linhas} chave={(l) => l.caminho} porPagina={20} colunas={[
          { k: "caminho", titulo: "Nível", mono: true, render: (l) => <span style={{ paddingLeft: l.nivel * 14 }}>{l.caminho}</span> },
          { k: "cod", titulo: "Código", mono: true, render: (l) => l.item.cod },
          { k: "nome", titulo: "Item", render: (l) => <span className={l.item.filhos ? "fx-forte" : ""}>{l.item.nome}</span> },
          { k: "qtd", titulo: "Qtd.", alinhar: "dir", render: (l) => `${fmt(l.item.qtd, l.item.qtd % 1 ? 2 : 0)} ${l.item.un}` },
          { k: "custo", titulo: "Custo", alinhar: "dir", render: (l) => "R$ " + fmt(custo(l.item) * l.item.qtd, 2) },
        ]} />
      </Cartao>
      <Cartao titulo="Composição do custo" sub="Por subconjunto">
        <Rosca dados={dist} centro={"R$ " + fmt(total, 2)} sub="por conjunto" formatar={(n) => "R$ " + fmt(n, 2)} />
      </Cartao>
    </div>
  );
}
