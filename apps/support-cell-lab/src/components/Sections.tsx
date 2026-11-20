import { motion } from 'motion/react'
import { Clock, CreditCard, Lock, MapPin, MessageCircle, Microscope, PackageCheck, Plus, Radar, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { Logo } from './Header'
import { MODEL_CREDITS, STORE, waLink } from '../data'

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
}

const STEPS = [
  { icon: Radar, t: 'Orçamento online', d: 'Escolha o aparelho e o reparo e receba o valor na hora, sem compromisso.' },
  { icon: Truck, t: 'Buscamos para você', d: 'Um motoboy da Support Cell retira o aparelho lacrado no seu endereço.' },
  { icon: Microscope, t: 'Reparo em laboratório', d: 'Técnicos certificados, bancada antiestática e fotos de cada etapa.' },
  { icon: PackageCheck, t: 'Entrega com garantia', d: 'Devolvemos testado, limpo e com 90 dias de garantia por escrito.' },
]

export function Process() {
  return (
    <section id="processo" className="py-28">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div {...reveal} className="max-w-2xl">
          <span className="eyebrow">
            <Wrench size={13} className="text-accent" /> Como funciona
          </span>
          <h2 className="section-title mt-4">
            Do orçamento à entrega <span className="text-fg/40">sem sair de casa.</span>
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: I, t, d }, i) => (
            <motion.div
              key={t}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-line bg-panel p-6"
            >
              <span className="absolute -top-4 -right-2 font-display text-[7rem] leading-none font-bold text-fg/[0.03] transition group-hover:text-accent/10">
                {i + 1}
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-fg/5 text-accent">
                <I size={22} />
              </span>
              <h3 className="mt-8 font-display text-xl font-semibold text-fg">{t}</h3>
              <p className="mt-2 text-sm text-fg/55">{d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Features() {
  return (
    <section className="pb-28">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-6">
        <motion.div {...reveal} className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accent/20 via-panel to-panel p-8 md:col-span-4">
          <ShieldCheck size={28} className="text-accent" />
          <h3 className="mt-10 max-w-md font-display text-3xl font-semibold text-fg">Garantia de 90 dias em todo reparo, por escrito.</h3>
          <p className="mt-3 max-w-md text-fg/60">Peças premium testadas em bancada antes e depois da instalação. Se algo não ficar perfeito, refazemos sem custo.</p>
        </motion.div>
        <motion.div {...reveal} className="rounded-3xl border border-line bg-panel p-8 md:col-span-2">
          <Clock size={24} className="text-accent-2" />
          <p className="mt-10 font-display text-5xl font-semibold text-fg">30 min</p>
          <p className="mt-2 text-sm text-fg/55">para trocas de bateria e tela na maioria dos modelos.</p>
        </motion.div>
        <motion.div {...reveal} className="rounded-3xl border border-line bg-panel p-8 md:col-span-2">
          <Lock size={24} className="text-accent-2" />
          <h3 className="mt-10 font-display text-xl font-semibold text-fg">Seus dados protegidos</h3>
          <p className="mt-2 text-sm text-fg/55">Não pedimos sua senha para reparos de hardware. Aparelho lacrado durante o transporte.</p>
        </motion.div>
        <motion.div {...reveal} className="rounded-3xl border border-line bg-panel p-8 md:col-span-2">
          <Microscope size={24} className="text-accent-2" />
          <h3 className="mt-10 font-display text-xl font-semibold text-fg">Microsoldagem</h3>
          <p className="mt-2 text-sm text-fg/55">Laboratório próprio para reparos de placa: aparelho que não liga, sem sinal ou em curto.</p>
        </motion.div>
        <motion.div {...reveal} className="rounded-3xl border border-line bg-panel p-8 md:col-span-2">
          <CreditCard size={24} className="text-accent-2" />
          <h3 className="mt-10 font-display text-xl font-semibold text-fg">Pague como preferir</h3>
          <p className="mt-2 text-sm text-fg/55">5% de desconto no Pix ou parcelamento em até 10x sem juros no cartão.</p>
        </motion.div>
      </div>
    </section>
  )
}

const FAQS = [
  ['Quanto tempo demora o reparo?', 'Trocas de tela e bateria costumam ficar prontas em 30 a 60 minutos. Reparos de placa levam de 24 a 72 horas, após diagnóstico.'],
  ['Vocês atendem Samsung Galaxy?', 'Sim. Atendemos a linha Galaxy S (S24, S24 Ultra, S25, S25+, S25 Edge e S25 Ultra) com o mesmo padrão de qualidade e garantia.'],
  ['O iPhone vai mostrar aviso de peça?', 'Em alguns modelos, o iOS exibe um aviso de peça não original nos Ajustes após a troca. É apenas informativo e não afeta o funcionamento.'],
  ['Perco meus dados?', 'Não. Reparos de hardware não apagam seus dados. Mesmo assim, recomendamos fazer backup antes de qualquer serviço.'],
  ['Como funciona o delivery?', 'Após confirmar o orçamento, agendamos a retirada. O aparelho é lacrado, levado ao laboratório e devolvido no mesmo endereço.'],
]

export function Faq() {
  return (
    <section id="faq" className="py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.4fr]">
        <motion.div {...reveal}>
          <span className="eyebrow">Dúvidas frequentes</span>
          <h2 className="section-title mt-4">Perguntas?</h2>
          <p className="mt-4 text-fg/60">Fale com um técnico de verdade pelo WhatsApp. Respondemos em minutos no horário comercial.</p>
          <a href={waLink('Olá! Tenho uma dúvida sobre um reparo.')} target="_blank" rel="noreferrer" className="btn-ghost mt-6">
            <MessageCircle size={16} /> Chamar no WhatsApp
          </a>
        </motion.div>
        <div className="divide-y divide-line rounded-3xl border border-line bg-panel">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fg">
                {q}
                <Plus size={18} className="shrink-0 text-fg/40 transition group-open:rotate-45 group-open:text-accent" />
              </summary>
              <p className="mt-3 text-sm text-fg/55">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-fg/50">Assistência técnica premium para iPhone e Samsung Galaxy S, com delivery e garantia de 90 dias.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-fg">Loja</p>
          <p className="mt-3 flex gap-2 text-fg/55">
            <MapPin size={15} className="mt-0.5 shrink-0" /> {STORE.address}
            <br />
            {STORE.city}
          </p>
          <p className="mt-2 flex gap-2 text-fg/55">
            <Clock size={15} className="mt-0.5 shrink-0" /> {STORE.hours}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-fg/55">
          <p className="font-semibold text-fg">Navegação</p>
          <a href="#showroom" className="hover:text-fg">Showroom 360°</a>
          <a href="#laboratorio" className="hover:text-fg">Laboratório 3D</a>
          <a href="#orcamento" className="hover:text-fg">Orçamento</a>
          <a href="#faq" className="hover:text-fg">Dúvidas</a>
        </div>
      </div>
      <div className="border-t border-line px-4 py-6 text-center text-xs text-fg/30">
        © {new Date().getFullYear()} {STORE.name}. Assistência independente, não autorizada pela Apple ou Samsung. iPhone é marca da Apple Inc.; Galaxy é marca da
        Samsung Electronics.
        <p className="mt-3">
          Modelos 3D via Sketchfab:{' '}
          {MODEL_CREDITS.map((c, i) => (
            <span key={c.url}>
              {i > 0 && ' · '}
              <a href={c.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-fg/60 hover:underline">
                {c.model} por {c.author}
              </a>{' '}
              ({c.license})
            </span>
          ))}
        </p>
      </div>
    </footer>
  )
}

export function WhatsAppFab() {
  return (
    <a
      href={waLink('Olá, Support Cell Lab! Quero um orçamento.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed right-5 bottom-5 z-50 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_40px_-10px_#25d366] transition hover:scale-105"
    >
      <MessageCircle size={24} />
    </a>
  )
}
