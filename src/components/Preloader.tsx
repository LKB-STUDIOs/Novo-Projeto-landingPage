import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { pausarScroll } from "../lib/scroll";

/** Abertura curta (≈1,6 s): contador + marca. Pulada para quem prefere menos movimento. */
export function Preloader({ aoTerminar }: { aoTerminar: () => void }) {
  const reduzir = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [n, setN] = useState(0);
  const [visivel, setVisivel] = useState(!reduzir);

  useEffect(() => {
    if (reduzir) {
      aoTerminar();
      return;
    }
    pausarScroll(true);
    const inicio = performance.now();
    const dur = 1500;
    let raf = 0;
    const passo = (t: number) => {
      const p = Math.min(1, (t - inicio) / dur);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(passo);
      else setTimeout(() => setVisivel(false), 180);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        pausarScroll(false);
        aoTerminar();
      }}
    >
      {visivel && (
        <motion.div
          className="preloader"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <motion.div
            className="preloader-marca"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            LBK<em>studio</em>
          </motion.div>
          <div className="preloader-num">{String(n).padStart(3, "0")}</div>
          <div className="preloader-barra">
            <span style={{ transform: `scaleX(${n / 100})` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
