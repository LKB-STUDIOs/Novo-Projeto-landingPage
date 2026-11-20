import { Link } from "react-router";
import { SetaDiagonal } from "../components/Icones";

/** Página estática (public/casa-beulah-park/): fica fora do app React, então é um link normal. */
const CASA_BEULAH_PARK = `${import.meta.env.BASE_URL}casa-beulah-park/`;

export function Projetos() {
  return (
    <section className="projetos" id="projetos">
      <div className="cabeca">
        <p className="eyebrow">Projetos em destaque</p>
        <h2>
          O que já <span className="destaque">construímos.</span>
        </h2>
      </div>

      <article className="projeto" style={{ ["--c" as string]: "#7cf2c4" }}>
        <Link to="/projetos/ferrus" className="projeto-midia" data-cursor="ver" aria-label="Abrir demonstração do Ferrus OS">
          <div className="mock mock-app">
            <div className="mock-barra"><i /><i /><i /><span>ferrus.app / painel</span></div>
            <div className="mock-corpo">
              <aside className="mock-lado"><b /><b /><b /><b /><b /></aside>
              <div className="mock-main">
                <div className="mock-kpis"><span /><span /><span /><span /></div>
                <div className="mock-grafico">
                  {[45, 62, 38, 75, 58, 88, 70, 92].map((h, i) => (
                    <i key={i} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>
        <div className="projeto-info">
          <p className="eyebrow">Sistema · Indústria</p>
          <h3>Ferrus OS</h3>
          <p>
            Gestão industrial completa em 13 módulos: produção e OEE, qualidade com CEP e 8D, engenharia e PPAP,
            manutenção, compras, logística, laboratório, meio ambiente, segurança do trabalho e TI, em várias unidades.
          </p>
          <ul className="chips"><li>13 módulos</li><li>Dashboards</li><li>Tempo real</li><li>Multiunidade</li></ul>
          <Link to="/projetos/ferrus" className="btn btn-cor">Abrir demonstração <SetaDiagonal /></Link>
        </div>
      </article>

      <article className="projeto reverso" style={{ ["--c" as string]: "#ffb86b" }}>
        <Link to="/projetos/brisa" className="projeto-midia" data-cursor="ver" aria-label="Abrir o site Brisa Temporadas">
          <div className="mock mock-site">
            <div className="mock-barra"><i /><i /><i /><span>brisatemporadas.com.br</span></div>
            <div className="mock-hero"><span /><span /><em /></div>
            <div className="mock-cards"><span /><span /><span /></div>
          </div>
        </Link>
        <div className="projeto-info">
          <p className="eyebrow">Site · Imobiliário</p>
          <h3>Brisa Temporadas</h3>
          <p>
            Vitrine de imóveis para temporada com busca, filtros e galeria. A reserva acontece no Airbnb, com a
            segurança e o pagamento da plataforma.
          </p>
          <ul className="chips"><li>Vitrine</li><li>Filtros</li><li>Airbnb</li><li>Mobile</li></ul>
          <Link to="/projetos/brisa" className="btn btn-cor">Abrir site <SetaDiagonal /></Link>
        </div>
      </article>

      <article className="projeto" style={{ ["--c" as string]: "#e7c487" }}>
        <a href={CASA_BEULAH_PARK} className="projeto-midia" data-cursor="ver" aria-label="Abrir o site Lume Residence">
          <div className="mock mock-site">
            <div className="mock-barra"><i /><i /><i /><span>lumeresidence.com.br</span></div>
            <div className="mock-hero"><span /><span /><em /></div>
            <div className="mock-cards"><span /><span /><span /></div>
          </div>
        </a>
        <div className="projeto-info">
          <p className="eyebrow">Site · Imobiliário</p>
          <h3>Lume Residence</h3>
          <p>
            Página de um imóvel com tour em vídeo que acompanha a rolagem: a câmera entra em cada ambiente e, depois,
            cada item da casa é detalhado com pontos numerados e cenas de perto.
          </p>
          <ul className="chips"><li>Tour em vídeo</li><li>Detalhes por ambiente</li><li>Rolagem</li><li>Mobile</li></ul>
          <a href={CASA_BEULAH_PARK} className="btn btn-cor">Abrir site <SetaDiagonal /></a>
        </div>
      </article>
    </section>
  );
}
