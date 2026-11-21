import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Rolagem suave (Lenis) ligada ao ScrollTrigger. Retorna a função de limpeza. */
export function iniciarScroll() {
  if (reduzMovimento()) return () => {}
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (t: number) => lenis.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
  }
}

export { gsap, ScrollTrigger, SplitText }
