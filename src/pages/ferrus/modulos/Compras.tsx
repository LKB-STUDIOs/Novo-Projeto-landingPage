import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Fornecedor, Pedido, Requisicao, StatusPedido } from "../dados";
import { Anel, Colunas, Ranking, Rosca } from "../graficos";
import { br, compacto, diasAte, fmt, real, realCompacto, soma, ultimosMeses } from "../nucleo";
import { Abas, Avatar, Cartao, Etiqueta, Kpi, Tabela, Vazio, useAba, useFerrus, type Tom } from "../ui";

const TOM_PEDIDO: Record<StatusPedido, Tom> = { Cotação: "neutro", Aprovação: "warn", Emitido: "info", "Em trânsito": "accent", Recebido: "ok", Atrasado: "bad" };
const TOM_CLASSE: Record<Fornecedor["classe"], Tom> = { A: "ok", B: "warn", C: "bad" };

export default function Compras() {
  const { db } = useFerrus();
  const [aba, setAba] = useAba(["painel", "pedidos", "fornecedores"] as const);
  return (
    <>
      <Abas atual={aba} mudar={setAba} abas={[["painel", "Painel"], ["pedidos", "Pedidos de compra", db.pedidos.length], ["fornecedores", "Fornecedores", db.fornecedores.length]] as const} />
      {aba === "painel" && <Painel />}
      {aba === "pedidos" && <Pedidos />}
      {aba === "fornecedores" && <Fornecedores />}
    </>
  );
}

function Painel() {
  const { db, mudar, avisar } = useFerrus();
  const meses = ultimosMeses(12);
  const categorias = Object.entries(db.pedidos.reduce<Record<string, number>>((a, p) => ({ ...a, [p.categoria]: (a[p.categoria] ?? 0) + p.valor }), {}))
    .map(([k, v], i) => ({ k, v, cor: `var(--c${(i % 6) + 1})` })).sort((a, b) => b.v - a.v);
  const decidir = (r: Requisicao, ok: boolean) => {
    mudar((b) => ({
      ...b,
      requisicoes: b.requisicoes.filter((x) => x.id !== r.id),
      pedidos: ok ? [{ id: "PC-" + (Math.max(...b.pedidos.map((p) => +p.id.slice(3))) + 1), fornecedor: "Em cotação", item: r.item, categoria: "Diversos", valor: r.valor, emissao: new Date().toISOString().slice(0, 10), previsao: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), status: "Cotação" as const }, ...b.pedidos] : b.pedidos,
      auditoria: [{ quando: new Date().toISOString(), quem: "Marina Alves", acao: ok ? "aprovou requisição" : "recusou requisição", modulo: "Compras" }, ...b.auditoria],
    }));
    avisar(ok ? `${r.id} aprovada e enviada para cotação` : `${r.id} recusada`);
  };
  const gastoMes = db.gastoMensal[11]!;
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="compras" rotulo="Gasto no mês" valor={gastoMes} formatar={realCompacto} delta={`${gastoMes < db.gastoMensal[10]! ? "-" : "+"}${fmt(Math.abs(gastoMes / db.gastoMensal[10]! - 1) * 100, 1)}% x mês anterior`} bom={gastoMes < db.gastoMensal[10]!} spark={db.gastoMensal} />
        <Kpi indice={1} icone="raio" rotulo="Saving negociado" valor={186400} formatar={realCompacto} delta="7,8% do comprado" tom="ok" />
        <Kpi indice={2} icone="relogio" rotulo="Lead time médio" valor={11.4} formatar={(n) => fmt(n, 1) + " dias"} delta="-1,2 dia no trimestre" tom="info" />
        <Kpi indice={3} icone="alerta" rotulo="Pedidos atrasados" valor={db.pedidos.filter((p) => p.status === "Atrasado").length} delta="cobrar fornecedores" bom={false} tom="bad" />
      </div>
      <div className="fx-grade-main">
        <Cartao titulo="Gasto mensal" sub="Últimos 12 meses · orçamento de R$ 2 mi">
          <Colunas rotulos={meses} meta={2_000_000} formatar={compacto} series={[{ nome: "Gasto", valores: db.gastoMensal, cor: "var(--c2)" }]} />
        </Cartao>
        <Cartao titulo="Por categoria" sub="Pedidos em aberto">
          <Rosca dados={categorias} centro={realCompacto(soma(categorias.map((c) => c.v)))} sub="em pedidos" formatar={realCompacto} />
        </Cartao>
      </div>
      <Cartao titulo="Requisições para aprovar" sub="Pedidos internos das áreas" acao={<Etiqueta tom="warn">{db.requisicoes.length} pendentes</Etiqueta>}>
        <div className="fx-lista">
          <AnimatePresence initial={false}>
            {db.requisicoes.map((r) => (
              <motion.div key={r.id} className="fx-lista-item" layout exit={{ opacity: 0, x: 40 }}>
                <Avatar nome={r.solicitante} />
                <div className="fx-lista-txt"><b>{r.item}</b><span>{r.qtd} un · {r.setor} · {r.solicitante} · {br(r.data)}</span></div>
                {r.urgencia === "Urgente" && <Etiqueta tom="bad">Urgente</Etiqueta>}
                <strong className="fx-lista-valor">{real(r.valor)}</strong>
                <div className="fx-lista-acoes">
                  <button className="fx-btn fino" onClick={() => decidir(r, false)}>Recusar</button>
                  <button className="fx-btn primario fino" onClick={() => decidir(r, true)}>Aprovar</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!db.requisicoes.length && <Vazio>Nenhuma requisição aguardando aprovação.</Vazio>}
        </div>
      </Cartao>
    </>
  );
}

