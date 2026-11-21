import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, DollarSign, ExternalLink, Info, Lock, LogOut, RotateCcw, Search, Wrench } from 'lucide-react'
import {
  DEVICE_FAMILIES,
  REPAIRS,
  STORE,
  brl,
  defaultPrice,
  loadPainel,
  priceKey,
  resetPainel,
  savePainel,
  type Brand,
  type PainelStore,
  type PartId,
} from '../data'
import { REPAIR_ICONS } from '../components/repairUi'

/* Painel de demonstração: login fixo e dados salvos no navegador.
   Na versão do cliente, o login e os preços ficam no servidor (PHP + MySQL). */
const DEMO_USER = 'demo'
const DEMO_PASS = 'demo'
const SESSION_KEY = 'supportcell:painel:sessao'
const SITE_URL = import.meta.env.BASE_URL

type Tab = 'precos' | 'servicos'
type Model = { name: string; tier: number; brand: Brand; family: string }

const MODELS: Model[] = DEVICE_FAMILIES.flatMap((f) => f.models.map((m) => ({ ...m, brand: f.brand, family: f.name })))

const readSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}
const writeSession = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem(SESSION_KEY, '1')
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignora */
  }
}

export function Painel() {
  const [logged, setLogged] = useState(readSession)
  if (!logged) return <Login onLogin={() => (writeSession(true), setLogged(true))} />
  return <Dashboard onLogout={() => (writeSession(false), setLogged(false))} />
}

/* ───────── login ───────── */

function Login({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (user.trim().toLowerCase() === DEMO_USER && pass === DEMO_PASS) onLogin()
    else setError(true)
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-accent-2 px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-panel p-7 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-accent text-white">
            <Lock size={20} />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-fg">Painel da loja</p>
            <p className="text-xs text-muted">{STORE.name}</p>
          </div>
        </div>

        <label className="mt-7 block text-xs font-medium text-fg/70">Usuário</label>
        <input className="field mt-1.5" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" autoFocus />
        <label className="mt-4 block text-xs font-medium text-fg/70">Senha</label>
        <input className="field mt-1.5" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
        {error && <p className="mt-3 text-sm text-accent">Usuário ou senha incorretos.</p>}

        <button className="btn-primary mt-6 w-full">Entrar</button>

        <p className="mt-5 rounded-xl bg-panel-2 px-4 py-3 text-xs leading-relaxed text-fg/70">
          <b className="text-fg">Demonstração:</b> usuário <code className="font-semibold">demo</code> e senha{' '}
          <code className="font-semibold">demo</code>.
        </p>
        <a href={SITE_URL} className="mt-4 block text-center text-xs text-muted hover:text-fg">
          ← Voltar para o site
        </a>
      </form>
    </main>
  )
}

