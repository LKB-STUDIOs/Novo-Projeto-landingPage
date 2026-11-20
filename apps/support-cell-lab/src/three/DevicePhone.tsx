import * as THREE from 'three'
import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { Phone } from './Phone'
import { SPECS, asset, modelUrl, type PhoneColor, type Product } from '../data'

/** Verifica se o arquivo do modelo existe em public/models (o dev server devolve HTML para arquivos ausentes). */
const cache = new Map<string, Promise<boolean>>()
function useAssetExists(url: string) {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    let alive = true
    if (!cache.has(url)) {
      cache.set(
        url,
        fetch(url, { method: 'HEAD' })
          .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
          .catch(() => false),
      )
    }
    cache.get(url)!.then((v) => alive && setOk(v))
    return () => {
      alive = false
    }
  }, [url])
  return ok
}

/** Se o .glb estiver corrompido, volta para o modelo procedural em vez de derrubar a cena. */
class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('[Support Cell] falha ao carregar modelo 3D, usando modelo procedural', err)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const has = (name: string, keys: string[]) => keys.some((k) => name.includes(k))

/** caixa envolvente ignorando objetos escondidos */
function visibleBox(obj: THREE.Object3D) {
  const box = new THREE.Box3()
  obj.updateMatrixWorld(true)
  obj.traverseVisible((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh) box.union(new THREE.Box3().setFromObject(mesh, true))
  })
  return box
}

const tmpA = { h: 0, s: 0, l: 0 }
const tmpB = { h: 0, s: 0, l: 0 }

function GLBPhone({ product, color }: { product: Product; color: PhoneColor }) {
  const spec = SPECS[product.spec]
  const cfg = product.model ?? {}
  const { scene } = useGLTF(modelUrl(product), asset('/draco/'))

  const { root, scale, center } = useMemo(() => {
    const root = scene.clone(true)
    // o GLTFLoader troca espaços por "_" e remove ".", ":" e "/" dos nomes
    const norm = (n: string) => n.toLowerCase().replace(/[.:/[\]]/g, '').replace(/[\s_]+/g, ' ')
    const hidden = (cfg.hide ?? []).map(norm)
    root.traverse((o) => {
      if (hidden.some((h) => norm(o.name).includes(h))) o.visible = false
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone()
    })
    // endireita sozinho: maior dimensão em Y (altura) e menor em Z (espessura)
    const pivot = new THREE.Group()
    pivot.add(root)
    const measure = () => {
      pivot.updateMatrixWorld(true)
      return visibleBox(pivot).getSize(new THREE.Vector3())
    }
    let s = measure()
    if (s.z >= s.x && s.z >= s.y) pivot.rotateX(-Math.PI / 2)
    else if (s.x >= s.y && s.x >= s.z) pivot.rotateZ(Math.PI / 2)
    s = measure()
    if (s.x < s.z) pivot.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2)
    if (cfg.rotation) {
      const [x, y, z] = cfg.rotation
      pivot.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), x)
      pivot.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), y)
      pivot.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), z)
    }
    pivot.updateMatrixWorld(true)
    const box = visibleBox(pivot)
    const size = box.getSize(new THREE.Vector3())
    // encaixa a altura do aparelho na mesma altura do modelo procedural
    const scale = (spec.h / Math.max(size.y, 1e-6)) * (cfg.scale ?? 1)
    return { root: pivot, scale, center: box.getCenter(new THREE.Vector3()) }
  }, [scene, spec.h, cfg.rotation, cfg.scale])

  // aplica a cor escolhida nos materiais configurados (traseira / laterais)
  useEffect(() => {
    const back = cfg.tint?.back ?? ['back', 'body', 'housing', 'rear']
    const frame = cfg.tint?.frame ?? ['frame', 'side', 'band', 'metal', 'titanium', 'alumin']
    const target = { back: new THREE.Color(color.back), frame: new THREE.Color(color.frame) }
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      for (const m of [mesh.material].flat() as THREE.MeshStandardMaterial[]) {
        const name = `${m.name} ${mesh.name}`.toLowerCase()
        if (!m.color) continue
        if (cfg.tint?.auto) {
          // recolore só materiais coloridos e opacos (preserva telas, lentes, pretos e vidros)
          const orig = (m.userData.orig ??= m.color.clone()) as THREE.Color
          orig.getHSL(tmpA)
          if (tmpA.s > 0.15 && tmpA.l > 0.06 && m.opacity > 0.95 && !m.map) {
            target.back.getHSL(tmpB)
            m.color.setHSL(tmpB.h, tmpB.s, tmpB.l * 0.75 + tmpA.l * 0.25)
          }
          continue
        }
        if (has(name, frame)) m.color.copy(target.frame)
        else if (has(name, back)) m.color.copy(target.back)
      }
    })
  }, [root, color, cfg.tint])

  return (
    <group scale={scale}>
      <primitive object={root} position={[-center.x, -center.y, -center.z]} />
    </group>
  )
}

/**
 * Aparelho do catálogo: usa o modelo real em public/models/<id>.glb quando existir;
 * caso contrário, o modelo procedural.
 */
export function DevicePhone({ product, color }: { product: Product; color: PhoneColor }) {
  const exists = useAssetExists(modelUrl(product))
  const fallback = <Phone spec={SPECS[product.spec]} color={color} />
  if (!exists) return fallback
  return (
    <ModelBoundary key={product.id} fallback={fallback}>
      <Suspense fallback={fallback}>
        <GLBPhone product={product} color={color} />
      </Suspense>
    </ModelBoundary>
  )
}
