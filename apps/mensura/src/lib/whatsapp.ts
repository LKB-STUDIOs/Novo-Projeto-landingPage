import { MARCA, WHATSAPP } from "../config";

/** Remove caracteres invisíveis/de controle e limita o tamanho antes de montar o link. */
export function limparTexto(texto: string, limite = 600): string {
  return texto
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .trim()
    .slice(0, limite);
}

export function linkWhatsApp(mensagem = `Olá! Vim pelo site da ${MARCA.nome} e quero saber mais sobre os cursos de metrologia.`) {
  const url = new URL(`https://wa.me/${WHATSAPP.numero}`);
  url.searchParams.set("text", limparTexto(mensagem));
  return url.toString();
}

export const mensagemCompra = (curso: string) =>
  `Olá! Quero comprar o curso "${curso}" da ${MARCA.nome}. Como faço o pagamento?`;
