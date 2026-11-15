# LBK Studio — Portfólio e microsites

Site da **LBK Studio** (Lahel, Bruno e Kenni): um portfólio principal com animação de scroll e, dentro dele, microsites separados por nicho para mostrar o que fazemos a clientes de micro a grande porte.

## Estrutura

```
index.html                 → portfólio principal (GSAP + ScrollTrigger)
assets/css/main.css        → estilos do portfólio
assets/js/main.js          → animações de scroll (linha do tempo da página)
assets/js/particles.js     → cena de partículas 3D que muda de forma com o scroll

projetos/ferrus/           → Ferrus OS — sistema de gestão industrial (demo)
projetos/brisa/            → Brisa Temporadas — imóveis para temporada com reserva no Airbnb
projetos/brisa/imoveis.js  → lista de imóveis (edite aqui)
```

## Projetos

### Portfólio principal
Página que funciona como um vídeo controlado pela rolagem. Uma nuvem de partículas se transforma em esfera, onda, gráfico de barras, casa e anel, enquanto as seções aparecem:
hero → manifesto revelado palavra por palavra → processo em 3 etapas (cena fixada) → nichos em scroll horizontal → projetos → números → equipe → contato.

Usuários com "reduzir movimento" ativado no sistema veem a página sem as cenas fixadas.

### Ferrus OS (nicho: Indústria)
Versão nova, com outro nome e outra identidade visual, do nosso sistema de controle de produção e qualidade. Cliente fictício: *Metalúrgica Aurora*.
- Login de demonstração (aceita qualquer e-mail e senha)
- Painel com indicadores, produção por setor, índice de aprovação e principais defeitos
- Apontamento de produção por unidade e setor, com defeitos e cálculo de aprovação
- Registros com busca, filtro e exportação em CSV
- Não conformidades (abrir e avançar status)
- Calibração de instrumentos com alerta de vencimento
- Liberação de novos usuários

Os dados são fictícios e ficam salvos no navegador. Para virar produto, a camada de dados passa a chamar a API do back-end.

### Brisa Temporadas (nicho: Imobiliário)
Vitrine de imóveis para temporada no litoral de SC, com busca, filtros e página de detalhes de cada imóvel. O botão **Reservar no Airbnb** leva ao anúncio.
- Para trocar ou adicionar imóveis, edite `projetos/brisa/imoveis.js`.
- No campo `airbnb`, cole o link real do anúncio (`https://www.airbnb.com.br/rooms/...`). Enquanto estiver vazio, o botão abre a busca do Airbnb na cidade.

## O que trocar antes de publicar
- Número de WhatsApp: procure por `5500000000000` nos arquivos HTML e JS.
- E-mail de contato em `index.html`.
- Nome da agência (LBK Studio), se quiserem outro.
- Fotos dos imóveis: hoje vêm do Unsplash. O ideal é usar fotos reais na pasta `assets/img`.

## Rodar localmente
Não precisa instalar nada. Na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Publicar grátis (GitHub Pages)
No GitHub, vá em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve. Em alguns minutos o site fica no ar em
`https://lahelandim.github.io/Novo-Projeto-landingPage/`.
