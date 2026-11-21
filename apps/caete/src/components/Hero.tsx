import { useLayoutEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { gsap, SplitText, reduzMovimento } from '../lib/scroll'
import { Magnetico } from './Magnetico'

export function Hero() {
  const raiz = useRef<HTMLElement>(null)
  const video = useRef<HTMLDivElement>(null)
  const titulo = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    if (reduzMovimento()) return
    const ctx = gsap.context(() => {
      const split = SplitText.create(titulo.current!, { type: 'lines,words', mask: 'lines', autoSplit: true })
      gsap.from(split.words, { yPercent: 115, rotate: 4, duration: 1.15, ease: 'expo.out', stagger: 0.055, delay: 0.25 })
      gsap.from('.hero-in', { y: 28, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.9 })

      // rolagem: vídeo afunda e escurece, texto sobe mais devagar (profundidade)
      gsap.timeline({ scrollTrigger: { trigger: raiz.current, start: 'top top', end: 'bottom top', scrub: true } })
        .to(video.current, { scale: 1.18, yPercent: 14, ease: 'none' }, 0)
        .to('.hero-texto', { yPercent: -22, opacity: 0.1, ease: 'none' }, 0)
        .to('.hero-veu', { opacity: 1, ease: 'none' }, 0)
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={raiz} id="topo" className="relative h-[108svh] min-h-[640px] overflow-hidden bg-kraft">
      <div ref={video} className="absolute inset-0 will-change-transform">
        <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="auto" poster="media/hero-poster.jpg" aria-hidden>
          <source src="media/hero.mp4" type="video/mp4" />
        </video>
      </div>
      {/* véu de papel para o texto respirar + fusão com a próxima seção */}
      <div className="absolute inset-0 bg-gradient-to-b from-papel/45 via-papel/10 to-papel" />
      <div className="absolute inset-0 bg-gradient-to-r from-papel/80 via-papel/30 to-transparent" />
      <div className="hero-veu absolute inset-0 bg-papel opacity-0" />

      <div className="hero-texto relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-28 pt-32 md:px-8 md:pb-24">
        <p className="hero-in rotulo mb-6 flex items-center gap-3 text-musgo-escuro">
          <span className="h-px w-10 bg-musgo-escuro" /> Engenharia ambiental · desde 2006
        </p>
        <h1 ref={titulo} className="display max-w-5xl text-[clamp(2.7rem,8.2vw,7.4rem)] font-medium leading-[0.96] text-tinta">
          Licenciar sem <em className="font-normal text-musgo">atravessar</em> a mata.
        </h1>
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="hero-in max-w-md text-lg leading-relaxed text-tinta/80">
            Estudos, licenças e gestão ambiental para empreendimentos que precisam andar, com rigor técnico e respeito ao território.
          </p>
          <div className="hero-in flex items-center gap-4">
            <Magnetico href="#cases" className="rotulo inline-flex items-center gap-2 rounded-full bg-musgo px-7 py-4 text-papel-claro shadow-lg shadow-musgo/25 transition-colors hover:bg-musgo-escuro">
              Ver projetos <ArrowDown size={15} />
            </Magnetico>
            <Magnetico href="#simulador" className="rotulo rounded-full border border-tinta/40 px-7 py-4 transition-colors hover:bg-tinta hover:text-papel-claro">
              Simular licença
            </Magnetico>
          </div>
        </div>
      </div>
    </section>
  )
}
