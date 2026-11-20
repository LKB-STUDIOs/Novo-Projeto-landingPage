import * as THREE from 'three'
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import type { PartId, PhoneColor, PhoneSpec } from '../data'
import { BatteryPack, CameraModules, ChargePort, DisplayStack, FrontSensors, LogicBoard, MidFrame, SpeakerTaptic, WirelessCoil } from './Internals'

const ACCENT = new THREE.Color('#d72638')

// ---------- geometria ----------

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  r = Math.min(r, w / 2, h / 2)
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return s
}

/** Extrusão centrada em z=0, espessura total = depth + 2*bevel. */
function slab(shape: THREE.Shape, depth: number, bevel = 0) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 32,
  })
  g.translate(0, 0, -depth / 2)
  return g
}

/** ShapeGeometry com UV normalizado 0..1 para receber textura. */
function flat(shape: THREE.Shape, w: number, h: number) {
  const g = new THREE.ShapeGeometry(shape, 32)
  const p = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5)
  return g
}

function useScreenTexture(brand: PhoneSpec['brand']) {
  return useMemo(() => {
    const W = 640
    const H = 1320
    const cv = document.createElement('canvas')
    cv.width = W
    cv.height = H
    const g = cv.getContext('2d')!
    const bg = g.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#14060a')
    bg.addColorStop(1, '#070204')
    g.fillStyle = bg
    g.fillRect(0, 0, W, H)
    const blobs =
      brand === 'apple'
        ? [['#ff0400', 120, 980, 460], ['#7a0c17', 560, 760, 420], ['#ff7673', 300, 1250, 380]]
        : [['#d72638', 520, 1000, 480], ['#ff3936', 80, 820, 380], ['#7a0c17', 360, 1280, 400]]
    for (const [col, x, y, r] of blobs as [string, number, number, number][]) {
      const rg = g.createRadialGradient(x, y, 0, x, y, r)
      rg.addColorStop(0, col)
      rg.addColorStop(1, 'transparent')
      g.globalAlpha = 0.85
      g.fillStyle = rg
      g.fillRect(0, 0, W, H)
    }
    g.globalAlpha = 1
    g.strokeStyle = 'rgba(255,255,255,0.14)'
    g.lineWidth = 2
    for (let i = 0; i < 4; i++) {
      g.beginPath()
      g.ellipse(W / 2, 900, 160 + i * 70, 60 + i * 26, -0.35, 0, Math.PI * 2)
      g.stroke()
    }
    g.fillStyle = '#ffffff'
    g.textAlign = 'center'
    g.font = '500 30px "Inter Variable", system-ui, sans-serif'
    g.globalAlpha = 0.8
    g.fillText('sexta-feira, 20 de novembro', W / 2, 190)
    g.globalAlpha = 1
    g.font = '600 180px "Space Grotesk Variable", system-ui, sans-serif'
    g.fillText('10:24', W / 2, 360)
    g.font = '600 24px "Space Grotesk Variable", system-ui, sans-serif'
    g.globalAlpha = 0.6
    g.fillText('S U P P O R T   C E L L   L A B', W / 2, H - 90)
    const t = new THREE.CanvasTexture(cv)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [brand])
}

// ---------- partes interativas ----------

type Ctx = {
  explode: { current: number }
  /** ref estável: o loop de animação lê a seleção atual mesmo sem re-render das peças */
  activeRef: { current: PartId | null }
  active: PartId | null
  hotspots: boolean
  onSelect?: (id: PartId) => void
  labels?: Partial<Record<PartId, string>>
}
const PhoneCtx = createContext<Ctx>(null!)

type V3 = [number, number, number]
const SHOWN = { visibility: 'visible' } as const
const HIDDEN = { visibility: 'hidden' } as const

function Part({ id, offset, anchor, children }: { id: PartId; offset: V3; anchor?: V3; children: ReactNode }) {
  const { explode, activeRef, active, hotspots, onSelect, labels } = useContext(PhoneCtx)
  const ref = useRef<THREE.Group>(null!)
  const [hover, setHover] = useState(false)

  useFrame((state) => {
    const e = explode.current
    ref.current.position.set(offset[0] * e, offset[1] * e, offset[2] * e)
    const cur = activeRef.current
    const isActive = cur === id
    const dim = cur !== null && !isActive
    const glow = isActive ? 0.35 + Math.sin(state.clock.elapsedTime * 4) * 0.15 : hover && onSelect ? 0.18 : 0
    ref.current.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const m = mesh.material as THREE.MeshStandardMaterial
      if (!m.userData.base) {
        m.userData.base = { emissive: m.emissive ? m.emissive.clone() : null, opacity: m.opacity }
        m.transparent = true
        m.needsUpdate = true
      }
      const b = m.userData.base as { emissive: THREE.Color | null; opacity: number }
      m.opacity = THREE.MathUtils.lerp(m.opacity, dim ? 0.1 : b.opacity, 0.12)
      m.depthWrite = m.opacity > 0.9
      if (b.emissive) m.emissive.copy(b.emissive).lerp(ACCENT, glow)
    })
  })

  const interactive = !!onSelect
  return (
    <group
      ref={ref}
      onClick={interactive ? (ev) => (ev.stopPropagation(), onSelect!(id)) : undefined}
      onPointerOver={
        interactive
          ? (ev) => {
              ev.stopPropagation()
              setHover(true)
              document.body.style.cursor = 'pointer'
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              setHover(false)
              document.body.style.cursor = ''
            }
          : undefined
      }
    >
      {children}
      {/* mantém o Html montado e só esconde: desmontar raízes do Html durante o render gera avisos no React */}
      {interactive && anchor && (
        <Html position={anchor} center zIndexRange={[40, 0]} style={hotspots ? SHOWN : HIDDEN}>
          <button
            type="button"
            onClick={() => onSelect?.(id)}
            className={`hotspot ${active === id ? 'is-active' : ''}`}
            aria-label={labels?.[id]}
          >
            <span className="hotspot-dot" />
            <span className="hotspot-label">{labels?.[id]}</span>
          </button>
        </Html>
      )}
    </group>
  )
}

