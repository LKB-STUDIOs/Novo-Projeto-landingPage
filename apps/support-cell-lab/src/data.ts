export type Brand = 'apple' | 'samsung'
export type CameraLayout = 'bar' | 'pro' | 'dual' | 'air' | 'galaxy2' | 'galaxy3' | 'galaxyUltra'
export type PartId =
  | 'tela'
  | 'bateria'
  | 'traseira'
  | 'camera'
  | 'frontal'
  | 'conector'
  | 'altofalante'
  | 'placa'
  | 'carcaca'

/** Dimensões do modelo 3D procedural (unidades de cena, não milímetros). */
export type PhoneSpec = {
  brand: Brand
  w: number
  h: number
  d: number
  r: number
  camera: CameraLayout
}

export const SPECS = {
  iphone17Pro: { brand: 'apple', w: 3.6, h: 7.4, d: 0.44, r: 0.62, camera: 'bar' },
  iphone17ProMax: { brand: 'apple', w: 3.85, h: 7.9, d: 0.44, r: 0.66, camera: 'bar' },
  iphonePro: { brand: 'apple', w: 3.6, h: 7.4, d: 0.42, r: 0.62, camera: 'pro' },
  iphone: { brand: 'apple', w: 3.6, h: 7.4, d: 0.4, r: 0.62, camera: 'dual' },
  iphoneAir: { brand: 'apple', w: 3.75, h: 7.7, d: 0.28, r: 0.66, camera: 'air' },
  galaxy: { brand: 'samsung', w: 3.5, h: 7.3, d: 0.38, r: 0.5, camera: 'galaxy3' },
  galaxyPlus: { brand: 'samsung', w: 3.7, h: 7.7, d: 0.37, r: 0.52, camera: 'galaxy3' },
  galaxyEdge: { brand: 'samsung', w: 3.7, h: 7.7, d: 0.27, r: 0.5, camera: 'galaxy2' },
  galaxyUltra: { brand: 'samsung', w: 3.8, h: 7.8, d: 0.4, r: 0.24, camera: 'galaxyUltra' },
} satisfies Record<string, PhoneSpec>

export type SpecKey = keyof typeof SPECS

export type PhoneColor = { name: string; frame: string; back: string }

export type Product = {
  id: string
  brand: Brand
  name: string
  spec: SpecKey
  condition: 'Novo' | 'Seminovo'
  tagline: string
  colors: PhoneColor[]
  storage: { label: string; price: number }[]
  specs: { tela: string; chip: string; camera: string; bateria: string }
  /** Ajustes opcionais do modelo real em public/models/<id>.glb */
  model?: ModelConfig
}

export type ModelConfig = {
  /** arquivo dentro de public/models diferente do padrão `<id>.glb` */
  file?: string
  /** corrige a orientação do arquivo (radianos) para o aparelho ficar em pé, tela para +Z */
  rotation?: [number, number, number]
  /** multiplicador de tamanho após o encaixe automático pela altura */
  scale?: number
  /** trechos do nome dos materiais que recebem a cor escolhida */
  tint?: { back?: string[]; frame?: string[]; auto?: boolean }
  /** esconde partes do arquivo pelo nome do objeto (ex.: um segundo aparelho na cena) */
  hide?: string[]
}

/** caminho relativo à base do site: funciona na raiz do domínio e em subpastas (ex.: GitHub Pages) */
export const modelUrl = (p: Product) => `${import.meta.env.BASE_URL}models/${p.model?.file ?? `${p.id}.glb`}`

const c = (name: string, frame: string, back = frame): PhoneColor => ({ name, frame, back })

