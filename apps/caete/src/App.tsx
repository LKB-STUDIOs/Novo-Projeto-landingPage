import { useEffect } from 'react'
import { iniciarScroll, ScrollTrigger } from './lib/scroll'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Clientes } from './components/Clientes'
import { Servicos } from './components/Servicos'
import { Processo } from './components/Processo'
import { Cases } from './components/Cases'
import { Numeros } from './components/Numeros'
import { Simulador } from './components/Simulador'
import { Contato } from './components/Contato'

export default function App() {
  useEffect(() => {
    const parar = iniciarScroll()
    // fontes mudam a altura das seções: recalcula os gatilhos quando carregarem
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return parar
  }, [])
  return (
    <>
      <div className="papel-grao" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <Clientes />
        <Servicos />
        <Processo />
        <Cases />
        <Numeros />
        <Simulador />
      </main>
      <Contato />
    </>
  )
}
