import * as THREE from 'three'
import { useLayoutEffect, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import type { Brand } from '../data'

/** Componentes internos detalhados usados na vista explodida do Laboratório 3D. */

// ---------- utilidades ----------

function rng(seed: number) {
  let s = seed % 2147483647 || 1
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const texCache = new Map<string, THREE.CanvasTexture>()
function canvasTexture(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  let t = texCache.get(key)
  if (!t) {
    const cv = document.createElement('canvas')
    cv.width = w
    cv.height = h
    draw(cv.getContext('2d')!)
    t = new THREE.CanvasTexture(cv)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    texCache.set(key, t)
  }
  return t
}

const pcbTexture = () =>
  canvasTexture('pcb', 1024, 640, (g) => {
    const r = rng(7)
    g.fillStyle = '#0a2a1f'
    g.fillRect(0, 0, 1024, 640)
    // trilhas com curvas de 45°
    g.lineCap = 'round'
    for (let i = 0; i < 220; i++) {
      g.strokeStyle = r() > 0.25 ? 'rgba(201,162,74,0.55)' : 'rgba(90,170,120,0.45)'
      g.lineWidth = 1 + r() * 2.5
      let x = r() * 1024
      let y = r() * 640
      g.beginPath()
      g.moveTo(x, y)
      for (let k = 0; k < 4; k++) {
        const len = 20 + r() * 120
        const dir = Math.floor(r() * 8) * (Math.PI / 4)
        x += Math.cos(dir) * len
        y += Math.sin(dir) * len
        g.lineTo(x, y)
      }
      g.stroke()
    }
    // vias
    for (let i = 0; i < 600; i++) {
      g.fillStyle = r() > 0.5 ? '#c9a24a' : '#d9c48a'
      g.beginPath()
      g.arc(r() * 1024, r() * 640, 1.5 + r() * 2.5, 0, Math.PI * 2)
      g.fill()
    }
    // pads e serigrafia
    g.strokeStyle = 'rgba(255,255,255,0.5)'
    g.lineWidth = 1.5
    for (let i = 0; i < 40; i++) g.strokeRect(r() * 1000, r() * 620, 14 + r() * 40, 10 + r() * 30)
    g.fillStyle = 'rgba(255,255,255,0.65)'
    g.font = '600 18px monospace'
    for (let i = 0; i < 18; i++) g.fillText(['C', 'R', 'U', 'L', 'J', 'FL'][Math.floor(r() * 6)] + Math.floor(r() * 900 + 100), r() * 980, r() * 620)
  })

const batteryTexture = () =>
  canvasTexture('battery', 768, 1024, (g) => {
    g.fillStyle = '#16171b'
    g.fillRect(0, 0, 768, 1024)
    g.fillStyle = '#e9e9ec'
    g.font = '700 54px system-ui, sans-serif'
    g.fillText('Li-ion Polymer', 60, 160)
    g.font = '500 34px system-ui, sans-serif'
    g.fillText('Rechargeable Battery', 60, 215)
    g.fillText('3.87 V ⎓ 4685 mAh · 18.13 Wh', 60, 300)
    g.globalAlpha = 0.7
    g.font = '400 24px system-ui, sans-serif'
    const lines = ['Não perfure, aqueça ou desmonte.', 'Do not puncture or incinerate.', 'Somente técnicos qualificados.', 'Serviced by Support Cell Lab']
    lines.forEach((l, i) => g.fillText(l, 60, 400 + i * 40))
    g.globalAlpha = 1
    // ícones de aviso
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = '#e9e9ec'
      g.lineWidth = 4
      g.strokeRect(60 + i * 110, 620, 80, 80)
      g.beginPath()
      g.moveTo(70 + i * 110, 690)
      g.lineTo(130 + i * 110, 630)
      g.stroke()
    }
    // código de barras
    for (let x = 60; x < 700; x += 6) {
      g.fillStyle = Math.sin(x * 12.9898) > 0 ? '#e9e9ec' : '#16171b'
      g.fillRect(x, 820, 4, 110)
    }
  })

const grilleTexture = () =>
  canvasTexture('grille', 256, 96, (g) => {
    g.fillStyle = '#222328'
    g.fillRect(0, 0, 256, 96)
    g.fillStyle = '#0a0a0c'
    for (let y = 10; y < 96; y += 12) for (let x = 10 + ((y / 12) % 2) * 6; x < 256; x += 12) g.beginPath(), g.arc(x, y, 3.2, 0, Math.PI * 2), g.fill()
  })

function Screw({ x, y, z, r = 0.045 }: { x: number; y: number; z: number; r?: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[r, r, 0.03, 20]} />
        <meshStandardMaterial color="#c7cbd2" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position-z={0.016}>
        <boxGeometry args={[r * 1.2, r * 0.3, 0.004]} />
        <meshStandardMaterial color="#3a3c42" />
      </mesh>
      <mesh position-z={0.016} rotation-z={Math.PI / 2}>
        <boxGeometry args={[r * 1.2, r * 0.3, 0.004]} />
        <meshStandardMaterial color="#3a3c42" />
      </mesh>
    </group>
  )
}

