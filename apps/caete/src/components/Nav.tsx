import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { MarcaCaete } from './Logos'

const LINKS = [['Serviços', '#servicos'], ['Caminho da licença', '#processo'], ['Cases', '#cases'], ['Simulador', '#simulador']]

export function Nav() {
  const [oculta, setOculta] = useState(false)
  const [fundo, setFundo] = useState(false)
  const { scrollYProgress } = useScroll()
  const barra = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  useEffect(() => {
    let ultimo = 0
    const f = () => {
      const y = window.scrollY
      setOculta(y > ultimo && y > 400)
      setFundo(y > 60)
      ultimo = y
    }
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <>
      <motion.div style={{ scaleX: barra }} className="fixed left-0 right-0 top-0 z-[100] h-[3px] origin-left bg-ferrugem" />
      <motion.header
        animate={{ y: oculta ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${fundo ? 'bg-papel/80 backdrop-blur-md shadow-[0_1px_0_rgba(38,38,31,.12)]' : ''}`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#topo" className="flex items-center gap-2.5" aria-label="Caeté, início">
            <MarcaCaete />
            <span className="display text-2xl font-semibold">Caeté</span>
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map(([t, h]) => (
              <li key={h}><a href={h} className="rotulo relative py-1 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-tinta after:transition-transform hover:after:scale-x-100">{t}</a></li>
            ))}
          </ul>
          <a href="#contato" className="rotulo rounded-full bg-tinta px-5 py-2.5 text-papel-claro transition-colors hover:bg-musgo">Fale conosco</a>
        </nav>
      </motion.header>
    </>
  )
}
