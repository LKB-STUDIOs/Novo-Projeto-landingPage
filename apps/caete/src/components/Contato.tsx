import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Magnetico } from './Magnetico'

// Número fictício: troque pelo WhatsApp real antes de publicar.
const WHATSAPP = '5500000000000'
const limpa = (s: string) => s.replace(/[\u0000-\u001f​-‏‪-‮]/g, '').slice(0, 400)

export function Contato() {
  const [f, setF] = useState({ nome: '', empresa: '', msg: '' })
  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    const t = `Olá, Caeté! Sou ${limpa(f.nome)}${f.empresa ? ` (${limpa(f.empresa)})` : ''}. ${limpa(f.msg)}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`, '_blank', 'noopener,noreferrer')
  }
  const campo = 'w-full border-b border-papel/35 bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-papel/40 focus:border-[#d9a15e]'
  return (
    <section id="contato" className="relative overflow-hidden bg-tinta text-papel">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-28 md:px-8 md:py-36 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="rotulo mb-5 flex items-center gap-3 text-[#d9a15e]"><span className="h-px w-8 bg-[#d9a15e]" />Vamos conversar</p>
          <h2 className="display text-[clamp(2.4rem,6.4vw,5.6rem)] font-medium leading-[.98]">Seu empreendimento merece um caminho <em className="text-[#d9a15e]">limpo</em>.</h2>
        </div>
        <form onSubmit={enviar} className="flex flex-col gap-7 self-end">
          <label className="block"><span className="rotulo text-papel/60">Seu nome</span><input required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={campo} placeholder="Como podemos te chamar?" /></label>
          <label className="block"><span className="rotulo text-papel/60">Empresa</span><input value={f.empresa} onChange={(e) => setF({ ...f, empresa: e.target.value })} className={campo} placeholder="Opcional" /></label>
          <label className="block"><span className="rotulo text-papel/60">Sobre o projeto</span><textarea required rows={3} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} className={`${campo} resize-none`} placeholder="Atividade, local, fase em que está" /></label>
          <Magnetico as="button" type={'submit' as never} className="rotulo inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-[#d9a15e] px-8 py-4 text-tinta transition-colors hover:bg-papel">
            Enviar pelo WhatsApp <ArrowUpRight size={16} />
          </Magnetico>
        </form>
      </div>
      <footer className="border-t border-papel/15">
        <div className="rotulo mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-7 text-papel/55 md:flex-row md:px-8">
          <span>© Caeté Engenharia Ambiental · empresa fictícia</span>
          <span>Projeto de demonstração · LBK Studio</span>
        </div>
      </footer>
    </section>
  )
}
