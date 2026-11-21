import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ATIVIDADES, PORTES } from '../lib/data'
import { Titulo } from './Titulo'

export function Simulador() {
  const [atv, setAtv] = useState<(typeof ATIVIDADES)[number]['id']>('mineracao')
  const [porte, setPorte] = useState(1)
  const [sensivel, setSensivel] = useState(false)

  const r = useMemo(() => {
    const a = ATIVIDADES.find((x) => x.id === atv)!
    const meses = Math.round(a.base * (1 + porte * 0.45) * (sensivel ? 1.4 : 1))
    const licencas = porte === 0 && !sensivel ? ['LAS (simplificado)'] : ['LP', 'LI', 'LO']
    return { meses, licencas, estudo: porte === 0 && !sensivel ? 'RAS' : a.estudo, pct: Math.min(100, (meses / 36) * 100) }
  }, [atv, porte, sensivel])

  const chip = (ativo: boolean) => `rotulo cursor-pointer rounded-full border px-4 py-2.5 transition-colors ${ativo ? 'border-musgo bg-musgo text-papel-claro' : 'border-tinta/30 hover:border-tinta'}`

  return (
    <section id="simulador" className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <Titulo rotulo="Simulador">Quanto tempo leva a sua licença?</Titulo>
          <p className="mt-6 max-w-md leading-relaxed text-tinta/75">Responda três perguntas e veja o caminho típico. É uma estimativa ilustrativa: cada órgão e cada território têm as suas regras.</p>
        </div>
        <div className="rounded-[2rem] border border-tinta/15 bg-papel-claro/80 p-6 md:p-9">
          <fieldset className="mb-7"><legend className="rotulo mb-3 text-tinta/60">1 · Atividade</legend>
            <div className="flex flex-wrap gap-2">{ATIVIDADES.map((a) => <button key={a.id} onClick={() => setAtv(a.id)} className={chip(atv === a.id)} aria-pressed={atv === a.id}>{a.nome}</button>)}</div>
          </fieldset>
          <fieldset className="mb-7"><legend className="rotulo mb-3 text-tinta/60">2 · Porte</legend>
            <div className="flex gap-2">{PORTES.map((p, i) => <button key={p} onClick={() => setPorte(i)} className={chip(porte === i)} aria-pressed={porte === i}>{p}</button>)}</div>
          </fieldset>
          <fieldset className="mb-9"><legend className="rotulo mb-3 text-tinta/60">3 · Território</legend>
            <button onClick={() => setSensivel((s) => !s)} className={chip(sensivel)} aria-pressed={sensivel}>Perto de APP, unidade de conservação ou terra indígena</button>
          </fieldset>

          <div className="border-t border-tinta/15 pt-7">
            <div className="mb-3 flex items-end justify-between">
              <span className="rotulo text-tinta/60">Prazo típico até a licença</span>
              <span className="display text-5xl font-medium leading-none">{r.meses}<span className="rotulo ml-2 !text-sm">meses</span></span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-tinta/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-musgo to-ferrugem" animate={{ width: `${r.pct}%` }} transition={{ type: 'spring', stiffness: 90, damping: 18 }} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-live="polite">
              {[...r.licencas, r.estudo].map((t) => <span key={t} className="rotulo rounded-full bg-tinta px-3.5 py-1.5 text-papel-claro !text-[.65rem]">{t}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
