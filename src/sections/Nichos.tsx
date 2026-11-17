import { Link } from "react-router";

const NICHOS = [
  { n: "01", t: "Indústria", d: "Produção, qualidade e indicadores para o chão de fábrica.", c: "#7cf2c4", link: "/projetos/ferrus", nome: "Ferrus OS" },
  { n: "02", t: "Imobiliário e temporada", d: "Vitrines de imóveis integradas ao Airbnb.", c: "#ffb86b", link: "/projetos/brisa", nome: "Brisa Temporadas" },
  { n: "03", t: "Saúde e clínicas", d: "Agendamento online, especialidades e área do paciente.", c: "#8fb4ff" },
  { n: "04", t: "Restaurantes", d: "Cardápio digital, pedidos e reservas direto no site.", c: "#ff8fab" },
  { n: "05", t: "Varejo e e-commerce", d: "Lojas virtuais rápidas com catálogo e WhatsApp.", c: "#d6a8ff" },
  { n: "06", t: "Serviços", d: "Escritórios, academias, oficinas: presença e captação.", c: "#f4f48a" },
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
                <span className={`nicho-tag ${n.link ? "" : "breve"}`}>{n.link ? "No ar" : "Em breve"}</span>
                <h3>{n.t}</h3>
                <p>{n.d}</p>
                {n.link && <span className="nicho-link">Ver {n.nome} →</span>}
              </>
            );
            return n.link ? (
              <Link key={n.n} className="nicho ativo" to={n.link} style={{ ["--c" as string]: n.c }} data-cursor="ver">
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
