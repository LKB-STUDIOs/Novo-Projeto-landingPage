import { useEffect } from 'react'
import Lenis from 'lenis'
import { Header } from './components/Header'
import { Hero, Marquee } from './components/Hero'
import { Showroom } from './components/Showroom'
import { RepairLab } from './components/RepairLab'
import { Quote } from './components/Quote'
import { Faq, Features, Footer, Process, WhatsAppFab } from './components/Sections'

export default function App() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -80 } })
    return () => lenis.destroy()
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Showroom />
        <RepairLab />
        <Quote />
        <Process />
        <Features />
        <Faq />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
