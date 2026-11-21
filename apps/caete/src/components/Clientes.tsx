import { CLIENTES } from '../lib/data'
import { LogoCliente } from './Logos'

export function Clientes() {
  const a = CLIENTES.slice(0, 6), b = CLIENTES.slice(6)
  const fila = (lista: typeof CLIENTES, volta = false, dur = 46) => (
    <div className="marquee-pausa overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className={`marquee ${volta ? 'volta' : ''}`} style={{ ['--dur' as string]: `${dur}s` }}>
        {[...lista, ...lista, ...lista, ...lista].map((c, i) => <LogoCliente key={i} c={c} />)}
      </div>
    </div>
  )
  return (
    <section className="relative border-y border-tinta/15 bg-papel-claro/60 py-14" aria-label="Clientes atendidos">
      <p className="rotulo mb-9 text-center text-tinta/60">Quem já licenciou com a gente · 12 grupos, 9 estados</p>
      <div className="space-y-6">{fila(a)}{fila(b, true, 54)}</div>
      <p className="mx-auto mt-8 max-w-7xl px-5 text-center text-xs text-tinta/45">Empresas e marcas fictícias, criadas para esta demonstração.</p>
    </section>
  )
}
