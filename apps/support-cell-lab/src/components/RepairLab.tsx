import * as THREE from 'three'
import { useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { AnimatePresence, motion } from 'motion/react'
import { Clock, Layers, MousePointerClick, Plus, RotateCcw, ShieldCheck, X } from 'lucide-react'
import { REPAIR_ICONS, addRepairToQuote } from './repairUi'
import { Stage3D } from '../three/Stage'
import { Phone } from '../three/Phone'
import { PRODUCTS, REPAIRS, SPECS, brl, priceFor, type PartId } from '../data'

const LAB_MODELS = {
  iphone: { label: 'iPhone 17 Pro', product: PRODUCTS.find((p) => p.id === 'ip17pro')!, tier: 10 },
  galaxy: { label: 'Galaxy S25 Ultra', product: PRODUCTS.find((p) => p.id === 's25ultra')!, tier: 11 },
}
type LabModel = keyof typeof LAB_MODELS

const LABELS = Object.fromEntries(REPAIRS.map((r) => [r.id, r.short])) as Record<PartId, string>

/** Gira o aparelho de lado conforme abre, para as camadas se espalharem na tela. */
function LabRig({ explode, children }: { explode: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    const g = ref.current
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.45 * explode, 3, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.12 * explode, 3, dt)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, 1 - 0.18 * explode, 3, dt))
  })
  return <group ref={ref}>{children}</group>
}

export function RepairLab() {
  const [model, setModel] = useState<LabModel>('iphone')
  const [active, setActive] = useState<PartId | null>(null)
  const [explode, setExplode] = useState(0)
  const m = LAB_MODELS[model]
  const repair = REPAIRS.find((r) => r.id === active)

  const select = (id: PartId) => {
    setActive((cur) => (cur === id ? null : id))
    if (explode < 0.6) setExplode(1)
  }

  return (
    <section id="laboratorio" className="relative overflow-hidden py-28">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="max-w-3xl">
          <span className="eyebrow">
            <Layers size={13} className="text-accent" /> Laboratório 3D
          </span>
          <h2 className="section-title mt-4">
            Abra o aparelho. <span className="text-fg/40">Sem chave de fenda.</span>
          </h2>
          <p className="mt-4 text-lg text-fg/60">
            Explore a vista explodida, toque em qualquer componente e veja exatamente o que será reparado, quanto tempo leva e quanto custa.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* lista de reparos */}
          <div className="order-2 flex flex-col gap-2 lg:order-1">
            {REPAIRS.map((r) => {
              const I = REPAIR_ICONS[r.id]
              const on = active === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => select(r.id)}
                  className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    on ? 'border-accent/50 bg-accent/10' : 'border-line bg-panel hover:border-fg/20'
                  }`}
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${on ? 'bg-accent text-white' : 'bg-fg/5 text-fg/70 group-hover:text-fg'}`}>
                    <I size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-fg">{r.name}</span>
                    <span className="block text-xs text-fg/40">
                      a partir de {brl(priceFor(3, r.base))} · {r.time}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* palco */}
          <div className="relative order-1 h-[600px] overflow-hidden rounded-[2rem] bg-panel md:h-[720px] lg:order-2">
            <Stage3D className="absolute inset-0 cursor-grab active:cursor-grabbing" camera={[12, 4, 14]} fov={30}>
              <LabRig explode={explode}>
                <Phone
                  spec={SPECS[m.product.spec]}
                  color={m.product.colors[0]}
                  explode={explode}
                  active={active}
                  hotspots={explode > 0.5}
                  onSelect={select}
                  labels={LABELS}
                  internals
                />
              </LabRig>
              <ContactShadows position={[0, -5.2, 0]} opacity={0.45} scale={18} blur={3} far={8} />
              <OrbitControls enablePan={false} enableZoom={false} autoRotate={!active} autoRotateSpeed={0.5} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.6} />
            </Stage3D>

            {/* controles */}
            <div className="absolute top-4 right-4 left-4 flex flex-wrap items-center justify-between gap-2">
              <div className="glass flex rounded-full p-1">
                {(Object.keys(LAB_MODELS) as LabModel[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setModel(k)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${model === k ? 'bg-fg text-white' : 'text-fg/60 hover:text-fg'}`}
                  >
                    {LAB_MODELS[k].label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setActive(null)
                  setExplode(0)
                }}
                className="glass flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-fg/70 hover:text-fg"
              >
                <RotateCcw size={13} /> Montar
              </button>
            </div>

            <div className="glass absolute bottom-4 left-4 flex w-[min(320px,calc(100%-2rem))] items-center gap-4 rounded-2xl px-4 py-3">
              <Layers size={16} className="shrink-0 text-accent" />
              <div className="flex-1">
                <div className="mb-2 flex justify-between text-[11px] text-fg/50">
                  <span>Vista explodida</span>
                  <span>{Math.round(explode * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={explode}
                  onChange={(e) => setExplode(+e.target.value)}
                  className="slider w-full"
                  style={{ ['--v' as string]: `${explode * 100}%` }}
                  aria-label="Vista explodida"
                />
              </div>
            </div>

            {explode < 0.5 && !active && (
              <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center">
                <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-fg/70">
                  <MousePointerClick size={14} className="text-accent" /> Clique em um componente ou arraste a vista explodida
                </span>
              </div>
            )}

            <AnimatePresence>
              {repair && (
                <motion.div
                  key={repair.id + model}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="glass absolute right-4 bottom-4 w-[min(340px,calc(100%-2rem))] rounded-3xl p-5 max-md:bottom-24"
                >
                  <button onClick={() => setActive(null)} className="absolute top-4 right-4 text-fg/40 hover:text-fg" aria-label="Fechar">
                    <X size={16} />
                  </button>
                  <p className="text-xs text-accent">{m.label}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-fg">{repair.name}</h3>
                  <p className="mt-2 text-sm text-fg/60">{repair.desc}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-fg/5 p-3">
                      <Clock size={14} className="mb-1 text-fg/50" />
                      <span className="text-fg">{repair.time}</span>
                    </div>
                    <div className="rounded-xl bg-fg/5 p-3">
                      <ShieldCheck size={14} className="mb-1 text-fg/50" />
                      <span className="text-fg">90 dias de garantia</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-fg/40">neste modelo</p>
                      <p className="font-display text-2xl font-semibold text-fg">{brl(priceFor(m.tier, repair.base))}</p>
                    </div>
                    <button onClick={() => addRepairToQuote(repair.id)} className="btn-primary px-4 py-2.5">
                      <Plus size={14} /> Orçar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
