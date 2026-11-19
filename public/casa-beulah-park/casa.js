/* =====================  CONFIG (edite aqui)  ===================== */
const CONFIG = {
  whatsapp: '55DDDNUMERO',                 // DDI + DDD + número, só dígitos
  mensagem: 'Olá! Vi o site da casa em Beulah Park e gostaria de agendar uma visita.',
  videoDesktop: 'tour-ai.mp4',             // 1920×1080, 30 fps (ampliado por IA)
  videoMobile:  'tour-ai-720.mp4',         // 1280×720 (telas pequenas)
  inicioVideo: 11.0, fimVideo: 57.5        // trecho do vídeo original usado no tour (só informativo)
};

/* Capítulos do tour. de/ate = segundos do vídeo do tour (0 a 46,5 s). */
const T0 = 11.0, DUR = 46.5;               // o tour começa em 11,0 s do vídeo original
const src = s => (s - T0) / DUR;           // converte segundo original -> fração 0..1
const TOUR = [
  { nome:'Cozinha',            de:12.8, ate:17.2, id:'cozinha',   t:'Cozinha com ilha e eletrodomésticos embutidos', d:'Bancada de pedra branca, cooktop a gás e fornos em inox.' },
  { nome:'Jantar',             de:17.4, ate:18.9, id:'jantar',    t:'Mesa redonda de carvalho',                      d:'Cadeiras brancas e muita luz natural.' },
  { nome:'Sala de estar',      de:19.0, ate:22.6, id:'estar',     t:'Sala de estar com lareira',                     d:'Sofás confortáveis e lareira linear.' },
  { nome:'Escritório',         de:23.8, ate:26.2, id:'escritorio',t:'Cantinho de trabalho',                          d:'Mesa, tapete geométrico e uma figueira ao lado da cortina.' },
  { nome:'Lavabo',             de:26.4, ate:27.9, id:'banhoc',    t:'Lavabo com cuba redonda',                       d:'Bancada de pedra sobre gabinete de carvalho.' },
  { nome:'Suíte',              de:28.0, ate:29.9, id:'suite',     t:'Suíte principal',                               d:'Cama king, cabeceira preta e carpete escuro.' },
  { nome:'Banheiro da suíte',  de:30.0, ate:31.9, id:'banhos',    t:'Banheiro da suíte',                             d:'Revestimento cinza e misturador de parede.' },
  { nome:'Estar e escada',     de:32.0, ate:35.2, id:'estar',     t:'Estar principal e escada',                      d:'Ambientes amplos, guarda-corpo de vidro e degraus de madeira.' },
  { nome:'Sala íntima',        de:35.4, ate:37.7, id:'intima',    t:'Sala íntima no piso superior',                  d:'Sofá, aparador de madeira e espelho redondo.' },
  { nome:'Banheiro social',    de:38.2, ate:41.2, id:'banhoc',    t:'Banheiro social com banheira',                  d:'Gabinete de carvalho, pendentes e banheira de livre instalação.' },
  { nome:'Quarto 2',           de:41.4, ate:46.7, id:'dorm2',     t:'Quarto de hóspedes',                            d:'Carpete escuro, roupa de cama branca e armário espelhado.' },
  { nome:'Do alto',            de:47.0, ate:49.4, id:'cozinha',   t:'Tudo integrado',                                d:'Cozinha, jantar e estar em um só espaço.' },
  { nome:'Área externa',       de:50.0, ate:54.9, id:'alf',       t:'Área externa gourmet',                          d:'Mesa para a família, adega e churrasqueira.' },
  { nome:'Jantar com vista',   de:55.0, ate:56.2, id:'jantar',    t:'Jantar com janelões',                           d:'Esquadrias pretas do chão ao teto.' },
  { nome:'Fachada',            de:56.4, ate:60.0, id:'fachada',   t:'A fachada',                                     d:'Telhado cinza, muro branco e portão com cerca preta.' }
];

/* Detalhes de cada ambiente.
   spots: pontos numerados na foto principal (x,y em %).
   macros: cenas de perto (img, foco x/y em %, zoom z). Fotos = quadros do vídeo. */
