import { useEffect } from "react";
import { Capa } from "../components/Capa";
import { Comprar } from "../components/Comprar";
import { Cadeado, Camadas, Check, Play, Relogio, Seta, Voltar } from "../components/Icones";
import { VideoYoutube } from "../components/VideoYoutube";
import { aulasDe, duracaoCurso, formatarDuracao, formatarPreco, type Curso } from "../cursos";
import { alternarConcluida, concluida, marcarUltima, temAcesso, useAluno } from "../lib/aluno";
import { href } from "../lib/rota";

function ListaAulas({ curso, atual }: { curso: Curso; atual?: string }) {
  const aluno = useAluno();
  const liberado = temAcesso(aluno, curso.slug);
  let n = 0;
  return (
    <div className="modulos">
      {curso.modulos.map((m, mi) => (
        <section key={m.titulo} className="modulo">
          <h3><span className="mono">Módulo {mi + 1}</span>{m.titulo}</h3>
          <ol>
            {m.aulas.map((a) => {
              n += 1;
              const aberta = liberado || a.gratis;
              const feita = concluida(aluno, curso.slug, a.id);
              return (
                <li key={a.id}>
                  <a href={href.aula(curso.slug, a.id)} className={`aula-item${a.id === atual ? " atual" : ""}`} aria-current={a.id === atual ? "page" : undefined}>
                    <span className={`aula-estado${feita ? " feita" : ""}`} aria-hidden="true">
                      {feita ? <Check size={14} /> : aberta ? <Play size={12} /> : <Cadeado size={14} />}
                    </span>
                    <span className="aula-titulo">
                      <span className="mono aula-n">{String(n).padStart(2, "0")}</span> {a.titulo}
                      {a.gratis && !liberado && <span className="selo selo-gratis">Grátis</span>}
                      <span className="sr">{feita ? " (concluída)" : aberta ? "" : " (bloqueada)"}</span>
                    </span>
                    <span className="mono aula-dur">{a.duracao}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function PaginaCurso({ curso }: { curso: Curso }) {
  const aluno = useAluno();
  const aulas = aulasDe(curso);
  const liberado = temAcesso(aluno, curso.slug);
  const feitas = aulas.filter((a) => concluida(aluno, curso.slug, a.id)).length;
  const proxima = aulas.find((a) => !concluida(aluno, curso.slug, a.id)) ?? aulas[0];
  const primeiraGratis = aulas.find((a) => a.gratis);

  useEffect(() => { document.title = `${curso.titulo} · Mensura`; }, [curso.titulo]);

  return (
    <>
      <section className="curso-topo">
        <div className="conteudo curso-topo-grade">
          <div>
            <a href={href.inicio("cursos")} className="voltar"><Voltar size={16} /> Todos os cursos</a>
            <span className="selo">{curso.nivel}</span>
            <h1>{curso.titulo}</h1>
            <p className="curso-desc">{curso.descricao}</p>
            <ul className="meta meta-grande">
              <li><Camadas /> {aulas.length} aulas em {curso.modulos.length} módulos</li>
              <li><Relogio /> {formatarDuracao(duracaoCurso(curso))} de vídeo</li>
            </ul>
          </div>
          <aside className="compra">
            <div className="compra-capa"><Capa tipo={curso.capa} /></div>
            {liberado ? (
              <>
                <p className="compra-status"><Check size={16} /> Você tem acesso a este curso</p>
                <div className="barra" aria-hidden="true"><span style={{ width: `${(feitas / aulas.length) * 100}%` }} /></div>
                <p className="mono compra-prog">{feitas} de {aulas.length} aulas concluídas</p>
                <a href={href.aula(curso.slug, proxima.id)} className="btn btn-acento btn-bloco">
                  {feitas ? "Continuar de onde parei" : "Começar o curso"} <Seta />
                </a>
              </>
            ) : (
              <>
                <strong className="preco preco-grande">{formatarPreco(curso.preco)}</strong>
                <p className="compra-obs">Pagamento único · Pix ou cartão</p>
                <Comprar curso={curso} classe="btn btn-acento btn-bloco" />
                {primeiraGratis && (
                  <a href={href.aula(curso.slug, primeiraGratis.id)} className="btn btn-contorno btn-bloco">Assistir aula grátis</a>
                )}
                <p className="compra-obs">Já comprou? <a href={href.aluno()}>Ative seu código na Área do Aluno</a></p>
              </>
            )}
          </aside>
        </div>
      </section>

      <section className="secao">
        <div className="conteudo curso-corpo">
          <div>
            <h2>O que você vai aprender</h2>
            <ul className="aprendizados">
              {curso.aprendizados.map((a) => <li key={a}><Check size={16} /> {a}</li>)}
            </ul>
          </div>
          <div>
            <h2>Conteúdo do curso</h2>
            <ListaAulas curso={curso} />
          </div>
        </div>
      </section>
    </>
  );
}

export function PaginaAula({ curso, aulaId }: { curso: Curso; aulaId: string }) {
  const aluno = useAluno();
  const aulas = aulasDe(curso);
  const i = Math.max(0, aulas.findIndex((a) => a.id === aulaId));
  const aula = aulas[i];
  const anterior = aulas[i - 1];
  const seguinte = aulas[i + 1];
  const liberado = temAcesso(aluno, curso.slug);
  const aberta = liberado || !!aula.gratis;
  const feita = concluida(aluno, curso.slug, aula.id);
  const modulo = curso.modulos.find((m) => m.aulas.some((a) => a.id === aula.id));

  useEffect(() => { document.title = `${aula.titulo} · ${curso.titulo}`; }, [aula.titulo, curso.titulo]);
  useEffect(() => { if (liberado) marcarUltima(curso.slug, aula.id); }, [liberado, curso.slug, aula.id]);

  return (
    <section className="secao aula-pagina">
      <div className="conteudo aula-grade">
        <div className="aula-principal">
          <a href={href.curso(curso.slug)} className="voltar"><Voltar size={16} /> {curso.titulo}</a>
          {aberta ? (
            <VideoYoutube key={aula.id} video={aula.youtube} titulo={aula.titulo} iniciar={liberado} />
          ) : (
            <div className="video video-bloqueado">
              <span className="bloqueio-icone"><Cadeado size={28} /></span>
              <h2>Esta aula faz parte do curso completo</h2>
              <p>Garanta seu acesso para assistir a todas as {aulas.length} aulas.</p>
              <div className="acoes">
                <Comprar curso={curso} rotulo={`Comprar por ${formatarPreco(curso.preco)}`} />
                <a href={href.aluno()} className="btn btn-claro">Já comprei</a>
              </div>
            </div>
          )}
          <p className="mono aula-modulo">{modulo?.titulo} · aula {i + 1} de {aulas.length} · {aula.duracao}</p>
          <h1 className="aula-h1">{aula.titulo}</h1>
          <p className="aula-resumo">{aula.resumo}</p>
          <div className="aula-acoes">
            {liberado && (
              <button type="button" className={`btn ${feita ? "btn-feito" : "btn-escuro"}`} onClick={() => alternarConcluida(curso.slug, aula.id)} aria-pressed={feita}>
                <Check size={16} /> {feita ? "Concluída" : "Marcar como concluída"}
              </button>
            )}
            <span className="aula-nav">
              {anterior && <a href={href.aula(curso.slug, anterior.id)} className="btn btn-contorno"><Voltar size={16} /> Anterior</a>}
              {seguinte && <a href={href.aula(curso.slug, seguinte.id)} className="btn btn-contorno">Próxima <Seta size={16} /></a>}
            </span>
          </div>
        </div>
        <aside className="aula-lateral">
          <h2 className="aula-lateral-titulo">Aulas do curso</h2>
          <ListaAulas curso={curso} atual={aula.id} />
        </aside>
      </div>
    </section>
  );
}
