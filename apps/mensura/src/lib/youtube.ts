const ID = /^[\w-]{11}$/;

/** Aceita o ID ou qualquer link comum do YouTube e devolve só o ID de 11 caracteres (ou null). */
export function idYoutube(valor: string): string | null {
  const v = valor.trim();
  if (!v) return null;
  if (ID.test(v)) return v;
  let candidato: string | null = null;
  try {
    const u = new URL(v);
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    const partes = u.pathname.split("/").filter(Boolean);
    if (host === "youtu.be") candidato = partes[0] ?? null;
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      candidato = u.searchParams.get("v") ?? (["embed", "shorts", "live", "v"].includes(partes[0]) ? partes[1] : null);
    }
  } catch {
    return null;
  }
  return candidato && ID.test(candidato) ? candidato : null;
}

export const miniatura = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const player = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
