// GitHub Pages: qualquer rota desconhecida cai no 404.html, que é o próprio app (SPA).
import { copyFileSync } from "node:fs";
copyFileSync("dist/index.html", "dist/404.html");
console.log("404.html criado para as rotas do app");
