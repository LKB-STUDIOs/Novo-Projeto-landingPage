import type { OcorrenciaST, TipoOcorrencia } from "../dados";
import { Colunas, Linhas, Piramide, Rosca } from "../graficos";
import { br, compacto, diasAte, fmt, pct, soma, ultimosMeses } from "../nucleo";
import { Abas, Cartao, Etiqueta, Kpi, Progresso, Tabela, useAba, useFerrus, usePorUnidade, type Tom } from "../ui";

export function Ambiental() {
  const { db } = useFerrus();
  const a = db.ambiental;
  const meses = ultimosMeses(12);
  const totalRes = soma(a.residuos.map((r) => r.t));
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="gota" rotulo="Água no mês" valor={a.agua[11]!} formatar={(n) => fmt(n) + " m³"} delta={`${pct((a.agua[11]! / a.agua[0]! - 1) * 100)} em 12 meses`} spark={a.agua} tom="info" />
        <Kpi indice={1} icone="raio" rotulo="Energia no mês" valor={a.energia[11]!} formatar={(n) => compacto(n) + " kWh"} delta={`${pct((a.energia[11]! / a.energia[0]! - 1) * 100)} em 12 meses`} spark={a.energia} tom="warn" />
        <Kpi indice={2} icone="folha" rotulo="Reciclagem" valor={a.reciclagem[11]!} formatar={(n) => pct(n)} delta="meta 70% até dezembro" spark={a.reciclagem} tom="ok" />
        <Kpi indice={3} icone="ambiental" rotulo="Emissões (escopo 1 e 2)" valor={a.co2[11]!} formatar={(n) => fmt(n, 1) + " tCO₂e"} delta={`${pct((a.co2[11]! / a.co2[0]! - 1) * 100)} em 12 meses`} spark={a.co2} />
      </div>
      <div className="fx-grade-2">
        <Cartao titulo="Consumo de água" sub="m³ por mês · meta de 2.400 m³">
          <Colunas rotulos={meses} meta={2400} series={[{ nome: "Água", valores: a.agua, cor: "var(--c2)" }]} formatar={(n) => fmt(n)} />
        </Cartao>
        <Cartao titulo="Energia elétrica" sub="kWh por mês">
          <Linhas rotulos={meses} formatar={(n) => compacto(n)} series={[{ nome: "Energia", valores: a.energia, cor: "var(--warn)" }]} />
        </Cartao>
      </div>
      <div className="fx-grade-main">
        <Cartao titulo="Resíduos gerados" sub="Toneladas no mês, por classe">
          <Rosca dados={a.residuos.map((r, i) => ({ k: r.tipo, v: r.t, cor: ["var(--ok)", "var(--bad)", "var(--muted)", "var(--c5)", "var(--c4)"][i] }))} centro={fmt(totalRes, 1) + " t"} sub="no mês" formatar={(n) => fmt(n, 1) + " t"} />
        </Cartao>
        <Cartao titulo="Licenças e outorgas" sub="Controle de vencimentos">
          <ul className="fx-msa">
            {[...db.licencas].sort((x, y) => x.venc.localeCompare(y.venc)).map((l) => {
              const d = diasAte(l.venc);
              const t: Tom = d < 0 ? "bad" : d < 60 ? "warn" : "ok";
              return <li key={l.nome}><div><b>{l.nome}</b><span>{l.orgao} · {br(l.venc)}</span></div><Etiqueta tom={t}>{d < 0 ? "Vencida" : `${d} dias`}</Etiqueta></li>;
            })}
          </ul>
        </Cartao>
      </div>
      <Cartao titulo="Plano de ação ambiental">
        <div className="fx-acoes">
          {db.acoes.filter((x) => x.area === "Ambiental").concat([
            { id: "PA-398", area: "Ambiental", acao: "Coleta seletiva nos refeitórios das 3 unidades", resp: "Fernanda Lima", prazo: db.geradoEm, progresso: 90 },
            { id: "PA-395", area: "Ambiental", acao: "Painéis solares no telhado da Unidade Vale", resp: "Gustavo Prado", prazo: db.geradoEm, progresso: 25 },
          ]).map((x) => (
            <div key={x.id} className="fx-acao"><div className="fx-acao-top"><span className="mono">{x.id}</span></div><b>{x.acao}</b><Progresso valor={x.progresso} /><div className="fx-acao-pe"><span>{x.resp}</span><span>{x.progresso}%</span></div></div>
          ))}
        </div>
      </Cartao>
    </>
  );
}

const ORDEM: TipoOcorrencia[] = ["Com afastamento", "Sem afastamento", "Primeiros socorros", "Quase acidente", "Condição insegura"];
const TOM_TIPO: Record<TipoOcorrencia, Tom> = { "Com afastamento": "bad", "Sem afastamento": "bad", "Primeiros socorros": "warn", "Quase acidente": "warn", "Condição insegura": "info" };

