const ETAPAS = [
  ["Descoberta", "Entendemos seu processo, seus clientes e onde o digital gera mais resultado."],
  ["Design", "Protótipos navegáveis antes de qualquer linha de código. Você aprova cada tela."],
  ["Código e entrega", "Desenvolvimento, publicação, segurança e suporte. Seu projeto no ar e evoluindo."],
] as const;

export function Processo() {
  return (
    <section className="processo" aria-label="Como trabalhamos">
      <div className="processo-pin">
        <p className="eyebrow processo-eyebrow">Como trabalhamos</p>
        <div className="processo-contador" aria-hidden="true">
          <span className="pc-atual">01</span>
          <span className="pc-total">/ 03</span>
        </div>
        <ol className="processo-etapas">
          {ETAPAS.map(([t, d], i) => (
            <li className="etapa" key={t}>
              <p className="eyebrow">Etapa 0{i + 1}</p>
              <h2>{t}</h2>
              <p>{d}</p>
            </li>
          ))}
        </ol>
        <div className="processo-barra" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