/** Catálogo do showroom. Preços ilustrativos — edite aqui. */
export const PRODUCTS: Product[] = [
  {
    id: 'ip17promax',
    model: { tint: { back: ['basecolor', 'backpanel', 'material.005'], frame: ['metalframe'] } },
    brand: 'apple',
    name: 'iPhone 17 Pro Max',
    spec: 'iphone17ProMax',
    condition: 'Novo',
    tagline: 'A maior tela e a maior bateria da linha.',
    colors: [c('Laranja cósmico', '#c9682f', '#d9773a'), c('Azul profundo', '#27334d', '#2f3d5c'), c('Prata', '#c9cbcd', '#e1e2e0')],
    storage: [
      { label: '256 GB', price: 9999.99 },
      { label: '512 GB', price: 9999.99 },
      { label: '1 TB', price: 9999.99 },
    ],
    specs: { tela: '6,9" OLED 120 Hz', chip: 'A19 Pro', camera: 'Tripla 48 MP', bateria: 'Dia todo +' },
  },
  {
    id: 'ip17pro',
    model: { tint: { back: ['material.004'], frame: ['material.002'] } },
    brand: 'apple',
    name: 'iPhone 17 Pro',
    spec: 'iphone17Pro',
    condition: 'Novo',
    tagline: 'Desempenho Pro em tamanho compacto.',
    colors: [c('Laranja cósmico', '#c9682f', '#d9773a'), c('Azul profundo', '#27334d', '#2f3d5c'), c('Prata', '#c9cbcd', '#e1e2e0')],
    storage: [
      { label: '256 GB', price: 9999.99 },
      { label: '512 GB', price: 9999.99 },
      { label: '1 TB', price: 9999.99 },
    ],
    specs: { tela: '6,3" OLED 120 Hz', chip: 'A19 Pro', camera: 'Tripla 48 MP', bateria: 'Dia todo' },
  },
  {
    id: 'ipair',
    model: { rotation: [0, Math.PI, 0], tint: { back: ['aluminum'], frame: ['steel'] } },
    brand: 'apple',
    name: 'iPhone Air',
    spec: 'iphoneAir',
    condition: 'Novo',
    tagline: 'Ultrafino, leve e surpreendentemente potente.',
    colors: [c('Azul-céu', '#b9c9d8', '#c9dcee'), c('Dourado-claro', '#d9c9a9', '#e9dcc4'), c('Branco nuvem', '#dcdcd8', '#f1f1ee'), c('Preto espacial', '#2a2a2c', '#2f2f31')],
    storage: [
      { label: '256 GB', price: 9999.99 },
      { label: '512 GB', price: 9999.99 },
    ],
    specs: { tela: '6,5" OLED 120 Hz', chip: 'A19 Pro', camera: '48 MP Fusion', bateria: 'Dia todo' },
  },
  {
    id: 'ip17',
    model: { file: 'ip16.glb', tint: { auto: true } },
    brand: 'apple',
    name: 'iPhone 17',
    spec: 'iphone',
    condition: 'Novo',
    tagline: 'O essencial, agora com 120 Hz.',
    colors: [c('Lavanda', '#b4aacb', '#c9bfe0'), c('Sálvia', '#a5b39b', '#b9c7ae'), c('Azul névoa', '#93a6ba', '#a9bcd0'), c('Preto', '#2b2b2d', '#333336')],
    storage: [
      { label: '256 GB', price: 9999.99 },
      { label: '512 GB', price: 9999.99 },
    ],
    specs: { tela: '6,3" OLED 120 Hz', chip: 'A19', camera: 'Dupla 48 MP', bateria: 'Dia todo' },
  },
  {
    id: 'ip16pro',
    model: { tint: { back: ['basecolor'], frame: ['metalframe'] } },
    brand: 'apple',
    name: 'iPhone 16 Pro',
    spec: 'iphonePro',
    condition: 'Seminovo',
    tagline: 'Seminovo revisado, bateria acima de 90%.',
    colors: [c('Titânio deserto', '#a8917a', '#bfa48a'), c('Titânio natural', '#a39e96', '#b5b0a8'), c('Titânio preto', '#323234', '#3a3a3c')],
    storage: [
      { label: '128 GB', price: 9999.99 },
      { label: '256 GB', price: 9999.99 },
    ],
    specs: { tela: '6,3" OLED 120 Hz', chip: 'A18 Pro', camera: 'Tripla 48 MP', bateria: '≥ 90% saúde' },
  },
  {
    id: 'ip16',
    model: { tint: { auto: true } },
    brand: 'apple',
    name: 'iPhone 16',
    spec: 'iphone',
    condition: 'Seminovo',
    tagline: 'Ótimo custo-benefício com garantia Support Cell.',
    colors: [c('Ultramarino', '#3e4db8', '#4a5bd6'), c('Verde-acinzentado', '#7c9d93', '#8fb3a8'), c('Rosa', '#d9a3b3', '#f0b8c8'), c('Preto', '#2b2b2d', '#333336')],
    storage: [
      { label: '128 GB', price: 9999.99 },
      { label: '256 GB', price: 9999.99 },
    ],
    specs: { tela: '6,1" OLED', chip: 'A18', camera: 'Dupla 48 MP', bateria: '≥ 90% saúde' },
  },
  {
    id: 's25ultra',
    model: { tint: { back: ['backcover_glass'], frame: ['rearcase'] } },
    brand: 'samsung',
    name: 'Galaxy S25 Ultra',
    spec: 'galaxyUltra',
    condition: 'Novo',
    tagline: 'S Pen, 200 MP e IA no topo da linha Galaxy.',
    colors: [c('Titânio azul-prata', '#8c98a4', '#9aa6b2'), c('Titânio preto', '#2a2b2d', '#2e2f31'), c('Titânio cinza', '#7f7f7d', '#8a8a88'), c('Titânio branco', '#cfcfcd', '#dcdcda')],
    storage: [
      { label: '256 GB', price: 9999.99 },
      { label: '512 GB', price: 9999.99 },
      { label: '1 TB', price: 9999.99 },
    ],
    specs: { tela: '6,9" AMOLED 120 Hz', chip: 'Snapdragon 8 Elite', camera: 'Quádrupla 200 MP', bateria: '5.000 mAh' },
  },
  {
    id: 's25edge',
    model: { file: 's25.glb', hide: ['s25.001'] },
    brand: 'samsung',
    name: 'Galaxy S25 Edge',
    spec: 'galaxyEdge',
    condition: 'Novo',
    tagline: 'O Galaxy mais fino já feito.',
    colors: [c('Titânio prata', '#b9bbbd', '#c5c7c9'), c('Titânio preto', '#1d1d1f', '#232325'), c('Titânio azul-gelo', '#a9c0d0', '#bcd3e3')],
    storage: [
      { label: '256 GB', price: 9999.99 },
      { label: '512 GB', price: 9999.99 },
    ],
    specs: { tela: '6,7" AMOLED 120 Hz', chip: 'Snapdragon 8 Elite', camera: 'Dupla 200 MP', bateria: '3.900 mAh' },
  },
  {
    id: 's25plus',
    model: { file: 's25.glb', hide: ['s25.001'] },
    brand: 'samsung',
    name: 'Galaxy S25+',
    spec: 'galaxyPlus',
    condition: 'Novo',
    tagline: 'Tela grande e carregamento super rápido.',
    colors: [c('Azul-marinho', '#253049', '#2b3550'), c('Azul-gelo', '#a9c0d0', '#bcd3e3'), c('Menta', '#b4d0c0', '#c8e3d4'), c('Prata', '#a9aaac', '#b8b9bb')],
    storage: [
      { label: '256 GB', price: 9999.99 },
      { label: '512 GB', price: 9999.99 },
    ],
    specs: { tela: '6,7" AMOLED 120 Hz', chip: 'Snapdragon 8 Elite', camera: 'Tripla 50 MP', bateria: '4.900 mAh' },
  },
  {
    id: 's25',
    model: { hide: ['s25.001'] },
    brand: 'samsung',
    name: 'Galaxy S25',
    spec: 'galaxy',
    condition: 'Novo',
    tagline: 'Compacto, completo e com Galaxy AI.',
    colors: [c('Azul-marinho', '#253049', '#2b3550'), c('Azul-gelo', '#a9c0d0', '#bcd3e3'), c('Menta', '#b4d0c0', '#c8e3d4'), c('Prata', '#a9aaac', '#b8b9bb')],
    storage: [
      { label: '128 GB', price: 9999.99 },
      { label: '256 GB', price: 9999.99 },
    ],
    specs: { tela: '6,2" AMOLED 120 Hz', chip: 'Snapdragon 8 Elite', camera: 'Tripla 50 MP', bateria: '4.000 mAh' },
  },
  {
    id: 's24ultra',
    model: { file: 's25ultra.glb', tint: { back: ['backcover_glass'], frame: ['rearcase'] } },
    brand: 'samsung',
    name: 'Galaxy S24 Ultra',
    spec: 'galaxyUltra',
    condition: 'Seminovo',
    tagline: 'Seminovo revisado com S Pen inclusa.',
    colors: [c('Titânio cinza', '#7f7f7d', '#8a8a88'), c('Titânio violeta', '#958ba5', '#a59bb5'), c('Titânio amarelo', '#d9cfa8', '#e9dfb8'), c('Titânio preto', '#2a2b2d', '#2e2f31')],
    storage: [
      { label: '256 GB', price: 9999.99 },
      { label: '512 GB', price: 9999.99 },
    ],
    specs: { tela: '6,8" AMOLED 120 Hz', chip: 'Snapdragon 8 Gen 3', camera: 'Quádrupla 200 MP', bateria: '≥ 90% saúde' },
  },
  {
    id: 's24',
    model: { file: 's25.glb', hide: ['s25.001'] },
    brand: 'samsung',
    name: 'Galaxy S24',
    spec: 'galaxy',
    condition: 'Seminovo',
    tagline: 'Galaxy AI com preço de entrada.',
    colors: [c('Preto ônix', '#232325', '#29292b'), c('Cinza mármore', '#a3a4a6', '#b4b5b7'), c('Violeta cobalto', '#7f76a8', '#8f86b8'), c('Amarelo âmbar', '#e0cf90', '#f0dfa0')],
    storage: [
      { label: '128 GB', price: 9999.99 },
      { label: '256 GB', price: 9999.99 },
    ],
    specs: { tela: '6,2" AMOLED 120 Hz', chip: 'Exynos 2400', camera: 'Tripla 50 MP', bateria: '≥ 90% saúde' },
  },
]

