import { motion, useScroll, useSpring } from "motion/react";

export function Progresso() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className="progresso" style={{ scaleX }} aria-hidden="true" />;
}
