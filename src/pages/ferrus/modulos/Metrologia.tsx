import type { Ensaio, Instrumento } from "../dados";
import { Colunas, Rosca } from "../graficos";
import { br, diasAte, fmt, iso, media, pct } from "../nucleo";
import { Abas, Cartao, Etiqueta, Kpi, Tabela, useAba, useFerrus, type Tom } from "../ui";

const situacao = (i: Instrumento): [Tom, string] => {
  const d = diasAte(i.venc);
  return d < 0 ? ["bad", `Vencida há ${-d} dia${d === -1 ? "" : "s"}`] : d <= 15 ? ["warn", `Vence em ${d} dia${d === 1 ? "" : "s"}`] : ["ok", "Em dia"];
};

export function Metrologia() {
  const { db, mudar, avisar } = useFerrus();
  const [aba, setAba] = useAba(["instrumentos", "msa"] as const);
  const vencidos = db.instrumentos.filter((i) => diasAte(i.venc) < 0).length;
  const proximos = db.instrumentos.filter((i) => diasAte(i.venc) >= 0 && diasAte(i.venc) <= 15).length;
  const calibrar = (i: Instrumento) => {
    mudar((b) => ({ ...b, instrumentos: b.instrumentos.map((x) => (x.cod === i.cod ? { ...x, ultima: iso(new Date()), venc: iso(new Date(Date.now() + 365 * 864e5)) } : x)) }));
    avisar(`${i.cod} calibrado: próximo vencimento em 12 meses`);
  };
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="metrologia" rotulo="Instrumentos ativos" valor={db.instrumentos.length * 21} delta="em 3 unidades" />
        <Kpi indice={1} icone="ok" rotulo="Calibração em dia" valor={((db.instrumentos.length - vencidos) / db.instrumentos.length) * 100} formatar={(n) => pct(n)} delta="meta 100%" tom="ok" />
        <Kpi indice={2} icone="relogio" rotulo="Vencem em 15 dias" valor={proximos} delta="agendar com o laboratório" tom="warn" />
        <Kpi indice={3} icone="alerta" rotulo="Vencidos" valor={vencidos} delta="bloqueados para uso" bom={false} tom="bad" />
      </div>
      <Abas atual={aba} mudar={setAba} abas={[["instrumentos", "Instrumentos", db.instrumentos.length], ["msa", "Estudos de MSA", db.msa.length]] as const} />
      {aba === "instrumentos" ? (
        <Cartao titulo="Controle de calibração" sub="Ordenado pelo vencimento">
          <Tabela linhas={[...db.instrumentos].sort((a, b) => a.venc.localeCompare(b.venc))} chave={(i) => i.cod} busca={(i) => `${i.cod} ${i.nome} ${i.local}`} porPagina={12}
            csv={{ nome: "ferrus-instrumentos", colunas: ["cod", "nome", "local", "ultima", "venc", "erro", "tolerancia"] }}
            colunas={[
              { k: "cod", titulo: "Código", mono: true }, { k: "nome", titulo: "Instrumento" }, { k: "local", titulo: "Local", esconderCelular: true },
              { k: "erro", titulo: "Erro / tolerância", alinhar: "dir", esconderCelular: true, render: (i) => <span className={i.erro > i.tolerancia * 0.75 ? "t-warn" : ""}>{fmt(i.erro, 3)} / {fmt(i.tolerancia, 2)} mm</span> },
              { k: "venc", titulo: "Vencimento", render: (i) => br(i.venc) },
              { k: "sit", titulo: "Situação", valor: (i) => diasAte(i.venc), render: (i) => { const [t, txt] = situacao(i); return <Etiqueta tom={t}>{txt}</Etiqueta>; } },
              { k: "acao", titulo: "", alinhar: "dir", render: (i) => diasAte(i.venc) <= 15 && <button className="fx-btn fino" onClick={() => calibrar(i)}>Registrar calibração</button> },
            ]} />
        </Cartao>
      ) : (
        <div className="fx-grade-main">
          <Cartao titulo="Repetibilidade e reprodutibilidade (R&R)" sub="Até 10%: aceitável · 10% a 30%: condicional · acima de 30%: reprovado">
            <Colunas rotulos={db.msa.map((m) => m.caracteristica)} meta={10} formatar={(n) => fmt(n, 0) + "%"} series={[{ nome: "%R&R", valores: db.msa.map((m) => m.rr), cor: "var(--c2)" }]} />
          </Cartao>
          <Cartao titulo="Resultado dos estudos">
            <ul className="fx-msa">
              {db.msa.map((m) => (
                <li key={m.caracteristica}>
                  <div><b>{m.caracteristica}</b><span>{m.instrumento} · ndc {m.ndc}</span></div>
                  <Etiqueta tom={m.rr <= 10 ? "ok" : m.rr <= 30 ? "warn" : "bad"}>{fmt(m.rr, 1)}% · {m.rr <= 10 ? "aceitável" : "condicional"}</Etiqueta>
                </li>
              ))}
            </ul>
          </Cartao>
        </div>
      )}
    </>
  );
}

