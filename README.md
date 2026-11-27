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
| `/projetos/ferrus` | **Ferrus OS**: demonstração do sistema de gestão industrial com 13 módulos (dados fictícios, salvos só no navegador) |
| `/projetos/brisa` | **Brisa Temporadas**: vitrine de imóveis com reserva no Airbnb |
| `/casa-beulah-park/` | **Lume Residence**: página estática de um imóvel, com tour em vídeo que acompanha a rolagem e detalhes de cada ambiente (arquivos em `public/casa-beulah-park/`) |

Cada página é baixada só quando o visitante abre. O Three.js (a parte mais pesada) carrega depois que a página já apareceu.

## Estrutura

```
src/main.tsx              rotas
src/pages/Home.tsx        página principal + coreografia de scroll (GSAP ScrollTrigger)
src/pages/home.css        visual da página principal
src/sections/             seções da página principal
src/components/           nav, preloader, botões magnéticos, WhatsApp flutuante…
src/three/                cena 3D (partículas que mudam de forma, formas flutuantes)
src/lib/contato.ts        número do WhatsApp e montagem segura dos links
src/pages/ferrus/         Ferrus OS (veja abaixo)
src/pages/brisa/          Brisa Temporadas (imóveis em imoveis.ts)
public/equipe/            fotos da equipe: lahel.jpg, bruno.jpg, kenni.jpg (veja LEIA-ME.txt)
```

**Trocar o WhatsApp:** edite `src/lib/contato.ts`. Todos os botões usam esse arquivo.
**Trocar imóveis da Brisa:** edite `src/pages/brisa/imoveis.ts` e, no campo `airbnb`, cole o link do anúncio real.

### Ferrus OS (`src/pages/ferrus/`)

Painel de gestão industrial de uma empresa fictícia (Metalúrgica Aurora, 3 unidades). Cada módulo tem endereço próprio: `/projetos/ferrus/<módulo>`.

| Módulo | O que mostra |
|---|---|
| Visão geral | Faturamento x meta, OEE por unidade, eventos ao vivo, saúde das áreas, alertas, plano de ação |
| Produção | OEE, status das 28 máquinas, apontamento de produção, registros com busca e exportação CSV |
| Qualidade | Carta de controle (CEP) com Cp/Cpk, Pareto, quadro de NCs, reclamações de clientes pelo 8D |
| Engenharia | Projetos PPAP (fases APQP e 18 elementos), mudanças de engenharia, estrutura de produto com custo |
| Manutenção | MTBF/MTTR, ordens de serviço, mapa de calor de paradas, preventiva de moldes |
| Compras | Gasto x orçamento, aprovação de requisições, pedidos, avaliação de fornecedores (IQF) |
| Logística | Expedição por etapas, OTD, posição de estoque com mínimo e máximo |
| Metrologia e Laboratório | Calibração de instrumentos, estudos de MSA, ensaios comparados com a especificação |
| Ambiental | Água, energia, emissões, resíduos, licenças |
| Segurança do trabalho | Dias sem acidente, pirâmide de Bird, ocorrências, treinamentos NR |
| TI | Chamados com SLA, inventário, conformidade ISO 27001, disponibilidade dos serviços |
| Usuários e acesso | Liberação de cadastros, matriz de permissões por perfil, auditoria |

Também tem busca rápida (Ctrl+K ou ⌘K), filtro por unidade, notificações, tema claro e escuro, e funciona no celular.

| Arquivo | Para quê |
|---|---|
| `dados.ts` | gera os dados fictícios (semente fixa: todo visitante vê os mesmos números) |
| `nucleo.ts` | datas, formatação, CSV |
| `graficos.tsx` | gráficos em SVG puro, sem biblioteca |
| `ui.tsx` | componentes (indicador, tabela, quadro kanban, abas, janela) |
| `modulos/` | uma tela por área |
| `ferrus.css` | visual, com as cores do tema em variáveis no começo do arquivo |

As alterações feitas na demonstração ficam só no navegador de quem abre e voltam ao padrão no dia seguinte, ou pelo botão "Restaurar dados" no rodapé.

### Lume Residence (Beulah Park) (`public/casa-beulah-park/`)

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

## Direitos autorais

