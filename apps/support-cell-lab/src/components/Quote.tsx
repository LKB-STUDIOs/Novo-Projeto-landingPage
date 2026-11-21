import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Info, MessageCircle, Receipt, Store, Truck } from 'lucide-react'
import { DEVICE_FAMILIES, REPAIRS, brl, repairPrice, waLink, type Brand, type PartId } from '../data'
import { usePainel } from '../usePainel'
import { REPAIR_ICONS } from './repairUi'

type Device = { name: string; tier: number; brand: Brand }
const STEPS = ['Selecionar aparelho', 'Selecionar reparo', 'Finalizar pedido']

export function Quote() {
  const [step, setStep] = useState(0)
  const [brand, setBrand] = useState<Brand>('apple')
  const [device, setDevice] = useState<Device | null>(null)
  const [repairs, setRepairs] = useState<PartId[]>([])
  const [mode, setMode] = useState<'delivery' | 'loja'>('delivery')
  const [form, setForm] = useState({ nome: '', bairro: '', obs: '' })
  const painel = usePainel()
  const visibleRepairs = REPAIRS.filter((r) => !painel.hidden.includes(r.id))

  // reparos enviados pelo Laboratório 3D
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<PartId>).detail
      setRepairs((r) => (r.includes(id) ? r : [...r, id]))
      setStep((s) => (device ? Math.max(s, 1) : 0))
    }
    window.addEventListener('supportcell:add-repair', on)
    return () => window.removeEventListener('supportcell:add-repair', on)
  }, [device])

  const items = useMemo(
    () =>
      device
        ? repairs
            .filter((id) => !painel.hidden.includes(id))
            .map((id) => ({ id, name: REPAIRS.find((r) => r.id === id)!.name, price: repairPrice(painel, device.name, device.tier, id) }))
        : [],
    [device, repairs, painel],
  )
  const subtotal = items.reduce((a, b) => a + b.price, 0)
  const pix = Math.round(subtotal * 0.05)

  const toggle = (id: PartId) => setRepairs((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]))

  const message = [
    `Olá, Support Cell Lab! Gostaria de agendar um reparo.`,
    ``,
    `Aparelho: ${device?.name}`,
    `Reparos: ${items.map((i) => `${i.name} (${brl(i.price)})`).join(', ')}`,
    `Total estimado: ${brl(subtotal)} (Pix: ${brl(subtotal - pix)})`,
    `Atendimento: ${mode === 'delivery' ? 'Delivery (busca e entrega)' : 'Levar na loja'}`,
    form.nome && `Nome: ${form.nome}`,
    form.bairro && `Bairro/cidade: ${form.bairro}`,
    form.obs && `Obs.: ${form.obs}`,
  ]
    .filter((l): l is string => typeof l === 'string' && l !== '')
    .join('\n')

  return (
    <section id="orcamento" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="eyebrow">
              <Receipt size={13} className="text-accent" /> Orçamento instantâneo
            </span>
            <h2 className="section-title mt-4">
              Preço na hora. <span className="text-fg/40">Sem surpresas.</span>
            </h2>
          </div>
          {/* progresso */}
          <ol className="flex gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <button
                  disabled={i > 0 && !device}
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition disabled:opacity-40 ${
                    i === step ? 'border-accent/60 bg-accent/10 text-fg' : i < step ? 'border-line text-fg/70' : 'border-line text-fg/40'
                  }`}
                >
                  <span className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${i < step ? 'bg-accent text-white' : 'bg-fg/10'}`}>
                    {i < step ? <Check size={11} /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="min-h-[520px] rounded-[2rem] border border-line bg-panel p-5 md:p-8">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-display text-2xl font-semibold text-fg">Selecione seu aparelho</h3>
                    <div className="flex rounded-full border border-line p-1">
                      {(['apple', 'samsung'] as Brand[]).map((b) => (
                        <button
                          key={b}
                          onClick={() => setBrand(b)}
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${brand === b ? 'bg-fg text-white' : 'text-fg/60'}`}
                        >
                          {b === 'apple' ? 'iPhone' : 'Samsung Galaxy S'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 space-y-6">
                    {DEVICE_FAMILIES.filter((f) => f.brand === brand).map((f) => (
                      <div key={f.name}>
                        <p className="mb-2 text-xs font-semibold tracking-wider text-fg/40 uppercase">{f.name}</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                          {f.models.map((mo) => {
                            const on = device?.name === mo.name
                            return (
                              <button
                                key={mo.name}
                                onClick={() => {
                                  setDevice({ ...mo, brand: f.brand })
                                  setStep(1)
                                }}
                                className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                                  on ? 'border-accent/60 bg-accent/10 text-fg' : 'border-line bg-fg/[0.02] text-fg/75 hover:border-fg/25 hover:text-fg'
                                }`}
                              >
                                {mo.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 1 && device && (
                <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <h3 className="font-display text-2xl font-semibold text-fg">O que precisa de reparo?</h3>
                  <p className="mt-1 text-sm text-fg/50">{device.name} · selecione um ou mais serviços</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {visibleRepairs.map((r) => {
                      const I = REPAIR_ICONS[r.id]
                      const on = repairs.includes(r.id)
                      return (
                        <button
                          key={r.id}
                          onClick={() => toggle(r.id)}
                          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${on ? 'border-accent/60 bg-accent/10' : 'border-line bg-fg/[0.02] hover:border-fg/25'}`}
                        >
                          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${on ? 'bg-accent text-white' : 'bg-fg/5 text-fg/70'}`}>
                            {on ? <Check size={18} /> : <I size={18} />}
                          </span>
                          <span className="flex-1">
                            <span className="flex justify-between gap-2">
                              <span className="text-sm font-semibold text-fg">{r.name}</span>
                              <span className="text-sm font-semibold text-fg">{brl(repairPrice(painel, device.name, device.tier, r.id))}</span>
                            </span>
                            <span className="mt-1 block text-xs text-fg/45">{r.desc}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button onClick={() => setStep(0)} className="btn-ghost">
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <button disabled={!repairs.length} onClick={() => setStep(2)} className="btn-primary disabled:opacity-40">
                      Continuar <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && device && (
                <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <h3 className="font-display text-2xl font-semibold text-fg">Finalizar pedido</h3>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ['delivery', Truck, 'Delivery', 'Buscamos e devolvemos no seu endereço.'],
                        ['loja', Store, 'Levar na loja', 'Atendimento com hora marcada.'],
                      ] as const
                    ).map(([id, I, t, d]) => (
                      <button
                        key={id}
                        onClick={() => setMode(id)}
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${mode === id ? 'border-accent/60 bg-accent/10' : 'border-line hover:border-fg/25'}`}
                      >
                        <I size={20} className={mode === id ? 'text-accent' : 'text-fg/50'} />
                        <span>
                          <span className="block text-sm font-semibold text-fg">{t}</span>
                          <span className="block text-xs text-fg/45">{d}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input className="field" placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                    <input className="field" placeholder="Bairro / cidade" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
                    <textarea
                      className="field min-h-24 sm:col-span-2"
                      placeholder="Conte o que aconteceu (opcional)"
                      value={form.obs}
                      onChange={(e) => setForm({ ...form, obs: e.target.value })}
                    />
                  </div>
                  {device.brand === 'apple' && (
                    <p className="mt-4 flex gap-2 rounded-xl border border-accent-2/20 bg-accent-2/5 p-3 text-xs text-fg/60">
                      <Info size={14} className="mt-0.5 shrink-0 text-accent-2" />
                      A substituição de componentes pode gerar um aviso de “peça desconhecida” nos Ajustes do iPhone. Isso é normal e não afeta o desempenho.
                    </p>
                  )}
                  <div className="mt-6 flex justify-between">
                    <button onClick={() => setStep(1)} className="btn-ghost">
                      <ArrowLeft size={16} /> Voltar
                    </button>
                    <a href={waLink(message)} target="_blank" rel="noreferrer" className="btn-primary">
                      <MessageCircle size={16} /> Enviar pelo WhatsApp
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* resumo */}
          <aside className="h-fit rounded-[2rem] border border-line bg-panel-2 p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-lg font-semibold text-fg">Resumo do pedido</h3>
            {!device ? (
              <div className="mt-6 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-fg/40">
                Nenhum aparelho selecionado.
                <br />
                Selecione um aparelho para começar.
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-between rounded-xl bg-fg/5 px-4 py-3">
                  <span className="text-sm text-fg">{device.name}</span>
                  <button onClick={() => setStep(0)} className="text-xs text-accent">
                    trocar
                  </button>
                </div>
                <ul className="mt-4 space-y-2">
                  {items.length === 0 && <li className="text-sm text-fg/40">Nenhum reparo selecionado.</li>}
                  {items.map((i) => (
                    <li key={i.id} className="flex justify-between text-sm">
                      <span className="text-fg/70">{i.name}</span>
                      <span className="text-fg">{brl(i.price)}</span>
                    </li>
                  ))}
                  {items.length > 0 && (
                    <li className="flex justify-between text-sm">
                      <span className="text-fg/70">{mode === 'delivery' ? 'Busca e entrega' : 'Atendimento na loja'}</span>
                      <span className="text-emerald-600">grátis</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
            <div className="mt-6 border-t border-line pt-4">
              <div className="flex items-end justify-between">
                <span className="text-sm text-fg/50">Total</span>
                <span className="font-display text-3xl font-semibold text-fg">{subtotal ? brl(subtotal) : '—'}</span>
              </div>
              {subtotal > 0 && (
                <p className="mt-1 text-right text-xs text-emerald-600">
                  {brl(subtotal - pix)} no Pix (5% off) · ou 10x sem juros
                </p>
              )}
            </div>
            <p className="mt-6 text-[11px] text-fg/30">Valores estimados. O preço final é confirmado após diagnóstico gratuito.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
