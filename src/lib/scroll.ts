import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** Rolagem suave (Lenis) sincronizada com o relógio do GSAP. */
export function iniciarScrollSuave(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function rolarPara(alvo: string | number) {
  if (lenis) lenis.scrollTo(alvo, { offset: 0, duration: 1.6 });
  else if (typeof alvo === "string") document.querySelector(alvo)?.scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: alvo, behavior: "smooth" });
}

export function pausarScroll(pausar: boolean) {
  if (!lenis) return;
  if (pausar) lenis.stop();
  else lenis.start();
}

export { gsap, ScrollTrigger };