export type Repair = {
  id: PartId
  name: string
  short: string
  desc: string
  time: string
  base: number
}

export const REPAIRS: Repair[] = [
  { id: 'tela', name: 'Troca de tela', short: 'Tela', desc: 'Display OLED com vidro, touch e calibração de cor. Mantemos True Tone / Vision Booster.', time: '40 min', base: 690 },
  { id: 'bateria', name: 'Troca de bateria', short: 'Bateria', desc: 'Bateria nova com 100% de saúde, ciclos zerados e calibração de carga.', time: '30 min', base: 290 },
  { id: 'traseira', name: 'Vidro traseiro', short: 'Traseira', desc: 'Remoção a laser do vidro quebrado e aplicação de traseira nova com acabamento de fábrica.', time: '1h30', base: 390 },
  { id: 'camera', name: 'Câmera traseira', short: 'Câmeras', desc: 'Módulo de câmeras, lentes de safira e estabilização óptica testados em bancada.', time: '45 min', base: 450 },
  { id: 'frontal', name: 'Face ID / câmera frontal', short: 'Frontal', desc: 'Reparo do sistema TrueDepth, câmera de selfie e sensores de proximidade.', time: '1h', base: 420 },
  { id: 'conector', name: 'Conector de carga', short: 'Conector', desc: 'Porta USB-C ou Lightning, microfone inferior e flex de carregamento.', time: '50 min', base: 260 },
  { id: 'altofalante', name: 'Alto-falante', short: 'Áudio', desc: 'Alto-falante inferior e auricular com teste de frequência e volume.', time: '30 min', base: 190 },
  { id: 'placa', name: 'Reparo de placa', short: 'Placa', desc: 'Microsoldagem: não liga, sem sinal, curto, aquecimento. Diagnóstico gratuito.', time: '24–72h', base: 590 },
  { id: 'carcaca', name: 'Carcaça e botões', short: 'Carcaça', desc: 'Troca de lateral, botões de volume/power, gaveta do chip e antenas.', time: '2h', base: 520 },
]

