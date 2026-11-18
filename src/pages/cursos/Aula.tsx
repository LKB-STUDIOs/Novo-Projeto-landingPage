import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useAuth } from "../../cursos/Auth";
import { ExigeLogin } from "../../cursos/ExigeLogin";
import { useCarregar, useTitulo } from "../../cursos/useCarregar";
import { ErroAmigavel, PLATAFORMA_NOME } from "../../cursos/tipos";
import { urlDoPlayer } from "../../cursos/youtube";

function Player({ id, titulo }: { id: string; titulo: string }) {
  if (id === "demo")
    return (
      <div className="cs-player cs-player--aviso">
        <p>▶ Aqui toca o vídeo da aula<br /><small>Modo demonstração</small></p>
      </div>
    );
  let src: string;
  try {
    src = urlDoPlayer(id);
  } catch {
    return <div className="cs-player cs-player--aviso"><p>Vídeo indisponível.</p></div>;
  }
  return (
    <div className="cs-player">
      <iframe
        src={src}
        title={titulo}
        allow="fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
    </div>
  );
}

export default function Aula() {
  const { slug = "", aulaId = "" } = useParams();
  const { api, usuario } = useAuth();
  const [erroAcao, setErroAcao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const { dados, erro, carregando, recarregar } = useCarregar(async () => {
    if (!usuario) return null;
    const cc = await api.obterCurso(slug);
    if (!cc) return null;
    const inscrito = (await api.minhasInscricoes()).includes(cc.curso.id);
    if (!inscrito) return { ...cc, inscrito, video: null, feitas: new Set<string>() };
    const [video, feitas] = await Promise.all([api.videoDaAula(aulaId), api.aulasConcluidas(cc.curso.id)]);
    return { ...cc, inscrito, video, feitas: new Set(feitas) };
  }, [api, usuario?.id, slug, aulaId]);

  const aula = dados?.aulas.find((a) => a.id === aulaId);
  useTitulo(`${aula?.titulo ?? "Aula"} · ${PLATAFORMA_NOME}`);

  // só quem está logado e inscrito assiste: os demais voltam para o lugar certo
  if (!usuario) return <ExigeLogin voltar={`/cursos/${slug}/aula/${aulaId}`} />;
  if (carregando) return <p className="cs-vazio">Carregando aula…</p>;
  if (erro) return <p className="cs-erro" role="alert">{erro}</p>;
  if (!dados)
    return (
      <div className="cs-vazio">
        <p>Curso não encontrado.</p>
        <Link className="cs-btn cs-btn--fantasma" to="/cursos">Ver todos os cursos</Link>
      </div>
    );
  if (!dados.inscrito) return <Navigate to={`/cursos/${slug}`} replace />;
  if (!aula)
    return (
      <div className="cs-vazio">
        <p>Aula não encontrada.</p>
        <Link className="cs-btn cs-btn--fantasma" to={`/cursos/${slug}`}>Voltar ao curso</Link>
      </div>
    );

  const { curso, aulas, feitas, video } = dados;
  const i = aulas.findIndex((a) => a.id === aula.id);
  const anterior = aulas[i - 1];
  const proxima = aulas[i + 1];
  const concluida = feitas.has(aula.id);

  async function alternar() {
    if (!aula) return;
    setSalvando(true);
    setErroAcao("");
    try {
      await api.marcarConcluida(aula.id, !concluida);
      recarregar();
    } catch (e) {
      setErroAcao(e instanceof ErroAmigavel ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="cs-aula">
      <div className="cs-aula-principal">
        <Link to={`/cursos/${curso.slug}`} className="cs-voltar">← {curso.titulo}</Link>
        {video ? <Player id={video} titulo={aula.titulo} /> : <div className="cs-player cs-player--aviso"><p>Vídeo indisponível no momento.</p></div>}
        <h1 className="cs-h1-pequeno">{aula.ordem}. {aula.titulo}</h1>
        {aula.descricao && <p className="cs-descricao">{aula.descricao}</p>}

        <div className="cs-barra-aula">
          <button className={`cs-btn ${concluida ? "cs-btn--fantasma" : "cs-btn--primario"}`} onClick={alternar} disabled={salvando} aria-pressed={concluida}>
            {concluida ? "✓ Aula concluída (desfazer)" : "Marcar como concluída"}
          </button>
          <div className="cs-navaula">
            {anterior && <Link className="cs-btn cs-btn--fantasma" to={`/cursos/${curso.slug}/aula/${anterior.id}`}>← Anterior</Link>}
            {proxima && <Link className="cs-btn cs-btn--fantasma" to={`/cursos/${curso.slug}/aula/${proxima.id}`}>Próxima →</Link>}
          </div>
        </div>
        {erroAcao && <p className="cs-erro" role="alert">{erroAcao}</p>}
      </div>

      <aside className="cs-lateral" aria-label="Aulas do curso">
        <h2>Aulas</h2>
        <ol className="cs-aulas">
          {aulas.map((a) => (
            <li key={a.id} className={`${feitas.has(a.id) ? "feita" : ""} ${a.id === aula.id ? "atual" : ""}`}>
              <Link to={`/cursos/${curso.slug}/aula/${a.id}`} aria-current={a.id === aula.id ? "page" : undefined}>
                <span className="cs-num">{feitas.has(a.id) ? "✓" : a.ordem}</span>
                <span className="cs-aula-titulo">{a.titulo}</span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
