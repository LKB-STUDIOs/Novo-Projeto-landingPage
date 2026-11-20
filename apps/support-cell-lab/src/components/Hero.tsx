import { ContactShadows, Float, OrbitControls } from '@react-three/drei'
import { motion } from 'motion/react'
import { ArrowRight, Rotate3d, ShieldCheck, Timer, Truck } from 'lucide-react'
import { Stage3D } from '../three/Stage'
import { DevicePhone } from '../three/DevicePhone'
import { PRODUCTS } from '../data'

const iphone = PRODUCTS[0]
const galaxy = PRODUCTS.find((p) => p.id === 's25ultra')!

function HeroScene() {
  return (
    <>
      <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.7}>
        <group position={[-1.6, 0, 0.6]} rotation={[0.04, 0.35, 0.03]}>
          <DevicePhone product={iphone} color={iphone.colors[0]} />
        </group>
      </Float>
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.6}>
        <group position={[1.8, 0, -1.2]} rotation={[0.04, Math.PI - 0.45, -0.03]}>
          <DevicePhone product={galaxy} color={galaxy.colors[0]} />
        </group>
      </Float>
      <ContactShadows position={[0, -4.4, 0]} opacity={0.35} scale={16} blur={2.8} far={6} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.7}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.75}
      />
    </>
  )
}

const up = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay: d, ease: [0.22, 1, 0.36, 1] as const },
})

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-panel pt-28 md:pt-32">
      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <motion.p {...up(0)} className="text-sm font-semibold tracking-wide text-accent md:text-base">
          Assistência premium · iPhone & Galaxy S
        </motion.p>
        <motion.h1 {...up(0.08)} className="mt-3 font-display text-5xl leading-[1.02] font-semibold tracking-[-0.03em] text-fg sm:text-7xl xl:text-[6rem]">
          Seu celular volta <span className="text-gradient">como novo.</span>
        </motion.h1>
        <motion.p {...up(0.16)} className="mx-auto mt-6 max-w-2xl text-lg text-fg/60 md:text-xl">
          Peças de alta qualidade, diagnóstico transparente e delivery: buscamos, consertamos e devolvemos onde você estiver.
        </motion.p>
        <motion.div {...up(0.24)} className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#orcamento" className="btn-primary">
            Orçamento instantâneo <ArrowRight size={16} />
          </a>
          <a href="#showroom" className="btn-ghost">
            <Rotate3d size={16} /> Explorar em 360°
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto h-[480px] max-w-6xl cursor-grab active:cursor-grabbing sm:h-[600px] lg:h-[72svh]"
      >
        <Stage3D className="absolute inset-0" camera={[0, 0.4, 20]} fov={30}>
          <HeroScene />
        </Stage3D>
        <div className="glass pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs text-fg/70">
          <Rotate3d size={14} className="text-accent" /> Arraste para girar 360°
        </div>
      </motion.div>

      <motion.dl {...up(0.32)} className="mx-auto grid max-w-3xl grid-cols-3 gap-4 px-4 pt-6 pb-16 text-center">
        {[
          [ShieldCheck, '90 dias', 'de garantia'],
          [Timer, '30 min', 'reparos expressos'],
          [Truck, 'Delivery', 'busca e entrega'],
        ].map(([Icon, a, b], i) => {
          const I = Icon as typeof ShieldCheck
          return (
            <div key={i} className="flex flex-col items-center">
              <I size={22} className="mb-3 text-accent" />
              <dt className="font-display text-2xl font-semibold text-fg">{a as string}</dt>
              <dd className="text-sm text-fg/50">{b as string}</dd>
            </div>
          )
        })}
      </motion.dl>
    </section>
  )
}

export function Marquee() {
  const items = ['Troca de tela', 'Bateria', 'Face ID', 'Vidro traseiro a laser', 'Microsoldagem', 'Câmeras', 'Conector de carga', 'iPhone 11 ao 17', 'Galaxy S24 & S25', 'Garantia de 90 dias']
  return (
    <div className="relative overflow-hidden border-y border-line py-5">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-xl text-fg/50">
            {t} <span className="size-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  )
}
