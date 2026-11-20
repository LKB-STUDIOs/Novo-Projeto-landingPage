import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CameraControls, CameraControlsImpl, ContactShadows } from '@react-three/drei'
import { AnimatePresence, motion } from 'motion/react'
import { Aperture, BatteryFull, Camera, Cpu, Eye, Minus, MonitorSmartphone, Pause, Play, Plus, Rotate3d, Smartphone } from 'lucide-react'
import { Stage3D } from '../three/Stage'
import { DevicePhone } from '../three/DevicePhone'
import { PRODUCTS, SPECS, brl, waLink, type Brand, type PhoneColor, type Product } from '../data'

type View = 'livre' | 'frente' | 'traseira' | 'lateral' | 'cameras'

const VIEWS: { id: Exclude<View, 'livre'>; label: string; icon: typeof Eye }[] = [
  { id: 'frente', label: 'Frente', icon: Smartphone },
  { id: 'traseira', label: 'Traseira', icon: MonitorSmartphone },
  { id: 'lateral', label: 'Lateral', icon: Eye },
  { id: 'cameras', label: 'Câmeras', icon: Aperture },
]

function ShowroomScene({
  product,
  color,
  auto,
  view,
  zoom,
  onUserMove,
}: {
  product: Product
  color: PhoneColor
  auto: boolean
  view: { v: View; n: number }
  zoom: { d: number; n: number }
  onUserMove: () => void
}) {
  const spec = SPECS[product.spec]
  const controls = useRef<CameraControlsImpl>(null)
  const turntable = useRef<THREE.Group>(null!)
  const boost = useRef(0)

  // giro de apresentação ao trocar de modelo
  useEffect(() => {
    boost.current = Math.PI * 2
  }, [product.id])

  useFrame((_, dt) => {
    const g = turntable.current
    if (auto) g.rotation.y += dt * 0.45
    else {
      const target = Math.round(g.rotation.y / (Math.PI * 2)) * Math.PI * 2
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, 4, dt)
    }
    if (boost.current > 0.001) {
      const step = boost.current * Math.min(1, dt * 2.5)
      g.rotation.y += step
      boost.current -= step
    }
  })

  useEffect(() => {
    const c = controls.current
    if (!c || view.v === 'livre') return
    const camX = spec.w / 2 - 0.8
    const camY = spec.h / 2 - 1
    if (view.v === 'frente') c.setLookAt(0, 0.5, 19, 0, 0, 0, true)
    if (view.v === 'traseira') c.setLookAt(0, 0.5, -19, 0, 0, 0, true)
    if (view.v === 'lateral') c.setLookAt(19, 0.5, 0.01, 0, 0, 0, true)
    if (view.v === 'cameras') c.setLookAt(camX + 2.2, camY + 1.2, -7, camX, camY, 0, true)
  }, [view, spec])

  useEffect(() => {
    if (zoom.n) controls.current?.dolly(zoom.d, true)
  }, [zoom])

  const baseY = -spec.h / 2
  return (
    <>
      <group ref={turntable}>
        <DevicePhone product={product} color={color} />
      </group>
      <group position={[0, baseY - 0.14, 0]}>
        <mesh>
          <cylinderGeometry args={[3.6, 3.8, 0.26, 96]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.15} roughness={0.18} clearcoat={1} />
        </mesh>
        <mesh position-y={0.135} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[3.2, 3.27, 128]} />
          <meshBasicMaterial color="#D72638" toneMapped={false} />
        </mesh>
        <mesh position-y={0.134} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.2, 2.22, 128]} />
          <meshBasicMaterial color="#7a0c17" transparent opacity={0.18} />
        </mesh>
      </group>
      <ContactShadows position={[0, baseY + 0.005, 0]} opacity={0.7} scale={8} blur={2} far={3} />
      <CameraControls
        ref={controls}
        minDistance={7}
        maxDistance={26}
        smoothTime={0.55}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.7}
        mouseButtons={{ left: CameraControlsImpl.ACTION.ROTATE, middle: CameraControlsImpl.ACTION.NONE, right: CameraControlsImpl.ACTION.NONE, wheel: CameraControlsImpl.ACTION.NONE }}
        touches={{ one: CameraControlsImpl.ACTION.TOUCH_ROTATE, two: CameraControlsImpl.ACTION.TOUCH_DOLLY, three: CameraControlsImpl.ACTION.NONE }}
        onStart={onUserMove}
      />
    </>
  )
}

