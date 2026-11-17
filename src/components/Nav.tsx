import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { linkWhatsApp } from "../lib/contato";
import { rolarPara } from "../lib/scroll";
import { IconeWhats } from "./Icones";
import { Logo } from "./Logo";

const LINKS = [
  ["#servicos", "Serviços"],
  ["#nichos", "Nichos"],
  ["#projetos", "Projetos"],
  ["#equipe", "Equipe"],
  ["#contato", "Contato"],
] as const;

export function Nav() {
  const { scrollY } = useScroll();
  const [escondida, setEscondida] = useState(false);
  const [solida, setSolida] = useState(false);
  const [aberto, setAberto] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const ant = scrollY.getPrevious() ?? 0;
    setEscondida(y > ant && y > 400 && !aberto);
    setSolida(y > 40);
  });

  const ir = (href: string) => {
    setAberto(false);
    rolarPara(href);
  };

  return (
    <motion.header
      className={`nav ${solida ? "solida" : ""}`}
      animate={{ y: escondida ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <a href="#topo" onClick={(e) => { e.preventDefault(); ir("#topo"); }} aria-label="LBK Studio, voltar ao início">
        <Logo />
      </a>
      <nav className="nav-links" aria-label="Principal">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} onClick={(e) => { e.preventDefault(); ir(href); }}>
            <span data-texto={label}>{label}</span>
          </a>
        ))}
      </nav>
      <a className="nav-cta" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
        <IconeWhats size={18} /> <span>Falar agora</span>
      </a>
      <button className="nav-menu" aria-expanded={aberto} aria-controls="menu-movel" onClick={() => setAberto((v) => !v)}>
        <span className="sr-only">{aberto ? "Fechar menu" : "Abrir menu"}</span>
        <i /><i />
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.nav
            id="menu-movel"
            className="menu-movel"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            aria-label="Menu"
          >
            {LINKS.map(([href, label], i) => (
              <motion.a
                key={href}
                href={href}
                onClick={(e) => { e.preventDefault(); ir(href); }}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.06 }}
              >
                {label}
              </motion.a>
            ))}
            <a className="btn" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
              <IconeWhats /> WhatsApp
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
