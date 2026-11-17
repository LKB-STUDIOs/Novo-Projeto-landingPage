import { motion } from "motion/react";
import { Magnetico } from "../components/Magnetico";
import { IconeWhats, Seta } from "../components/Icones";
import { linkWhatsApp } from "../lib/contato";
import { rolarPara } from "../lib/scroll";

const LINHAS = ["Sites e sistemas", "que fazem seu", "negócio crescer."];

export function Hero({ pronto }: { pronto: boolean }) {
  return (
    <section className="hero" id="topo">
      <div className="hero-inner">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={pronto ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="ponto-vivo" /> Estúdio digital · Joinville/SC · atendemos todo o Brasil
        </motion.p>
        <h1 className="hero-titulo" aria-label={LINHAS.join(" ")}>
          {LINHAS.map((linha, i) => (
            <span className="linha" key={i} aria-hidden="true">
              <motion.span
                className={i === 2 ? "destaque" : ""}
                initial={{ y: "115%", rotateX: -70 }}
                animate={pronto ? { y: "0%", rotateX: 0 } : {}}
                transition={{ duration: 1.3, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                {linha}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 24 }}
          animate={pronto ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.6 }}
        >
          Do pequeno comércio à indústria: criamos sites que vendem, sistemas que organizam a operação e
          experiências que fazem o cliente lembrar da sua marca.
        </motion.p>
        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 24 }}
          animate={pronto ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.75 }}
        >
          <Magnetico className="btn btn-primario" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
            <IconeWhats /> Quero meu projeto
          </Magnetico>
          <Magnetico
            className="btn btn-fantasma"
            href="#projetos"
            onClick={(e) => {
              e.preventDefault();
              rolarPara("#projetos");
            }}
          >
            Ver projetos <Seta />
          </Magnetico>
        </motion.div>
      </div>
      <motion.div
        className="hero-rodape"
        initial={{ opacity: 0 }}
        animate={pronto ? { opacity: 1 } : {}}
        transition={{ delay: 1.1, duration: 1 }}
      >
        <span>Role para explorar</span>
        <i className="rolar-linha" aria-hidden="true" />
        <span>2026 ©</span>
      </motion.div>
    </section>
  );
}
