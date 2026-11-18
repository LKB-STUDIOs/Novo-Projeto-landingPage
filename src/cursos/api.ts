import type { CursosApi } from "./tipos";

let promessa: Promise<CursosApi> | null = null;

/**
 * Escolhe o servidor. Com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY definidos, usa o Supabase;
 * sem eles, cai na demonstração. O código do Supabase só é baixado quando alguém abre /cursos.
 */
export function obterApi(): Promise<CursosApi> {
  promessa ??= (async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && chave) {
      const { criarApiSupabase } = await import("./supabaseApi");
      const voltarPara = new URL(`${import.meta.env.BASE_URL}cursos/entrar`, window.location.origin).toString();
      return criarApiSupabase(url, chave, voltarPara);
    }
    const { criarApiDemo } = await import("./demoApi");
    let memoria: Storage | null = null;
    try {
      memoria = window.localStorage;
    } catch {
      /* navegador bloqueou o armazenamento */
    }
    const fallback = new Map<string, string>();
    return criarApiDemo(memoria ?? { getItem: (k) => fallback.get(k) ?? null, setItem: (k, v) => void fallback.set(k, v) });
  })();
  return promessa;
}