function Flex({ from, to, z, width = 0.18, color = '#c8792c' }: { from: [number, number]; to: [number, number]; z: number; width?: number; color?: string }) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy)
  return (
    <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, z]} rotation-z={Math.atan2(dy, dx)}>
      <boxGeometry args={[len, width, 0.008]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
    </mesh>
  )
}

/** Conector board-to-board (dourado com fileiras de pinos). */
function B2B({ x, y, z, len = 0.36, rot = 0 }: { x: number; y: number; z: number; len?: number; rot?: number }) {
  return (
    <group position={[x, y, z]} rotation-z={rot}>
      <mesh>
        <boxGeometry args={[len, 0.1, 0.03]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.5} />
      </mesh>
      {[-0.025, 0.025].map((oy) => (
        <mesh key={oy} position={[0, oy, 0.017]}>
          <boxGeometry args={[len * 0.9, 0.012, 0.004]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

/** Centenas de capacitores/resistores minúsculos em um único draw call. */
function SMD({ count, area, z, seed }: { count: number; area: [number, number, number, number]; z: number; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const r = rng(seed)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const c = new THREE.Color()
    const palette = ['#1b1b1f', '#8a6a3a', '#c9b48a', '#d9d9de', '#2c2c33']
    const [x0, y0, x1, y1] = area
    for (let i = 0; i < count; i++) {
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), r() > 0.5 ? 0 : Math.PI / 2)
      m.compose(new THREE.Vector3(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), z), q, new THREE.Vector3(0.03 + r() * 0.05, 0.016 + r() * 0.025, 0.018))
      ref.current.setMatrixAt(i, m)
      ref.current.setColorAt(i, c.set(palette[Math.floor(r() * palette.length)]))
    }
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [count, area, z, seed])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry />
      <meshStandardMaterial metalness={0.5} roughness={0.45} />
    </instancedMesh>
  )
}

function Chip({ x, y, z, sx, sy, kind = 'ic' }: { x: number; y: number; z: number; sx: number; sy: number; kind?: 'ic' | 'shield' | 'soc' }) {
  if (kind === 'shield')
    return (
      <RoundedBox args={[sx, sy, 0.06]} radius={0.012} position={[x, y, z + 0.03]}>
        <meshPhysicalMaterial color="#c3c7cf" metalness={1} roughness={0.32} clearcoat={0.3} />
      </RoundedBox>
    )
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[sx, sy, 0.045]} radius={0.008} position-z={0.022}>
        <meshStandardMaterial color="#17181c" roughness={0.35} metalness={0.2} />
      </RoundedBox>
      {kind === 'soc' && (
        <RoundedBox args={[sx * 0.82, sy * 0.82, 0.02]} radius={0.01} position-z={0.052}>
          <meshPhysicalMaterial color="#d8dbe0" metalness={1} roughness={0.18} clearcoat={0.6} />
        </RoundedBox>
      )}
    </group>
  )
}

// ---------- módulos ----------

