import { useRef } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { SERVICOS } from '../lib/data'
import { Titulo } from './Titulo'

/** Cartão com "lanterna" que segue o cursor (padrão spotlight card). */
function Cartao({ s, i }: { s: (typeof SERVICOS)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    ref.current!.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current!.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-tinta/15 bg-papel-claro/70 p-8 transition-transform duration-500 hover:-translate-y-1.5"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(380px circle at var(--mx) var(--my), rgba(63,91,58,.22), transparent 65%)' }} />
      <div className="relative">
        <div className="mb-10 flex items-start justify-between">
          <span className="rotulo text-ferrugem">{s.n}</span>
          <ArrowUpRight className="text-tinta/40 transition-all duration-300 group-hover:rotate-12 group-hover:text-musgo" />
        </div>
        <h3 className="display mb-3 text-3xl font-medium">{s.titulo}</h3>
        <p className="mb-7 leading-relaxed text-tinta/75">{s.texto}</p>
        <ul className="flex flex-wrap gap-2">
          {s.tags.map((t) => <li key={t} className="rotulo rounded-full border border-tinta/25 px-3 py-1 !text-[.62rem]">{t}</li>)}
        </ul>
      </div>
    </motion.div>
  )
}

export function Servicos() {
  return (
    <section id="servicos" className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-40">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.5fr)] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <Titulo rotulo="O que fazemos">Do estudo à licença, e além dela.</Titulo>
          <p className="mt-6 max-w-md leading-relaxed text-tinta/75">
            Uma equipe só cuida do diagnóstico, do protocolo e das condicionantes. Menos troca de mãos, menos retrabalho, menos risco de a obra parar.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {SERVICOS.map((s, i) => <Cartao key={s.n} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}
