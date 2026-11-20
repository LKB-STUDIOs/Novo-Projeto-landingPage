import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useRef, type ComponentProps, type PointerEvent } from "react";

type Props = ComponentProps<typeof motion.a> & { forca?: number };

/** Link que "puxa" o cursor quando ele se aproxima. */
export function Magnetico({ forca = 0.35, children, className = "", ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduzir = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });

  const mover = (e: PointerEvent<HTMLAnchorElement>) => {
    if (reduzir || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * forca);
    y.set((e.clientY - (r.top + r.height / 2)) * forca);
  };
  const soltar = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      className={`magnetico ${className}`}
      style={{ x, y }}
      onPointerMove={mover}
      onPointerLeave={soltar}
      whileTap={{ scale: 0.96 }}
      {...rest}
    >
      {children}
    </motion.a>
  );
}
