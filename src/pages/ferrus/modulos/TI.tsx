import { AnimatePresence, motion } from "motion/react";
import { MODULOS_ID, PERFIS, type Chamado, type StatusChamado } from "../dados";
import { Colunas, Radar, Rosca } from "../graficos";
import { br, fmt, media, pct } from "../nucleo";
import { Abas, Avatar, Cartao, Etiqueta, Kanban, Kpi, Tabela, Vazio, useAba, useFerrus, type Tom } from "../ui";

const COLS = [
  { id: "Novo", titulo: "Novo", tom: "warn" }, { id: "Em atendimento", titulo: "Em atendimento", tom: "info" },
  { id: "Aguardando usuário", titulo: "Aguardando usuário", tom: "neutro" }, { id: "Resolvido", titulo: "Resolvido", tom: "ok" },
] as const satisfies readonly { id: StatusChamado; titulo: string; tom: Tom }[];
const TOM_PRI: Record<Chamado["prioridade"], Tom> = { Baixa: "neutro", Média: "info", Alta: "warn", Crítica: "bad" };
const desde = (isoStr: string) => {
  const h = (Date.now() - new Date(isoStr).getTime()) / 36e5;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} dias`;
};

export function TI() {
  const { db, mudar, avisar } = useFerrus();
  const [aba, setAba] = useAba(["chamados", "ativos", "sgsi"] as const);
  const abertos = db.chamados.filter((c) => c.status !== "Resolvido");
  const mover = (c: Chamado, para: StatusChamado) => {
    mudar((b) => ({ ...b, chamados: b.chamados.map((x) => (x.id === c.id ? { ...x, status: para } : x)) }));
    avisar(`${c.id} → ${para}`);
  };
  const categorias = [...new Set(db.chamados.map((c) => c.categoria))];
  return (
    <>
      <div className="fx-grade-kpis">
        <Kpi indice={0} icone="ti" rotulo="Chamados abertos" valor={abertos.length} delta={`${abertos.filter((c) => c.prioridade === "Crítica").length} críticos`} tom="info" bom={false} />
        <Kpi indice={1} icone="ok" rotulo="Dentro do SLA" valor={91.4} formatar={(n) => pct(n)} delta="meta 90%" tom="ok" spark={[86, 88, 87, 90, 89, 92, 91.4]} />
        <Kpi indice={2} icone="relogio" rotulo="Tempo médio de solução" valor={5.2} formatar={(n) => fmt(n, 1) + " h"} delta="-0,8 h no mês" tom="accent" />
        <Kpi indice={3} icone="qualidade" rotulo="Conformidade SGSI" valor={media(db.sgsi.map((d) => d.conf))} formatar={(n) => pct(n)} delta="ISO 27001 · 93 controles" tom="warn" />
      </div>
      <Abas atual={aba} mudar={setAba} abas={[["chamados", "Chamados", abertos.length], ["ativos", "Inventário", db.ativos.length], ["sgsi", "Segurança da informação"]] as const} />
      {aba === "chamados" && (
        <>
          <Kanban colunas={COLS} itens={db.chamados} chave={(c) => c.id} coluna={(c) => c.status} mover={mover}
            render={(c) => (
              <>
                <div className="fx-kc-top"><span className="mono">{c.id}</span><Etiqueta tom={TOM_PRI[c.prioridade]}>{c.prioridade}</Etiqueta></div>
                <p className="fx-kc-txt">{c.titulo}</p>
                <p className="fx-kc-sub">{c.categoria} · SLA {c.sla} h</p>
                <div className="fx-kc-pe"><Avatar nome={c.solicitante} tam={22} /><span>{c.setor}</span><time>há {desde(c.aberto)}</time></div>
              </>
            )} />
          <div className="fx-grade-main">
            <Cartao titulo="Chamados por categoria" sub="Últimos 30 dias">
              <Colunas rotulos={categorias} series={[{ nome: "Chamados", valores: categorias.map((k, i) => db.chamados.filter((c) => c.categoria === k).length * 6 + i * 2), cor: "var(--c2)" }]} />
            </Cartao>
            <Cartao titulo="Por prioridade" sub="Chamados abertos">
              <Rosca dados={(["Crítica", "Alta", "Média", "Baixa"] as const).map((p, i) => ({ k: p, v: abertos.filter((c) => c.prioridade === p).length, cor: ["var(--bad)", "var(--warn)", "var(--info)", "var(--muted)"][i] }))} centro={String(abertos.length)} sub="abertos" />
            </Cartao>
          </div>
        </>
      )}
      {aba === "ativos" && (
        <div className="fx-grade-main">
          <Cartao titulo="Inventário de equipamentos">
            <Tabela linhas={db.ativos} chave={(a) => a.tag} busca={(a) => `${a.tag} ${a.tipo} ${a.modelo} ${a.usuario}`} porPagina={12}
              csv={{ nome: "ferrus-ativos", colunas: ["tag", "tipo", "modelo", "usuario", "local", "status", "garantia"] }}
              colunas={[
                { k: "tag", titulo: "Patrimônio", mono: true }, { k: "tipo", titulo: "Tipo" }, { k: "modelo", titulo: "Modelo", esconderCelular: true },
                { k: "usuario", titulo: "Responsável" }, { k: "local", titulo: "Local", esconderCelular: true, render: (a) => a.local.replace("Unidade ", "") },
                { k: "garantia", titulo: "Garantia", esconderCelular: true, render: (a) => <span className={a.garantia < db.geradoEm ? "t-muted" : ""}>{a.garantia < db.geradoEm ? "expirada" : br(a.garantia)}</span> },
                { k: "status", titulo: "Status", render: (a) => <Etiqueta tom={a.status === "Em uso" ? "ok" : a.status === "Estoque" ? "neutro" : "warn"}>{a.status}</Etiqueta> },
              ]} />
          </Cartao>
          <Cartao titulo="Por tipo">
            <Rosca dados={[...new Set(db.ativos.map((a) => a.tipo))].map((t, i) => ({ k: t, v: db.ativos.filter((a) => a.tipo === t).length * 9 + i, cor: `var(--c${(i % 6) + 1})` }))} centro="243" sub="equipamentos" />
          </Cartao>
        </div>
      )}
      {aba === "sgsi" && (
        <div className="fx-grade-main">
          <Cartao titulo="Conformidade por domínio" sub="ISO 27001 · linha tracejada = meta de 85%">
            <Radar dados={db.sgsi.map((d) => ({ k: d.dominio, v: d.conf }))} />
          </Cartao>
          <Cartao titulo="Disponibilidade dos serviços" sub="Últimos 30 dias">
            <ul className="fx-servicos">
              {db.servicos.map((s) => (
                <li key={s.nome}><i className={`fx-ponto t-${s.ok ? "ok" : "warn"}`} /><b>{s.nome}</b><span>{fmt(s.uptime, 2)}%</span>
                  <div className="fx-uptime">{[...Array(30)].map((_, i) => <em key={i} className={!s.ok && (i === 26 || i === 21) ? "w" : s.uptime < 99.5 && i === 12 ? "w" : ""} />)}</div>
                </li>
              ))}
            </ul>
          </Cartao>
        </div>
      )}
    </>
  );
}

const NOMES_MOD: Record<string, string> = {
  visao: "Visão geral", producao: "Produção", qualidade: "Qualidade", engenharia: "Engenharia", compras: "Compras", logistica: "Logística",
  manutencao: "Manutenção", metrologia: "Metrologia", laboratorio: "Laboratório", ambiental: "Ambiental", seguranca: "Segurança", ti: "TI", acesso: "Acesso",
};

export function Acesso() {
  const { db, mudar, avisar } = useFerrus();
  const [aba, setAba] = useAba(["usuarios", "permissoes", "auditoria"] as const);
  const liberar = (email: string, ok: boolean) => {
    const p = db.pendentes.find((x) => x.email === email)!;
    mudar((b) => ({
      ...b,
      pendentes: b.pendentes.filter((x) => x.email !== email),
      usuarios: ok ? [...b.usuarios, { nome: p.nome, email: p.email, perfil: "Operador", unidade: p.unidade, ultimoAcesso: new Date().toISOString(), ativo: true }] : b.usuarios,
      auditoria: [{ quando: new Date().toISOString(), quem: "Marina Alves", acao: ok ? `liberou acesso de ${p.nome}` : `recusou cadastro de ${p.nome}`, modulo: "Acesso" }, ...b.auditoria],
    }));
    avisar(ok ? `Acesso liberado para ${p.nome}` : `Cadastro de ${p.nome} recusado`);
  };
  const alternar = (perfil: string, mod: string) => {
    mudar((b) => {
      const atual = b.permissoes[perfil] ?? [];
      return { ...b, permissoes: { ...b.permissoes, [perfil]: atual.includes(mod) ? atual.filter((m) => m !== mod) : [...atual, mod] } };
    });
  };
  return (
    <>
      <Abas atual={aba} mudar={setAba} abas={[["usuarios", "Usuários", db.pendentes.length || undefined], ["permissoes", "Perfis e permissões"], ["auditoria", "Auditoria"]] as const} />
      {aba === "usuarios" && (
        <>
          <Cartao titulo="Aguardando liberação" sub="Cadastros feitos na tela de login">
            <div className="fx-lista">
              <AnimatePresence initial={false}>
                {db.pendentes.map((p) => (
                  <motion.div key={p.email} className="fx-lista-item" layout exit={{ opacity: 0, x: 40 }}>
                    <Avatar nome={p.nome} />
                    <div className="fx-lista-txt"><b>{p.nome}</b><span>{p.email} · {p.setor} · {p.unidade} · pediu em {br(p.pediu)}</span></div>
                    <div className="fx-lista-acoes">
                      <button className="fx-btn fino" onClick={() => liberar(p.email, false)}>Recusar</button>
                      <button className="fx-btn primario fino" onClick={() => liberar(p.email, true)}>Liberar acesso</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!db.pendentes.length && <Vazio>Nenhum cadastro aguardando liberação.</Vazio>}
            </div>
          </Cartao>
          <Cartao titulo="Usuários" sub={`${db.usuarios.filter((u) => u.ativo).length} ativos`}>
            <Tabela linhas={db.usuarios} chave={(u) => u.email} busca={(u) => `${u.nome} ${u.email} ${u.perfil}`} colunas={[
              { k: "nome", titulo: "Nome", render: (u) => <span className="fx-usuario"><Avatar nome={u.nome} tam={26} />{u.nome}</span> },
              { k: "email", titulo: "E-mail", esconderCelular: true }, { k: "perfil", titulo: "Perfil" }, { k: "unidade", titulo: "Unidade", esconderCelular: true },
              { k: "ultimoAcesso", titulo: "Último acesso", esconderCelular: true, render: (u) => `há ${desde(u.ultimoAcesso)}` },
              { k: "ativo", titulo: "Status", render: (u) => <Etiqueta tom={u.ativo ? "ok" : "neutro"}>{u.ativo ? "Ativo" : "Inativo"}</Etiqueta> },
            ]} />
          </Cartao>
        </>
      )}
      {aba === "permissoes" && (
        <Cartao titulo="Matriz de permissões" sub="Clique para dar ou tirar o acesso de um perfil a um módulo">
          <div className="fx-matriz-rolagem">
            <table className="fx-matriz">
              <thead><tr><th>Perfil</th>{MODULOS_ID.map((m) => <th key={m}><span>{NOMES_MOD[m]}</span></th>)}</tr></thead>
              <tbody>
                {PERFIS.map((p) => (
                  <tr key={p}>
                    <th>{p}</th>
                    {MODULOS_ID.map((m) => {
                      const tem = db.permissoes[p]?.includes(m) ?? false;
                      return <td key={m}><button className={tem ? "on" : ""} onClick={() => alternar(p, m)} aria-pressed={tem} aria-label={`${p}: ${NOMES_MOD[m]}`}>{tem ? "✓" : ""}</button></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>
      )}
      {aba === "auditoria" && (
        <Cartao titulo="Registro de auditoria" sub="Quem fez o quê, e quando">
          <ul className="fx-auditoria">
            {db.auditoria.map((a, i) => (
              <li key={i}><Avatar nome={a.quem} tam={28} /><p><b>{a.quem}</b> {a.acao}</p><Etiqueta>{a.modulo}</Etiqueta><time>há {desde(a.quando)}</time></li>
            ))}
          </ul>
        </Cartao>
      )}
    </>
  );
}
