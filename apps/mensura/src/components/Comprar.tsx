import type { Curso } from "../cursos";
import { linkWhatsApp, mensagemCompra } from "../lib/whatsapp";
import { IconeWhats, Seta } from "./Icones";

/** Botão de compra: vai para o link de pagamento do curso ou, se não houver, para o WhatsApp. */
export function Comprar({ curso, rotulo = "Quero este curso", classe = "btn btn-acento" }: { curso: Curso; rotulo?: string; classe?: string }) {
  const temCheckout = /^https:\/\//.test(curso.checkout);
  return (
    <a className={classe} href={temCheckout ? curso.checkout : linkWhatsApp(mensagemCompra(curso.titulo))} target="_blank" rel="noopener noreferrer">
      {temCheckout ? <Seta /> : <IconeWhats size={18} />}
      <span>{rotulo}</span>
    </a>
  );
}