/* ───────── painel ───────── */

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('precos')
  const [store, setStore] = useState<PainelStore>(loadPainel)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const commit = (next: PainelStore, message: string) => {
    const s = { ...next, updatedAt: new Date().toISOString() }
    savePainel(s)
    setStore(s)
    setToast(message)
  }

  const restore = () => {
    if (!window.confirm('Voltar todos os preços e serviços para o padrão?')) return
    resetPainel()
    setStore(loadPainel())
    setToast('Preços padrão restaurados')
  }

  const custom = Object.keys(store.prices).length
  const updated = store.updatedAt
    ? new Date(store.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : 'Nenhuma'

  return (
    <div className="min-h-dvh bg-ink pb-24 lg:grid lg:grid-cols-[240px_1fr] lg:pb-0">
      {/* menu lateral (computador) */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-1 bg-accent-2 p-5 text-white lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-white font-display text-sm font-bold text-accent-2">SC</span>
          <span className="font-display font-semibold leading-tight">
            {STORE.name}
            <small className="block text-[11px] font-normal text-white/60">Painel da loja</small>
          </span>
        </div>
        <SideItem on={tab === 'precos'} onClick={() => setTab('precos')} icon={<DollarSign size={17} />}>
          Preços
        </SideItem>
        <SideItem on={tab === 'servicos'} onClick={() => setTab('servicos')} icon={<Wrench size={17} />}>
          Serviços
        </SideItem>
        <a href={`${SITE_URL}#orcamento`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/10 hover:text-white">
          <ExternalLink size={17} /> Ver site
        </a>
        <div className="mt-auto border-t border-white/15 px-2 pt-4 text-xs text-white/60">
          <b className="block text-sm text-white">Administrador</b>
          <button onClick={onLogout} className="mt-1 inline-flex items-center gap-1.5 hover:text-white">
            <LogOut size={13} /> Sair
          </button>
        </div>
      </aside>

      {/* topo (celular) */}
      <header className="flex items-center justify-between bg-accent-2 px-5 pb-5 pt-6 text-white lg:hidden">
        <div>
          <p className="text-xs text-white/60">Painel · {STORE.name}</p>
          <p className="font-display text-xl font-semibold">{tab === 'precos' ? 'Preços' : 'Serviços'}</p>
        </div>
        <button onClick={onLogout} className="rounded-full bg-white/10 p-2.5" aria-label="Sair">
          <LogOut size={16} />
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-line bg-panel px-4 py-3 text-xs leading-relaxed text-fg/70">
          <Info size={15} className="mt-0.5 shrink-0 text-accent" />
          <p>
            <b className="text-fg">Demonstração.</b> As alterações ficam salvas só neste navegador, e o orçamento do site já usa os preços daqui. Na versão da loja,
            elas ficam no servidor e valem para todos os clientes.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <Stat label="Modelos cadastrados" value={String(MODELS.length)} />
          <Stat label="Preços alterados" value={String(custom)} />
          <Stat label="Última alteração" value={updated} />
        </div>

        {tab === 'precos' ? <Precos store={store} onSave={commit} onRestore={restore} /> : <Servicos store={store} onSave={commit} />}
      </main>

      {/* navegação (celular) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line bg-panel px-2 pb-5 pt-2 text-center text-[11px] text-muted lg:hidden">
        <MobileItem on={tab === 'precos'} onClick={() => setTab('precos')} icon={<DollarSign size={19} />} label="Preços" />
        <MobileItem on={tab === 'servicos'} onClick={() => setTab('servicos')} icon={<Wrench size={19} />} label="Serviços" />
        <a href={`${SITE_URL}#orcamento`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-0.5 py-1">
          <ExternalLink size={19} /> Site
        </a>
      </nav>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-fg px-4 py-3.5 text-sm text-white shadow-2xl lg:bottom-8"
            role="status"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600">
              <Check size={14} />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────── aba: preços ───────── */

function Precos({ store, onSave, onRestore }: { store: PainelStore; onSave: (s: PainelStore, msg: string) => void; onRestore: () => void }) {
  const [brand, setBrand] = useState<Brand>('apple')
  const [query, setQuery] = useState('')
  const [modelName, setModelName] = useState('iPhone 13')
  const [draft, setDraft] = useState<Partial<Record<PartId, string>>>({})

  const model = MODELS.find((m) => m.name === modelName)!
  const options = useMemo(
    () => MODELS.filter((m) => m.brand === brand && m.name.toLowerCase().includes(query.trim().toLowerCase())),
    [brand, query],
  )

  useEffect(() => setDraft({}), [modelName])

  const pickBrand = (b: Brand) => {
    setBrand(b)
    setQuery('')
    setModelName(MODELS.find((m) => m.brand === b)!.name)
  }

  const current = (part: PartId) => store.prices[priceKey(model.name, part)] ?? defaultPrice(model.tier, part)
  const dirty = (Object.entries(draft) as [PartId, string][]).filter(([part, v]) => {
    const n = Number(v)
    return v !== '' && Number.isFinite(n) && n > 0 && n !== current(part)
  })

  const save = () => {
    if (!dirty.length) return
    const prices = { ...store.prices }
    for (const [part, v] of dirty) prices[priceKey(model.name, part)] = Math.round(Number(v))
    const names = dirty.map(([part]) => REPAIRS.find((r) => r.id === part)!.short.toLowerCase())
    setDraft({})
    onSave({ ...store, prices }, `${names.length === 1 ? `Preço de ${names[0]}` : `${names.length} preços`} do ${model.name} atualizado${names.length === 1 ? '' : 's'} no site`)
  }

  const resetOne = (part: PartId) => {
    const prices = { ...store.prices }
    delete prices[priceKey(model.name, part)]
    setDraft((d) => ({ ...d, [part]: undefined }))
    onSave({ ...store, prices }, `${REPAIRS.find((r) => r.id === part)!.name} do ${model.name} voltou ao preço padrão`)
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="hidden lg:block">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">Preços dos consertos</h1>
          <p className="mt-1 text-sm text-muted">Mudou aqui, o orçamento do site atualiza na hora.</p>
        </div>
        <div className="flex w-full gap-2 lg:w-auto">
          <button onClick={onRestore} className="btn-ghost flex-1 px-4 py-2.5 text-xs lg:flex-none">
            <RotateCcw size={14} /> Restaurar padrão
          </button>
          <button onClick={save} disabled={!dirty.length} className="btn-primary flex-1 px-5 py-2.5 disabled:opacity-40 lg:flex-none">
            <Check size={16} /> Salvar{dirty.length > 1 ? ` (${dirty.length})` : ''}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex gap-2">
          {(['apple', 'samsung'] as Brand[]).map((b) => (
            <button key={b} onClick={() => pickBrand(b)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${brand === b ? 'bg-fg text-white' : 'border border-line bg-panel text-fg/70'}`}>
              {b === 'apple' ? 'iPhone' : 'Samsung'}
            </button>
          ))}
        </div>
        <div className="relative md:w-56">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg/35" />
          <input className="field bg-panel py-2.5 pl-9" placeholder="Buscar modelo…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select
          className="field bg-panel py-2.5 font-semibold md:w-64"
          value={options.some((o) => o.name === modelName) ? modelName : ''}
          onChange={(e) => setModelName(e.target.value)}
        >
          {!options.some((o) => o.name === modelName) && <option value="">{options.length ? 'Escolha o modelo' : 'Nenhum modelo encontrado'}</option>}
          {DEVICE_FAMILIES.filter((f) => f.brand === brand).map((f) => {
            const ms = options.filter((o) => o.family === f.name)
            return ms.length ? (
              <optgroup key={f.name} label={f.name}>
                {ms.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            ) : null
          })}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="hidden grid-cols-[1fr_90px_170px_130px] gap-4 border-b border-line px-5 py-3 text-[11px] font-semibold tracking-wider text-muted uppercase md:grid">
          <span>Serviço · {model.name}</span>
          <span>Prazo</span>
          <span>Preço</span>
          <span>No site</span>
        </div>
        {REPAIRS.map((r) => {
          const I = REPAIR_ICONS[r.id]
          const custom = store.prices[priceKey(model.name, r.id)] !== undefined
          const hidden = store.hidden.includes(r.id)
          const value = draft[r.id] ?? String(current(r.id))
          const editing = draft[r.id] !== undefined && Number(draft[r.id]) !== current(r.id)
          return (
            <div key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 last:border-0 md:grid-cols-[1fr_90px_170px_130px] md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-panel-2 text-fg/70">
                  <I size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg">{r.name}</p>
                  <p className="text-xs text-muted md:hidden">{r.time}</p>
                </div>
              </div>
              <span className="hidden text-sm text-fg/70 md:block">{r.time}</span>
              <div className="flex items-center gap-2">
                <label className={`flex items-center overflow-hidden rounded-xl border bg-panel transition ${editing ? 'border-accent ring-3 ring-accent/15' : 'border-line'}`}>
                  <span className="border-r border-line bg-panel-2 px-2.5 py-2 text-xs text-muted">R$</span>
                  <input
                    inputMode="numeric"
                    aria-label={`Preço de ${r.name} no ${model.name}`}
                    className="w-20 bg-transparent px-2.5 py-2 text-sm font-bold text-fg outline-none"
                    value={value}
                    onChange={(e) => setDraft((d) => ({ ...d, [r.id]: e.target.value.replace(/\D/g, '') }))}
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                  />
                </label>
                {custom && !editing && (
                  <button onClick={() => resetOne(r.id)} title={`Voltar ao padrão (${brl(defaultPrice(model.tier, r.id))})`} className="rounded-lg p-1.5 text-fg/40 hover:bg-panel-2 hover:text-fg">
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
              <span className={`col-span-2 text-xs md:col-span-1 ${hidden ? 'text-fg/40' : 'text-emerald-700'}`}>
                {hidden ? 'Oculto (aba Serviços)' : custom ? 'Visível · preço da loja' : 'Visível'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ───────── aba: serviços ───────── */

function Servicos({ store, onSave }: { store: PainelStore; onSave: (s: PainelStore, msg: string) => void }) {
  const toggle = (part: PartId) => {
    const on = store.hidden.includes(part)
    const hidden = on ? store.hidden.filter((h) => h !== part) : [...store.hidden, part]
    const name = REPAIRS.find((r) => r.id === part)!.name
    onSave({ ...store, hidden }, on ? `${name} voltou a aparecer no site` : `${name} escondido do site`)
  }

  return (
    <section>
      <div className="hidden lg:block">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">Serviços no site</h1>
        <p className="mt-1 text-sm text-muted">Desligue um serviço para ele sumir do orçamento, sem perder o preço.</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {REPAIRS.map((r) => {
          const I = REPAIR_ICONS[r.id]
          const visible = !store.hidden.includes(r.id)
          return (
            <div key={r.id} className={`flex items-start gap-3 rounded-2xl border bg-panel p-4 transition ${visible ? 'border-line' : 'border-dashed border-fg/15 opacity-70'}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-panel-2 text-fg/70">
                <I size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fg">{r.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{r.desc}</p>
                <p className="mt-1.5 text-xs text-fg/60">Prazo: {r.time}</p>
              </div>
              <Toggle on={visible} onClick={() => toggle(r.id)} label={`Mostrar ${r.name} no site`} />
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ───────── peças ───────── */

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-emerald-600' : 'bg-fg/20'}`}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-3 py-3 md:px-5 md:py-4">
      <p className="text-[11px] leading-tight text-muted md:text-xs">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-fg md:text-2xl">{value}</p>
    </div>
  )
}

function SideItem({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${on ? 'bg-white/15 font-semibold text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
      {icon} {children}
    </button>
  )
}

function MobileItem({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 py-1 ${on ? 'font-semibold text-accent' : ''}`}>
      {icon} {label}
    </button>
  )
}
