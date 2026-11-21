import { useLayoutEffect, useRef } from 'react'
import { gsap, reduzMovimento } from '../lib/scroll'

const FRASES = [
  'Antes da primeira máquina, o território já foi lido.',
  'Cada rua, cada lago e cada área verde nasce de um estudo.',
  'Licença na mão, obra no prazo, mata em pé.',
]

/** Seção em tela cheia: a moldura do vídeo se expande com a rolagem e as frases trocam. */
export function Panorama() {
  const raiz = useRef<HTMLElement>(null)
  const palco = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useLayoutEffect(() => {
    if (reduzMovimento()) return
    const ctx = gsap.context(() => {
      const frases = gsap.utils.toArray<HTMLElement>('.frase')
      gsap.set(frases, { autoAlpha: 0, y: 40 })
      gsap.set(palco.current, { clipPath: 'inset(14% 9% 14% 9% round 36px)' })
      gsap.set(video.current, { scale: 1.25 })

      const tl = gsap.timeline({ scrollTrigger: { trigger: raiz.current, start: 'top top', end: '+=330%', pin: true, scrub: 0.7 } })
      tl.to(palco.current, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1, ease: 'power2.inOut' }, 0)
        .to(video.current, { scale: 1, duration: 3.2, ease: 'none' }, 0)
        .to('.pan-titulo', { autoAlpha: 0, y: -30, duration: 0.5 }, 0.9)
      frases.forEach((f, i) => {
        const t = 1.2 + i * 0.95
        tl.to(f, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t)
        if (i < frases.length - 1) tl.to(f, { autoAlpha: 0, y: -40, duration: 0.3, ease: 'power2.in' }, t + 0.6)
      })
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={raiz} className="relative h-screen overflow-hidden bg-papel" aria-label="Do estudo ao território">
      <div className="pan-titulo absolute inset-x-0 top-[6%] z-10 text-center">
        <p className="rotulo text-musgo">Do mapa ao chão</p>
      </div>
      <div ref={palco} className="absolute inset-0 overflow-hidden bg-musgo-escuro">
        <video ref={video} className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster="media/panorama-poster.jpg" aria-hidden>
          <source src="media/panorama.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-musgo-escuro/85 via-musgo-escuro/30 to-musgo-escuro/45" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
        {/* sem movimento: todas as frases ficam visíveis, uma sob a outra */}
        <div className="relative w-full max-w-5xl text-center motion-reduce:space-y-6">
          {FRASES.map((f) => (
            <p key={f} className="frase display text-[clamp(1.9rem,5.2vw,4.4rem)] font-medium leading-[1.05] text-papel-claro [text-shadow:0_2px_30px_rgba(0,0,0,.35)] motion-safe:absolute motion-safe:inset-x-0 motion-safe:top-1/2 motion-safe:-translate-y-1/2">
              {f}
            </p>
          ))}
        </div>
      </div>
      <p className="rotulo absolute bottom-5 left-5 z-10 text-papel/70 !text-[.62rem] md:left-8">Imagem ilustrativa · loteamento ao entardecer</p>
    </section>
  )
}
