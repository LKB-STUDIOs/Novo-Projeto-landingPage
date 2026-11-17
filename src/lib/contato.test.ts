import { describe, expect, it } from "vitest";
import { limparTexto, linkWhatsApp, mensagemPedido, WHATSAPP_NUMERO } from "./contato";

describe("contato", () => {
  it("monta link do WhatsApp com o número oficial e texto codificado", () => {
    const url = new URL(linkWhatsApp("Olá & tudo bem? <script>"));
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe(`/${WHATSAPP_NUMERO}`);
    expect(url.searchParams.get("text")).toBe("Olá & tudo bem? <script>");
    expect(url.toString()).not.toContain("<script>");
  });

  it("remove caracteres de controle e de direção invisíveis", () => {
    expect(limparTexto("a\u0000b‮c​d")).toBe("abcd");
  });

  it("limita o tamanho", () => {
    expect(limparTexto("x".repeat(5000)).length).toBe(600);
    expect(mensagemPedido({ nome: "y".repeat(500), empresa: "", servico: "Site", detalhes: "" }).length).toBeLessThan(200);
  });

  it("não deixa injetar outro número", () => {
    const url = new URL(linkWhatsApp("https://wa.me/5511000000000"));
    expect(url.pathname).toBe(`/${WHATSAPP_NUMERO}`);
  });
});