export type DeviceFamily = { brand: Brand; name: string; models: { name: string; tier: number }[] }

const fam = (brand: Brand, name: string, models: [string, number][]): DeviceFamily => ({
  brand,
  name,
  models: models.map(([n, tier]) => ({ name: n, tier })),
})

/** Aparelhos atendidos no orçamento. `tier` escala o preço do reparo. */
export const DEVICE_FAMILIES: DeviceFamily[] = [
  fam('apple', 'iPhone 17', [['iPhone 17', 9], ['iPhone Air', 10], ['iPhone 17 Pro', 10], ['iPhone 17 Pro Max', 11]]),
  fam('apple', 'iPhone 16', [['iPhone 16e', 7], ['iPhone 16', 8], ['iPhone 16 Plus', 8], ['iPhone 16 Pro', 9], ['iPhone 16 Pro Max', 10]]),
  fam('apple', 'iPhone 15', [['iPhone 15', 7], ['iPhone 15 Plus', 7], ['iPhone 15 Pro', 8], ['iPhone 15 Pro Max', 9]]),
  fam('apple', 'iPhone 14', [['iPhone 14', 6], ['iPhone 14 Plus', 6], ['iPhone 14 Pro', 7], ['iPhone 14 Pro Max', 8]]),
  fam('apple', 'iPhone 13', [['iPhone 13 mini', 5], ['iPhone 13', 5], ['iPhone 13 Pro', 6], ['iPhone 13 Pro Max', 7]]),
  fam('apple', 'iPhone 12', [['iPhone 12 mini', 4], ['iPhone 12', 4], ['iPhone 12 Pro', 5], ['iPhone 12 Pro Max', 6]]),
  fam('apple', 'iPhone 11', [['iPhone 11', 3], ['iPhone 11 Pro', 4], ['iPhone 11 Pro Max', 4]]),
  fam('apple', 'iPhone X', [['iPhone X', 2], ['iPhone XS', 2], ['iPhone XS Max', 3], ['iPhone XR', 2]]),
  fam('samsung', 'Galaxy S25', [['Galaxy S25', 8], ['Galaxy S25+', 9], ['Galaxy S25 Edge', 9], ['Galaxy S25 Ultra', 11]]),
  fam('samsung', 'Galaxy S24', [['Galaxy S24', 7], ['Galaxy S24 Ultra', 9]]),
]

