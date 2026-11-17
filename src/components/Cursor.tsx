import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/** Cursor personalizado: ponto + anel que cresce sobre links. Só em mouse, nunca no toque. */
export function Cursor() {
  const [ativo, setAtivo] = useState(false);
  const [modo, setModo] = useState<"" | "link" | "ver">("");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ax = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ay = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    const fino = window.matchMedia("(pointer: fine)").matches;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fino || reduzir) return;
    setAtivo(true);
    document.documentElement.classList.add("cursor-custom");
    const mover = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const alvo = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button");
      setModo(alvo ? ((alvo.dataset.cursor as "link" | "ver") ?? "link") : "");
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      document.documentElement.classList.remove("cursor-custom");
    };
  }, [x, y]);

  if (!ativo) return null;
  return (
    <>
      <motion.div className="cursor-ponto" style={{ x, y }} aria-hidden="true" />
      <motion.div className={`cursor-anel ${modo}`} style={{ x: ax, y: ay }} aria-hidden="true">
        {modo === "ver" && <span>ver</span>}
      </motion.div>
    </>
  );
}
