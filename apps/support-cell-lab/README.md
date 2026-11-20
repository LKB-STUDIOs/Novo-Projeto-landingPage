# Support Cell Lab

Site de assistência técnica premium para **iPhone** e **Samsung Galaxy S**, com modelos 3D interativos.

- **Showroom 360°** estilo concessionária: gire o aparelho com o mouse, troque cor e armazenamento, vistas prontas (frente, traseira, lateral, câmeras).
- **Laboratório 3D de reparos**: vista explodida do celular com placa-mãe, bateria, Face ID, câmeras, bobina de carregamento e mais; clique numa peça para ver o reparo, tempo e preço.
- **Orçamento instantâneo** em 3 passos, enviado pelo WhatsApp.

## Tecnologias

React 19 · TypeScript · Vite · Three.js com React Three Fiber e Drei · Tailwind CSS 4 · Motion · Lenis

## Rodando

```bash
npm install
npm run dev
```

No Windows, se o PowerShell bloquear scripts, use `npm.cmd run dev` ou dê dois cliques em `iniciar.cmd`.

## Personalização

Tudo fica em `src/data.ts`: número do WhatsApp (`WHATSAPP`), endereço (`STORE`), produtos, preços e reparos.
Os modelos 3D ficam em `public/models/` — veja `public/models/LEIA-ME.md`.

## Créditos dos modelos 3D

Modelos baixados do Sketchfab (licenças CC BY 4.0 e Sketchfab Free Standard); autores listados no rodapé do site e em `MODEL_CREDITS` em `src/data.ts`.
iPhone é marca da Apple Inc.; Galaxy é marca da Samsung Electronics. Assistência independente, não autorizada.
