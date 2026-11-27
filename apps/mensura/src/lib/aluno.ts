import { useSyncExternalStore } from "react";
import { CODIGOS_ACESSO } from "../config";
import { CURSOS } from "../cursos";

/*
 * Área do aluno sem servidor: nome, cursos liberados e progresso ficam salvos
 * no navegador do próprio aluno (localStorage). Trocar de aparelho = digitar o código de novo.
 */

export type Aluno = {
  nome: string;
  liberados: string[];
  concluidas: string[]; // "curso/aula"
  ultima?: { curso: string; aula: string };
};

const CHAVE = "mensura-aluno-v1";
const VAZIO: Aluno = { nome: "", liberados: [], concluidas: [] };

function ler(): Aluno {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return VAZIO;
    const d = JSON.parse(bruto) as Partial<Aluno>;
    return {
      nome: typeof d.nome === "string" ? d.nome.slice(0, 60) : "",
      liberados: Array.isArray(d.liberados) ? d.liberados.filter((s) => typeof s === "string") : [],
      concluidas: Array.isArray(d.concluidas) ? d.concluidas.filter((s) => typeof s === "string") : [],
      ultima: d.ultima && typeof d.ultima.curso === "string" && typeof d.ultima.aula === "string" ? d.ultima : undefined,
    };
  } catch {
    return VAZIO;
  }
}

let atual = ler();
const ouvintes = new Set<() => void>();

function salvar(novo: Aluno) {
  atual = novo;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(novo));
  } catch {
    /* modo privado: continua funcionando só nesta aba */
  }
  ouvintes.forEach((f) => f());
}

window.addEventListener("storage", (e) => {
  if (e.key === CHAVE) {
    atual = ler();
    ouvintes.forEach((f) => f());
  }
});

export function useAluno() {
  return useSyncExternalStore(
    (f) => (ouvintes.add(f), () => ouvintes.delete(f)),
    () => atual,
  );
}

export const definirNome = (nome: string) => salvar({ ...atual, nome: nome.trim().slice(0, 60) });
export const sair = () => salvar(VAZIO);
export const temAcesso = (a: Aluno, curso: string) => a.liberados.includes(curso);
export const concluida = (a: Aluno, curso: string, aula: string) => a.concluidas.includes(`${curso}/${aula}`);

export function alternarConcluida(curso: string, aula: string) {
  const k = `${curso}/${aula}`;
  const lista = atual.concluidas.includes(k) ? atual.concluidas.filter((x) => x !== k) : [...atual.concluidas, k];
  salvar({ ...atual, concluidas: lista });
}

export function marcarUltima(curso: string, aula: string) {
  if (atual.ultima?.curso === curso && atual.ultima.aula === aula) return;
  salvar({ ...atual, ultima: { curso, aula } });
}

async function sha256(texto: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Confere o código e libera os cursos. Devolve os títulos liberados (vazio = código inválido). */
export async function ativarCodigo(codigo: string): Promise<string[]> {
  const limpo = codigo.trim().toUpperCase().slice(0, 64);
  if (!limpo) return [];
  if (!crypto?.subtle) throw new Error("O navegador bloqueou a verificação. Abra o site pelo endereço com https://.");
  const hash = await sha256(limpo);
  const achado = CODIGOS_ACESSO.find((c) => c.hash === hash);
  if (!achado) return [];
  const slugs = achado.cursos === "todos" ? CURSOS.map((c) => c.slug) : achado.cursos;
  salvar({ ...atual, liberados: Array.from(new Set([...atual.liberados, ...slugs])) });
  return CURSOS.filter((c) => slugs.includes(c.slug)).map((c) => c.titulo);
}
