import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Content-Security-Policy injetada só no build (o servidor de desenvolvimento usa scripts inline).
 * O site não tem back-end nem formulário que envie dados: o único destino externo é o WhatsApp.
 * frame-ancestors e HSTS não funcionam via <meta>: ficam em public/_headers e vercel.json.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

function securityHeaders(): Plugin {
  return {
    name: "lbk-csp",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "<!--CSP-->",
        `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

export default defineConfig({
  // GitHub Pages publica em /<repositório>/; em domínio próprio ou Vercel, BASE_PATH=/
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), securityHeaders()],
  build: {
    target: "es2022",
    sourcemap: false,
    cssCodeSplit: true,
    // nada de fontes ou imagens embutidas como data: — mantém a CSP restrita
    assetsInlineLimit: 0,
    // a cena 3D (three.js) é importada sob demanda e sai num arquivo próprio
    chunkSizeWarningLimit: 1000,
  },
  test: { environment: "node" },
});
