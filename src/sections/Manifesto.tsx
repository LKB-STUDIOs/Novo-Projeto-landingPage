const TEXTO =
  "Cada empresa tem um jeito de trabalhar. Por isso não vendemos modelos prontos: estudamos o seu nicho, desenhamos a experiência e entregamos tecnologia que o seu cliente sente e o seu time usa de verdade.";
const DESTAQUES = new Set(["modelos", "prontos:", "sente", "verdade."]);

export function Manifesto() {
  return (
    <section className="manifesto" aria-label="Nosso jeito de trabalhar">
      <p className="manifesto-texto">
        {TEXTO.split(" ").map((p, i) => (
          <span key={i} className={`w ${DESTAQUES.has(p) ? "forte" : ""}`}>
            {p}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