export function LogicBoard({ w, h, brand }: { w: number; h: number; brand: Brand }) {
  const bw = w - 0.5
  const bh = 2.05
  const cy = h / 2 - 1.62
  const z = 0.05
  const top = z + 0.025
  return (
    <group>
      {/* placa inferior */}
      <RoundedBox args={[bw, bh, 0.04]} radius={0.02} position={[0, cy, z]}>
        <meshStandardMaterial color="#0a2a1f" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, cy, top + 0.001]}>
        <planeGeometry args={[bw - 0.04, bh - 0.04]} />
        <meshStandardMaterial map={pcbTexture()} roughness={0.55} metalness={0.15} />
      </mesh>
      <SMD count={320} area={[-bw / 2 + 0.08, cy - bh / 2 + 0.08, bw / 2 - 0.08, cy + bh / 2 - 0.08]} z={top + 0.01} seed={11} />

      {/* sanduíche com interposer (iPhone) ou blindagens grandes (Galaxy) */}
      {brand === 'apple' ? (
        <group position={[-0.25, cy + 0.12, 0]}>
          {[
            [0, 0.6, 2.1, 0.06],
            [0, -0.6, 2.1, 0.06],
            [-1.02, 0, 0.06, 1.26],
            [1.02, 0, 0.06, 1.26],
          ].map(([x, y, sx, sy], i) => (
            <mesh key={i} position={[x, y, top + 0.04]}>
              <boxGeometry args={[sx, sy, 0.08]} />
              <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
          <RoundedBox args={[2.1, 1.26, 0.035]} radius={0.015} position={[0, 0, top + 0.1]}>
            <meshStandardMaterial color="#0a2a1f" roughness={0.6} />
          </RoundedBox>
          <mesh position={[0, 0, top + 0.119]}>
            <planeGeometry args={[2.06, 1.22]} />
            <meshStandardMaterial map={pcbTexture()} roughness={0.55} metalness={0.15} />
          </mesh>
          <Chip x={-0.45} y={0.12} z={top + 0.12} sx={0.62} sy={0.62} kind="soc" />
          <Chip x={0.35} y={0.28} z={top + 0.12} sx={0.5} sy={0.36} />
          <Chip x={0.35} y={-0.2} z={top + 0.12} sx={0.46} sy={0.42} kind="shield" />
          <Chip x={-0.6} y={-0.42} z={top + 0.12} sx={0.5} sy={0.22} />
          <SMD count={140} area={[-0.98, -0.56, 0.98, 0.56]} z={top + 0.13} seed={23} />
        </group>
      ) : (
        <group position={[-0.2, cy + 0.1, 0]}>
          <Chip x={-0.55} y={0.2} z={top} sx={0.7} sy={0.7} kind="soc" />
          <Chip x={0.45} y={0.35} z={top} sx={0.9} sy={0.6} kind="shield" />
          <Chip x={0.4} y={-0.45} z={top} sx={0.8} sy={0.45} kind="shield" />
          <Chip x={-0.6} y={-0.55} z={top} sx={0.55} sy={0.32} />
        </group>
      )}

      {/* conectores board-to-board e parafusos */}
      <B2B x={bw / 2 - 0.35} y={cy - bh / 2 + 0.2} z={top + 0.015} />
      <B2B x={-bw / 2 + 0.35} y={cy - bh / 2 + 0.2} z={top + 0.015} />
      <B2B x={bw / 2 - 0.3} y={cy + bh / 2 - 0.25} z={top + 0.015} len={0.3} rot={Math.PI / 2} />
      <B2B x={0.1} y={cy + bh / 2 - 0.15} z={top + 0.015} len={0.42} />
      {[
        [-bw / 2 + 0.12, cy + bh / 2 - 0.12],
        [bw / 2 - 0.12, cy + bh / 2 - 0.12],
        [-bw / 2 + 0.12, cy - bh / 2 + 0.12],
        [bw / 2 - 0.12, cy - bh / 2 + 0.12],
        [0.85, cy - 0.15],
      ].map(([x, y], i) => (
        <Screw key={i} x={x} y={y} z={top + 0.02} />
      ))}
    </group>
  )
}

export function BatteryPack({ w, h }: { w: number; h: number }) {
  const bw = w - 1.0
  const bh = h * 0.44
  const y = -0.75
  return (
    <group>
      <RoundedBox args={[bw, bh, 0.14]} radius={0.05} position={[0, y, -0.03]}>
        <meshPhysicalMaterial color="#16171b" metalness={0.3} roughness={0.35} clearcoat={0.5} />
      </RoundedBox>
      {[0.042, -0.102].map((z) => (
        <mesh key={z} position={[0, y, z]} rotation-y={z < 0 ? Math.PI : 0}>
          <planeGeometry args={[bw - 0.2, bh - 0.3]} />
          <meshStandardMaterial map={batteryTexture()} roughness={0.5} />
        </mesh>
      ))}
      {/* fitas de remoção (pull tabs) */}
      {[-bw / 4, bw / 4].map((x) => (
        <mesh key={x} position={[x, y - bh / 2 - 0.12, -0.03]}>
          <boxGeometry args={[0.28, 0.32, 0.006]} />
          <meshStandardMaterial color="#e8e6df" roughness={0.8} />
        </mesh>
      ))}
      {/* flex e conector da bateria */}
      <Flex from={[bw / 2 - 0.35, y + bh / 2 - 0.05]} to={[bw / 2 - 0.35, y + bh / 2 + 0.3]} z={0.03} width={0.24} color="#1c1c20" />
      <RoundedBox args={[0.34, 0.12, 0.04]} radius={0.01} position={[bw / 2 - 0.35, y + bh / 2 + 0.32, 0.04]}>
        <meshStandardMaterial color="#c3c7cf" metalness={1} roughness={0.3} />
      </RoundedBox>
    </group>
  )
}

export function ChargePort({ w, h }: { w: number; h: number }) {
  const y = -h / 2 + 0.2
  return (
    <group>
      <RoundedBox args={[0.66, 0.22, 0.13]} radius={0.05} position={[0, y, 0]}>
        <meshStandardMaterial color="#b9bec6" metalness={1} roughness={0.25} />
      </RoundedBox>
      <mesh position={[0, y - 0.02, 0]}>
        <boxGeometry args={[0.52, 0.2, 0.08]} />
        <meshStandardMaterial color="#08080a" />
      </mesh>
      <mesh position={[0, y - 0.02, 0]}>
        <boxGeometry args={[0.38, 0.21, 0.025]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
      </mesh>
      {/* microfones inferiores */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, y, 0.02]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.06, 0.06, 0.06, 16]} />
          <meshStandardMaterial color="#2a2b30" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* flex de carga subindo pela lateral até a placa */}
      <Flex from={[0.2, y + 0.12]} to={[w / 2 - 0.35, y + 0.6]} z={0.07} width={0.2} />
      <Flex from={[w / 2 - 0.35, y + 0.5]} to={[w / 2 - 0.35, h / 2 - 2.55]} z={0.07} width={0.2} />
      <Screw x={-0.42} y={y + 0.14} z={0.075} />
      <Screw x={0.42} y={y + 0.14} z={0.075} />
    </group>
  )
}

