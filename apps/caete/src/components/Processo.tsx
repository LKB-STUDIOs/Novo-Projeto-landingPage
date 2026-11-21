import { useLayoutEffect, useRef } from 'react'
import { ETAPAS } from '../lib/data'
import { gsap, reduzMovimento } from '../lib/scroll'
import { Titulo } from './Titulo'

/** Linha do tempo na horizontal, fixa na tela enquanto se rola; o rio no fundo se desenha com o progresso. */
export function Processo() {
  const raiz = useRef<HTMLElement>(null)
  const trilho = useRef<HTMLDivElement>(null)
  const rio = useRef<SVGPathElement>(null)

  useLayoutEffect(() => {
    if (reduzMovimento()) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        const dist = () => trilho.current!.scrollWidth - window.innerWidth + 120
        const len = rio.current!.getTotalLength()
        gsap.set(rio.current, { strokeDasharray: len, strokeDashoffset: len })
        const tl = gsap.timeline({ scrollTrigger: { trigger: raiz.current, start: 'top top', end: () => `+=${dist() + 300}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } })
        tl.to(trilho.current, { x: () => -dist(), ease: 'none' }, 0)
          .to(rio.current, { strokeDashoffset: 0, ease: 'none' }, 0)
        gsap.utils.toArray<HTMLElement>('.etapa').forEach((el) => {
          gsap.from(el, { opacity: 0.25, scale: 0.94, scrollTrigger: { trigger: el, containerAnimation: tl, start: 'left 85%', end: 'left 55%', scrub: true } })
        })
      })
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={raiz} id="processo" className="relative overflow-hidden bg-musgo-escuro text-papel">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1600 800" preserveAspectRatio="none" aria-hidden>
        <path d="M-20 560 C 250 380, 420 700, 760 520 S 1250 300, 1640 460" fill="none" stroke="rgba(230,220,195,.12)" strokeWidth="26" strokeLinecap="round" />
        <path ref={rio} d="M-20 560 C 250 380, 420 700, 760 520 S 1250 300, 1640 460" fill="none" stroke="#d9a15e" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 10" />
      </svg>
      <div className="relative flex min-h-screen flex-col justify-center gap-14 py-24 max-[899px]:py-20">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <Titulo rotulo="Caminho da licença" claro>Cinco etapas, um calendário claro.</Titulo>
        </div>
        <div ref={trilho} className="flex gap-6 px-5 max-[899px]:flex-col md:px-[max(2rem,calc((100vw-80rem)/2+2rem))] min-[900px]:w-max">
          {ETAPAS.map((e) => (
            <article key={e.n} className="etapa w-full shrink-0 rounded-3xl border border-papel/20 bg-papel/[.06] p-8 backdrop-blur-sm min-[900px]:w-[27rem]">
              <div className="mb-14 flex items-baseline justify-between">
                <span className="display text-7xl font-light text-[#d9a15e]">{e.n}</span>
                <span className="rotulo rounded-full border border-papel/30 px-3 py-1 !text-[.62rem]">{e.prazo}</span>
              </div>
              <h3 className="display mb-3 text-3xl font-medium">{e.titulo}</h3>
              <p className="leading-relaxed text-papel/75">{e.texto}</p>
            </article>
          ))}
          <div className="w-0 shrink-0 min-[900px]:w-24" />
        </div>
      </div>
    </section>
  )
}
