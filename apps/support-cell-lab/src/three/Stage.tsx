import { Suspense, useRef, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { useInView } from 'motion/react'

/** Canvas com estúdio de luz procedural; pausa a renderização fora da tela. */
export function Stage3D({
  children,
  className,
  camera = [0, 0, 18],
  fov = 30,
}: {
  children: ReactNode
  className?: string
  camera?: [number, number, number]
  fov?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '200px 0px' })
  return (
    <div ref={ref} className={className}>
      <Canvas dpr={[1, 2]} frameloop={inView ? 'always' : 'never'} camera={{ position: camera, fov }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <Studio />
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}

function Studio() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 6]} intensity={1.3} />
      <directionalLight position={[-6, 2, -5]} intensity={0.9} color="#ff7673" />
      <Environment resolution={256} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
          <Lightformer form="ring" color="#ff3936" intensity={2} rotation-y={Math.PI / 2} position={[-8, 6, 2]} scale={6} />
          <Lightformer form="rect" intensity={3} position={[0, 0, 10]} scale={[10, 3, 1]} />
          <Lightformer form="rect" color="#ff7673" intensity={1.5} position={[0, -4, -10]} scale={[10, 2, 1]} />
        </group>
      </Environment>
    </>
  )
}
