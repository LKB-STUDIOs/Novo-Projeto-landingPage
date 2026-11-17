import { motion } from "motion/react";
import { Escudo } from "../components/Icones";

const ITENS = [
  ["HTTPS e cabeçalhos de segurança", "Conexão criptografada, proteção contra clickjacking e política de conteúdo restrita (CSP)."],
  ["Sem dados à toa", "Coletamos só o necessário e seguimos a LGPD. Neste site, por exemplo, nenhum dado é guardado."],
  ["Dependências auditadas", "Bibliotecas com versões fixas e verificadas contra vulnerabilidades conhecidas."],
  ["Rápido em qualquer lugar", "Carregamento sob demanda, imagens leves e fontes hospedadas no próprio site."],
];

export function Seguranca() {
  return (
    <section className="seguranca" aria-labelledby="titulo-seguranca">
      <div className="cabeca">
        <p className="eyebrow">Segurança desde a primeira linha</p>
        <h2 id="titulo-seguranca">
          Bonito por fora, <span className="destaque">blindado</span> por dentro.
        </h2>
      </div>
      <div className="seguranca-grade">
        {ITENS.map(([t, d], i) => (
          <motion.div
            className="seg-item"
            key={t}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="seg-icone"><Escudo size={22} /></span>
            <h3>{t}</h3>
            <p>{d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
