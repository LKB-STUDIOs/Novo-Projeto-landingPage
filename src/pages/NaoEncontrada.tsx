import { Link } from "react-router";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/inter-tight";
import "./home.css";

export default function NaoEncontrada() {
  return (
    <main className="home nao-encontrada">
      <p className="eyebrow">Erro 404</p>
      <h2>
        Essa página <span className="destaque">não existe.</span>
      </h2>
      <Link to="/" className="btn btn-primario">Voltar ao início</Link>
    </main>
  );
}