const ROOMS = [
 { id:'cozinha', nome:'Cozinha', kicker:'Aberta para a sala',
   lead:'Cozinha em linha com ilha central, janela-painel sobre a bancada e eletrodomésticos embutidos. Tudo integrado à sala de estar e à área de jantar.',
   hero:'cozinha', spots:[
    {x:34,y:60,t:'Ilha central de pedra branca',    d:'Bancada ampla com laterais em cascata, ideal para cozinhar e receber.'},
    {x:45,y:64,t:'Banquetas de madeira',            d:'Banquetas com assento trançado ao longo da ilha.'},
    {x:30,y:47,t:'Janela-painel sobre a bancada',   d:'Faixa de vidro escuro que traz luz e vista para a área externa.'},
    {x:36,y:26,t:'Pendente linear',                 d:'Luminária linear sobre a ilha, de linhas finas.'},
    {x:24,y:63,t:'Forno embutido',                  d:'Fornos em inox integrados ao armário.'},
    {x:55,y:11,t:'Spots de embutir',                d:'Iluminação pontual no forro, com visual limpo.'},
    {x:84,y:38,t:'Portas de vidro de correr',       d:'Esquadrias pretas do chão ao teto, abrem para o pátio.'},
    {x:84,y:90,t:'Piso de madeira clara',           d:'Madeira clara contínua entre cozinha, jantar e estar.'}
   ], macros:[
    {img:'cooktop',x:44,y:40,z:1.2,t:'Cooktop a gás',        d:'Vidro preto e queimadores de ferro fundido.'},
    {img:'forno',  x:64,y:66,z:1.9,t:'Fornos em inox',        d:'Dois fornos embutidos sob a bancada.'},
    {img:'ilha',   x:68,y:30,z:1.9,t:'Torneira gourmet preta',d:'Bica alta articulada e cuba dupla.'},
    {img:'ilha',   x:62,y:62,z:1.5,t:'Banquetas trançadas',   d:'Madeira e fibra natural.'}
   ]},
 { id:'jantar', nome:'Sala de jantar', kicker:'Com janelões para o pátio',
   lead:'Mesa redonda de carvalho cercada por esquadrias pretas e muita luz natural. Fica ao lado da cozinha e do acesso à área externa.',
   hero:'jantar2', spots:[
    {x:15,y:38,t:'Janelões com esquadria preta',    d:'Vidros do chão ao teto, que enchem o ambiente de luz.'},
    {x:52,y:46,t:'Portas-janela ao fundo',          d:'Esquadrias pretas que enquadram o pátio.'},
    {x:50,y:62,t:'Mesa redonda',                    d:'Mesa redonda com tampo de carvalho, boa para conversar.'},
    {x:58,y:78,t:'Cadeiras brancas',                d:'Cadeiras de design em tom branco, leves e fáceis de limpar.'},
    {x:70,y:42,t:'Quadro com folhagem',             d:'Arte com folhas, que traz um toque de natureza.'},
    {x:40,y:90,t:'Piso de madeira clara',           d:'Madeira clara que se estende por todo o térreo.'},
    {x:92,y:55,t:'Passagem para a área gourmet',    d:'Ao fundo, a cozinha externa com adega.'}
   ], macros:[
    {img:'jantar',x:62,y:36,z:1.4,t:'Mesa redonda',     d:'Centro de mesa e cadeiras ao redor.'},
    {img:'oak',   x:75,y:35,z:1.3,t:'Tampo de carvalho',d:'Veios de madeira e emendas à mostra.'},
    {img:'jantar2',x:80,y:45,z:2.0,t:'Arte com folhas',  d:'Moldura clara e folhagem tropical.'}
   ]},
 { id:'estar', nome:'Sala de estar', kicker:'Lareira, sofás e escada',
   lead:'Sala ampla, com dois sofás frente a frente, mesa de centro de madeira e uma lareira linear embutida. A escada com guarda-corpo de vidro fica ao lado.',
   hero:'estar', spots:[
    {x:20,y:72,t:'Sofás cinza',                     d:'Dois sofás de tecido cinza frente a frente.'},
    {x:52,y:62,t:'Lareira linear',                  d:'Lareira embutida na parede, de formato horizontal.'},
    {x:51,y:73,t:'Mesa de centro redonda',          d:'Madeira com pés finos, no meio do estar.'},
    {x:49,y:33,t:'Quadro em nicho',                 d:'Arte abstrata em tons neutros dentro de um nicho na parede.'},
    {x:23,y:63,t:'Almofadas mostarda',              d:'Toque de cor entre os tons neutros.'},
    {x:90,y:38,t:'Guarda-corpo de vidro',           d:'Vidro na escada, que deixa o ambiente aberto.'},
    {x:88,y:52,t:'Planta decorativa',               d:'Verde ao lado da escada.'},
    {x:6,y:45,t:'Esquadrias pretas',               d:'Portas e janelas pretas que dão a volta no ambiente.'}
   ], macros:[
    {img:'lareira',x:72,y:57,z:2.0,t:'Lareira embutida',    d:'Moldura preta, chama horizontal.'},
    {img:'lareira',x:42,y:70,z:1.8,t:'Mesa de centro',      d:'Madeira com livros e objetos.'},
    {img:'sofa',   x:62,y:66,z:1.7,t:'Sofá de dois lugares',d:'Tecido cinza e almofadas.'}
   ]},
 { id:'escritorio', nome:'Escritório', kicker:'Um canto para trabalhar',
   lead:'Cômodo claro, com mesa de trabalho, cortina até o chão e um tapete geométrico que dá personalidade. Serve como escritório ou quarto extra.',
   hero:'escritorio', spots:[
    {x:48,y:57,t:'Mesa de trabalho',                d:'Mesa pequena de madeira, sob a arte.'},
    {x:51,y:66,t:'Cadeira cor de caramelo',         d:'Cadeira de design com assento e encosto em couro.'},
    {x:34,y:55,t:'Luminária de tripé',              d:'Luminária de piso em tripé, com cúpula de filamento.'},
    {x:12,y:18,t:'Quadros emoldurados',             d:'Duas obras com moldura preta e fina.'},
    {x:47,y:30,t:'Arte grande',                     d:'Quadro em tons de areia, centralizado na parede.'},
    {x:84,y:28,t:'Figueira-lira',                   d:'Planta grande em vaso preto, ao lado da janela.'},
    {x:40,y:90,t:'Tapete geométrico',               d:'Tapete com losangos em preto, areia e cinza.'},
    {x:74,y:22,t:'Cortina até o chão',              d:'Cortina de tecido leve e plissado.'}
   ], macros:[
    {img:'escritorio',x:40,y:88,z:1.8,t:'Tapete geométrico',d:'Padrão em zigue-zague.'},
    {img:'escritorio',x:84,y:30,z:1.8,t:'Figueira-lira',    d:'Folhas grandes e vaso preto.'},
    {img:'escritorio',x:50,y:50,z:2.0,t:'Mesa e cadeira',   d:'Luminária, vaso e uma cadeira de couro.'}
   ]},
 { id:'suite', nome:'Suíte principal', kicker:'Descanso em tons suaves',
   lead:'Cama king com cabeceira preta, abajures de cada lado, carpete escuro e janelas altas que trazem luz sem perder a privacidade.',
   hero:'suite', spots:[
    {x:50,y:62,t:'Cama com roupa de cama branca',   d:'Cama grande, roupa branca listrada em preto.'},
    {x:46,y:45,t:'Cabeceira preta',                 d:'Cabeceira alta e estofada em preto.'},
    {x:37,y:43,t:'Abajures pretos',                 d:'Um de cada lado da cama, com cúpula preta.'},
    {x:20,y:27,t:'Arte vermelha',                   d:'Quadro grande em tons de vinho e rosa.'},
    {x:50,y:10,t:'Luminária linear de teto',        d:'Luminária com desenho vazado, sobre a cama.'},
    {x:50,y:27,t:'Janelas altas',                   d:'Janelas horizontais pretas, na altura do forro.'},
    {x:50,y:88,t:'Carpete escuro',                  d:'Carpete em tom grafite, macio sob os pés.'},
    {x:78,y:42,t:'Acesso ao closet e banheiro',     d:'Porta aberta ao lado leva à suíte.'}
   ], macros:[
    {img:'luz',  x:36,y:25,z:1.1,t:'Luminária de teto', d:'Desenho linear em preto e branco.'},
    {img:'suite',x:50,y:64,z:2.2,t:'Cama king',         d:'Listras escuras sobre o branco.'},
    {img:'suite',x:20,y:28,z:2.4,t:'Arte na parede',    d:'Estampa em tons de vinho.'}
   ]},
 { id:'banhos', nome:'Banheiro da suíte', kicker:'Cinza escuro, branco e metal',
   lead:'Revestimento cinza em grande formato, bancada branca com cuba redonda de apoio e misturador de parede. Sofisticado e fácil de manter.',
   hero:'banhos', spots:[
    {x:56,y:6,t:'Espelho oval',                    d:'Espelho com moldura fina.'},
    {x:52,y:26,t:'Misturador de parede',            d:'Torneira embutida na parede, em metal escovado.'},
    {x:43,y:45,t:'Cuba redonda de apoio',           d:'Cuba branca de formato arredondado, sobre a bancada.'},
    {x:30,y:58,t:'Bancada branca',                  d:'Tampo branco liso, com espaço de apoio.'},
    {x:32,y:80,t:'Gabinete suspenso branco',        d:'Gabinete flutuante, que deixa o piso à mostra.'},
    {x:15,y:30,t:'Revestimento cinza',              d:'Revestimento cinza grande, com poucas juntas.'},
    {x:66,y:52,t:'Planta decorativa',               d:'Vasinho verde com cachepô dourado.'}
   ], macros:[
    {img:'banhos',x:50,y:28,z:1.9,t:'Misturador de parede',d:'Linhas retas, acabamento metálico.'},
    {img:'banhos',x:45,y:48,z:2.0,t:'Cuba redonda',        d:'Branca, sobre bancada de pedra.'},
    {img:'banhos',x:66,y:52,z:2.2,t:'Toque verde',         d:'Planta e cachepô dourado.'}
   ]},
 { id:'intima', nome:'Sala íntima', kicker:'No piso superior',
   lead:'Segundo estar no andar de cima, com sofá, mesa de centro branca e um aparador de madeira com castiçais. Ideal para ler ou assistir a algo em família.',
   hero:'intima', spots:[
    {x:21,y:10,t:'Espelho redondo',                 d:'Espelho de moldura fina, que amplia a luz.'},
    {x:77,y:11,t:'Quadro com folhagem',             d:'Arte botânica em tons de verde.'},
    {x:56,y:35,t:'Abajur de mesa',                  d:'Abajur com cúpula branca sobre o aparador.'},
    {x:72,y:55,t:'Aparador de madeira',             d:'Aparador baixo com portas de madeira e estrutura preta.'},
    {x:87,y:43,t:'Castiçais metálicos',             d:'Peças decorativas em metal, de hastes finas.'},
    {x:52,y:64,t:'Mesa de centro branca',           d:'Mesa redonda branca, de pés finos.'},
    {x:36,y:78,t:'Sofá com almofadas estampadas',   d:'Sofá cinza e almofadas com estampa de folhas.'}
   ], macros:[
    {img:'intima',x:73,y:50,z:1.7,t:'Aparador e castiçais',d:'Madeira, metal e um abajur.'},
    {img:'intima',x:35,y:78,z:1.8,t:'Almofadas estampadas',d:'Estampa tropical em tons de verde.'},
    {img:'intima',x:52,y:64,z:2.0,t:'Mesa de centro',      d:'Branca, redonda, de pés finos.'}
   ]},
 { id:'banhoc', nome:'Banheiros sociais', kicker:'Lavabo e banheiro com banheira',
   lead:'Carvalho claro, pedra branca e cubas redondas. No banheiro social há uma banheira de livre instalação e pendentes de vidro sobre o gabinete.',
   hero:'banhoc', spots:[
    {x:46,y:12,t:'Pendentes de vidro',              d:'Três globos de vidro pendurados sobre o gabinete.'},
    {x:45,y:62,t:'Gabinete suspenso em carvalho',   d:'Gabinete comprido, de carvalho claro.'},
    {x:45,y:74,t:'Nicho aberto',                    d:'Prateleira aberta abaixo do tampo, para toalhas e cestos.'},
    {x:64,y:44,t:'Cuba redonda',                    d:'Cuba de apoio branca, sobre bancada de pedra.'},
    {x:67,y:30,t:'Espelho com armário',             d:'Armário com espelho acima da cuba.'},
    {x:72,y:34,t:'Toalha mostarda',                 d:'Toque de cor pendurado na parede.'},
    {x:22,y:40,t:'Revestimento branco',             d:'Revestimento branco em grande formato nas paredes.'},
    {x:30,y:88,t:'Piso cinza escuro',               d:'Piso escuro, que dá contraste com as paredes brancas.'}
   ], macros:[
    {img:'cuba',    x:45,y:48,z:1.4,t:'Cuba redonda',        d:'Branca, de apoio, sobre carvalho e pedra.'},
    {img:'banheira',x:66,y:55,z:1.5,t:'Banheira',            d:'Banheira de livre instalação, de linhas suaves.'},
    {img:'lavabo',  x:44,y:36,z:1.6,t:'Lavabo',              d:'Bancada de pedra sobre gabinete de carvalho.'}
   ]},
 { id:'dorm2', nome:'Quarto de hóspedes', kicker:'Carpete, rattan e linho',
   lead:'Quarto com roupa de cama branca, manta listrada, criados-mudos de rattan e um armário com portas espelhadas. Janelas altas deixam a luz entrar.',
   hero:'dorm2', spots:[
    {x:45,y:10,t:'Espelho redondo',                 d:'Espelho com moldura fina acima da cabeceira.'},
    {x:55,y:42,t:'Almofadas e almofadões',          d:'Almofadas em preto, cinza e listrado, em camadas.'},
    {x:36,y:36,t:'Abajur preto',                    d:'Abajur de cúpula preta sobre o criado-mudo.'},
    {x:89,y:58,t:'Criados-mudos de rattan',         d:'Móveis de madeira clara com portas de palhinha.'},
    {x:75,y:72,t:'Cama com manta listrada',         d:'Cobertura branca com faixa preta e cinza.'},
    {x:5,y:25,t:'Armário com portas espelhadas',   d:'Portas de espelho que ampliam o quarto.'},
    {x:50,y:92,t:'Carpete escuro',                  d:'Carpete grafite, macio e silencioso.'}
   ], macros:[
    {img:'almof', x:45,y:45,z:1.2,t:'Almofadas',           d:'Linho cinza, estampa gráfica e franjas.'},
    {img:'criado',x:45,y:52,z:1.2,t:'Criado-mudo e abajur',d:'Luz quente e porta-retratos.'},
    {img:'armario',x:60,y:50,z:1.7,t:'Armário espelhado',  d:'Espelho redondo ao fundo.'}
   ]},
 { id:'alf', nome:'Área externa gourmet', kicker:'Para receber ao ar livre',
   lead:'Varanda coberta com mesa para a família, cozinha externa com churrasqueira e adega climatizada, tudo de frente para o gramado com fire pit.',
   hero:'alf', spots:[
    {x:52,y:58,t:'Mesa branca de jantar',           d:'Mesa grande, para receber amigos e família.'},
    {x:62,y:72,t:'Cadeiras brancas',                d:'Cadeiras de design, leves e resistentes ao tempo.'},
    {x:80,y:64,t:'Adega climatizada',               d:'Adega embutida sob a bancada.'},
    {x:66,y:45,t:'Churrasqueira',                   d:'Churrasqueira com tampa, em bancada de pedra.'},
    {x:88,y:50,t:'Bancada branca',                  d:'Bancada comprida, que serve de apoio ao churrasco.'},
    {x:24,y:58,t:'Gramado',                         d:'Jardim com grama e área de lazer.'},
    {x:35,y:30,t:'Cerca de madeira escura',         d:'Fecho do pátio com privacidade.'},
    {x:60,y:5,t:'Cobertura',                       d:'Telhado que protege do sol e da chuva.'}
   ], macros:[
    {img:'bbq',   x:55,y:52,z:1.6,t:'Churrasqueira e adega',d:'Tudo em uma bancada.'},
    {img:'jardim',x:65,y:72,z:1.3,t:'Fire pit no jardim',   d:'Cadeiras de palhinha ao redor.'},
    {img:'alf',   x:60,y:70,z:1.9,t:'Cadeiras de design',   d:'Cadeiras brancas ao redor da mesa.'}
   ]},
 { id:'fachada', nome:'Fachada', kicker:'Quem passa, vê',
   lead:'Telhado cinza de quatro águas, muro branco com portão, cerca preta e calçada de pavers. Uma entrada limpa e elegante.',
   hero:'fachada', spots:[
    {x:40,y:36,t:'Telhado cinza',                   d:'Telhado em quatro águas, de cor grafite.'},
    {x:62,y:30,t:'Segundo pavimento',               d:'Parte da casa tem dois andares.'},
    {x:50,y:52,t:'Porta de entrada em madeira',     d:'Porta de madeira escura ao fundo do caminho.'},
    {x:73,y:48,t:'Muro e cerca preta',              d:'Fecho elegante, que mantém a vista.'},
    {x:89,y:50,t:'Pilares brancos do portão',       d:'Pilares brancos de cada lado do portão.'},
    {x:45,y:82,t:'Calçada de pavers',               d:'Piso de tijolinhos com acabamento rústico.'}
   ], macros:[
    {img:'fachada',x:50,y:43,z:2.3,t:'Entrada',         d:'Porta de madeira e jardim.'},
    {img:'fachada',x:76,y:52,z:1.8,t:'Muro e cerca',    d:'Cerca preta com pilares brancos.'}
   ]}
];

