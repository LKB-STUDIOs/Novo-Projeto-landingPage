// Roda depois do build do portfólio.
// 1. GitHub Pages: qualquer rota desconhecida cai no 404.html, que é o próprio app (SPA).
// 2. Microsites com build próprio (pasta apps/) são gerados dentro de dist/<pasta>/.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

copyFileSync("dist/index.html", "dist/404.html");
console.log("404.html criado para as rotas do app");

const base = (process.env.BASE_PATH ?? "/").replace(/\/?$/, "/");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const MICROSITES = [{ pasta: "apps/support-cell-lab", rota: "support-cell-lab" },
  { pasta: "apps/caete", rota: "caete" },
  { pasta: "apps/mensura", rota: "mensura" },
];

for (const { pasta, rota } of MICROSITES) {
  if (!existsSync(pasta)) continue;
  const saida = resolve("dist", rota);
  console.log(`\n→ ${pasta} em ${base}${rota}/`);
  execFileSync(npm, ["ci", "--no-audit", "--no-fund"], { cwd: pasta, stdio: "inherit" });
  execFileSync(npm, ["run", "build", "--", "--base", `${base}${rota}/`, "--outDir", saida, "--emptyOutDir"], {
    cwd: pasta,
    stdio: "inherit",
  });
}
