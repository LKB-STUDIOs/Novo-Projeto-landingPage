import { useLayoutEffect, useMemo, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { CASES, type Case } from '../lib/data'
import { gsap, reduzMovimento } from '../lib/scroll'
import { Titulo } from './Titulo'

/** Curvas de nível geradas por semente: cada projeto ganha um "mapa" próprio. */
function Mapa({ seed, cor }: { seed: number; cor: string }) {
  const aneis = useMemo(() => {
    let s = seed
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647
    const cx = 200 + r() * 200, cy = 160 + r() * 120
    return Array.from({ length: 16 }, (_, k) => {
      const raio = 14 + k * 17, pts = 36
      const d = Array.from({ length: pts }, (_, i) => {
        const a = (i / pts) * Math.PI * 2
        const ruido = 1 + 0.22 * Math.sin(a * 3 + seed + k * 0.35) + 0.12 * Math.cos(a * 5 + seed * 2 - k * 0.2)
        return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * raio * ruido * 1.35).toFixed(1)} ${(cy + Math.sin(a) * raio * ruido).toFixed(1)}`
      }).join('') + 'Z'
      return d
    })
  }, [seed])
  return (
    <svg viewBox="0 0 600 440" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="600" height="440" fill={cor} />
      {aneis.map((d, i) => <path key={i} d={d} fill="none" stroke="#f3ecdb" strokeOpacity={i % 4 === 0 ? 0.55 : 0.22} strokeWidth={i % 4 === 0 ? 1.8 : 1} />)}
      <circle cx="300" cy="220" r="5" fill="#d9a15e" /><circle cx="300" cy="220" r="14" fill="none" stroke="#d9a15e" strokeOpacity=".7" />
    </svg>
  )
}

function Cartao({ c, i }: { c: Case; i: number }) {
  return (
    <article className="caso sticky top-24 mb-10 origin-top will-change-transform md:top-28" style={{ zIndex: i }}>
      <div className="grid overflow-hidden rounded-[2rem] border border-tinta/15 bg-papel-claro shadow-[0_30px_60px_-30px_rgba(38,38,31,.4)] md:grid-cols-[1.05fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[26rem]">
          <div className="mapa absolute inset-0 scale-110"><Mapa seed={c.seed} cor={c.cor} /></div>
          <span className="rotulo absolute left-5 top-5 rounded-full bg-papel-claro/90 px-3 py-1.5 !text-[.65rem]">{c.setor}</span>
        </div>
        <div className="flex flex-col justify-between gap-8 p-7 md:p-10">
          <div>
            <p className="rotulo mb-5 flex items-center gap-2 text-tinta/55"><MapPin size={13} /> {c.cliente} · {c.ano}</p>
            <h3 className="display mb-4 text-3xl font-medium leading-tight md:text-4xl">{c.titulo}</h3>
            <p className="leading-relaxed text-tinta/75">{c.texto}</p>
          </div>
          <ul className="grid grid-cols-1 gap-2.5 border-t border-tinta/15 pt-6 sm:grid-cols-3">
            {c.resultado.map((r) => <li key={r} className="text-sm font-medium leading-snug"><span className="mb-1 block h-1 w-6 rounded bg-ferrugem" />{r}</li>)}
          </ul>
        </div>
      </div>
    </article>
  )
}

export function Cases() {
  const raiz = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (reduzMovimento()) return
    const ctx = gsap.context(() => {
      const el = gsap.utils.toArray<HTMLElement>('.caso')
      el.forEach((c, i) => {
        // mapa com parallax interno
        gsap.fromTo(c.querySelector('.mapa'), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } })
        const prox = el[i + 1]
        if (!prox) return
        // quando o próximo cartão chega, este recua e escurece
        gsap.to(c, { scale: 0.93, filter: 'brightness(.78)', ease: 'none', scrollTrigger: { trigger: prox, start: 'top 85%', end: 'top 15%', scrub: true } })
      })
    }, raiz)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={raiz} id="cases" className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-40">
      <Titulo rotulo="Projetos em destaque" className="mb-16 md:mb-24">Territórios que já saíram do papel.</Titulo>
      <div>{CASES.map((c, i) => <Cartao key={c.id} c={c} i={i} />)}</div>
    </section>
  )
}
