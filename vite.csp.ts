/**
 * Content-Security-Policy injetada só no build (o servidor de desenvolvimento usa scripts inline).
 * Destinos externos permitidos:
 *  - o projeto Supabase (login e dados da área de cursos), quando VITE_SUPABASE_URL está definida;
 *  - o player do YouTube em modo "nocookie" (vídeos das aulas), só como iframe.
 * frame-ancestors e HSTS não funcionam via <meta>: ficam em public/_headers e vercel.json.
 */
export function origemDoSupabase(valor: string | undefined): string | null {
  if (!valor) return null;
  try {
    const origem = new URL(valor).origin;
    // só letras, números, ponto e hífen: nada que possa abrir outra regra dentro da política
    return /^https:\/\/[a-z0-9.-]+$/i.test(origem) ? origem : null;
  } catch {
    return null;
  }
}

export function montarCsp(supabase: string | null): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "font-src 'self'",
    `connect-src 'self'${supabase ? ` ${supabase}` : ""}`,
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-src https://www.youtube-nocookie.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}
