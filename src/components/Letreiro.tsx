/** Faixa de texto infinita (CSS puro, pausa para quem prefere menos movimento). */
export function Letreiro({ itens, reverso = false }: { itens: string[]; reverso?: boolean }) {
  const lista = [...itens, ...itens];
  return (
    <div className={`letreiro ${reverso ? "reverso" : ""}`} aria-hidden="true">
      <div className="letreiro-trilho">
        {lista.map((t, i) => (
          <span key={i}>
            {t}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
