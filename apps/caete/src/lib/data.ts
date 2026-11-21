// Tudo aqui é fictício: empresas, números e cases foram inventados para a demonstração.

export type Cliente = { nome: string; sub: string; marca: 'rombo' | 'onda' | 'folha' | 'sol' | 'torre' | 'gota' | 'hex' | 'seta'; fonte: 'display' | 'sans' | 'mono' }

export const CLIENTES: Cliente[] = [
  { nome: 'Serra Dourada', sub: 'Mineração', marca: 'rombo', fonte: 'display' },
  { nome: 'Atlântica', sub: 'Petroquímica', marca: 'onda', fonte: 'sans' },
  { nome: 'Santa Aurora', sub: 'Usina de açúcar e etanol', marca: 'sol', fonte: 'display' },
  { nome: 'Boa Vista', sub: 'Celulose', marca: 'folha', fonte: 'sans' },
  { nome: 'Rodovias do Cerrado', sub: 'Concessões', marca: 'seta', fonte: 'mono' },
  { nome: 'Porto Alvorada', sub: 'Logística portuária', marca: 'torre', fonte: 'sans' },
  { nome: 'Ventos do Sul', sub: 'Energia eólica', marca: 'hex', fonte: 'display' },
  { nome: 'Rio Claro', sub: 'Saneamento', marca: 'gota', fonte: 'sans' },
  { nome: 'Pedra Alta', sub: 'Cimentos', marca: 'rombo', fonte: 'mono' },
  { nome: 'Tapajós Agro', sub: 'Agronegócio', marca: 'folha', fonte: 'display' },
  { nome: 'Pampa Alimentos', sub: 'Frigorífico', marca: 'sol', fonte: 'sans' },
  { nome: 'Alto Piquiri', sub: 'Hidrelétrica', marca: 'onda', fonte: 'mono' },
]

export const SERVICOS = [
  { n: '01', titulo: 'Licenciamento ambiental', texto: 'Licença Prévia, de Instalação e de Operação, do protocolo ao documento na mão. Estratégia, ritos e acompanhamento junto ao órgão ambiental.', tags: ['LP · LI · LO', 'LAS / RAS', 'Renovação'] },
  { n: '02', titulo: 'EIA/RIMA e estudos', texto: 'Diagnóstico de meio físico, biótico e socioeconômico, com equipe própria de campo e laudos que sobrevivem à audiência pública.', tags: ['EIA/RIMA', 'PCA · RCA', 'Audiência pública'] },
  { n: '03', titulo: 'Recursos hídricos', texto: 'Outorgas de captação e lançamento, balanço hídrico, monitoramento de qualidade da água e planos de contingência.', tags: ['Outorga', 'Balanço hídrico', 'Qualidade da água'] },
  { n: '04', titulo: 'Fauna, flora e áreas degradadas', texto: 'Inventário, resgate e monitoramento de fauna; supressão vegetal; PRAD e compensações com acompanhamento de pega até a devolução da área.', tags: ['PRAD', 'Supressão', 'Compensação'] },
  { n: '05', titulo: 'Resíduos e economia circular', texto: 'PGRS, logística reversa, destinação certificada e projetos que transformam passivo em receita.', tags: ['PGRS', 'Logística reversa', 'Rastreio'] },
  { n: '06', titulo: 'Compliance e auditoria', texto: 'Auditorias legais, ISO 14001, due diligence ambiental em fusões e aquisições e gestão de condicionantes em painel único.', tags: ['ISO 14001', 'Due diligence', 'Condicionantes'] },
]

export const ETAPAS = [
  { n: '01', titulo: 'Enquadramento', texto: 'Lemos o empreendimento, o território e a legislação aplicável. Definimos qual licença, qual órgão e qual caminho tem o menor risco de exigência.', prazo: '1–2 semanas' },
  { n: '02', titulo: 'Diagnóstico de campo', texto: 'Campanhas de fauna, flora, água, solo, ruído e comunidades. Dados primários com rastreabilidade, não cópia de estudo antigo.', prazo: '2–6 meses' },
  { n: '03', titulo: 'Estudos e protocolo', texto: 'Redação técnica, mitigação e programas ambientais. Protocolamos já com a documentação revisada para evitar ofício de complementação.', prazo: '1–2 meses' },
  { n: '04', titulo: 'Análise e audiências', texto: 'Acompanhamos o processo semana a semana, respondemos às exigências do órgão e preparamos a equipe para a audiência pública.', prazo: '4–12 meses' },
  { n: '05', titulo: 'Licença e condicionantes', texto: 'Com a licença emitida, transformamos cada condicionante em tarefa, prazo e responsável. Nada vence sem alerta.', prazo: 'Contínuo' },
]

