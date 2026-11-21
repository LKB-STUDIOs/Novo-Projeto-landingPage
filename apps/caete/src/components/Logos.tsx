import type { Cliente } from '../lib/data'

const marcas: Record<Cliente['marca'], React.ReactNode> = {
  rombo: <path d="M12 2l10 10-10 10L2 12z" />,
  onda: <path d="M2 14c3-6 6-6 10 0s7 6 10 0v6H2z" />,
  folha: <path d="M12 2c7 3 9 9 5 14-2 2-4 4-5 6-1-2-3-4-5-6-4-5-2-11 5-14z" />,
  sol: <><circle cx="12" cy="12" r="5" />{[0, 45, 90, 135].map((a) => <rect key={a} x="11" y="0" width="2" height="5" transform={`rotate(${a} 12 12)`} />)}{[0, 45, 90, 135].map((a) => <rect key={'b' + a} x="11" y="19" width="2" height="5" transform={`rotate(${a} 12 12)`} />)}</>,
  torre: <path d="M10 2h4l1 7h3v13H6V9h3z" />,
  gota: <path d="M12 2c5 6 7 9 7 12a7 7 0 01-14 0c0-3 2-6 7-12z" />,
  hex: <path d="M12 2l9 5v10l-9 5-9-5V7z" />,
  seta: <path d="M3 12h14l-5-7h4l6 7-6 7h-4l5-7z" />,
}

const fontes = { display: 'font-display italic font-medium text-[1.45rem]', sans: 'font-sans font-bold tracking-tight text-[1.2rem]', mono: 'font-mono font-medium uppercase tracking-widest text-[.95rem]' }

/** Marca fictícia: ícone geométrico + nome. Tudo em tinta, para parecer carimbo no papel. */
export function LogoCliente({ c }: { c: Cliente }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-9 text-tinta/70 transition-colors hover:text-musgo" title={`${c.nome} · ${c.sub}`}>
      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>{marcas[c.marca]}</svg>
      <span className={`whitespace-nowrap ${fontes[c.fonte]}`}>{c.nome}</span>
    </div>
  )
}

export function MarcaCaete({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-musgo" />
      <path d="M16 5c5.5 4 7.5 9.5 4.2 15C19 22 17 23 16 27c-1-4-3-5-4.2-7C8.500 14.500 10.500 9 16 5z" className="fill-papel" />
      <path d="M16 11v15" className="stroke-musgo" strokeWidth="1.4" fill="none" />
    </svg>
  )
}