/* =====================  utilitários  ===================== */
const $ = (s,c=document)=>c.querySelector(s);
const img = n => `img/${n}.webp`;
const esc = s => s.replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
gsap.registerPlugin(ScrollTrigger);
$('#wa').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensagem)}`;

/* navegação */
const NAVS=[['cozinha','Cozinha'],['jantar','Jantar'],['estar','Estar'],['suite','Suíte'],['banhoc','Banheiros'],['dorm2','Quarto'],['alf','Área externa'],['reservar','Reservar']];
NAVS.forEach(([id,n])=>$('#navLinks').insertAdjacentHTML('beforeend',`<li><a href="#${id}">${n}</a></li>`));
ScrollTrigger.create({trigger:'.facts',start:'top 70px',end:'max',toggleClass:{targets:'#nav',className:'solid'}});

/* =====================  cômodos (setas com o nome de cada item)  ===================== */
const IMG_AR=16/9, TILE_AR=4/3, W=TILE_AR/IMG_AR;   // fração visível da largura numa tile 4:3
const roomsEl = $('#rooms');
const LH=96, GAP=8, NS='http://www.w3.org/2000/svg';
const svgEl=(n,a)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);return e;};

/* Posiciona os rótulos nas laterais e desenha as setas até cada ponto da foto. */
function layoutAnnot(a){
  const {A,pic,svg,cols,labs,spots}=a;
  const flat=innerWidth<900;
  A.classList.toggle('flat',flat);
  svg.replaceChildren(); a.lines=[];
  if(flat){ labs.forEach(l=>l.remove()); cols.L.style.height=cols.R.style.height=''; return; }
  const order=spots.map((s,i)=>i).sort((i,j)=>spots[i].x-spots[j].x);
  const half=Math.ceil(order.length/2), left=order.slice(0,half), right=order.slice(half);
  cols.L.append(...left.map(i=>labs[i])); cols.R.append(...right.map(i=>labs[i]));
  const figH=A.querySelector('.figwrap').offsetHeight;
  const need=Math.max(left.length,right.length)*(LH+GAP)-GAP;
  const H=Math.max(figH,need);
  cols.L.style.height=cols.R.style.height=H+'px';
  const ar=A.getBoundingClientRect(), pr=pic.getBoundingClientRect();
  svg.setAttribute('width',ar.width); svg.setAttribute('height',ar.height); svg.setAttribute('viewBox',`0 0 ${ar.width} ${ar.height}`);
  const place=(ids,col,side)=>{
    const cr=col.getBoundingClientRect(), colTop=cr.top-ar.top;
    const its=ids.map(i=>({i,px:pr.left-ar.left+spots[i].x/100*pr.width,py:pr.top-ar.top+spots[i].y/100*pr.height})).sort((p,q)=>p.py-q.py);
    let tops=its.map(o=>Math.min(Math.max(o.py-colTop-LH/2,0),H-LH));
    for(let k=1;k<tops.length;k++) tops[k]=Math.max(tops[k],tops[k-1]+LH+GAP);
    tops[tops.length-1]=Math.min(tops[tops.length-1],H-LH);          // o último não passa do fim da coluna
    for(let k=tops.length-2;k>=0;k--) tops[k]=Math.min(tops[k],tops[k+1]-LH-GAP);
    its.forEach((o,k)=>{
      const l=labs[o.i]; l.style.top=tops[k]+'px'; l.style.height=LH+'px';
      const ax=side==='L'?cr.right-ar.left:cr.left-ar.left, ay=colTop+tops[k]+LH/2;
      const dx=o.px-ax, dy=o.py-ay, len=Math.hypot(dx,dy)||1, ux=dx/len, uy=dy/len;
      const ex=o.px-ux*15, ey=o.py-uy*15, nx=-uy, ny=ux;           // a seta termina na borda do ponto
      const g=svgEl('g',{class:'ln-g','data-i':o.i});
      g.append(svgEl('line',{class:'ln-halo',x1:ax,y1:ay,x2:ex,y2:ey}),
               svgEl('line',{class:'ln',x1:ax,y1:ay,x2:ex,y2:ey}),
               svgEl('circle',{class:'ln-dot',cx:ax,cy:ay,r:3.5}),
               svgEl('path',{class:'ah',d:`M${ex},${ey} L${ex-ux*11+nx*5},${ey-uy*11+ny*5} L${ex-ux*11-nx*5},${ey-uy*11-ny*5} Z`}));
      svg.append(g); a.lines[o.i]=g;
    });
  };
  place(left,cols.L,'L'); place(right,cols.R,'R');
}

const annots=[];
ROOMS.forEach((r,ri)=>{
  const sec=document.createElement('section'); sec.className='room'; sec.id=r.id;
  const pins=r.spots.map((s,i)=>`<button class="pin" style="left:${s.x}%;top:${s.y}%" data-i="${i}" aria-label="${esc(s.t)}">${i+1}</button>`).join('');
  const items=r.spots.map((s,i)=>`<li data-i="${i}" tabindex="0"><b>${esc(s.t)}</b><span>${esc(s.d)}</span></li>`).join('');
  const macros=r.macros.map((m,i)=>{
    // posição do recorte: centraliza o ponto (x,y) numa tile 4:3
    const p=Math.max(0,Math.min(1,(m.x/100-W/2)/(1-W)));
    const left=p*(1-W), ox=Math.max(0,Math.min(100,(m.x/100-left)/W*100));
    return `<figure class="macro rv"><div class="crop" data-n="Detalhe ${i+1}"><img src="${img(m.img)}" width="1920" height="1080" alt="${esc(m.t)}" loading="lazy" decoding="async" style="object-position:${(p*100).toFixed(1)}% 50%;transform-origin:${ox.toFixed(1)}% ${m.y}%;transform:scale(${m.z})" data-z="${m.z}"></div><figcaption><b>${esc(m.t)}</b><span>${esc(m.d)}</span></figcaption></figure>`;
  }).join('');
  sec.innerHTML=`<div class="in">
    <header class="rhead rv"><span class="num">${String(ri+1).padStart(2,'0')}</span><h2>${esc(r.nome)}</h2><p>${esc(r.lead)}</p></header>
    <div class="annot">
      <div class="col L"></div>
      <div class="figwrap"><figure class="pic"><img src="${img(r.hero)}" width="1920" height="1080" alt="${esc(r.nome)}" loading="${ri<2?'eager':'lazy'}" decoding="async">${pins}</figure></div>
      <div class="col R"></div>
      <svg class="lines" aria-hidden="true"></svg>
    </div>
    <ol class="items">${items}</ol>
    <div class="macros">${macros}</div>
  </div>`;
  roomsEl.appendChild(sec);

  const A=sec.querySelector('.annot');
  const labs=r.spots.map((s,i)=>{const b=document.createElement('button');b.type='button';b.className='lab';b.dataset.i=i;
    b.innerHTML=`<b>${i+1}</b><span><strong>${esc(s.t)}</strong><em>${esc(s.d)}</em></span>`;return b;});
  const a={sec,A,pic:sec.querySelector('.pic'),svg:sec.querySelector('.lines'),cols:{L:A.querySelector('.col.L'),R:A.querySelector('.col.R')},labs,spots:r.spots,lines:[],w:0};
  annots.push(a);

  const P=[...sec.querySelectorAll('.pin')], L=[...sec.querySelectorAll('.items li')];
  const set=i=>{[P,L,labs,a.lines].forEach(arr=>{for(let k=0;k<P.length;k++) arr[k]&&arr[k].classList.toggle('on',k===i);});};
  const clear=()=>set(-1);
  [P,L,labs].forEach(arr=>arr.forEach((el,i)=>{el.addEventListener('mouseenter',()=>set(i));el.addEventListener('focus',()=>set(i));el.addEventListener('mouseleave',clear);el.addEventListener('blur',clear);el.addEventListener('click',e=>{e.stopPropagation();set(i);});}));
  sec.addEventListener('click',e=>{ if(!e.target.closest('.pin,.items li,.lab')) clear(); });

  layoutAnnot(a);
  new ResizeObserver(()=>{ const w=A.clientWidth; if(w!==a.w){a.w=w;layoutAnnot(a);} }).observe(A);

  gsap.to(sec.querySelectorAll('.rhead,.macro'),{opacity:1,y:0,duration:.9,ease:'power3.out',stagger:.12,scrollTrigger:{trigger:sec,start:'top 82%',once:true}});
  ScrollTrigger.create({trigger:A,start:'top 78%',once:true,onEnter:()=>{
    gsap.from(a.labs,{opacity:0,y:14,duration:.5,stagger:.07,ease:'power2.out'});
    gsap.from(A.querySelectorAll('.ln-g'),{opacity:0,duration:.6,stagger:.07,delay:.15,ease:'power1.out'});
    gsap.from(P,{scale:0,duration:.45,ease:'back.out(2)',stagger:.06});
  }});
  sec.querySelectorAll('.crop img').forEach(im=>{
    const z=+im.dataset.z;
    gsap.fromTo(im,{scale:z*.9},{scale:z,ease:'none',scrollTrigger:{trigger:im.parentNode,start:'top 95%',end:'center 55%',scrub:true}});
  });
});
document.fonts&&document.fonts.ready.then(()=>annots.forEach(layoutAnnot));
addEventListener('load',()=>{annots.forEach(layoutAnnot);ScrollTrigger.refresh();});

/* =====================  TOUR em vídeo  ===================== */
(function(){
  const tour=$('#topo'), v=$('#tv'), intro=$('#intro'), hint=$('#hint'), chaptersEl=$('#chapters'), dots=$('#dots');
  const els=TOUR.map(c=>{
    const a=src(c.de), b=Math.min(1.2,src(c.ate));
    const d=document.createElement('div'); d.className='layer chapter';
    d.innerHTML=`<div class="label">${esc(c.nome)}</div><h2>${esc(c.t)}</h2><p>${esc(c.d)}</p><a class="more" href="#${c.id}">Ver cada detalhe ↓</a>`;
    chaptersEl.appendChild(d);
    const bt=document.createElement('button'); bt.textContent=c.nome; dots.appendChild(bt);
    return {c,a,b,d,bt};
  });
  const proxy={t:0}; let st=null;
  const small = innerWidth<900 || (navigator.connection && navigator.connection.saveData);
  const url = small ? CONFIG.videoMobile : CONFIG.videoDesktop;
  els.forEach(o=>o.bt.addEventListener('click',()=>{ if(!st) return; scrollTo({top:st.start+(st.end-st.start)*(o.a+.01),behavior:'smooth'}); }));
  intro.style.opacity=1;

  function build(){
    const dur=v.duration;
    st=ScrollTrigger.create({
      trigger:tour,start:'top top',end:()=>'+='+Math.round(innerHeight*(innerWidth<820?20:32)),pin:true,scrub:true,
      onUpdate:s=>{
        const p=s.progress;
        gsap.to(proxy,{t:p*(dur-.04),duration:.9,ease:'power2.out',overwrite:true});
        $('#bar').style.transform=`scaleX(${p})`;
        const fade=(el,a,b)=>{const w=.012,o=Math.max(0,Math.min(1,(p-a)/w,(b-p)/w));el.style.opacity=o;el.style.transform=`translateY(${(1-o)*22}px)`;el.style.pointerEvents=o>.5?'auto':'none';return o};
        fade(intro,-1,.03); hint.style.opacity=p<.025?1:0;
        els.forEach(o=>{const x=fade(o.d,o.a,o.b);o.bt.classList.toggle('on',x>.5)});
      }
    });
    gsap.ticker.add(()=>{ if(!v.seeking && Math.abs(v.currentTime-proxy.t)>1/70) v.currentTime=proxy.t; });
    $('#status').classList.add('ready');
    ScrollTrigger.refresh();
  }

  // baixa o vídeo inteiro (blob) para a rolagem nunca engasgar; não bloqueia a página
  (async()=>{
    const sb=$('#sbar');
    try{
      const r=await fetch(url); const total=+r.headers.get('content-length')||0;
      const rd=r.body.getReader(); const parts=[]; let got=0;
      for(;;){const {done,value}=await rd.read(); if(done)break; parts.push(value); got+=value.length; if(total) sb.style.transform=`scaleX(${got/total})`;}
      v.src=URL.createObjectURL(new Blob(parts,{type:'video/mp4'}));
    }catch(e){ v.src=url; }
    v.addEventListener('loadeddata',build,{once:true}); v.load();
  })();
})();

/* =====================  RESERVA E VISITA (demonstração: dados fictícios)  ===================== */
(function(){
  const root=$('#booking'); if(!root) return;
  const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const SEM=['D','S','T','Q','Q','S','S'];
  const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const today=new Date(); today.setHours(0,0,0,0);
  const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
  const pad=n=>String(n).padStart(2,'0');
  const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parse=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d);};
  const fmt=d=>d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
  const fmtLong=d=>d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  const nightsBetween=(a,b)=>Math.round((b-a)/86400000);
  const limpar=s=>String(s).replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g,' ').replace(/\s+/g,' ').trim().slice(0,200);

  /* valores e disponibilidade FICTÍCIOS */
  const CFG={min:2,max:60,clean:280,weekday:890,weekend:1190,extraFrom:6,extraFee:60};
  const BOOKED=[[5,8],[19,24],[33,36],[47,52],[63,66],[80,86]].map(([a,b])=>[addDays(today,a),addDays(today,b)]);
  const bookedNight=d=>BOOKED.some(([a,b])=>d>=a&&d<=b);
  const freeNights=(a,b)=>{for(let d=new Date(a);d<b;d=addDays(d,1)) if(bookedNight(d)) return false;return true;};
  const SLOTS=['09:00','10:00','11:00','14:00','15:00','16:00','17:00'];
  const slotTaken=(d,s)=>((d.getDate()*5+d.getMonth()*3+SLOTS.indexOf(s)*7)%4)===0;
  const visitOk=d=>d>=today&&d<=addDays(today,90)&&d.getDay()!==0&&d.getDate()%9!==0;

  const cal=$('#cal'), slotsEl=$('#slots'), msgEl=$('#bk-msg'), sum=$('#summary'), form=$('#bkForm'), done=$('#done'), guestsSel=$('#guests'), guestsBox=$('#guestsBox');
  const prev=$('#calPrev'), next=$('#calNext'), tabs=[...root.querySelectorAll('[role=tab]')];
  let mode='stay', view=new Date(today.getFullYear(),today.getMonth(),1), msg='';
  const S={start:null,end:null}, V={day:null,slot:null};
  for(let i=1;i<=8;i++) guestsSel.insertAdjacentHTML('beforeend',`<option value="${i}">${i} ${i===1?'hóspede':'hóspedes'}</option>`);
  guestsSel.value='2';
  const months=()=>innerWidth>=900?2:1;

  function monthHTML(first){
    const y=first.getFullYear(), m=first.getMonth(), days=new Date(y,m+1,0).getDate();
    let h=`<div class="month"><h3>${MESES[m]} ${y}</h3><div class="grid">`+SEM.map(s=>`<span class="dow">${s}</span>`).join('');
    for(let i=0;i<first.getDay();i++) h+='<span></span>';
    for(let n=1;n<=days;n++){
      const d=new Date(y,m,n), k=key(d); let cls='day', dis=false, label=fmtLong(d), sel=false;
      if(mode==='stay'){
        const past=d<today, bk=bookedNight(d);
        const asEnd=!!(S.start&&!S.end&&d>S.start&&nightsBetween(S.start,d)<=CFG.max&&freeNights(S.start,d));
        dis=past||(bk&&!asEnd);
        if(dis&&!past){cls+=' booked';label+=' (ocupado)';}
        if(past) cls+=' past';
        if(S.start&&k===key(S.start)){cls+=' start';sel=true;}
        if(S.end&&k===key(S.end)){cls+=' end';sel=true;}
        if(S.start&&S.end&&d>S.start&&d<S.end) cls+=' mid';
      }else{
        dis=!visitOk(d);
        if(d<today) cls+=' past'; else if(dis){cls+=' booked';label+=' (indisponível)';}
        if(V.day&&k===key(V.day)){cls+=' start';sel=true;}
      }
      if(k===key(today)) cls+=' today';
      h+=`<button type="button" class="${cls}" data-k="${k}"${dis?' disabled':''} aria-label="${label}"${sel?' aria-pressed="true"':''}>${n}</button>`;
    }
    return h+'</div></div>';
  }
  function renderCal(){
    let h=''; for(let i=0;i<months();i++) h+=monthHTML(new Date(view.getFullYear(),view.getMonth()+i,1));
    cal.innerHTML=h;
    prev.disabled=view<=new Date(today.getFullYear(),today.getMonth(),1);
    next.disabled=view>=new Date(today.getFullYear(),today.getMonth()+12,1);
  }
  function calc(){
    const n=nightsBetween(S.start,S.end); let weekend=0;
    for(let d=new Date(S.start);d<S.end;d=addDays(d,1)) if(d.getDay()===5||d.getDay()===6) weekend++;
    const g=+guestsSel.value, extra=Math.max(0,g-CFG.extraFrom)*CFG.extraFee*n;
    const nightly=(n-weekend)*CFG.weekday+weekend*CFG.weekend;
    return {n,weekend,week:n-weekend,g,extra,nightly,total:nightly+extra+CFG.clean};
  }
  function renderSummary(){
    if(mode==='stay'){
      if(S.start&&S.end){
        const c=calc();
        sum.innerHTML=`<h3>Sua estadia</h3><p class="dates"><b>${fmt(S.start)}</b> → <b>${fmt(S.end)}</b> · ${c.n} ${c.n===1?'noite':'noites'}</p>
        <dl class="price">${c.week?`<div><dt>${c.week} × seg–qui</dt><dd>${brl(c.week*CFG.weekday)}</dd></div>`:''}${c.weekend?`<div><dt>${c.weekend} × sex–sáb</dt><dd>${brl(c.weekend*CFG.weekend)}</dd></div>`:''}${c.extra?`<div><dt>Hóspedes extras</dt><dd>${brl(c.extra)}</dd></div>`:''}<div><dt>Taxa de limpeza</dt><dd>${brl(CFG.clean)}</dd></div><div class="total"><dt>Total</dt><dd>${brl(c.total)}</dd></div></dl>`;
      }else sum.innerHTML=`<h3>Sua estadia</h3><p class="hint">${S.start?`Entrada em <b>${fmt(S.start)}</b>. Escolha a saída no calendário.`:'Escolha a entrada e a saída no calendário.'}</p><p class="hint">A partir de <b>${brl(CFG.weekday)}</b> por noite · mínimo de ${CFG.min} noites.</p>`;
    }else{
      sum.innerHTML=`<h3>Sua visita</h3><p class="hint">${V.day?(V.slot?`<b>${fmtLong(V.day)}</b> às <b>${V.slot}</b> · duração de cerca de 1 hora.`:`<b>${fmtLong(V.day)}</b>. Agora escolha um horário.`):'Escolha o dia e o horário no calendário. Atendemos de segunda a sábado.'}</p>`;
    }
  }
  function renderSlots(){
    slotsEl.hidden=!(mode==='visit'&&V.day);
    if(slotsEl.hidden) return;
    slotsEl.innerHTML=`<h4>Horários em ${fmtLong(V.day)}</h4><div>`+SLOTS.map(s=>{const t=slotTaken(V.day,s);return `<button type="button" class="slot${V.slot===s?' on':''}" data-s="${s}"${t?' disabled':''}>${s}${t?' <small>ocupado</small>':''}</button>`;}).join('')+'</div>';
  }
  function update(){
    renderCal(); renderSlots(); renderSummary();
    msgEl.textContent=msg; guestsBox.hidden=mode!=='stay';
    $('#bkSubmit').textContent=mode==='stay'?'Solicitar reserva':'Confirmar visita';
  }
  function pick(d){
    msg='';
    if(mode==='stay'){
      if(!S.start||S.end||d<=S.start){S.start=d;S.end=null;msg='Agora escolha a data de saída.';}
      else{
        const n=nightsBetween(S.start,d);
        if(n<CFG.min) msg=`A estadia mínima é de ${CFG.min} noites.`;
        else if(n>CFG.max) msg=`A estadia máxima é de ${CFG.max} noites.`;
        else if(!freeNights(S.start,d)) msg='Há noites ocupadas nesse período. Escolha outra saída.';
        else S.end=d;
      }
    }else{V.day=d;V.slot=null;}
    update();
  }
  cal.addEventListener('click',e=>{const b=e.target.closest('button.day'); if(b&&!b.disabled) pick(parse(b.dataset.k));});
  slotsEl.addEventListener('click',e=>{const b=e.target.closest('button.slot'); if(b&&!b.disabled){V.slot=b.dataset.s;msg='';update();}});
  prev.addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);update();});
  next.addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);update();});
  guestsSel.addEventListener('change',update);
  tabs.forEach(t=>t.addEventListener('click',()=>{
    mode=t.dataset.mode; tabs.forEach(x=>x.setAttribute('aria-selected',String(x===t))); msg='';
    done.hidden=true; form.hidden=false; update();
  }));
  let rt; addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(renderCal,150);});

  /* formulário: valida e mostra a confirmação (nada é enviado nem salvo) */
  const err=(f,t)=>{const p=form.querySelector(`[data-for="${f}"]`);p.textContent=t||'';return !!t;};
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const nome=limpar(form.nome.value), email=form.email.value.trim(), tel=form.tel.value.replace(/\D/g,'');
    let bad=false;
    bad=err('nome',nome.length<2?'Informe seu nome.':'')||bad;
    bad=err('email',!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?'Informe um e-mail válido.':'')||bad;
    bad=err('tel',tel.length<10||tel.length>13?'Informe um WhatsApp com DDD.':'')||bad;
    if(mode==='stay'&&!(S.start&&S.end)){msg='Escolha a entrada e a saída no calendário.';bad=true;}
    if(mode==='visit'&&!(V.day&&V.slot)){msg='Escolha o dia e o horário da visita.';bad=true;}
    if(bad){msgEl.textContent=msg;return;}
    const obs=limpar(form.obs.value), prot='LR-'+Math.random().toString(36).slice(2,8).toUpperCase();
    let titulo,linhas,txt,ics;
    if(mode==='stay'){
      const c=calc(); titulo='Pedido de reserva enviado (demonstração)';
      linhas=[['Entrada',fmt(S.start)],['Saída',fmt(S.end)],['Noites',c.n],['Hóspedes',c.g],['Total estimado',brl(c.total)]];
      txt=`Olá! Gostaria de reservar a Lume Residence de ${fmt(S.start)} a ${fmt(S.end)} (${c.n} noites, ${c.g} hóspedes), total estimado ${brl(c.total)}. Protocolo ${prot}. Nome: ${nome}.${obs?' '+obs:''}`;
      ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Lume Residence//PT','BEGIN:VEVENT',`UID:${prot}@lume`,`DTSTAMP:${key(today).replace(/-/g,'')}T000000Z`,`DTSTART;VALUE=DATE:${key(S.start).replace(/-/g,'')}`,`DTEND;VALUE=DATE:${key(S.end).replace(/-/g,'')}`,'SUMMARY:Estadia na Lume Residence','END:VEVENT','END:VCALENDAR'].join('\r\n');
    }else{
      titulo='Visita agendada (demonstração)';
      linhas=[['Dia',fmtLong(V.day)],['Horário',V.slot],['Local','Beulah Park · SA']];
      txt=`Olá! Gostaria de confirmar uma visita à Lume Residence em ${fmtLong(V.day)} às ${V.slot}. Protocolo ${prot}. Nome: ${nome}.${obs?' '+obs:''}`;
      const [h,mi]=V.slot.split(':').map(Number), d0=key(V.day).replace(/-/g,''), h1=pad(h+1)+pad(mi);
      ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Lume Residence//PT','BEGIN:VEVENT',`UID:${prot}@lume`,`DTSTAMP:${d0}T000000Z`,`DTSTART:${d0}T${pad(h)}${pad(mi)}00`,`DTEND:${d0}T${h1}00`,'SUMMARY:Visita à Lume Residence','END:VEVENT','END:VCALENDAR'].join('\r\n');
    }
    const blob=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
    const wa=`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;
    done.innerHTML=`<div class="ok"><span class="check">✓</span><h3>${titulo}</h3><p class="proto">Protocolo <b>${prot}</b></p>
      <dl>${linhas.map(([a,b])=>`<div><dt>${a}</dt><dd>${esc(String(b))}</dd></div>`).join('')}</dl>
      <p class="hint">Isto é só uma demonstração: nenhuma informação foi enviada nem salva. Para falar de verdade, use o botão abaixo.</p>
      <div class="row"><a class="btn" href="${wa}" target="_blank" rel="noopener noreferrer">Enviar pelo WhatsApp</a><a class="btn alt" href="${blob}" download="lume-residence.ics">Adicionar ao calendário</a><button type="button" class="btn alt" id="again">Nova solicitação</button></div></div>`;
    form.hidden=true; done.hidden=false; msgEl.textContent='';
    done.querySelector('#again').addEventListener('click',()=>{done.hidden=true;form.hidden=false;form.reset();guestsSel.value='2';S.start=S.end=null;V.day=V.slot=null;update();});
    done.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  update();
})();
