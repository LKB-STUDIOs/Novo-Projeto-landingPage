import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/** Botão que "puxa" em direção ao cursor (estilo componente 21st.dev). */
export function Magnetico({ children, className = '', as = 'a', ...rest }: React.ComponentProps<'a'> & { as?: 'a' | 'button' }) {
  const ref = useRef<HTMLElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.34)
  }
  const sai = () => { x.set(0); y.set(0) }
  const Tag = (as === 'a' ? motion.a : motion.button) as typeof motion.a
  return (
    <Tag ref={ref as never} style={{ x, y }} onPointerMove={move} onPointerLeave={sai} className={className} {...(rest as object)}>
      {children}
    </Tag>
  )
}
