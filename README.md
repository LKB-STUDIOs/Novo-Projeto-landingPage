# LBK Studio: site e microsites

Site da **LBK Studio** (Lahel, Bruno e Kenni) em **React 19 + Vite 8 + TypeScript**, com animações em **GSAP**, **Motion** e **Three.js** (React Three Fiber).

## Rodar

```bash
npm ci           # instala exatamente as versões do package-lock
npm run dev      # http://localhost:5173
npm test         # testes
npm run build    # gera a pasta dist/
npm run preview  # testa o build localmente
```

Requer Node 20.19 ou mais recente.

## Páginas

| Rota | O que é |
|---|---|
| `/` | Portfólio: cena 3D guiada pela rolagem, serviços, processo, nichos, projetos, segurança, equipe e contato |
| `/projetos/ferrus` | **Ferrus OS**: demonstração do sistema de gestão industrial (dados fictícios, salvos só no navegador) |
| `/projetos/brisa` | **Brisa Temporadas**: vitrine de imóveis com reserva no Airbnb |
| `/casa-beulah-park/` | **Casa em Beulah Park**: página estática de um imóvel, com tour em vídeo que acompanha a rolagem e detalhes de cada ambiente (arquivos em `public/casa-beulah-park/`) |

Cada página é baixada só quando o visitante abre. O Three.js (a parte mais pesada) carrega depois que a página já apareceu.

## Estrutura

```
src/main.tsx              rotas
src/pages/Home.tsx        página principal + coreografia de scroll (GSAP ScrollTrigger)
src/pages/home.css        visual da página principal
src/sections/             seções da página principal
src/components/           nav, cursor, preloader, botões magnéticos, WhatsApp flutuante…
src/three/                cena 3D (partículas que mudam de forma, formas flutuantes)
src/lib/contato.ts        número do WhatsApp e montagem segura dos links
src/pages/ferrus/         Ferrus OS
src/pages/brisa/          Brisa Temporadas (imóveis em imoveis.ts)
```

**Trocar o WhatsApp:** edite `src/lib/contato.ts`. Todos os botões usam esse arquivo.
**Trocar imóveis da Brisa:** edite `src/pages/brisa/imoveis.ts` e, no campo `airbnb`, cole o link do anúncio real.

### Casa em Beulah Park (`public/casa-beulah-park/`)

Página estática (HTML, CSS e JS próprios, fora do app React). GSAP e fontes ficam no próprio site, sem CDN. O tour é o vídeo `tour-ai.mp4` (1920×1080, 30 fps; `tour-ai-720.mp4` para celular) controlado pela rolagem. Tem `noindex` enquanto estiver em rascunho.
**Antes de publicar:** troque o WhatsApp (`CONFIG.whatsapp` em `casa.js`) e confira os textos dos itens em `ROOMS`.

## Segurança

O site não tem back-end, login real nem formulário que envie dados. O formulário de contato só monta a mensagem e abre o WhatsApp.

- **Content-Security-Policy** restrita, injetada no build: só scripts, estilos e fontes do próprio site, sem `eval`, sem scripts inline, sem iframes.
- **Cabeçalhos HTTP** prontos em `public/_headers` (Netlify e Cloudflare Pages) e `vercel.json`: HSTS, anti-clickjacking, `nosniff`, Permissions-Policy.
- **Fontes hospedadas no próprio site**: nenhuma chamada ao Google Fonts, o que é melhor para a LGPD e para a velocidade.
- **Links externos** com `rel="noopener noreferrer"`. A mensagem do WhatsApp passa por limpeza: remove caracteres invisíveis e limita o tamanho.
- **Exportação CSV do Ferrus** protegida contra injeção de fórmulas no Excel.
- **Dependências**: versões fixas no `package-lock.json`, instaladas só se publicadas há pelo menos uma semana (proteção contra pacotes comprometidos). `npm audit --omit=dev` roda no deploy.
  - Aviso conhecido: o `picomatch`, usado só pelas ferramentas de build, tem um alerta de lentidão (ReDoS) ainda sem correção publicada. Ele não vai para o site.

O GitHub Pages não permite configurar cabeçalhos HTTP. Para ter HSTS e anti-clickjacking de verdade, publique na **Vercel**, **Netlify** ou **Cloudflare Pages**: os arquivos já estão prontos.

## Publicação

- **GitHub Pages**: em Settings → Pages, escolha **Source: GitHub Actions**. A cada push na `main`, o workflow testa, gera e publica.
- **Render** (recomendado): New → **Blueprint** → escolha este repositório → **Apply**. O `render.yaml` já configura o build, as rotas e os cabeçalhos de segurança.
- **Vercel, Netlify ou Cloudflare**: importe o repositório, use o comando `npm run build` e a pasta `dist`. Sem `BASE_PATH`, o site fica na raiz do domínio.
