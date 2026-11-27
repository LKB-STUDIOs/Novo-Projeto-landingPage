// Gera o "hash" de um código de acesso para colar em src/config.ts (CODIGOS_ACESSO).
// Uso: npm run codigo -- TURMA-MARCO-26
import { createHash } from "node:crypto";

const codigo = (process.argv[2] ?? "").trim().toUpperCase();
if (!codigo) {
  console.error("Informe o código. Exemplo: npm run codigo -- TURMA-MARCO-26");
  process.exit(1);
}
const hash = createHash("sha256").update(codigo).digest("hex");
console.log(`\nCódigo: ${codigo}\nCole em CODIGOS_ACESSO:\n  { hash: "${hash}", cursos: ["slug-do-curso"] },\n`);