export type Case = { id: string; setor: string; titulo: string; cliente: string; texto: string; resultado: string[]; ano: string; cor: string; seed: number }

export const CASES: Case[] = [
  { id: 'serra', setor: 'Mineração', titulo: 'Expansão de cava em área de Mata Atlântica', cliente: 'Serra Dourada', texto: 'Licença de Instalação para ampliar a lavra em 38% sem supressão em APP. O desenho da mitigação evitou 112 ha de impacto direto.', resultado: ['LI em 11 meses', '112 ha preservados', 'Zero autuações'], ano: '2024', cor: '#3f5b3a', seed: 11 },
  { id: 'ventos', setor: 'Energia', titulo: 'Complexo eólico com monitoramento de aves', cliente: 'Ventos do Sul', texto: 'Estudos de fauna voadora em duas rotas migratórias e reposicionamento de 14 aerogeradores antes do protocolo.', resultado: ['180 MW licenciados', '14 torres realocadas', 'LP + LI em um ciclo'], ano: '2023', cor: '#6b7a3a', seed: 29 },
  { id: 'porto', setor: 'Logística', titulo: 'Dragagem e novo berço em estuário sensível', cliente: 'Porto Alvorada', texto: 'Plano de dragagem com janelas de defeso, monitoramento de sedimentos e acordo com colônia de pescadores.', resultado: ['Obra sem paralisação', '9 comunidades ouvidas', 'LO renovada'], ano: '2024', cor: '#44677a', seed: 47 },
  { id: 'rio', setor: 'Saneamento', titulo: 'Outorgas e ETE para cidade de 240 mil habitantes', cliente: 'Rio Claro', texto: 'Regularização de 31 pontos de captação e lançamento, com balanço hídrico por bacia e plano de contingência.', resultado: ['31 outorgas', '−42% em DBO lançada', 'Meta do TAC cumprida'], ano: '2022', cor: '#4a7468', seed: 63 },
  { id: 'agro', setor: 'Agronegócio', titulo: 'Regularização de 18 fazendas e CAR retificado', cliente: 'Tapajós Agro', texto: 'Retificação de cadastros, PRAD de 2.300 ha e plano de recuperação com espécies nativas e monitoramento por satélite.', resultado: ['18 fazendas regulares', '2.300 ha em recuperação', 'Acesso a crédito verde'], ano: '2023', cor: '#8a6a2f', seed: 81 },
]

export const NUMEROS = [
  { valor: 340, sufixo: '+', rotulo: 'licenças emitidas' },
  { valor: 19, sufixo: ' anos', rotulo: 'de campo e de órgão ambiental' },
  { valor: 92, sufixo: '%', rotulo: 'dos processos sem exigência extra' },
  { valor: 41, sufixo: ' mil ha', rotulo: 'preservados em projetos' },
]

// Simulador (estimativas ilustrativas, não valem como orientação legal)
export const PORTES = ['Pequeno', 'Médio', 'Grande'] as const
export const ATIVIDADES = [
  { id: 'mineracao', nome: 'Mineração', base: 8, estudo: 'EIA/RIMA' },
  { id: 'energia', nome: 'Energia (eólica/solar/PCH)', base: 6, estudo: 'EIA/RIMA ou RAS' },
  { id: 'industria', nome: 'Indústria', base: 5, estudo: 'PCA / RCA' },
  { id: 'infra', nome: 'Infraestrutura e logística', base: 9, estudo: 'EIA/RIMA' },
  { id: 'agro', nome: 'Agroindústria', base: 4, estudo: 'RAS / Plano de Controle' },
  { id: 'saneamento', nome: 'Saneamento', base: 5, estudo: 'RAS' },
] as const
