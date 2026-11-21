import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Fotos: coloque os arquivos em public/equipe/ com estes nomes (JPG, vertical, de preferência 800×1000 ou mais).
 * Enquanto a foto não existir, o cartão mostra a inicial do nome.
 */
const FOTO = (arquivo: string) => `${import.meta.env.BASE_URL}equipe/${arquivo}`;

const TIME = [
  {
    i: "L", n: "Lahel", foto: "lahel.jpg", papel: "Back-end, sistemas e dados",
    texto: "Arquitetura de sistemas, APIs e bancos de dados. É quem transforma informação bagunçada em painéis e decisões.",
    chips: ["Back-end", "Sistemas", "Dados", "Arquitetura"],
  },
  {
    i: "B", n: "Bruno", foto: "bruno.jpg", papel: "Design, front-end e segurança",
    texto: "Desenha a interface, programa a experiência e garante que tudo saia seguro por padrão, do primeiro commit ao deploy.",
    chips: ["UI/UX", "Front-end", "Segurança", "Animação"],
  },
  {
    i: "K", n: "Kenni", foto: "kenni.jpg", papel: "Infraestrutura e gestão de risco",
    texto: "Engenheiro de produção. Cuida da infraestrutura, dos processos críticos e do risco de cada projeto, e é a voz do time com o cliente.",
    chips: ["Infraestrutura", "Gestão de risco", "Processos", "Atendimento"],
  },
];

type Membro = (typeof TIME)[number];

/** Cartão holográfico: inclina em 3D seguindo o cursor, com varredura de luz e moldura de scanner sobre a foto. */
function Cartao({ m, i }: { m: Membro; i: number }) {
  const [semFoto, setSemFoto] = useState(false);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), { stiffness: 160, damping: 18 });

  const mover = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const sair = () => { px.set(0); py.set(0); };

  return (
    <motion.article
      className="membro"
      initial={{ opacity: 0, y: 80, rotateY: -35 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={mover}
      onPointerLeave={sair}
    >
      <motion.div className="membro-inclina" style={{ rotateX: rx, rotateY: ry }}>
        <div className="holo">
          {semFoto ? (
            <div className="holo-inicial" aria-hidden="true">{m.i}</div>
          ) : (
            <img src={FOTO(m.foto)} alt={`Foto de ${m.n}`} loading="lazy" decoding="async" onError={() => setSemFoto(true)} />
          )}
          <span className="holo-linhas" aria-hidden="true" />
          <span className="holo-varre" aria-hidden="true" />
          <i className="holo-canto c1" aria-hidden="true" /><i className="holo-canto c2" aria-hidden="true" />
          <i className="holo-canto c3" aria-hidden="true" /><i className="holo-canto c4" aria-hidden="true" />
          <span className="holo-id" aria-hidden="true">ID·0{i + 1}</span>
        </div>
        <h3>{m.n}</h3>
        <p className="membro-papel">{m.papel}</p>
        <p className="membro-texto">{m.texto}</p>
        <ul className="chips membro-chips">{m.chips.map((c) => <li key={c}>{c}</li>)}</ul>
      </motion.div>
    </motion.article>
  );
}

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
        {TIME.map((m, i) => <Cartao key={m.n} m={m} i={i} />)}
      </div>
    </section>
  );
}
