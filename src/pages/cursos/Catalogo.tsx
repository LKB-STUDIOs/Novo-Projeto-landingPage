import { Link } from "react-router";
import { useAuth } from "../../cursos/Auth";
import { useCarregar, useTitulo } from "../../cursos/useCarregar";
import { PLATAFORMA_NOME } from "../../cursos/tipos";

export default function Catalogo() {
  useTitulo(`Cursos · ${PLATAFORMA_NOME}`);
  const { api, usuario } = useAuth();
  const { dados, erro, carregando } = useCarregar(async () => {
    const [cursos, inscritos] = await Promise.all([api.listarCursos(), api.minhasInscricoes()]);
    return { cursos, inscritos: new Set(inscritos) };
  }, [api, usuario?.id]);

  return (
    <>
      <section className="cs-hero">
        <p className="cs-eyebrow">Aprenda no seu ritmo</p>
        <h1>Cursos em vídeo, <span className="cs-destaque">quando e onde você quiser.</span></h1>
        <p className="cs-sub">Crie sua conta, inscreva-se e assista às aulas quantas vezes precisar.</p>
        {!usuario && (
          <Link className="cs-btn cs-btn--primario" to="/cursos/entrar?modo=criar">Criar minha conta</Link>
        )}
      </section>

      <section aria-labelledby="titulo-cursos">
        <h2 id="titulo-cursos" className="cs-h2">Cursos disponíveis</h2>
        {carregando && <p className="cs-vazio">Carregando cursos…</p>}
        {erro && <p className="cs-erro" role="alert">{erro}</p>}
        {dados && dados.cursos.length === 0 && <p className="cs-vazio">Nenhum curso publicado ainda. Volte em breve.</p>}
        {dados && dados.cursos.length > 0 && (
          <ul className="cs-grade">
            {dados.cursos.map((c) => (
              <li key={c.id}>
                <Link to={`/cursos/${c.slug}`} className="cs-cartao">
                  {dados.inscritos.has(c.id) && <span className="cs-selo">Inscrito</span>}
                  <h3>{c.titulo}</h3>
                  <p>{c.resumo}</p>
                  <span className="cs-meta">{c.totalAulas} {c.totalAulas === 1 ? "aula" : "aulas"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
