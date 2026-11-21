import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="#top" className={`flex items-center gap-2.5 ${className}`} aria-label="Support Cell Lab — início">
      <svg viewBox="0 0 32 32" className="size-8">
        <rect width="32" height="32" rx="9" fill="#7A0C17" />
        <circle cx="16" cy="16" r="6" fill="none" stroke="#F5F1EF" strokeWidth="2.4" />
        <ellipse cx="16" cy="16" rx="12" ry="4.6" fill="none" stroke="#D72638" strokeWidth="1.8" transform="rotate(-28 16 16)" />
        <circle cx="26.2" cy="10.4" r="2" fill="#D72638" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-fg">
        Support Cell<span className="text-accent"> Lab</span>
      </span>
    </a>
  )
}

const NAV = [
  ['Showroom 360°', '#showroom'],
  ['Laboratório 3D', '#laboratorio'],
  ['Orçamento', '#orcamento'],
  ['Como funciona', '#processo'],
  ['Dúvidas', '#faq'],
  ['Painel da loja', `${import.meta.env.BASE_URL}painel/`],
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl backdrop-saturate-150 transition-colors duration-500 ${
        scrolled ? 'border-line bg-white/75' : 'border-transparent bg-white/40'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} className="text-[13px] text-fg/70 transition hover:text-fg">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#orcamento" className="btn-primary hidden px-4 py-1.5 text-xs sm:inline-flex">
            Orçamento grátis
          </a>
          <button className="grid size-9 place-items-center rounded-full lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto flex max-w-6xl flex-col border-t border-line p-2 lg:hidden"
          >
            {NAV.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-fg/80 hover:bg-fg/5">
                {label}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
