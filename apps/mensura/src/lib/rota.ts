import { useSyncExternalStore } from "react";

/*
 * Rotas pelo "#" do endereço (ex.: #/curso/fundamentos). Assim o site funciona em qualquer
 * hospedagem estática, dentro de uma subpasta, sem configurar redirecionamentos.
 */

export type Rota =
  | { nome: "inicio"; secao?: string }
  | { nome: "curso"; curso: string }
  | { nome: "aula"; curso: string; aula: string }
  | { nome: "aluno" };

export function lerRota(hash = window.location.hash): Rota {
  const p = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (p[0] === "curso" && p[1] && p[2] === "aula" && p[3]) return { nome: "aula", curso: p[1], aula: p[3] };
  if (p[0] === "curso" && p[1]) return { nome: "curso", curso: p[1] };
  if (p[0] === "aluno") return { nome: "aluno" };
  return { nome: "inicio", secao: p[0] === "inicio" ? p[1] : undefined };
}

export const href = {
  inicio: (secao?: string) => (secao ? `#/inicio/${secao}` : "#/"),
  curso: (c: string) => `#/curso/${encodeURIComponent(c)}`,
  aula: (c: string, a: string) => `#/curso/${encodeURIComponent(c)}/aula/${encodeURIComponent(a)}`,
  aluno: () => "#/aluno",
};

export function useHash() {
  return useSyncExternalStore(
    (f) => (window.addEventListener("hashchange", f), () => window.removeEventListener("hashchange", f)),
    () => window.location.hash,
  );
}
