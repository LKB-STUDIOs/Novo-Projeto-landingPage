import { useEffect, useLayoutEffect } from "react";
import { Moldura } from "./components/Moldura";
import { acharCurso, aulasDe } from "./cursos";
import { lerRota, useHash } from "./lib/rota";
import { PaginaAluno } from "./pages/Aluno";
import { PaginaAula, PaginaCurso } from "./pages/Curso";
import { Inicio } from "./pages/Inicio";

function NaoAchou() {
  return (
    <section className="secao">
      <div className="conteudo chamada">
        <h1>Não encontramos esta página.</h1>
        <a href="#/" className="btn btn-acento">Voltar ao início</a>
      </div>
    </section>
  );
}

export default function App() {
  const hash = useHash();
  const rota = lerRota(hash);

  // ao trocar de página, volta ao topo (ou rola até a seção pedida)
  useLayoutEffect(() => {
    if (rota.nome === "inicio" && rota.secao) {
      document.getElementById(rota.secao)?.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rota.nome === "inicio") document.title = "Mensura · Escola de Metrologia";
  }, [rota.nome]);

  let pagina;
  if (rota.nome === "inicio") pagina = <Inicio />;
  else if (rota.nome === "aluno") pagina = <PaginaAluno />;
  else {
    const curso = acharCurso(rota.curso);
    if (!curso) pagina = <NaoAchou />;
    else if (rota.nome === "curso") pagina = <PaginaCurso curso={curso} />;
    else pagina = aulasDe(curso).some((a) => a.id === rota.aula) ? <PaginaAula curso={curso} aulaId={rota.aula} /> : <NaoAchou />;
  }

  return <Moldura>{pagina}</Moldura>;
}
