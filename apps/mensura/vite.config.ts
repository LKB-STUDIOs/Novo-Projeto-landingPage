import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Content-Security-Policy injetada só no build (o servidor de desenvolvimento usa scripts inline).
 * Destinos externos permitidos: os vídeos do YouTube (player sem cookies) e as miniaturas deles.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: https://i.ytimg.com",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "upgrade-insecure-requests",
].join("; ");

function csp(): Plugin {
  return {
    name: "mensura-csp",
    apply: "build",
    transformIndexHtml: (html) =>
      html.replace("<!--CSP-->", `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
  };
}

export default defineConfig({
  plugins: [react(), csp()],
  build: { target: ["es2022", "safari15"], assetsInlineLimit: 0, sourcemap: false },
});
