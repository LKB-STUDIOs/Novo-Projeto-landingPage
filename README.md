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
| `/cursos` | **Plataforma de cursos**: a pessoa cria conta, se inscreve e assiste às videoaulas (veja a seção abaixo) |

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
src/pages/cursos/         telas da plataforma de cursos (catálogo, login, curso, aula, minha área)
src/cursos/               regras da plataforma: acesso ao Supabase, modo demonstração, validações
supabase/schema.sql       tabelas e regras de acesso do banco
```

**Trocar o WhatsApp:** edite `src/lib/contato.ts`. Todos os botões usam esse arquivo.
**Trocar imóveis da Brisa:** edite `src/pages/brisa/imoveis.ts` e, no campo `airbnb`, cole o link do anúncio real.

## Plataforma de cursos (`/cursos`)

Fluxo: a pessoa **cria a conta** (e-mail e senha), **se inscreve** no curso e então **assiste às aulas** em vídeo, marcando o progresso. Quem não está inscrito vê a lista de aulas, mas não o vídeo.

**Modo demonstração.** Sem as variáveis abaixo, a plataforma abre com 2 cursos de exemplo e guarda tudo só no navegador (aparece uma faixa laranja avisando). Serve para ver e testar a tela; **não é seguro nem sincroniza**.

**Para usar de verdade (Supabase, plano grátis):**

1. Crie um projeto em https://supabase.com.
2. No **SQL Editor**, cole e rode o arquivo `supabase/schema.sql`. Ele cria as tabelas e as regras de acesso.
3. Em **Project Settings → API**, copie o **Project URL** e a chave **anon / publishable**.
4. Para testar no computador, copie `.env.example` para `.env` e preencha os dois valores. Para publicar no GitHub Pages, cadastre os mesmos valores em **Settings → Secrets and variables → Actions → Variables** (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`). Na Vercel, Netlify ou Cloudflare, cadastre-os nas variáveis de ambiente do projeto.
5. Em **Authentication → URL Configuration**, ponha o endereço do site em *Site URL* e em *Redirect URLs* (precisa para o link de confirmação de e-mail voltar ao site). Em **Authentication → Providers → Email** você escolhe se exige confirmação de e-mail.
6. Cadastre os cursos em **Table Editor** (`cursos`, `aulas` e `aulas_video`) ou com o exemplo comentado no fim do `schema.sql`.

**Vídeos.** Cada aula usa um vídeo do YouTube marcado como **"Não listado"**. Em `aulas_video.youtube_id` vai o código de 11 caracteres (a parte depois de `v=` no link). O código só sai do banco para quem está inscrito, e o player usa `youtube-nocookie.com`. Limite honesto: um aluno inscrito consegue copiar o link do vídeo e passá-lo adiante. Para proteger de verdade (cursos pagos), use um serviço de vídeo com proteção por domínio, como Vimeo ou Bunny Stream.

**Inscrição.** Hoje é livre (qualquer pessoa logada se inscreve). Para cobrar, troque a regra `me inscrever` no `schema.sql` e crie as inscrições a partir do seu sistema de pagamento.

**O que ainda não existe:** recuperar senha ("esqueci a senha"), painel para cadastrar cursos dentro do próprio site (hoje é pelo painel do Supabase) e pagamento.

**Trocar o nome** da plataforma: `PLATAFORMA_NOME` em `src/cursos/tipos.ts`.

## Segurança

O portfólio, o Ferrus OS e a Brisa não têm back-end nem formulário que envie dados: o formulário de contato só monta a mensagem e abre o WhatsApp. **A única exceção é a plataforma de cursos**, que conversa com o Supabase (login e dados) e mostra vídeos do YouTube.

- **Plataforma de cursos:** as regras de acesso ficam **no banco** (Row Level Security em `supabase/schema.sql`), não na tela: ninguém lê o vídeo de um curso em que não está inscrito, nem a inscrição ou o progresso de outra pessoa. A chave pública do Supabase pode ficar no código; **nunca** use a chave `service_role`. Depois do login, só se volta para caminhos de `/cursos` (sem redirecionar para outros sites).

- **Content-Security-Policy** restrita, injetada no build: só scripts, estilos e fontes do próprio site, sem `eval` e sem scripts inline. Únicas aberturas: conexão com o projeto Supabase (quando configurado) e iframe do `youtube-nocookie.com` para os vídeos das aulas (`vite.csp.ts`).
- **Cabeçalhos HTTP** prontos em `public/_headers` (Netlify e Cloudflare Pages) e `vercel.json`: HSTS, anti-clickjacking, `nosniff`, Permissions-Policy.
- **Fontes hospedadas no próprio site**: nenhuma chamada ao Google Fonts, o que é melhor para a LGPD e para a velocidade.
- **Links externos** com `rel="noopener noreferrer"`. A mensagem do WhatsApp passa por limpeza: remove caracteres invisíveis e limita o tamanho.
- **Exportação CSV do Ferrus** protegida contra injeção de fórmulas no Excel.
- **Dependências**: versões fixas no `package-lock.json`, instaladas só se publicadas há pelo menos uma semana (proteção contra pacotes comprometidos). `npm audit --omit=dev` roda no deploy.
  - Aviso conhecido: o `picomatch`, usado só pelas ferramentas de build, tem um alerta de lentidão (ReDoS) ainda sem correção publicada. Ele não vai para o site.

O GitHub Pages não permite configurar cabeçalhos HTTP. Para ter HSTS e anti-clickjacking de verdade, publique na **Vercel**, **Netlify** ou **Cloudflare Pages**: os arquivos já estão prontos.

## Publicação

- **GitHub Pages**: em Settings → Pages, escolha **Source: GitHub Actions**. A cada push na `main`, o workflow testa, gera e publica.
- **Vercel, Netlify ou Cloudflare**: importe o repositório, use o comando `npm run build` e a pasta `dist`. Sem `BASE_PATH`, o site fica na raiz do domínio.
