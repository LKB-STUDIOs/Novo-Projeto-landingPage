import { aulasDe, duracaoCurso, formatarDuracao, formatarPreco, type Curso } from "../cursos";
import { concluida, temAcesso, useAluno } from "../lib/aluno";
import { href } from "../lib/rota";
import { Capa } from "./Capa";
import { Camadas, Relogio } from "./Icones";

export function CartaoCurso({ curso, indice }: { curso: Curso; indice: number }) {
  const aluno = useAluno();
  const aulas = aulasDe(curso);
  const liberado = temAcesso(aluno, curso.slug);
  const feitas = aulas.filter((a) => concluida(aluno, curso.slug, a.id)).length;
  return (
    <a href={href.curso(curso.slug)} className="cartao">
      <div className="etiqueta mono">
        <span className="etiqueta-furo" aria-hidden="true" />
        <span>Curso MS-{String(indice + 1).padStart(2, "0")}</span>
        <span className="etiqueta-nivel">{curso.nivel}</span>
      </div>
      <div className="cartao-capa">
        <Capa tipo={curso.capa} />
      </div>
      <div className="cartao-corpo">
        <h3>{curso.titulo}</h3>
        <p>{curso.chamada}</p>
        <ul className="meta">
          <li><Camadas /> {aulas.length} aulas</li>
          <li><Relogio /> {formatarDuracao(duracaoCurso(curso))}</li>
        </ul>
      </div>
      <div className="cartao-pe">
        {liberado ? (
          <>
            <div className="barra" aria-hidden="true"><span style={{ width: `${(feitas / aulas.length) * 100}%` }} /></div>
            <span className="mono">{feitas}/{aulas.length} concluídas</span>
          </>
        ) : (
          <>
            <strong className="preco">{formatarPreco(curso.preco)}</strong>
            <span className="cartao-ver">Ver aulas →</span>
          </>
        )}
      </div>
    </a>
  );
}