export function SpeakerTaptic({ w, h }: { w: number; h: number }) {
  return (
    <group>
      <RoundedBox args={[1.1, 0.4, 0.17]} radius={0.05} position={[-w / 2 + 0.92, -h / 2 + 0.46, 0]}>
        <meshStandardMaterial color="#1a1b20" metalness={0.4} roughness={0.5} />
      </RoundedBox>
      <mesh position={[-w / 2 + 0.92, -h / 2 + 0.46, 0.0851]}>
        <planeGeometry args={[0.95, 0.3]} />
        <meshStandardMaterial map={grilleTexture()} roughness={0.6} />
      </mesh>
      {/* motor de vibração (taptic) */}
      <RoundedBox args={[0.95, 0.36, 0.15]} radius={0.04} position={[w / 2 - 0.82, -h / 2 + 0.95, 0]}>
        <meshPhysicalMaterial color="#9ea3ab" metalness={1} roughness={0.3} clearcoat={0.4} />
      </RoundedBox>
      <mesh position={[w / 2 - 0.82, -h / 2 + 0.95, 0.077]}>
        <planeGeometry args={[0.6, 0.18]} />
        <meshStandardMaterial color="#141418" />
      </mesh>
      <Flex from={[w / 2 - 1.25, -h / 2 + 0.95]} to={[w / 2 - 1.55, -h / 2 + 1.4]} z={0.05} width={0.1} color="#1c1c20" />
    </group>
  )
}

