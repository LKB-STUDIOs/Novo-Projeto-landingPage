import { CLIENTES, type EtapaExpedicao, type Expedicao, type ItemEstoque } from "../dados";
import { Linhas, Ranking } from "../graficos";
import { br, brCurta, fmt, pct, real, realCompacto, soma, ultimosMeses } from "../nucleo";
import { Abas, Cartao, Etiqueta, Kanban, Kpi, Tabela, useAba, useFerrus, type Tom } from "../ui";

const COLS = [
  { id: "Separação", titulo: "Separação", tom: "neutro" }, { id: "Conferência", titulo: "Conferência", tom: "warn" },
  { id: "Carregado", titulo: "Carregado", tom: "info" }, { id: "Em trânsito", titulo: "Em trânsito", tom: "accent" }, { id: "Entregue", titulo: "Entregue", tom: "ok" },
] as const satisfies readonly { id: EtapaExpedicao; titulo: string; tom: Tom }[];

export default function Logistica() {
  const { db } = useFerrus();
  const [aba, setAba] = useAba(["expedicao", "estoque"] as const);
  const abaixo = db.estoque.filter((e) => e.saldo < e.minimo).length;
  return (
    <>
      <Abas atual={aba} mudar={setAba} abas={[["expedicao", "Expedição", db.expedicoes.filter((e) => e.etapa !== "Entregue").length], ["estoque", "Estoque", abaixo]] as const} />
      {aba === "expedicao" ? <Expedicoes /> : <Estoque />}
    </>
  );
}

function Expedicoes() {
  const { db, mudar, avisar } = useFerrus();
  const mover = (e: Expedicao, para: EtapaExpedicao) => {
    mudar((b) => ({ ...b, expedicoes: b.expedicoes.map((x) => (x.id === e.id ? { ...x, etapa: para } : x)) }));
    avisar(`${e.id} → ${para}`);
  };
  const emCurso = db.expedicoes.filter((e) => e.etapa !== "Entregue");
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="logistica" rotulo="Entregas no prazo (OTD)" valor={db.otdMensal[11]!} formatar={(n) => pct(n)} delta="meta 95%" spark={db.otdMensal} tom="ok" />
        <Kpi indice={1} icone="relogio" rotulo="Expedições em curso" valor={emCurso.length} delta={`${fmt(soma(emCurso.map((e) => e.volumes)))} volumes`} tom="info" />
        <Kpi indice={2} icone="producao" rotulo="Peso a expedir" valor={soma(emCurso.map((e) => e.peso))} formatar={(n) => fmt(n / 1000, 1) + " t"} delta="hoje e amanhã" tom="accent" />
        <Kpi indice={3} icone="alerta" rotulo="Com risco de atraso" valor={emCurso.filter((e) => !e.noPrazo).length} delta="avisar clientes" bom={false} tom="bad" />
      </div>
      <Kanban colunas={COLS} itens={db.expedicoes} chave={(e) => e.id} coluna={(e) => e.etapa} mover={mover}
        render={(e) => (
          <>
            <div className="fx-kc-top"><span className="mono">{e.id}</span>{!e.noPrazo && e.etapa !== "Entregue" && <Etiqueta tom="bad">risco</Etiqueta>}</div>
            <p className="fx-kc-txt">{e.cliente}</p>
            <p className="fx-kc-sub">{e.nf} · {e.volumes} vol. · {fmt(e.peso)} kg</p>
            <div className="fx-kc-pe"><span>{e.transportadora}</span><time>{brCurta(e.previsao)}</time></div>
          </>
        )} />
      <div className="fx-grade-2">
        <Cartao titulo="OTD mensal" sub="Entregas no prazo · últimos 12 meses">
          <Linhas rotulos={ultimosMeses(12)} min={85} max={100} faixa={[95, 100]} formatar={(n) => fmt(n, 0) + "%"} series={[{ nome: "OTD", valores: db.otdMensal, cor: "var(--ok)" }]} />
        </Cartao>
        <Cartao titulo="Volume por cliente" sub="Peso expedido no mês (t)">
          <Ranking formatar={(n) => fmt(n, 1) + " t"} dados={CLIENTES.map((c, i) => ({ k: c, v: 18 + ((i * 37) % 41) + i * 3.4, cor: `var(--c${(i % 6) + 1})` })).sort((a, b) => b.v - a.v)} />
        </Cartao>
      </div>
    </>
  );
}

function Estoque() {
  const { db } = useFerrus();
  const valor = soma(db.estoque.map((e) => e.saldo * e.custo));
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="compras" rotulo="Valor em estoque" valor={valor} formatar={realCompacto} delta="matéria-prima e insumos" />
        <Kpi indice={1} icone="alerta" rotulo="Abaixo do mínimo" valor={db.estoque.filter((e) => e.saldo < e.minimo).length} delta="gerar requisição" bom={false} tom="bad" />
        <Kpi indice={2} icone="restaurar" rotulo="Giro de estoque" valor={6.8} formatar={(n) => fmt(n, 1) + "x"} delta="ao ano" tom="info" />
        <Kpi indice={3} icone="ok" rotulo="Acuracidade do inventário" valor={98.6} formatar={(n) => pct(n)} delta="último inventário" tom="ok" />
      </div>
      <Cartao titulo="Posição de estoque" sub="Barra mostra o saldo entre o mínimo e o máximo">
        <Tabela<ItemEstoque> linhas={db.estoque} chave={(e) => e.cod} busca={(e) => `${e.cod} ${e.item} ${e.categoria}`} porPagina={12}
          csv={{ nome: "ferrus-estoque", colunas: ["cod", "item", "categoria", "saldo", "minimo", "maximo", "un"] }}
          colunas={[
            { k: "cod", titulo: "Código", mono: true }, { k: "item", titulo: "Item" }, { k: "categoria", titulo: "Categoria", esconderCelular: true },
            { k: "saldo", titulo: "Saldo", alinhar: "dir", valor: (e) => e.saldo, render: (e) => `${fmt(e.saldo)} ${e.un}` },
            {
              k: "nivel", titulo: "Nível", valor: (e) => e.saldo / e.maximo, render: (e) => {
                const p = Math.min(100, (e.saldo / e.maximo) * 100);
                const t = e.saldo < e.minimo ? "bad" : e.saldo > e.maximo ? "info" : "ok";
                return <div className="fx-nivel"><div className={`fx-prog t-${t}`}><i style={{ width: `${p}%` }} /><em style={{ left: `${(e.minimo / e.maximo) * 100}%` }} /></div></div>;
              },
            },
            { k: "valor", titulo: "Valor", alinhar: "dir", esconderCelular: true, valor: (e) => e.saldo * e.custo, render: (e) => real(e.saldo * e.custo) },
            { k: "sit", titulo: "Situação", render: (e) => e.saldo < e.minimo ? <Etiqueta tom="bad">Repor</Etiqueta> : e.saldo > e.maximo ? <Etiqueta tom="info">Excesso</Etiqueta> : <Etiqueta tom="ok">Normal</Etiqueta> },
          ]} />
      </Cartao>
      <p className="fx-nota">Última contagem cíclica em {br(db.geradoEm)}.</p>
    </>
  );
}
