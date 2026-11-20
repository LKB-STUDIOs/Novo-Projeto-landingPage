import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { aprovacao, UNIDADES } from "../dados";
import { Anel, Linhas, Medidor } from "../graficos";
import { compacto, diasAte, fmt, media, pct, realCompacto, ultimosMeses, ultimosDias, brCurta } from "../nucleo";
import { Cartao, Etiqueta, Icone, Kpi, Progresso, useFerrus, usePorUnidade, type Tom } from "../ui";

const EVENTOS = [
  (n: number) => `Injetora 0${(n % 6) + 1} concluiu a OP-31${400 + n}`,
  (n: number) => `Inspeção aprovou o lote L24${500 + n} da pintura`,
  (n: number) => `Expedição EXP-93${n % 90} saiu para entrega`,
  (n: number) => `Robô de solda 0${(n % 4) + 1} voltou a produzir após setup`,
  (n: number) => `Ensaio de névoa salina ENS-64${n % 90} concluído: aprovado`,
  (n: number) => `Pedido PC-88${n % 90} recebido no almoxarifado`,
  (n: number) => `Chamado CH-158${n % 90} resolvido pela TI`,
];

export default function Visao() {
  const { db, ir, unidade } = useFerrus();
  const registros = usePorUnidade(db.registros);
  const maquinas = usePorUnidade(db.maquinas);
  const [ao, setAo] = useState({ pecas: 0, eventos: [] as { id: number; txt: string; hora: string }[] });

  // simulação "ao vivo": peças produzidas no turno e eventos do chão de fábrica
  useEffect(() => {
    let n = 7;
    const base = maquinas.reduce((s, m) => s + m.produzidas, 0);
    const hora = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setAo({ pecas: base, eventos: [0, 1, 2].map((i) => ({ id: i, txt: EVENTOS[i]!(i * 13), hora: hora() })) });
    const t = window.setInterval(() => {
      n++;
      setAo((a) => ({
        pecas: a.pecas + 3 + ((n * 7) % 11),
        eventos: n % 2 ? [{ id: n, txt: EVENTOS[n % EVENTOS.length]!(n * 17), hora: hora() }, ...a.eventos].slice(0, 6) : a.eventos,
      }));
    }, 2200);
    return () => window.clearInterval(t);
  }, [maquinas]);

  const meses = ultimosMeses(12);
  const fatMes = db.faturamento.real[11]!;
  const metaMes = db.faturamento.meta[11]!;
  const oee = media(maquinas.map((m) => m.oee));
  const aprov = aprovacao(registros.filter((r) => diasAte(r.data) >= -6));
  const aprovAnt = aprovacao(registros.filter((r) => diasAte(r.data) < -6));
  const otd = db.otdMensal[11]!;
  const diasSemAcidente = -diasAte(db.ultimoAfastamento);
  const chamadosAbertos = db.chamados.filter((c) => c.status !== "Resolvido").length;
  const dias = ultimosDias(14);

  const alertas = useMemo(() => {
    const a: { tom: Tom; txt: string; mod: string; icone: string }[] = [];
    db.instrumentos.filter((i) => diasAte(i.venc) < 0).forEach((i) => a.push({ tom: "bad", txt: `${i.nome} (${i.cod}) com calibração vencida`, mod: "metrologia", icone: "metrologia" }));
    db.estoque.filter((e) => e.saldo < e.minimo).forEach((e) => a.push({ tom: "warn", txt: `${e.item} abaixo do estoque mínimo`, mod: "logistica", icone: "logistica" }));
    db.ppap.filter((p) => p.status === "Atrasado").forEach((p) => a.push({ tom: "bad", txt: `${p.id} (${p.peca}) com prazo vencido`, mod: "engenharia", icone: "engenharia" }));
    db.licencas.filter((l) => diasAte(l.venc) < 30).forEach((l) => a.push({ tom: diasAte(l.venc) < 0 ? "bad" : "warn", txt: `${l.nome}: ${diasAte(l.venc) < 0 ? "vencida" : `vence em ${diasAte(l.venc)} dias`}`, mod: "ambiental", icone: "ambiental" }));
    db.ordens.filter((o) => o.prioridade === "Crítica" && o.status !== "Concluída").forEach((o) => a.push({ tom: "bad", txt: `OS crítica na ${o.maquina}: ${o.desc.toLowerCase()}`, mod: "manutencao", icone: "manutencao" }));
    return a;
  }, [db]);

  const saude: { mod: string; nome: string; nota: number; linha: string }[] = [
    { mod: "producao", nome: "Produção", nota: oee, linha: `${maquinas.filter((m) => m.status === "Produzindo").length}/${maquinas.length} máquinas rodando` },
    { mod: "qualidade", nome: "Qualidade", nota: aprov, linha: `${db.ncs.filter((n) => n.status !== "Encerrada").length} NCs abertas` },
    { mod: "engenharia", nome: "Engenharia", nota: (db.ppap.filter((p) => p.status !== "Atrasado").length / db.ppap.length) * 100, linha: `${db.ppap.filter((p) => p.status !== "Aprovado").length} PPAPs em andamento` },
    { mod: "compras", nome: "Compras", nota: media(db.fornecedores.map((f) => f.iqf)), linha: `${db.requisicoes.length} requisições para aprovar` },
    { mod: "logistica", nome: "Logística", nota: otd, linha: `${db.expedicoes.filter((e) => e.etapa !== "Entregue").length} expedições em curso` },
    { mod: "manutencao", nome: "Manutenção", nota: 100 - (db.ordens.filter((o) => o.status !== "Concluída").length / db.ordens.length) * 60, linha: `${db.ordens.filter((o) => o.status !== "Concluída").length} OS abertas` },
    { mod: "metrologia", nome: "Metrologia", nota: (db.instrumentos.filter((i) => diasAte(i.venc) >= 0).length / db.instrumentos.length) * 100, linha: `${db.instrumentos.filter((i) => diasAte(i.venc) < 15).length} calibrações a vencer` },
    { mod: "laboratorio", nome: "Laboratório", nota: (db.ensaios.filter((e) => e.resultado >= e.min && e.resultado <= e.max).length / db.ensaios.length) * 100, linha: `${db.ensaios.filter((e) => e.status !== "Concluído").length} ensaios na fila` },
    { mod: "ambiental", nome: "Ambiental", nota: db.ambiental.reciclagem[11]! + 15, linha: `${pct(db.ambiental.reciclagem[11]!)} de reciclagem` },
    { mod: "seguranca", nome: "Segurança", nota: 92, linha: `${diasSemAcidente} dias sem afastamento` },
    { mod: "ti", nome: "TI", nota: media(db.sgsi.map((d) => d.conf)), linha: `${chamadosAbertos} chamados abertos` },
  ];

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <>
      <section className="fx-hero">
        <div>
          <p className="fx-hero-sup"><span className="fx-pulso" />Operação em tempo real · {unidade === "todas" ? "3 unidades" : unidade}</p>
          <h2>{saudacao}, Marina.</h2>
          <p className="fx-hero-txt">
            A fábrica está com <b>OEE de {pct(oee)}</b>, {alertas.length ? <><b>{alertas.length} alertas</b> pedem atenção</> : "nenhum alerta aberto"} e o faturamento do mês está em <b>{pct((fatMes / metaMes) * 100, 0)} da meta</b>.
          </p>
        </div>
        <div className="fx-hero-contador">
          <span>Peças produzidas no turno</span>
          <strong>{fmt(ao.pecas)}</strong>
          <small><Icone n="raio" tam={13} /> +{fmt(Math.round(ao.pecas / 7.5))} por hora</small>
        </div>
      </section>

      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="compras" rotulo="Faturamento do mês" valor={fatMes} formatar={realCompacto} delta={`${pct((fatMes / metaMes) * 100, 0)} da meta`} bom={fatMes / metaMes > 0.6} spark={db.faturamento.real.slice(0, 11)} />
        <Kpi indice={1} icone="producao" rotulo="OEE global" valor={oee} formatar={(n) => pct(n)} delta="+1,8 p.p. no mês" tom="info" spark={dias.map((_, i) => 72 + Math.sin(i) * 3 + i * 0.4)} />
        <Kpi indice={2} icone="qualidade" rotulo="Aprovação (7 dias)" valor={aprov} formatar={(n) => pct(n)} delta={`${aprov >= aprovAnt ? "+" : ""}${fmt(aprov - aprovAnt, 2)} p.p.`} bom={aprov >= aprovAnt} tom="ok" />
        <Kpi indice={3} icone="logistica" rotulo="Entregas no prazo" valor={otd} formatar={(n) => pct(n)} delta="meta 95%" bom={otd >= 95} tom="warn" spark={db.otdMensal} />
        <Kpi indice={4} icone="seguranca" rotulo="Dias sem afastamento" valor={diasSemAcidente} delta="recorde: 214" tom="ok" />
        <Kpi indice={5} icone="ti" rotulo="Chamados de TI abertos" valor={chamadosAbertos} delta={`SLA ${pct(91.4)}`} tom="info" />
      </div>

      <div className="fx-grade-main">
        <Cartao titulo="Faturamento x meta" sub="Últimos 12 meses · mês atual parcial" acao={<Etiqueta tom="accent">{realCompacto(db.faturamento.real.reduce((s, v) => s + v, 0))} no período</Etiqueta>}>
          <Linhas rotulos={meses} formatar={(n) => compacto(n)} series={[
            { nome: "Realizado", valores: db.faturamento.real, cor: "var(--accent)" },
            { nome: "Meta", valores: db.faturamento.meta, cor: "var(--muted)", tracejada: true },
          ]} />
        </Cartao>
        <Cartao titulo="Chão de fábrica ao vivo" sub="Eventos das últimas horas" acao={<span className="fx-ao-vivo"><i />ao vivo</span>}>
          <ul className="fx-feed">
            <AnimatePresence initial={false}>
              {ao.eventos.map((e) => (
                <motion.li key={e.id} layout initial={{ opacity: 0, x: -14, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} exit={{ opacity: 0 }}>
                  <span className="fx-feed-ponto" /><p>{e.txt}</p><time>{e.hora}</time>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Cartao>
      </div>

      <div className="fx-grade-3">
        {UNIDADES.map((u) => {
          const ms = db.maquinas.filter((m) => m.unidade === u);
          return (
            <Cartao key={u} titulo={u} sub={`${ms.filter((m) => m.status === "Produzindo").length} de ${ms.length} máquinas produzindo`}>
              <Medidor valor={media(ms.map((m) => m.oee))} rotulo="OEE" meta={75} />
              <div className="fx-maq-pontos" aria-label={`Status das máquinas da ${u}`}>
                {ms.map((m) => <i key={m.id} className={`s-${m.status.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}`} title={`${m.nome}: ${m.status}`} />)}
              </div>
            </Cartao>
          );
        })}
      </div>

      <div className="fx-grade-main">
        <Cartao titulo="Saúde das áreas" sub="Clique em uma área para abrir o módulo">
          <div className="fx-saude">
            {saude.map((s) => (
              <button key={s.mod} className="fx-saude-item" onClick={() => ir(s.mod)}>
                <Anel valor={Math.min(100, s.nota)} />
                <div><b>{s.nome}</b><span>{s.linha}</span></div>
                <Icone n="seta" tam={15} />
              </button>
            ))}
          </div>
        </Cartao>
        <Cartao titulo="Alertas" sub={`${alertas.length} itens pedem atenção`}>
          <ul className="fx-alertas">
            {alertas.slice(0, 8).map((a, i) => (
              <li key={i}>
                <button onClick={() => ir(a.mod)}>
                  <span className={`fx-alerta-ico t-${a.tom}`}><Icone n={a.icone} tam={15} /></span>
                  <p>{a.txt}</p>
                </button>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>

      <Cartao titulo="Plano de ação corporativo" sub="Ações em andamento em todas as áreas">
        <div className="fx-acoes">
          {db.acoes.map((a) => (
            <div key={a.id} className="fx-acao">
              <div className="fx-acao-top"><span className="mono">{a.id}</span><Etiqueta>{a.area}</Etiqueta></div>
              <b>{a.acao}</b>
              <Progresso valor={a.progresso} />
              <div className="fx-acao-pe"><span>{a.resp}</span><span>{a.progresso}% · prazo {brCurta(a.prazo)}</span></div>
            </div>
          ))}
        </div>
      </Cartao>
    </>
  );
}
