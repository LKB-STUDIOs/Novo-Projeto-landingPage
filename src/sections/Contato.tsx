import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { Magnetico } from "../components/Magnetico";
import { IconeWhats } from "../components/Icones";
import { linkWhatsApp, mensagemPedido, WHATSAPP_EXIBICAO } from "../lib/contato";

const SERVICOS = ["Site", "Landing page", "Loja virtual", "Sistema", "Automação / IA", "Ainda não sei"];

export function Contato() {
  const id = useId();
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [servico, setServico] = useState("Site");
  const [detalhes, setDetalhes] = useState("");

  const mensagem = mensagemPedido({ nome, empresa, servico, detalhes });

  // nada é enviado a servidor nenhum: o botão só abre o WhatsApp com a mensagem pronta
  const abrir = (e: FormEvent) => {
    e.preventDefault();
    window.open(linkWhatsApp(mensagem), "_blank", "noopener,noreferrer");
  };

  return (
    <section className="contato" id="contato">
      <h2 className="contato-titulo">
        Vamos construir <br />
        <span className="destaque">o seu?</span>
      </h2>
      <div className="contato-grade">
        <form className="contato-form" onSubmit={abrir} aria-describedby={`${id}-priv`}>
          <fieldset className="contato-servicos">
            <legend>O que você precisa?</legend>
            {SERVICOS.map((s) => (
              <label key={s} className={servico === s ? "on" : ""}>
                <input type="radio" name="servico" value={s} checked={servico === s} onChange={() => setServico(s)} />
                {s}
              </label>
            ))}
          </fieldset>
          <div className="contato-campos">
            <label>
              Seu nome
              <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} autoComplete="name" placeholder="Como podemos te chamar?" />
            </label>
            <label>
              Empresa <small>(opcional)</small>
              <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} maxLength={100} autoComplete="organization" placeholder="Nome do negócio" />
            </label>
            <label className="inteiro">
              Conte um pouco <small>(opcional)</small>
              <textarea value={detalhes} onChange={(e) => setDetalhes(e.target.value)} maxLength={400} rows={3} placeholder="Ex.: quero um site para minha clínica com agendamento" />
            </label>
          </div>
          <button className="btn btn-zap" type="submit">
            <IconeWhats /> Enviar pelo WhatsApp
          </button>
          <p className="contato-priv" id={`${id}-priv`}>
            Seus dados não ficam salvos neste site: o botão só abre o WhatsApp com a mensagem pronta para você enviar.
          </p>
        </form>
        <aside className="contato-previa" aria-live="polite">
          <p className="eyebrow">Prévia da mensagem</p>
          <div className="balao">
            <AnimatePresence mode="popLayout">
              <motion.pre key={mensagem} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {mensagem}
              </motion.pre>
            </AnimatePresence>
          </div>
          <p className="contato-direto">
            Prefere ligar ou chamar direto?
            <Magnetico className="contato-numero" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
              {WHATSAPP_EXIBICAO}
            </Magnetico>
          </p>
        </aside>
      </div>
    </section>
  );
}
