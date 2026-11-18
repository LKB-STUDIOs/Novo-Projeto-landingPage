import { Link } from "react-router";
import { useAuth } from "../../cursos/Auth";
import { ExigeLogin } from "../../cursos/ExigeLogin";
import { useCarregar, useTitulo } from "../../cursos/useCarregar";
import { PLATAFORMA_NOME } from "../../cursos/tipos";

export default function MinhaArea() {
  useTitulo(`Minha área · ${PLATAFORMA_NOME}`);
  const { api, usuario } = useAuth();
  const { dados, erro, carregando } = useCarregar(async () => {
    if (!usuario) return [];
    const [cursos, ids] = await Promise.all([api.listarCursos(), api.minhasInscricoes()]);
    const meus = cursos.filter((c) => ids.includes(c.id));
    return Promise.all(meus.map(async (curso) => ({ curso, feitas: (await api.aulasConcluidas(curso.id)).length })));
  }, [api, usuario?.id]);

  if (!usuario) return <ExigeLogin voltar="/cursos/minha-area" />;

  return (
    <>
      <h1 className="cs-h1-pequeno">Olá, {usuario.nome.split(" ")[0]}!</h1>
      <p className="cs-sub">Seus cursos</p>
      {carregando && <p className="cs-vazio">Carregando…</p>}
      {erro && <p className="cs-erro" role="alert">{erro}</p>}
      {dados && dados.length === 0 && (
        <div className="cs-vazio">
          <p>Você ainda não se inscreveu em nenhum curso.</p>
          <Link className="cs-btn cs-btn--primario" to="/cursos">Ver cursos disponíveis</Link>
        </div>
      )}
      {dados && dados.length > 0 && (
        <ul className="cs-grade">
          {dados.map(({ curso, feitas }) => {
            const pct = curso.totalAulas ? Math.round((feitas / curso.totalAulas) * 100) : 0;
            return (
              <li key={curso.id}>
                <Link to={`/cursos/${curso.slug}`} className="cs-cartao">
                  <h3>{curso.titulo}</h3>
                  <p>{curso.resumo}</p>
                  <div className="cs-progresso" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`Progresso em ${curso.titulo}`}>
                    <i style={{ width: `${pct}%` }} />
                    <span>{feitas} de {curso.totalAulas} aulas</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