export function Seguranca() {
  const { db, mudar, avisar } = useFerrus();
  const [aba, setAba] = useAba(["painel", "ocorrencias", "treinamentos"] as const);
  const ocorrencias = usePorUnidade(db.ocorrencias);
  const dias = -diasAte(db.ultimoAfastamento);
  const fechar = (o: OcorrenciaST) => {
    const prox = o.status === "Aberta" ? "Em tratamento" : "Fechada";
    mudar((b) => ({ ...b, ocorrencias: b.ocorrencias.map((x) => (x.id === o.id ? { ...x, status: prox } : x)) }));
    avisar(`${o.id}: ${prox.toLowerCase()}`);
  };
  return (
    <>
      <Abas atual={aba} mudar={setAba} abas={[["painel", "Painel"], ["ocorrencias", "Ocorrências", ocorrencias.filter((o) => o.status !== "Fechada").length], ["treinamentos", "Treinamentos NR"]] as const} />
      {aba === "painel" && (
        <>
          <div className="fx-grade-main">
            <section className="fx-dias">
              <p>Dias sem acidente com afastamento</p>
              <strong>{dias}</strong>
              <div className="fx-dias-barra"><i style={{ width: `${Math.min(100, (dias / 214) * 100)}%` }} /></div>
              <span>Recorde da empresa: 214 dias · faltam {Math.max(0, 215 - dias)} para bater</span>
            </section>
            <Cartao titulo="Pirâmide de Bird" sub="Ocorrências registradas no ano">
              <Piramide niveis={ORDEM.map((t, i) => ({ k: t, v: t === "Com afastamento" ? 1 : ocorrencias.filter((o) => o.tipo === t).length * (i + 1) * 2, cor: ["var(--bad)", "#e8633f", "var(--warn)", "var(--c5)", "var(--c2)"][i]! }))} />
            </Cartao>
          </div>
          <div className="fx-grade-kpis">
            <Kpi indice={0} icone="seguranca" rotulo="Taxa de frequência" valor={1.84} formatar={(n) => fmt(n, 2)} delta="por milhão de horas" tom="ok" />
            <Kpi indice={1} icone="alerta" rotulo="Taxa de gravidade" valor={21} delta="dias perdidos/milhão h" tom="warn" />
            <Kpi indice={2} icone="ok" rotulo="Inspeções no mês" valor={64} delta="98% do planejado" tom="info" />
            <Kpi indice={3} icone="relogio" rotulo="Ações abertas" valor={ocorrencias.filter((o) => o.status !== "Fechada").length} delta="tratamento médio 4 dias" tom="bad" bom={false} />
          </div>
          <Cartao titulo="Ocorrências por mês" sub="Quase acidentes e condições inseguras relatados">
            <Colunas empilhar rotulos={ultimosMeses(6)} series={[
              { nome: "Condição insegura", valores: [14, 18, 16, 21, 19, 12], cor: "var(--c2)" },
              { nome: "Quase acidente", valores: [8, 7, 9, 6, 8, 4], cor: "var(--c5)" },
              { nome: "Primeiros socorros", valores: [3, 2, 4, 2, 1, 1], cor: "var(--warn)" },
            ]} />
          </Cartao>
        </>
      )}
      {aba === "ocorrencias" && (
        <Cartao titulo="Registro de ocorrências" sub="Condições inseguras, quase acidentes e acidentes">
          <Tabela linhas={ocorrencias} chave={(o) => o.id} busca={(o) => `${o.id} ${o.tipo} ${o.setor} ${o.desc}`} porPagina={12}
            csv={{ nome: "ferrus-ocorrencias", colunas: ["id", "data", "tipo", "setor", "unidade", "desc", "status"] }}
            colunas={[
              { k: "id", titulo: "Nº", mono: true }, { k: "data", titulo: "Data", render: (o) => br(o.data) },
              { k: "tipo", titulo: "Tipo", render: (o) => <Etiqueta tom={TOM_TIPO[o.tipo]}>{o.tipo}</Etiqueta> }, { k: "desc", titulo: "Descrição" },
              { k: "setor", titulo: "Setor", esconderCelular: true },
              { k: "status", titulo: "Status", render: (o) => o.status === "Fechada" ? <Etiqueta tom="ok">Fechada</Etiqueta> : <button className="fx-btn fino" onClick={() => fechar(o)}>{o.status === "Aberta" ? "Tratar" : "Fechar"}</button> },
            ]} />
        </Cartao>
      )}
      {aba === "treinamentos" && (
        <Cartao titulo="Treinamentos obrigatórios" sub="Normas regulamentadoras · colaboradores habilitados">
          <div className="fx-treinos">
            {db.treinamentos.map((t) => (
              <article key={t.nr} className="fx-treino">
                <header><b>{t.nr}</b><span>{t.nome}</span></header>
                <strong>{pct((t.emDia / t.total) * 100, 0)}</strong>
                <Progresso valor={(t.emDia / t.total) * 100} />
                <p>{t.emDia} de {t.total} em dia{t.vencendo > 0 && <> · <span className="t-warn">{t.vencendo} vencendo em 30 dias</span></>}</p>
              </article>
            ))}
          </div>
        </Cartao>
      )}
    </>
  );
}
