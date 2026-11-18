import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "../../cursos/Auth";
import { useCarregar, useTitulo } from "../../cursos/useCarregar";
import { ErroAmigavel, PLATAFORMA_NOME } from "../../cursos/tipos";

export default function Curso() {
  const { slug = "" } = useParams();
  const { api, usuario } = useAuth();
  const navigate = useNavigate();
  const [inscrevendo, setInscrevendo] = useState(false);
  const [erroAcao, setErroAcao] = useState("");

  const { dados, erro, carregando, recarregar } = useCarregar(async () => {
    const cc = await api.obterCurso(slug);
    if (!cc) return null;
    const inscrito = (await api.minhasInscricoes()).includes(cc.curso.id);
    const feitas = inscrito ? new Set(await api.aulasConcluidas(cc.curso.id)) : new Set<string>();
    return { ...cc, inscrito, feitas };
  }, [api, usuario?.id, slug]);

  useTitulo(`${dados?.curso.titulo ?? "Curso"} · ${PLATAFORMA_NOME}`);

  if (carregando) return <p className="cs-vazio">Carregando…</p>;
  if (erro) return <p className="cs-erro" role="alert">{erro}</p>;
  if (!dados)
    return (
      <div className="cs-vazio">
        <p>Curso não encontrado.</p>
        <Link className="cs-btn cs-btn--fantasma" to="/cursos">Ver todos os cursos</Link>
      </div>
    );

  const { curso, aulas, inscrito, feitas } = dados;
  const proxima = aulas.find((a) => !feitas.has(a.id)) ?? aulas[0];
  const pct = aulas.length ? Math.round((feitas.size / aulas.length) * 100) : 0;

  async function inscrever() {
    if (!usuario) {
      navigate(`/cursos/entrar?modo=criar&voltar=${encodeURIComponent(`/cursos/${slug}`)}`);
      return;
    }
    setInscrevendo(true);
    setErroAcao("");
    try {
      await api.inscrever(curso.id);
      recarregar();
    } catch (e) {
      setErroAcao(e instanceof ErroAmigavel ? e.message : "Não foi possível concluir a inscrição.");
    } finally {
      setInscrevendo(false);
    }
  }

  return (
    <article className="cs-curso">
      <Link to="/cursos" className="cs-voltar">← Todos os cursos</Link>
      <h1 className="cs-h1-pequeno">{curso.titulo}</h1>
      <p className="cs-sub">{curso.resumo}</p>

      <div className="cs-acao">
        {inscrito ? (
          proxima && (
            <>
              <Link className="cs-btn cs-btn--primario" to={`/cursos/${curso.slug}/aula/${proxima.id}`}>
                {feitas.size === 0 ? "Começar o curso" : feitas.size === aulas.length ? "Rever o curso" : "Continuar de onde parei"}
              </Link>
              <div className="cs-progresso" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Seu progresso">
                <i style={{ width: `${pct}%` }} />
                <span>{feitas.size} de {aulas.length} aulas ({pct}%)</span>
              </div>
            </>
          )
        ) : (
          <button className="cs-btn cs-btn--primario" onClick={inscrever} disabled={inscrevendo}>
            {inscrevendo ? "Aguarde…" : usuario ? "Inscrever-me neste curso" : "Criar conta e me inscrever"}
          </button>
        )}
        {erroAcao && <p className="cs-erro" role="alert">{erroAcao}</p>}
      </div>

      {curso.descricao && <p className="cs-descricao">{curso.descricao}</p>}

      <h2 className="cs-h2">Conteúdo do curso</h2>
      {aulas.length === 0 && <p className="cs-vazio">As aulas deste curso ainda estão sendo preparadas.</p>}
      <ol className="cs-aulas">
        {aulas.map((a) => (
          <li key={a.id} className={feitas.has(a.id) ? "feita" : ""}>
            {inscrito ? (
              <Link to={`/cursos/${curso.slug}/aula/${a.id}`}>
                <span className="cs-num">{feitas.has(a.id) ? "✓" : a.ordem}</span>
                <span className="cs-aula-titulo">{a.titulo}</span>
                {a.minutos > 0 && <span className="cs-meta">{a.minutos} min</span>}
              </Link>
            ) : (
              <div className="cs-bloqueada">
                <span className="cs-num">{a.ordem}</span>
                <span className="cs-aula-titulo">{a.titulo}</span>
                {a.minutos > 0 && <span className="cs-meta">{a.minutos} min</span>}
                <span className="cs-meta" aria-label="Disponível após a inscrição">🔒</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </article>
  );
}
