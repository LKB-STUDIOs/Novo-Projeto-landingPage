import { motion } from "motion/react";

const TIME = [
  { i: "L", n: "Lahel", p: "Sistemas e back-end" },
  { i: "B", n: "Bruno", p: "Design e front-end" },
  { i: "K", n: "Kenni", p: "Negócios e atendimento" },
];

export function Equipe() {
  return (
    <section className="equipe" id="equipe">
      <div className="cabeca">
        <p className="eyebrow">Quem faz</p>
        <h2>
          Três sócios, <span className="destaque">um time.</span>
        </h2>
      </div>
      <div className="equipe-grade">
        {TIME.map((m, i) => (
          <motion.article
            className="membro"
            key={m.n}
            initial={{ opacity: 0, y: 80, rotateY: -35 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
          >
            <div className="avatar" aria-hidden="true">{m.i}</div>
            <h3>{m.n}</h3>
            <p>{m.p}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