function Pedidos() {
  const { db } = useFerrus();
  const [st, setSt] = useState<StatusPedido | "todos">("todos");
  const linhas = st === "todos" ? db.pedidos : db.pedidos.filter((p) => p.status === st);
  return (
    <Cartao titulo="Pedidos de compra" sub="Do pedido de cotação ao recebimento">
      <Tabela<Pedido> linhas={linhas} chave={(p) => p.id} busca={(p) => `${p.id} ${p.fornecedor} ${p.item}`}
        csv={{ nome: "ferrus-pedidos", colunas: ["id", "fornecedor", "item", "categoria", "valor", "emissao", "previsao", "status"] }}
        filtros={<select className="fx-select" value={st} onChange={(e) => setSt(e.target.value as StatusPedido | "todos")} aria-label="Filtrar por status"><option value="todos">Todos os status</option>{Object.keys(TOM_PEDIDO).map((s) => <option key={s}>{s}</option>)}</select>}
        colunas={[
          { k: "id", titulo: "Pedido", mono: true }, { k: "fornecedor", titulo: "Fornecedor" }, { k: "item", titulo: "Item", esconderCelular: true },
          { k: "valor", titulo: "Valor", alinhar: "dir", valor: (p) => p.valor, render: (p) => real(p.valor) },
          { k: "emissao", titulo: "Emissão", render: (p) => br(p.emissao), esconderCelular: true },
          { k: "previsao", titulo: "Previsão", render: (p) => <span className={p.status !== "Recebido" && diasAte(p.previsao) < 0 ? "t-bad" : ""}>{br(p.previsao)}</span> },
          { k: "status", titulo: "Status", render: (p) => <Etiqueta tom={TOM_PEDIDO[p.status]}>{p.status}</Etiqueta> },
        ]} />
    </Cartao>
  );
}

function Fornecedores() {
  const { db } = useFerrus();
  return (
    <div className="fx-grade-main">
      <Cartao titulo="Avaliação de fornecedores (IQF)" sub="50% qualidade · 30% entrega · 20% preço">
        <div className="fx-fornecedores">
          {db.fornecedores.map((f) => (
            <article key={f.nome} className="fx-fornecedor">
              <Anel valor={f.iqf} tamanho={52} />
              <div className="fx-fornecedor-info"><b>{f.nome}</b><span>{f.categoria} · {f.cidade}</span></div>
              <div className="fx-fornecedor-notas">
                <span>Qualidade <b>{f.qualidade}</b></span><span>Entrega <b>{f.entrega}</b></span><span>Preço <b>{f.preco}</b></span>
              </div>
              <Etiqueta tom={TOM_CLASSE[f.classe]}>Classe {f.classe}</Etiqueta>
            </article>
          ))}
        </div>
      </Cartao>
      <Cartao titulo="Maiores gastos" sub="Acumulado no ano">
        <Ranking formatar={realCompacto} dados={[...db.fornecedores].sort((a, b) => b.gasto - a.gasto).slice(0, 8).map((f, i) => ({ k: f.nome, v: f.gasto, cor: `var(--c${(i % 6) + 1})` }))} />
      </Cartao>
    </div>
  );
}
