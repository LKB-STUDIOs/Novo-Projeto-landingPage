import { Link, NavLink, Outlet } from "react-router";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/inter-tight";
import { AuthProvider, useAuth } from "../../cursos/Auth";
import { PLATAFORMA_NOME } from "../../cursos/tipos";
import "./cursos.css";

function Casca() {
  const { api, usuario, sair } = useAuth();

  return (
    <div className="cs">
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>
      {api.modo === "demo" && (
        <p className="cs-aviso" role="note">
          Modo demonstração: contas e progresso ficam só neste navegador. Conecte o Supabase para usar de verdade.
        </p>
      )}
      <header className="cs-topo">
        <Link to="/cursos" className="cs-marca">
          <span className="cs-marca-ponto" aria-hidden="true" />
          {PLATAFORMA_NOME}
        </Link>
        <nav aria-label="Principal" className="cs-nav">
          <NavLink to="/cursos" end>Cursos</NavLink>
          {usuario ? (
            <>
              <NavLink to="/cursos/minha-area">Minha área</NavLink>
              <button type="button" className="cs-link-botao" onClick={sair}>Sair</button>
            </>
          ) : (
            <NavLink to="/cursos/entrar" className="cs-nav-entrar">Entrar</NavLink>
          )}
        </nav>
      </header>
      <main id="conteudo" className="cs-main">
        <Outlet />
      </main>
      <footer className="cs-rodape">
        {usuario && <span>Conectado como {usuario.nome}</span>}
        <Link to="/">LBK Studio</Link>
      </footer>
    </div>
  );
}

export default function CursosLayout() {
  return (
    <AuthProvider>
      <Casca />
    </AuthProvider>
  );
}
