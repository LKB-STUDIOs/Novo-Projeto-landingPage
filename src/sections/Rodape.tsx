import { Link } from "react-router";
import { linkWhatsApp, WHATSAPP_EXIBICAO } from "../lib/contato";

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-gigante" aria-hidden="true">LBK<span>studio</span></div>
      <div className="rodape-linha">
        <span>© {new Date().getFullYear()} LBK Studio · Lahel, Bruno e Kenni</span>
        <nav aria-label="Rodapé">
          <Link to="/projetos/ferrus">Ferrus OS</Link>
          <Link to="/projetos/brisa">Brisa Temporadas</Link>
          <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">WhatsApp {WHATSAPP_EXIBICAO}</a>
        </nav>
      </div>
    </footer>
  );
}