export function FrontSensors({ h, brand }: { h: number; brand: Brand }) {
  const y = h / 2 - 0.38
  if (brand === 'samsung')
    return (
      <group>
        <RoundedBox args={[0.42, 0.42, 0.12]} radius={0.04} position={[0, h / 2 - 0.32, 0.06]}>
          <meshStandardMaterial color="#141519" metalness={0.5} roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, h / 2 - 0.32, 0.125]}>
          <circleGeometry args={[0.1, 32]} />
          <meshPhysicalMaterial color="#0b1630" emissive="#2a4aa0" emissiveIntensity={0.5} clearcoat={1} roughness={0} />
        </mesh>
        <Flex from={[0, h / 2 - 0.55]} to={[0.4, h / 2 - 0.85]} z={0.1} width={0.14} />
      </group>
    )
  // Face ID: projetor de pontos, câmera infravermelha, iluminador e câmera frontal
  const parts: [number, number, string][] = [
    [-0.55, 0.075, '#3a0a10'],
    [-0.25, 0.075, '#0b1630'],
    [0.08, 0.05, '#222'],
    [0.42, 0.1, '#0b1630'],
  ]
  return (
    <group>
      <RoundedBox args={[1.45, 0.32, 0.1]} radius={0.04} position={[0, y, 0.08]}>
        <meshStandardMaterial color="#121318" metalness={0.6} roughness={0.35} />
      </RoundedBox>
      {parts.map(([x, r, col], i) => (
        <group key={i} position={[x, y, 0.13]} rotation-x={Math.PI / 2}>
          <mesh>
            <cylinderGeometry args={[r * 1.35, r * 1.35, 0.02, 24]} />
            <meshStandardMaterial color="#c3c7cf" metalness={1} roughness={0.3} />
          </mesh>
          <mesh position-y={0.012}>
            <cylinderGeometry args={[r, r, 0.012, 24]} />
            <meshPhysicalMaterial color={col} emissive={col} emissiveIntensity={0.6} clearcoat={1} roughness={0.05} />
          </mesh>
        </group>
      ))}
      <Flex from={[0.6, y - 0.1]} to={[0.6, y - 0.55]} z={0.1} width={0.16} />
      <Flex from={[-0.6, y - 0.1]} to={[-0.6, y - 0.5]} z={0.1} width={0.12} color="#1c1c20" />
    </group>
  )
}

/** Módulo interno de cada câmera: carcaça, estabilizador (OIS) e cano da lente. */
export function CameraModules({ lenses }: { lenses: { x: number; y: number; r?: number }[] }) {
  return (
    <group>
      {lenses.map((l, i) => (
        <group key={i} position={[l.x, l.y, -0.06]}>
          <RoundedBox args={[0.66, 0.66, 0.2]} radius={0.04}>
            <meshStandardMaterial color="#1a1b20" metalness={0.6} roughness={0.38} />
          </RoundedBox>
          {/* moldura do estabilizador óptico */}
          {[
            [0, 0.3, 0.6, 0.04],
            [0, -0.3, 0.6, 0.04],
            [0.3, 0, 0.04, 0.6],
            [-0.3, 0, 0.04, 0.6],
          ].map(([x, y, sx, sy], k) => (
            <mesh key={k} position={[x, y, -0.1]}>
              <boxGeometry args={[sx, sy, 0.03]} />
              <meshStandardMaterial color="#c3c7cf" metalness={1} roughness={0.25} />
            </mesh>
          ))}
          <mesh position-z={-0.14} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[(l.r ?? 0.28) * 0.75, (l.r ?? 0.28) * 0.85, 0.12, 32]} />
            <meshPhysicalMaterial color="#060608" metalness={0.4} roughness={0.15} clearcoat={1} />
          </mesh>
          <Flex from={[0.2, -0.2]} to={[0.2 - 0.6, -0.75]} z={0.06} width={0.14} color={i % 2 ? '#1c1c20' : '#c8792c'} />
        </group>
      ))}
    </group>
  )
}