export const priceFor = (tier: number, base: number) => Math.round((base * (0.6 + tier * 0.09)) / 10) * 10 - 1

export const brl = (v: number, cents = false) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(v)

/** Projeto de demonstração da LBK Studio: o contato cai no WhatsApp da LBK. Troque pelo número real da loja. */
export const WHATSAPP = '5547999687738'
export const waLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`

export const STORE = {
  name: 'Support Cell Lab',
  city: 'Florianópolis · SC',
  address: 'Rua Exemplo, 123 — Centro',
  hours: 'Seg a Sáb · 9h às 19h',
}

/** Créditos exigidos pelas licenças dos modelos 3D em public/models */
export const MODEL_CREDITS = [
  { model: 'iPhone 17 Pro Max', author: 'MajdyModels (MG990)', license: 'CC BY 4.0', url: 'https://sketchfab.com/3d-models/iphone-17-pro-max-87fc1df741384124a8ce0226d2b2058d' },
  { model: 'iPhone 17 Pro', author: 'Ibrahim.Bhl', license: 'CC BY 4.0', url: 'https://sketchfab.com/3d-models/x-4aeeeb41f9d14f96bb3f2589edc3edac' },
  { model: 'iPhone Air', author: 'rtql8d', license: 'CC BY 4.0', url: 'https://sketchfab.com/3d-models/x-66dd43c1660d430593a31652bd265531' },
  { model: 'iPhone 16 Pro Max', author: 'MajdyModels (MG990)', license: 'CC BY 4.0', url: 'https://sketchfab.com/3d-models/x-41a071ae12794b668502f58d1e0fd1a3' },
  { model: 'iPhone 16', author: 'wimell', license: 'Sketchfab Free Standard', url: 'https://sketchfab.com/3d-models/x-d58591e88a824dfd8cef0af616273b02' },
  { model: 'Galaxy S25 Ultra', author: 'vmmaniac', license: 'CC BY 4.0', url: 'https://sketchfab.com/3d-models/x-9cdcd5cff5e9496e88820d306acf4455' },
  { model: 'Galaxy S25', author: 'Blue3D', license: 'CC BY 4.0', url: 'https://sketchfab.com/3d-models/x-947f8afe504c4a4ba605819248d3d2cf' },
]
