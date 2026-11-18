import { defineConfig } from "vitest/config";
import { loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { montarCsp, origemDoSupabase } from "./vite.csp.ts";

function securityHeaders(csp: string): Plugin {
  return {
    name: "lbk-csp",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace("<!--CSP-->", `<meta http-equiv="Content-Security-Policy" content="${csp}" />`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const csp = montarCsp(origemDoSupabase(env.VITE_SUPABASE_URL));
  return {
    // GitHub Pages publica em /<repositório>/; em domínio próprio ou Vercel, BASE_PATH=/
    base: process.env.BASE_PATH ?? "/",
    plugins: [react(), securityHeaders(csp)],
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
  };
});
