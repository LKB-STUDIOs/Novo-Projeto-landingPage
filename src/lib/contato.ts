/** Contato oficial. O site não coleta nem guarda dados: tudo vira um link para o WhatsApp. */
export const WHATSAPP_NUMERO = "5547999687738";
export const WHATSAPP_EXIBICAO = "(47) 9 9968-7738";
export const EMPRESA = "LBK Studio";

const LIMITE = 600;

/** Remove caracteres de controle e limita o tamanho antes de montar o link. */
export function limparTexto(texto: string, limite = LIMITE): string {
  return texto
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, limite);
}

/** Link seguro para o WhatsApp com a mensagem já escrita. */
export function linkWhatsApp(mensagem = "Olá! Vim pelo site da LBK Studio e quero um orçamento."): string {
  const url = new URL(`https://wa.me/${WHATSAPP_NUMERO}`);
  url.searchParams.set("text", limparTexto(mensagem));
  return url.toString();
}

export type Pedido = { nome: string; empresa: string; servico: string; detalhes: string };

export function mensagemPedido(p: Pedido): string {
  const linhas = [
    `Olá! Meu nome é ${limparTexto(p.nome, 80) || "—"}.`,
    p.empresa && `Empresa: ${limparTexto(p.empresa, 100)}`,
    `Tenho interesse em: ${limparTexto(p.servico, 80)}`,
    p.detalhes && `\n${limparTexto(p.detalhes, 400)}`,
  ].filter(Boolean);
  return linhas.join("\n");
}