function Lens({ x, y, z, r = 0.28, ring }: { x: number; y: number; z: number; r?: number; ring: string }) {
  // grupo girado para que +Y aponte para fora da traseira (-Z)
  return (
    <group position={[x, y, z]} rotation-x={-Math.PI / 2}>
      <mesh>
        <cylinderGeometry args={[r, r, 0.1, 48]} />
        <meshPhysicalMaterial color={ring} metalness={1} roughness={0.22} />
      </mesh>
      <mesh position-y={0.012}>
        <cylinderGeometry args={[r * 0.8, r * 0.8, 0.1, 48]} />
        <meshPhysicalMaterial color="#040507" roughness={0.04} metalness={0.3} clearcoat={1} />
      </mesh>
      <mesh position-y={0.064} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[r * 0.4, 32]} />
        <meshPhysicalMaterial color="#0b1630" emissive="#1c3370" emissiveIntensity={0.5} roughness={0} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Dot({ x, y, z, r, color, emissive = '#000000' }: { x: number; y: number; z: number; r: number; color: string; emissive?: string }) {
  return (
    <mesh position={[x, y, z]} rotation-x={-Math.PI / 2}>
      <cylinderGeometry args={[r, r, 0.04, 32]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.3} />
    </mesh>
  )
}

// ---------- telefone ----------

export type PhoneProps = {
  spec: PhoneSpec
  color: PhoneColor
  explode?: number
  active?: PartId | null
  hotspots?: boolean
  onSelect?: (id: PartId) => void
  labels?: Partial<Record<PartId, string>>
  /** renderiza os componentes internos detalhados (só no Laboratório 3D) */
  internals?: boolean
}

export function Phone({ spec, color, explode = 0, active = null, hotspots = false, onSelect, labels, internals = false }: PhoneProps) {
  const { w, h, d, r, brand } = spec
  const e = useRef(explode)
  const activeRef = useRef(active)
  activeRef.current = active
  useFrame((_, dt) => {
    e.current = THREE.MathUtils.damp(e.current, explode, 3.2, dt)
  })

  const geo = useMemo(() => {
    const b = 0.035
    const frameShape = roundedRect(w - 2 * b, h - 2 * b, r - b)
    frameShape.holes.push(roundedRect(w - 0.16, h - 0.16, r - 0.08))
    const sw = w - 0.2
    const sh = h - 0.2
    return {
      frame: slab(frameShape, d - 2 * b, b),
      glass: slab(roundedRect(w - 0.07, h - 0.07, r - 0.035), 0.03, 0.012),
      screen: flat(roundedRect(sw, sh, Math.max(r - 0.1, 0.06)), sw, sh),
      island:
        brand === 'apple' ? new THREE.ShapeGeometry(roundedRect(0.92, 0.27, 0.135), 16) : new THREE.CircleGeometry(0.085, 32),
      plateau:
        spec.camera === 'bar'
          ? slab(roundedRect(w - 0.16, 1.9, 0.52), 0.05, 0.02)
          : spec.camera === 'pro'
          ? slab(roundedRect(1.62, 1.62, 0.42), 0.05, 0.02)
          : spec.camera === 'dual'
            ? slab(roundedRect(1.2, 1.2, 0.36), 0.04, 0.02)
            : spec.camera === 'air'
              ? slab(roundedRect(w - 0.32, 0.92, 0.46), 0.05, 0.02)
              : null,
    }
  }, [w, h, d, r, brand, spec.camera])

  const tex = useScreenTexture(brand)
  const frontZ = d / 2 + 0.019
  const backZ = -d / 2 - 0.017
  // canto superior esquerdo visto pela traseira = +x
  const cx = spec.camera === 'air' ? 0 : brand === 'apple' ? w / 2 - (spec.camera === 'pro' || spec.camera === 'bar' ? 0.98 : 0.78) : w / 2 - 0.62
  const cy = brand === 'apple' ? h / 2 - (spec.camera === 'air' ? 0.66 : spec.camera === 'bar' ? 1.05 : spec.camera === 'pro' ? 0.98 : 0.78) : h / 2 - 0.72
  const plateauZ = backZ - 0.03
  const lensZ = brand === 'apple' ? backZ - 0.11 : backZ - 0.03

  const lenses: { x: number; y: number; r?: number }[] = (() => {
    switch (spec.camera) {
      case 'bar':
      case 'pro':
        return [{ x: cx + 0.38, y: cy + 0.38 }, { x: cx + 0.38, y: cy - 0.38 }, { x: cx - 0.36, y: cy }]
      case 'dual':
        return [{ x: cx + 0.24, y: cy + 0.24, r: 0.22 }, { x: cx - 0.24, y: cy - 0.24, r: 0.22 }]
      case 'air':
        return [{ x: w / 2 - 0.75, y: cy }]
      case 'galaxy2':
        return [0, 1].map((i) => ({ x: cx, y: cy - i * 0.82, r: 0.32 }))
      case 'galaxy3':
        return [0, 1, 2].map((i) => ({ x: cx, y: cy - i * 0.74, r: 0.29 }))
      case 'galaxyUltra':
        return [...[0, 1, 2].map((i) => ({ x: cx, y: cy - i * 0.8, r: 0.32 })), { x: cx - 0.72, y: cy - 0.4, r: 0.26 }]
    }
  })()

  const flash =
    spec.camera === 'bar'
      ? { x: -w / 2 + 0.62, y: cy + 0.38 }
      : spec.camera === 'pro'
      ? { x: cx - 0.36, y: cy + 0.5 }
      : spec.camera === 'dual'
        ? { x: cx - 0.3, y: cy + 0.3 }
        : spec.camera === 'air'
          ? { x: w / 2 - 1.35, y: cy }
          : spec.camera === 'galaxyUltra'
            ? { x: cx - 0.72, y: cy - 1.15 }
            : { x: cx - 0.55, y: cy }

  const buttons: { side: 1 | -1; y: number; len: number; color?: string }[] =
    brand === 'apple'
      ? [
          { side: -1, y: h * 0.28, len: 0.34 },
          { side: -1, y: h * 0.18, len: 0.58 },
          { side: -1, y: h * 0.08, len: 0.58 },
          { side: 1, y: h * 0.18, len: 0.95 },
          { side: 1, y: -h * 0.12, len: 0.55, color: '#1a1b20' },
        ]
      : [
          { side: 1, y: h * 0.25, len: 1.1 },
          { side: 1, y: h * 0.1, len: 0.5 },
        ]

  return (
    <PhoneCtx.Provider value={{ explode: e, activeRef, active, hotspots, onSelect, labels }}>
      <group>
        {/* Tela + vidro frontal */}
        <Part id="tela" offset={[0, 0, 2.4]} anchor={[-w / 2 + 0.5, 0.6, frontZ + 0.02]}>
          <mesh geometry={geo.glass} position-z={d / 2 - 0.01}>
            <meshPhysicalMaterial color="#030304" roughness={0.08} clearcoat={1} metalness={0.2} />
          </mesh>
          <mesh geometry={geo.screen} position-z={frontZ}>
            <meshPhysicalMaterial color="#000000" emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1} roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh geometry={geo.island} position={[0, h / 2 - (brand === 'apple' ? 0.38 : 0.3), frontZ + 0.002]}>
            <meshStandardMaterial color="#000000" roughness={0.3} />
          </mesh>
          {internals && <DisplayStack w={w} h={h} d={d} />}
        </Part>

        {/* Módulo frontal / Face ID */}
        <Part id="frontal" offset={[0, 0.35, 1.5]} anchor={[0.65, h / 2 - 0.38, 0.12]}>
          {internals ? (
            <FrontSensors h={h} brand={brand} />
          ) : (
            <RoundedBox args={[1.1, 0.3, 0.1]} radius={0.04} position={[0, h / 2 - 0.38, 0.08]}>
              <meshStandardMaterial color="#121318" metalness={0.5} roughness={0.4} />
            </RoundedBox>
          )}
        </Part>

        {/* Placa lógica */}
        <Part id="placa" offset={[0, 0.45, 0.85]} anchor={[-0.6, h / 2 - 1.6, 0.12]}>
          {internals ? (
            <LogicBoard w={w} h={h} brand={brand} />
          ) : (
            <RoundedBox args={[w - 0.55, 1.9, 0.05]} radius={0.02} position={[0, h / 2 - 1.55, 0.06]}>
              <meshStandardMaterial color="#0d3b2c" roughness={0.6} metalness={0.2} />
            </RoundedBox>
          )}
        </Part>

        {/* Conector de carga + flex */}
        <Part id="conector" offset={[0, -0.7, 0.85]} anchor={[0.45, -h / 2 + 0.2, 0.12]}>
          {internals ? (
            <ChargePort w={w} h={h} />
          ) : (
            <RoundedBox args={[0.7, 0.2, 0.12]} radius={0.04} position={[0, -h / 2 + 0.2, 0]}>
              <meshStandardMaterial color="#9aa0a8" metalness={1} roughness={0.3} />
            </RoundedBox>
          )}
        </Part>

        {/* Alto-falante */}
        <Part id="altofalante" offset={[-0.3, -0.5, 0.85]} anchor={[-w / 2 + 0.55, -h / 2 + 0.45, 0.12]}>
          {internals ? (
            <SpeakerTaptic w={w} h={h} />
          ) : (
            <RoundedBox args={[1.0, 0.34, 0.16]} radius={0.05} position={[-w / 2 + 0.9, -h / 2 + 0.45, 0]}>
              <meshStandardMaterial color="#17181d" metalness={0.4} roughness={0.5} />
            </RoundedBox>
          )}
        </Part>

        {/* Carcaça / botões */}
        <Part id="carcaca" offset={[0, 0, 0]} anchor={[w / 2 + 0.06, h * 0.18, 0]}>
          <mesh geometry={geo.frame}>
            <meshPhysicalMaterial color={color.frame} metalness={1} roughness={0.28} clearcoat={0.4} />
          </mesh>
          {buttons.map((b, i) => (
            <RoundedBox key={i} args={[0.06, b.len, d * 0.42]} radius={0.025} position={[b.side * (w / 2 + 0.005), b.y, 0]}>
              <meshPhysicalMaterial color={b.color ?? color.frame} metalness={b.color ? 0.2 : 1} roughness={0.25} />
            </RoundedBox>
          ))}
          {internals && <MidFrame w={w} h={h} d={d} brand={brand} />}
        </Part>

        {/* Bateria */}
        <Part id="bateria" offset={[0, 0, -1.0]} anchor={[0, -0.7, -0.12]}>
          {internals ? (
            <BatteryPack w={w} h={h} />
          ) : (
            <RoundedBox args={[w - 1.0, h * 0.44, 0.14]} radius={0.05} position={[0, -0.7, -0.03]}>
              <meshStandardMaterial color="#24262c" metalness={0.35} roughness={0.45} />
            </RoundedBox>
          )}
        </Part>

        {/* Câmeras traseiras */}
        <Part id="camera" offset={[0, 0.25, -1.8]} anchor={[cx - 0.5, cy - 0.55, lensZ - 0.1]}>
          {geo.plateau && (
            <mesh geometry={geo.plateau} position={[spec.camera === 'air' || spec.camera === 'bar' ? 0 : cx, cy, plateauZ]}>
              <meshPhysicalMaterial color={color.back} roughness={0.12} clearcoat={1} metalness={0.15} />
            </mesh>
          )}
          {lenses.map((l, i) => (
            <Lens key={i} x={l.x} y={l.y} z={lensZ} r={l.r} ring={color.frame} />
          ))}
          <Dot x={flash.x} y={flash.y} z={lensZ + 0.02} r={0.1} color="#f3efe6" emissive="#fff3d6" />
          {spec.camera === 'pro' && <Dot x={cx + 0.38 - 0.76} y={cy - 0.5} z={lensZ + 0.02} r={0.09} color="#08090b" />}
          {spec.camera === 'bar' && <Dot x={-w / 2 + 0.62} y={cy - 0.3} z={lensZ + 0.02} r={0.09} color="#08090b" />}
          {internals && <CameraModules lenses={lenses} />}
        </Part>

        {/* Vidro traseiro */}
        <Part id="traseira" offset={[0, 0, -2.7]} anchor={[-0.4, -1.6, backZ - 0.05]}>
          <mesh geometry={geo.glass} position-z={-(d / 2 - 0.01)}>
            <meshPhysicalMaterial color={color.back} roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.3} metalness={0.1} />
          </mesh>
          {internals && <WirelessCoil d={d} brand={brand} />}
        </Part>
      </group>
    </PhoneCtx.Provider>
  )
}
