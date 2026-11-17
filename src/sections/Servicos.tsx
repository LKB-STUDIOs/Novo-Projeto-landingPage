import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import type { PointerEvent } from "react";

const SERVICOS = [
  { n: "01", t: "Sites institucionais", d: "Presença profissional, rápida e fácil de achar no Google.", c: "var(--accent)" },
  { n: "02", t: "Landing pages", d: "Páginas focadas em conversão para campanhas e lançamentos.", c: "var(--violet)" },
  { n: "03", t: "Lojas virtuais", d: "Catálogo, carrinho e pagamento, integrados ao WhatsApp.", c: "var(--mint)" },
  { n: "04", t: "Sistemas sob medida", d: "Gestão, produção, estoque e relatórios do jeito da sua empresa.", c: "var(--amber)" },
  { n: "05", t: "Automação e IA", d: "Atendimento, prospecção e tarefas repetitivas no piloto automático.", c: "#8fb4ff" },
  { n: "06", t: "Manutenção e SEO", d: "Seu site sempre atualizado, seguro e subindo nas buscas.", c: "#ff8fab" },
];

function Cartao({ s, i }: { s: (typeof SERVICOS)[number]; i: number }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const brilho = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, color-mix(in oklab, ${s.c} 22%, transparent), transparent 60%)`;

  const mover = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 14);
    rx.set(-(py - 0.5) * 14);
    mx.set(px * 100);
    my.set(py * 100);
  };

  return (
    <motion.article
      className="servico"
      style={{ rotateX: rx, rotateY: ry, ["--c" as string]: s.c }}
      onPointerMove={mover}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
      initial={{ opacity: 0, y: 70, rotateX: -25 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.span className="servico-brilho" style={{ background: brilho }} aria-hidden="true" />
      <span className="servico-num">{s.n}</span>
      <h3>{s.t}</h3>
      <p>{s.d}</p>
    </motion.article>
  );
}

export function Servicos() {
  return (
    <section className="servicos" id="servicos">
      <div className="cabeca">
        <p className="eyebrow">O que fazemos</p>
        <h2>
          Tudo o que sua empresa precisa <span className="destaque">no digital.</span>
        </h2>
      </div>
      <div className="servicos-grade">
        {SERVICOS.map((s, i) => (
          <Cartao key={s.n} s={s} i={i} />
        ))}
      </div>
    </section>
  );
}