export function Showroom() {
  const [brand, setBrand] = useState<Brand>('apple')
  const list = useMemo(() => PRODUCTS.filter((p) => p.brand === brand), [brand])
  const [pid, setPid] = useState(list[0].id)
  const product = PRODUCTS.find((p) => p.id === pid) ?? list[0]
  const [ci, setCi] = useState(0)
  const [si, setSi] = useState(0)
  const [auto, setAuto] = useState(true)
  const [view, setView] = useState<{ v: View; n: number }>({ v: 'livre', n: 0 })
  const [zoom, setZoom] = useState({ d: 0, n: 0 })

  const color = product.colors[Math.min(ci, product.colors.length - 1)]
  const storage = product.storage[Math.min(si, product.storage.length - 1)]

  const pick = (p: Product) => {
    setPid(p.id)
    setCi(0)
    setSi(0)
    setView({ v: 'frente', n: Date.now() })
  }
  const go = (v: View) => {
    setAuto(false)
    setView({ v, n: Date.now() })
  }

  return (
    <section id="showroom" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="eyebrow">
              <Rotate3d size={13} className="text-accent" /> Showroom 360°
            </span>
            <h2 className="section-title mt-4">
              Veja cada detalhe <br className="hidden md:block" />
              <span className="text-fg/40">antes de levar.</span>
            </h2>
          </div>
          <div className="glass flex rounded-full p-1">
            {(['apple', 'samsung'] as Brand[]).map((b) => (
              <button
                key={b}
                onClick={() => {
                  setBrand(b)
                  pick(PRODUCTS.find((p) => p.brand === b)!)
                }}
                className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition ${brand === b ? 'text-white' : 'text-fg/60 hover:text-fg'}`}
              >
                {brand === b && <motion.span layoutId="brandPill" className="absolute inset-0 rounded-full bg-fg" />}
                <span className="relative">{b === 'apple' ? 'iPhone' : 'Galaxy S'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {list.map((p) => (
            <button key={p.id} onClick={() => pick(p)} className={`chip shrink-0 ${p.id === product.id ? 'chip-on' : ''}`}>
              {p.name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* palco 3D */}
          <div className="relative h-[560px] overflow-hidden rounded-[2rem] bg-panel md:h-[680px]">
            <Stage3D className="absolute inset-0 cursor-grab active:cursor-grabbing" camera={[0, 0.5, 19]} fov={32}>
              <ShowroomScene
                product={product}
                color={color}
                auto={auto}
                view={view}
                zoom={zoom}
                onUserMove={() => {
                  setAuto(false)
                  setView((v) => ({ ...v, v: 'livre' }))
                }}
              />
            </Stage3D>

            <div className="pointer-events-none absolute top-5 left-5 flex gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.condition === 'Novo' ? 'bg-fg text-white' : 'bg-accent-2 text-white'}`}>
                {product.condition}
              </span>
              <span className="glass rounded-full px-3 py-1 text-xs text-fg/70">{color.name}</span>
            </div>

            <div className="absolute top-5 right-5 flex flex-col gap-2">
              <button onClick={() => setZoom({ d: 3, n: Date.now() })} className="glass grid size-10 place-items-center rounded-full hover:bg-fg/10" aria-label="Aproximar">
                <Plus size={16} />
              </button>
              <button onClick={() => setZoom({ d: -3, n: Date.now() })} className="glass grid size-10 place-items-center rounded-full hover:bg-fg/10" aria-label="Afastar">
                <Minus size={16} />
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
              <div className="glass flex max-w-full items-center gap-1 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none]">
                <button
                  onClick={() => setAuto((a) => !a)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${auto ? 'bg-accent text-white' : 'text-fg/70 hover:bg-fg/10'}`}
                >
                  {auto ? <Pause size={13} /> : <Play size={13} />} 360°
                </button>
                {VIEWS.map(({ id, label, icon: I }) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${view.v === id ? 'bg-fg text-white' : 'text-fg/70 hover:bg-fg/10'}`}
                  >
                    <I size={13} /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ficha técnica */}
          <div className="flex flex-col rounded-[2rem] border border-line bg-panel p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                <p className="text-sm text-fg/50">{product.brand === 'apple' ? 'Apple' : 'Samsung'}</p>
                <h3 className="mt-1 font-display text-3xl font-semibold text-fg md:text-4xl">{product.name}</h3>
                <p className="mt-2 text-fg/60">{product.tagline}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold tracking-wider text-fg/40 uppercase">Cor · {color.name}</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => setCi(i)}
                    aria-label={c.name}
                    title={c.name}
                    className={`size-9 rounded-full p-0.5 transition ${i === ci ? 'ring-2 ring-accent ring-offset-2 ring-offset-panel' : 'ring-1 ring-fg/15 hover:ring-fg/40'}`}
                  >
                    <span className="block size-full rounded-full" style={{ background: `linear-gradient(135deg, ${c.back}, ${c.frame})` }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold tracking-wider text-fg/40 uppercase">Armazenamento</p>
              <div className="flex flex-wrap gap-2">
                {product.storage.map((s, i) => (
                  <button key={s.label} onClick={() => setSi(i)} className={`chip ${i === si ? 'chip-on' : ''}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                [MonitorSmartphone, 'Tela', product.specs.tela],
                [Cpu, 'Chip', product.specs.chip],
                [Camera, 'Câmera', product.specs.camera],
                [BatteryFull, 'Bateria', product.specs.bateria],
              ].map(([Icon, k, v]) => {
                const I = Icon as typeof Cpu
                return (
                  <div key={k as string} className="rounded-2xl border border-line bg-fg/[0.02] p-4">
                    <I size={16} className="text-accent" />
                    <p className="mt-3 text-xs text-fg/40">{k as string}</p>
                    <p className="text-sm font-medium text-fg">{v as string}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-auto pt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-fg/40">à vista no Pix</p>
                  <motion.p key={storage.price} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-semibold text-fg">
                    {brl(storage.price, true)}
                  </motion.p>
                  <p className="text-xs text-fg/40">ou 12x de {brl(Math.ceil((storage.price * 1.08 * 100) / 12) / 100, true)}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a
                  className="btn-primary"
                  target="_blank"
                  rel="noreferrer"
                  href={waLink(`Olá! Tenho interesse no ${product.name} ${storage.label} (${color.name}) — ${product.condition}.`)}
                >
                  Reservar agora
                </a>
                <a className="btn-ghost" href="#orcamento">
                  Usar meu aparelho na troca
                </a>
              </div>
              <p className="mt-3 text-[11px] text-fg/30">Valores ilustrativos. Consulte disponibilidade.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