const aprovado = (e: Ensaio) => e.resultado >= e.min && e.resultado <= e.max;

export function Laboratorio() {
  const { db, mudar, avisar } = useFerrus();
  const concluidos = db.ensaios.filter((e) => e.status === "Concluído");
  const tipos = [...new Set(db.ensaios.map((e) => e.tipo))];
  const avancar = (e: Ensaio) => {
    const prox = e.status === "Na fila" ? "Em ensaio" : "Concluído";
    mudar((b) => ({ ...b, ensaios: b.ensaios.map((x) => (x.id === e.id ? { ...x, status: prox } : x)) }));
    avisar(`${e.id}: ${prox === "Concluído" ? (aprovado(e) ? "aprovado" : "reprovado") : "ensaio iniciado"}`);
  };
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="laboratorio" rotulo="Ensaios no mês" valor={148} delta="+12% x mês anterior" />
        <Kpi indice={1} icone="ok" rotulo="Aprovação" valor={(concluidos.filter(aprovado).length / (concluidos.length || 1)) * 100} formatar={(n) => pct(n)} delta="dos ensaios concluídos" tom="ok" />
        <Kpi indice={2} icone="relogio" rotulo="Na fila" valor={db.ensaios.filter((e) => e.status !== "Concluído").length} delta={`prazo médio ${fmt(1.8, 1)} dia`} tom="warn" />
        <Kpi indice={3} icone="qualidade" rotulo="Cpk médio" valor={media([1.62, 1.41, 1.18, 1.55, 1.37])} formatar={(n) => fmt(n, 2)} delta="características críticas" tom="info" />
      </div>
      <div className="fx-grade-main">
        <Cartao titulo="Ensaios" sub="Resultado comparado com a especificação">
          <Tabela linhas={db.ensaios} chave={(e) => e.id} busca={(e) => `${e.id} ${e.tipo} ${e.peca} ${e.lote}`} porPagina={10}
            colunas={[
              { k: "id", titulo: "Ensaio", mono: true }, { k: "tipo", titulo: "Tipo" }, { k: "peca", titulo: "Peça", esconderCelular: true },
              { k: "lote", titulo: "Lote", mono: true, esconderCelular: true },
              { k: "resultado", titulo: "Resultado", alinhar: "dir", render: (e) => e.status === "Concluído" ? <span className={aprovado(e) ? "" : "t-bad"}>{fmt(e.resultado, e.un === "Gt" ? 0 : 1)} {e.un}</span> : "—" },
              { k: "espec", titulo: "Especificação", esconderCelular: true, render: (e) => e.max >= 999 ? `≥ ${fmt(e.min)} ${e.un}` : `${fmt(e.min, e.min % 1 ? 1 : 0)} a ${fmt(e.max, e.max % 1 ? 1 : 0)} ${e.un}` },
              { k: "status", titulo: "Status", render: (e) => e.status === "Concluído" ? <Etiqueta tom={aprovado(e) ? "ok" : "bad"}>{aprovado(e) ? "Aprovado" : "Reprovado"}</Etiqueta> : <button className="fx-btn fino" onClick={() => avancar(e)}>{e.status === "Na fila" ? "Iniciar" : "Concluir"}</button> },
            ]} />
        </Cartao>
        <Cartao titulo="Ensaios por tipo" sub="Mês atual">
          <Rosca dados={tipos.map((t, i) => ({ k: t, v: db.ensaios.filter((e) => e.tipo === t).length * 7 + i, cor: `var(--c${(i % 6) + 1})` }))} centro="148" sub="ensaios" />
        </Cartao>
      </div>
    </>
  );
}
