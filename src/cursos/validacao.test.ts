import { describe, expect, it } from "vitest";
import { destinoSeguro, emailValido, erroDeSenha, nomeLimpo } from "./validacao";

describe("destinoSeguro (para onde voltar depois do login)", () => {
  it("aceita caminhos da área de cursos", () => {
    expect(destinoSeguro("/cursos/meu-curso/aula/abc-123")).toBe("/cursos/meu-curso/aula/abc-123");
    expect(destinoSeguro("/cursos")).toBe("/cursos");
  });
  it("usa a página padrão quando não há destino", () => {
    expect(destinoSeguro(null)).toBe("/cursos/minha-area");
    expect(destinoSeguro("")).toBe("/cursos/minha-area");
  });
  it("recusa qualquer endereço de outro site", () => {
    for (const mau of ["https://golpe.com", "//golpe.com", "/\\golpe.com", "javascript:alert(1)", "/cursos//golpe.com", "/outra-pagina", "/cursos/../admin", "/cursosx"]) {
      expect(destinoSeguro(mau), mau).toBe("/cursos/minha-area");
    }
  });
});

describe("validação de cadastro", () => {
  it("e-mail", () => {
    expect(emailValido("ana@exemplo.com")).toBe(true);
    expect(emailValido(" ana@exemplo.com ")).toBe(true);
    for (const mau of ["", "ana", "ana@", "@exemplo.com", "ana@exemplo", "a na@exemplo.com"]) expect(emailValido(mau), mau).toBe(false);
  });
  it("senha", () => {
    expect(erroDeSenha("abc12345")).toBeNull();
    expect(erroDeSenha("curta1")).toMatch(/8 caracteres/);
    expect(erroDeSenha("somenteletras")).toMatch(/letras e números/);
    expect(erroDeSenha("12345678")).toMatch(/letras e números/);
    expect(erroDeSenha("a1".repeat(40))).toMatch(/no máximo/);
  });
  it("limpa o nome", () => {
    expect(nomeLimpo("  Ana\u0000 ‮Silva​ ")).toBe("Ana Silva");
    expect(nomeLimpo("x".repeat(200)).length).toBe(80);
  });
});
