export const SENHA_MIN = 8;

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.length <= 254;
}

/** Devolve a mensagem de erro, ou null se a senha serve. */
export function erroDeSenha(senha: string): string | null {
  if (senha.length < SENHA_MIN) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
  if (senha.length > 72) return "A senha pode ter no máximo 72 caracteres.";
  if (!/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) return "Use letras e números na senha.";
  return null;
}

export function nomeLimpo(nome: string): string {
  // remove caracteres de controle e de direção invisíveis, como no formulário de contato
  return nome.replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g, "").trim().slice(0, 80);
}

/**
 * Para onde voltar depois do login. Só aceita caminhos internos da área de cursos:
 * impede que alguém monte um link de login que mande a pessoa para outro site.
 */
export function destinoSeguro(voltar: string | null): string {
  const padrao = "/cursos/minha-area";
  if (!voltar) return padrao;
  if (!/^\/cursos(\/[A-Za-z0-9\-_/]*)?$/.test(voltar)) return padrao;
  if (voltar.includes("//")) return padrao;
  return voltar;
}
