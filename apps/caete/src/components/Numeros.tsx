import { useEffect, useRef } from 'react'
import { animate, useInView } from 'motion/react'
import { NUMEROS } from '../lib/data'

function Contador({ valor, sufixo }: { valor: number; sufixo: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visto = useInView(ref, { once: true, margin: '-80px' })
  useEffect(() => {
    if (!visto || !ref.current) return
    const c = animate(0, valor, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) + sufixo } })
    return () => c.stop()
  }, [visto, valor, sufixo])
  return <span ref={ref}>0{sufixo}</span>
}

export function Numeros() {
  return (
    <section className="bg-kraft/60 py-20 md:py-28">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-14 px-5 md:grid-cols-4 md:px-8">
        {NUMEROS.map((n) => (
          <div key={n.rotulo} className="border-t-2 border-tinta pt-5">
            <dt className="display text-[clamp(2.4rem,5vw,4.6rem)] font-medium leading-none"><Contador valor={n.valor} sufixo={n.sufixo} /></dt>
            <dd className="rotulo mt-4 text-tinta/70">{n.rotulo}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
