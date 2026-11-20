import { Link } from "react-router";

/** Página estática (public/casa-beulah-park/): fica fora do app React, então é um link normal. */
const LUME_RESIDENCE = `${import.meta.env.BASE_URL}casa-beulah-park/`;
/** Microsite com build próprio (apps/support-cell-lab), publicado em /support-cell-lab/. */
const SUPPORT_CELL_LAB = `${import.meta.env.BASE_URL}support-cell-lab/`;

const NICHOS: { n: string; t: string; d: string; c: string; link?: string; href?: string; nome?: string }[] = [
  { n: "01", t: "Indústria", d: "Produção, qualidade e indicadores para o chão de fábrica.", c: "#7cf2c4", link: "/projetos/ferrus", nome: "Ferrus OS" },
  { n: "02", t: "Imobiliário e temporada", d: "Vitrines de imóveis integradas ao Airbnb.", c: "#ffb86b", link: "/projetos/brisa", nome: "Brisa Temporadas" },
  { n: "03", t: "Página de imóvel", d: "Tour em vídeo que acompanha a rolagem e cada detalhe da casa.", c: "#e7c487", href: LUME_RESIDENCE, nome: "Lume Residence" },
  { n: "04", t: "Assistência técnica", d: "Showroom 360°, laboratório 3D de reparos e orçamento pelo WhatsApp.", c: "#9be8ff", href: SUPPORT_CELL_LAB, nome: "Support Cell Lab" },
  { n: "05", t: "Saúde e clínicas", d: "Agendamento online, especialidades e área do paciente.", c: "#8fb4ff" },
  { n: "06", t: "Restaurantes", d: "Cardápio digital, pedidos e reservas direto no site.", c: "#ff8fab" },
  { n: "07", t: "Varejo e e-commerce", d: "Lojas virtuais rápidas com catálogo e WhatsApp.", c: "#d6a8ff" },
  { n: "08", t: "Serviços", d: "Escritórios, academias, oficinas: presença e captação.", c: "#f4f48a" },
];

export function Nichos() {
  return (
    <section className="nichos" id="nichos">
      <div className="nichos-pin">
        <div className="cabeca">
          <p className="eyebrow">Microsites por nicho</p>
          <h2>
            Uma vitrine para <br />
            cada tipo de <span className="destaque">negócio.</span>
          </h2>
        </div>
        <div className="nichos-trilho">
          {NICHOS.map((n) => {
            const conteudo = (
              <>
                <span className="nicho-num">{n.n}</span>
                <span className={`nicho-tag ${n.link || n.href ? "" : "breve"}`}>{n.link || n.href ? "No ar" : "Em breve"}</span>
                <h3>{n.t}</h3>
                <p>{n.d}</p>
                {(n.link || n.href) && <span className="nicho-link">Ver {n.nome} →</span>}
              </>
            );
            if (n.href) {
              return (
                <a key={n.n} className="nicho ativo" href={n.href} style={{ ["--c" as string]: n.c }}>
                  {conteudo}
                </a>
              );
            }
            return n.link ? (
              <Link key={n.n} className="nicho ativo" to={n.link} style={{ ["--c" as string]: n.c }}>
                {conteudo}
              </Link>
            ) : (
              <div key={n.n} className="nicho" style={{ ["--c" as string]: n.c }}>
                {conteudo}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
