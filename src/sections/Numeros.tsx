import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const NUMEROS = [
  { v: 6, s: "", l: "nichos atendidos" },
  { v: 100, s: "%", l: "responsivo e acessível" },
  { v: 90, s: "+", l: "nota de desempenho que buscamos no Lighthouse" },
  { v: 24, s: "h", l: "para responder seu contato" },
];

function Contador({ v, s }: { v: number; s: string }) {
  const ref = useRef<HTMLElement>(null);
  const visto = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduzir = useReducedMotion();
  useEffect(() => {
    if (!visto || !ref.current) return;
    if (reduzir) {
      ref.current.textContent = v + s;
      return;
    }
    const c = animate(0, v, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => { if (ref.current) ref.current.textContent = Math.round(n) + s; },
    });
    return () => c.stop();
  }, [visto, v, s, reduzir]);
  return <strong ref={ref}>0{s}</strong>;
}

export function Numeros() {
  return (
    <section className="numeros" aria-label="Números">
      {NUMEROS.map((n) => (
        <div className="numero" key={n.l}>
          <Contador v={n.v} s={n.s} />
          <span>{n.l}</span>
        </div>
      ))}
    </section>
  );
}