© LBK Studio. Todos os direitos reservados. O código está público para consulta e portfólio; copiar, modificar, redistribuir ou usar comercialmente exige autorização por escrito. Veja `LICENSE`.

## Microsites com build próprio

Projetos completos que têm o próprio `package.json` ficam em `apps/` e são gerados dentro do `dist/` pelo `scripts/postbuild.mjs`:

| Pasta | Publicado em |
| --- | --- |
| `apps/support-cell-lab` | `/support-cell-lab/` |
| `apps/caete` | `/caete/` |
| `apps/mensura` | `/mensura/` |

Para trabalhar em um deles: `cd apps/support-cell-lab && npm install && npm run dev`.

### Caeté Engenharia Ambiental (`apps/caete`)

Portfólio de uma consultoria de licenciamento ambiental (empresa, clientes e números **fictícios**). React 19 + Vite + Tailwind 4, GSAP (ScrollTrigger e SplitText), Motion e Lenis. Fontes: Work Sans, Fraunces e IBM Plex Mono.

- **Vídeo de fundo do hero:** `public/media/hero.mp4` (18 s, 1280×720, sem áudio, ~4 MB) e `hero-poster.jpg`. Imagem de mata em vale do Pixabay (Pixabay Content License, uso livre), cortada com *crossfade* de 2 s para o loop não dar salto. Para trocar, substitua os dois arquivos mantendo os nomes.
- **Textos, clientes e cases:** `src/lib/data.ts`.
- **WhatsApp do formulário:** constante `WHATSAPP` em `src/components/Contato.tsx` (hoje é um número fictício).

### Mensura · Escola de Metrologia (`apps/mensura`)

Plataforma de cursos de metrologia com aulas do YouTube tocando dentro do site, área do aluno e botão do WhatsApp. React 19 + Vite, sem back-end. Rotas pelo `#` (`#/curso/<slug>`, `#/curso/<slug>/aula/<id>`, `#/aluno`), então funciona em qualquer hospedagem estática.

| Arquivo | O que trocar |
| --- | --- |
| `src/config.ts` | nome da escola, WhatsApp, dados do professor, depoimentos e códigos de acesso. `DEMONSTRACAO = true` mostra os avisos de dados fictícios |
| `src/cursos.ts` | cursos, preços, link de pagamento (`checkout`), módulos, aulas e o link do YouTube de cada aula |
| `src/estilo.css` | cores e fontes (variáveis no começo do arquivo) |

- **Vídeos:** cole o link do YouTube no campo `youtube` da aula. O player só carrega quando o aluno clica e usa `youtube-nocookie.com`. Aulas com `gratis: true` ficam abertas para qualquer visitante.
- **Compra:** o botão abre o `checkout` do curso (Mercado Pago, Hotmart, Kiwify…) ou, se estiver vazio, o WhatsApp com a mensagem pronta.
- **Área do aluno:** o aluno digita nome e código de acesso; o progresso fica salvo no navegador dele. Para criar um código: `npm run codigo -- TURMA-MARCO-26` e cole a linha em `CODIGOS_ACESSO`. **Apague o código de teste `DEMO-METRO` antes de vender.**
- **Limite importante:** sem servidor, o bloqueio das aulas pagas é só de interface. Quem souber mexer no código do site encontra os links dos vídeos. Publique as aulas pagas como "Não listado" no YouTube e, quando precisar de proteção real (login por aluno, acesso com prazo), use um back-end (Supabase, Firebase) ou a área de membros de uma plataforma como Hotmart ou Kiwify.
- **Dados de demonstração:** professor (Prof. Rafael Monteiro), números e depoimentos são fictícios, e as 31 aulas usam vídeos públicos de outros canais do YouTube como exemplo (o canal aparece como crédito abaixo do player). Troque tudo antes de vender e mude `DEMONSTRACAO` para `false`.
- **Professor 3D** (`src/components/professor3d.ts`): boneco feito só com formas do three.js, de jaleco, óculos e crachá, segurando um paquímetro que abre e fecha; a cabeça segue o mouse. O three.js só é baixado quando a seção chega perto da tela.
- **Página do paquímetro interativo** (`src/components/Paquimetro.tsx`): nônio de 0,05 mm, com modo explorar e modo desafio.
