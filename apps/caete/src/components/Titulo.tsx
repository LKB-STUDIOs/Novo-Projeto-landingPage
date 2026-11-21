import { useLayoutEffect, useRef } from 'react'
import { gsap, SplitText, reduzMovimento } from '../lib/scroll'

/** Título de seção: palavras sobem com máscara quando entram na tela. */
export function Titulo({ rotulo, children, className = '', claro = false }: { rotulo: string; children: string; className?: string; claro?: boolean }) {
  const h = useRef<HTMLHeadingElement>(null)
  useLayoutEffect(() => {
    if (reduzMovimento()) return
    const ctx = gsap.context(() => {
      SplitText.create(h.current!, {
        type: 'lines,words', mask: 'lines', autoSplit: true,
        onSplit: (s) => gsap.from(s.words, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: h.current, start: 'top 85%' } }),
      })
    })
    return () => ctx.revert()
  }, [])
  return (
    <div className={className}>
      <p className={`rotulo mb-4 flex items-center gap-3 ${claro ? 'text-[#d9a15e]' : 'text-musgo'}`}><span className={`h-px w-8 ${claro ? 'bg-[#d9a15e]' : 'bg-musgo'}`} />{rotulo}</p>
      <h2 ref={h} className="display text-[clamp(2.1rem,5vw,4.2rem)] font-medium leading-[1.02]">{children}</h2>
    </div>
  )
}