/** Bobina de carregamento sem fio presa à traseira (com anel de ímãs no iPhone). */
export function WirelessCoil({ d, brand }: { d: number; brand: Brand }) {
  const z = -d / 2 + 0.04
  return (
    <group position={[0, -0.35, z]}>
      {[0.22, 0.32, 0.42, 0.52, 0.62].map((r) => (
        <mesh key={r}>
          <torusGeometry args={[r, 0.035, 8, 64]} />
          <meshStandardMaterial color="#b87333" metalness={1} roughness={0.3} />
        </mesh>
      ))}
      <mesh position-z={-0.01}>
        <circleGeometry args={[0.72, 64]} />
        <meshStandardMaterial color="#1b1c20" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {brand === 'apple' &&
        Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0]} rotation-z={a}>
              <boxGeometry args={[0.1, 0.24, 0.04]} />
              <meshStandardMaterial color="#8d9198" metalness={0.9} roughness={0.35} />
            </mesh>
          )
        })}
    </group>
  )
}

/** Painel OLED atrás do vidro, com o flex dobrado da tela. */
export function DisplayStack({ w, h, d }: { w: number; h: number; d: number }) {
  return (
    <group>
      <RoundedBox args={[w - 0.16, h - 0.16, 0.025]} radius={0.06} position={[0, 0, d / 2 - 0.055]}>
        <meshStandardMaterial color="#0c0d10" metalness={0.5} roughness={0.35} />
      </RoundedBox>
      <Flex from={[-0.6, -h / 2 + 0.35]} to={[0.6, -h / 2 + 0.35]} z={d / 2 - 0.075} width={0.42} />
      <RoundedBox args={[0.4, 0.14, 0.03]} radius={0.01} position={[0.75, -h / 2 + 0.35, d / 2 - 0.08]}>
        <meshStandardMaterial color="#c3c7cf" metalness={1} roughness={0.3} />
      </RoundedBox>
    </group>
  )
}

/** Chassi interno (mid-plate) com recorte da bateria, faixas de antena e gaveta do chip. */
export function MidFrame({ w, h, d, brand }: { w: number; h: number; d: number; brand: Brand }) {
  const shape = new THREE.Shape()
  const pw = w - 0.2
  const ph = h - 0.25
  shape.moveTo(-pw / 2, -ph / 2)
  shape.lineTo(pw / 2, -ph / 2)
  shape.lineTo(pw / 2, ph / 2)
  shape.lineTo(-pw / 2, ph / 2)
  const hole = new THREE.Path()
  const hw = w - 1.1
  const hh = h * 0.42
  hole.moveTo(-hw / 2, -0.75 - hh / 2)
  hole.lineTo(hw / 2, -0.75 - hh / 2)
  hole.lineTo(hw / 2, -0.75 + hh / 2)
  hole.lineTo(-hw / 2, -0.75 + hh / 2)
  shape.holes.push(hole)
  return (
    <group>
      <mesh position-z={-0.1}>
        <shapeGeometry args={[shape, 8]} />
        <meshStandardMaterial color="#a4a9b1" metalness={0.9} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* faixas de antena na lateral */}
      {[1, -1].flatMap((sx) =>
        [h / 2 - 1.1, -h / 2 + 1.0].map((y) => (
          <mesh key={`${sx}${y}`} position={[sx * (w / 2 + 0.002), y, 0]}>
            <boxGeometry args={[0.012, 0.06, d * 0.9]} />
            <meshStandardMaterial color="#2a2b30" roughness={0.6} />
          </mesh>
        )),
      )}
      {/* gaveta do chip */}
      <RoundedBox args={[0.02, 0.62, d * 0.5]} radius={0.008} position={[(brand === 'apple' ? -1 : 1) * (w / 2 + 0.006), brand === 'apple' ? -0.35 : h / 2 - 0.6, 0]}>
        <meshStandardMaterial color="#8d9198" metalness={1} roughness={0.3} />
      </RoundedBox>
      {/* parafusos inferiores */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, -h / 2 - 0.004, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.012, 12]} />
          <meshStandardMaterial color="#c7cbd2" metalness={1} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}
