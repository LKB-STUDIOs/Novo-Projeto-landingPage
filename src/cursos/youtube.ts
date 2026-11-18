/** Aceita o link do YouTube (watch, youtu.be, embed, shorts) ou só o código de 11 caracteres. */
export function extrairIdYoutube(entrada: string): string | null {
  const texto = entrada.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(texto)) return texto;
  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = /^\/(embed|shorts|live)\/([^/]+)/.exec(url.pathname);
      id = m?.[2] ?? null;
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

/** Endereço do player. Domínio "nocookie": o YouTube não grava cookies de quem só abriu a página. */
export function urlDoPlayer(id: string): string {
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error("Código de vídeo inválido");
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}
