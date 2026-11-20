/** Ferrus OS — utilitários: números aleatórios com semente, datas e formatação. */

/** Gerador com semente fixa: a demonstração mostra sempre os mesmos números para todo mundo. */
export function criarSorteio(semente: number) {
  let s = semente >>> 0;
  const r = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const entre = (a: number, b: number) => Math.floor(a + r() * (b - a + 1));
  const real = (a: number, b: number) => a + r() * (b - a);
  const um = <T,>(lista: readonly T[]) => lista[Math.floor(r() * lista.length)]!;
  const varios = <T,>(lista: readonly T[], n: number) => [...lista].sort(() => r() - 0.5).slice(0, n);
  const peso = <T,>(pares: readonly (readonly [T, number])[]) => {
    const total = pares.reduce((s2, p) => s2 + p[1], 0);
    let x = r() * total;
    for (const [v, p] of pares) {
      x -= p;
      if (x <= 0) return v;
    }
    return pares[pares.length - 1]![0];
  };
  /** distribuição aproximadamente normal (soma de uniformes) */
  const normal = (media: number, desvio: number) => media + ((r() + r() + r() + r() + r() + r() - 3) / 1.0) * desvio;
  return { r, entre, real, um, varios, peso, normal };
}
export type Sorteio = ReturnType<typeof criarSorteio>;

export const iso = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const diasAtras = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
export const diasAte = (data: string) => {
  const hoje = new Date(iso(new Date()) + "T00:00:00").getTime();
  return Math.round((new Date(data + "T00:00:00").getTime() - hoje) / 864e5);
};
export const br = (s: string) => s.slice(0, 10).split("-").reverse().join("/");
export const brCurta = (s: string) => br(s).slice(0, 5);

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
/** últimos n meses, do mais antigo ao atual: ["dez", "jan", ...] */
export function ultimosMeses(n: number) {
  const hoje = new Date();
  return [...Array(n)].map((_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (n - 1 - i), 1);
    return MESES[d.getMonth()]!;
  });
}
export const ultimosDias = (n: number) => [...Array(n)].map((_, i) => diasAtras(n - 1 - i));

export const fmt = (n: number, casas = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
export const pct = (n: number, casas = 1) => fmt(n, casas) + "%";
export const real = (n: number) => "R$ " + fmt(n, 0);
/** 1.234.567 → "1,23 mi"; 12.345 → "12,3 mil" */
export function compacto(n: number) {
  const a = Math.abs(n);
  if (a >= 1e6) return fmt(n / 1e6, a >= 1e7 ? 1 : 2) + " mi";
  if (a >= 1e4) return fmt(n / 1e3, 1) + " mil";
  return fmt(n);
}
export const realCompacto = (n: number) => "R$ " + compacto(n);

export const iniciais = (nome: string) =>
  nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");

export const soma = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
export const media = (xs: number[]) => (xs.length ? soma(xs) / xs.length : 0);
export const limitar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** CSV separado por ponto e vírgula (Excel em português), protegido contra injeção de fórmulas. */
export function paraCSV<T extends Record<string, unknown>>(linhas: T[], colunas: (keyof T & string)[]): string {
  const celula = (v: unknown) => {
    let s = String(Array.isArray(v) ? v.join(", ") : (v ?? ""));
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [colunas.join(";"), ...linhas.map((l) => colunas.map((c) => celula(l[c])).join(";"))].join("\n");
}

export function baixarArquivo(nome: string, conteudo: string, tipo = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob(["﻿" + conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
