import { describe, expect, it } from "vitest";
import { extrairIdYoutube, urlDoPlayer } from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("extrairIdYoutube", () => {
  it("aceita as formas comuns de link", () => {
    for (const entrada of [
      ID,
      `https://www.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/watch?v=${ID}&t=42s`,
      `https://youtu.be/${ID}`,
      `https://youtu.be/${ID}?si=abc`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube-nocookie.com/embed/${ID}`,
    ])
      expect(extrairIdYoutube(entrada), entrada).toBe(ID);
  });
  it("recusa o que não é do YouTube", () => {
    for (const mau of ["", "oi", "https://vimeo.com/123456789", `https://youtube.com.golpe.com/watch?v=${ID}`, "https://www.youtube.com/watch?v=curto", `javascript:alert("${ID}")`])
      expect(extrairIdYoutube(mau), mau).toBeNull();
  });
});

describe("urlDoPlayer", () => {
  it("usa o domínio sem cookies", () => {
    const url = new URL(urlDoPlayer(ID));
    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe(`/embed/${ID}`);
  });
  it("não deixa montar endereço com código inválido", () => {
    expect(() => urlDoPlayer('x" onload="alert(1)')).toThrow();
    expect(() => urlDoPlayer("../../outra")).toThrow();
  });
});
