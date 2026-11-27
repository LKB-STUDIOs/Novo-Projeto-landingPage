/*
 * VÉRTICE IMÓVEIS — imobiliária FICTÍCIA para demonstração no portfólio.
 *
 * Imóveis, preços, corretores e endereços são inventados.
 * WHATSAPP: troque pelo número real da imobiliária (só dígitos, com 55 + DDD).
 * fotos: links de imagens (a primeira é a capa). Se uma não carregar, aparece um fundo colorido.
 */
export const IMOBILIARIA = {
  nome: "Vértice Imóveis",
  whatsapp: "5547999687738",
  whatsappExibicao: "(47) 9 9968-7738",
  telefone: "(47) 3000-0000",
  email: "contato@verticeimoveis.com.br",
  creci: "CRECI 0000-J",
  cidade: "Joinville · SC",
};

export type Negocio = "venda" | "aluguel";
export type Tipo = "Apartamento" | "Casa" | "Sobrado" | "Terreno" | "Comercial" | "Cobertura";
export type Imovel = {
  codigo: string;
  titulo: string;
  negocio: Negocio;
  tipo: Tipo;
  bairro: string;
  cidade: string;
  preco: number;
  condominio?: number;
  iptu?: number;
  area: number;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  destaque?: boolean;
  lancamento?: boolean;
  aceitaPet?: boolean;
  mobiliado?: boolean;
  resumo: string;
  itens: string[];
  fotos: string[];
};

const U = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;
export const foto = U;

export const IMOVEIS: Imovel[] = [
  {
    codigo: "VT1042", titulo: "Apartamento com sacada gourmet", negocio: "venda", tipo: "Apartamento",
    bairro: "América", cidade: "Joinville", preco: 789000, condominio: 820, iptu: 210,
    area: 98, quartos: 3, suites: 1, banheiros: 2, vagas: 2, destaque: true, aceitaPet: true,
    resumo: "Andar alto, sol da manhã e sacada com churrasqueira. A duas quadras do parque e de escolas.",
    itens: ["Sacada gourmet", "Churrasqueira", "Piscina no condomínio", "Academia", "Portaria 24h", "Elevador"],
    fotos: [U("photo-1502672260266-1c1ef2d93688"), U("photo-1522708323590-d24dbb6b0267"), U("photo-1493809842364-78817add7ffb")],
  },
  {
    codigo: "VT2087", titulo: "Casa térrea com piscina", negocio: "venda", tipo: "Casa",
    bairro: "Glória", cidade: "Joinville", preco: 1290000, iptu: 380,
    area: 210, quartos: 3, suites: 2, banheiros: 3, vagas: 3, destaque: true, aceitaPet: true,
    resumo: "Casa em rua tranquila, terreno de 450 m², piscina aquecida e espaço gourmet integrado.",
    itens: ["Piscina aquecida", "Espaço gourmet", "Jardim", "Energia solar", "Portão eletrônico", "Lavanderia"],
    fotos: [U("photo-1564013799919-ab600027ffc6"), U("photo-1512917774080-9991f1c4c750"), U("photo-1586023492125-27b2c045efd7")],
  },
  {
    codigo: "VT3011", titulo: "Studio mobiliado perto da universidade", negocio: "aluguel", tipo: "Apartamento",
    bairro: "Bom Retiro", cidade: "Joinville", preco: 1850, condominio: 390, iptu: 45,
    area: 34, quartos: 1, suites: 0, banheiros: 1, vagas: 1, mobiliado: true,
    resumo: "Pronto para morar: cozinha planejada, ar-condicionado e internet inclusa no condomínio.",
    itens: ["Mobiliado", "Ar-condicionado", "Internet inclusa", "Lavanderia coletiva", "Bicicletário", "Portaria remota"],
    fotos: [U("photo-1493809842364-78817add7ffb"), U("photo-1502672260266-1c1ef2d93688"), U("photo-1560448204-e02f11c3d0e2")],
  },
  {
    codigo: "VT1120", titulo: "Cobertura duplex com terraço", negocio: "venda", tipo: "Cobertura",
    bairro: "Atiradores", cidade: "Joinville", preco: 2150000, condominio: 1650, iptu: 520,
    area: 240, quartos: 4, suites: 3, banheiros: 5, vagas: 3, destaque: true,
    resumo: "Terraço com piscina privativa e vista para a Serra do Mar. Acabamento de alto padrão.",
    itens: ["Piscina privativa", "Terraço", "Vista para a serra", "Automação", "Depósito", "3 vagas cobertas"],
    fotos: [U("photo-1600585154340-be6161a56a0c"), U("photo-1560448204-e02f11c3d0e2"), U("photo-1600596542815-ffad4c1539a9")],
  },
  {
    codigo: "VT3058", titulo: "Sobrado em condomínio fechado", negocio: "aluguel", tipo: "Sobrado",
    bairro: "Costa e Silva", cidade: "Joinville", preco: 4200, condominio: 450, iptu: 160,
    area: 140, quartos: 3, suites: 1, banheiros: 3, vagas: 2, aceitaPet: true,
    resumo: "Condomínio com área verde, playground e segurança. Ótimo para famílias com crianças.",
    itens: ["Condomínio fechado", "Playground", "Churrasqueira", "Quintal", "Aceita pet", "Salão de festas"],
    fotos: [U("photo-1568605114967-8130f3a36994"), U("photo-1586023492125-27b2c045efd7"), U("photo-1505691938895-1758d7feb511")],
  },
  {
    codigo: "VT4003", titulo: "Sala comercial no centro", negocio: "aluguel", tipo: "Comercial",
    bairro: "Centro", cidade: "Joinville", preco: 2600, condominio: 520, iptu: 120,
    area: 52, quartos: 0, suites: 0, banheiros: 1, vagas: 1,
    resumo: "Sala pronta com recepção, divisória de vidro e ar-condicionado. Prédio com estacionamento rotativo.",
    itens: ["Ar-condicionado", "Recepção", "Copa", "Elevador", "Estacionamento", "Acessibilidade"],
    fotos: [U("photo-1497366216548-37526070297c"), U("photo-1497366811353-6870744d04b2"), U("photo-1524758631624-e2822e304c36")],
  },
  {
    codigo: "VT5021", titulo: "Terreno plano em loteamento novo", negocio: "venda", tipo: "Terreno",
    bairro: "Pirabeiraba", cidade: "Joinville", preco: 245000,
    area: 420, quartos: 0, suites: 0, banheiros: 0, vagas: 0, lancamento: true,
    resumo: "Lote plano, escriturado, com rede de água, luz e asfalto. Cercado de natureza e perto da BR-101.",
    itens: ["Escriturado", "Asfalto", "Água e luz", "Plano", "Pronto para construir", "Aceita financiamento"],
    fotos: [U("photo-1500382017468-9049fed747ef"), U("photo-1501785888041-af3ef285b470"), U("photo-1441974231531-c6227db76b6e")],
  },
  {
    codigo: "VT1199", titulo: "Garden com quintal privativo", negocio: "venda", tipo: "Apartamento",
    bairro: "Anita Garibaldi", cidade: "Joinville", preco: 615000, condominio: 640, iptu: 150,
    area: 112, quartos: 2, suites: 1, banheiros: 2, vagas: 2, lancamento: true, aceitaPet: true,
    resumo: "Lançamento com entrega em 2027. Quintal de 40 m² e lazer completo no rooftop.",
    itens: ["Quintal privativo", "Rooftop", "Coworking", "Pet place", "Bicicletário", "Carregador para carro elétrico"],
    fotos: [U("photo-1545324418-cc1a3fa10c00"), U("photo-1600607687939-ce8a6c25118c"), U("photo-1600566753190-17f0baa2a6c3")],
  },
  {
    codigo: "VT3102", titulo: "Casa com edícula e jardim", negocio: "aluguel", tipo: "Casa",
    bairro: "Saguaçu", cidade: "Joinville", preco: 3500, iptu: 140,
    area: 160, quartos: 3, suites: 1, banheiros: 2, vagas: 2, aceitaPet: true,
    resumo: "Casa ampla com edícula para escritório ou visitas, jardim grande e garagem coberta.",
    itens: ["Edícula", "Jardim", "Churrasqueira", "Garagem coberta", "Aceita pet", "Área de serviço"],
    fotos: [U("photo-1570129477492-45c003edd2be"), U("photo-1484154218962-a197022b5858"), U("photo-1556909114-f6e7ad7d3136")],
  },
  {
    codigo: "VT1230", titulo: "Apartamento compacto com lazer", negocio: "venda", tipo: "Apartamento",
    bairro: "Itaum", cidade: "Joinville", preco: 329000, condominio: 380, iptu: 70,
    area: 54, quartos: 2, suites: 0, banheiros: 1, vagas: 1,
    resumo: "Primeiro imóvel com financiamento facilitado. Condomínio com piscina e salão de festas.",
    itens: ["Piscina", "Salão de festas", "Playground", "Portaria 24h", "Aceita financiamento", "Elevador"],
    fotos: [U("photo-1522708323590-d24dbb6b0267"), U("photo-1484154218962-a197022b5858"), U("photo-1502672260266-1c1ef2d93688")],
  },
  {
    codigo: "VT4019", titulo: "Galpão logístico com pé-direito alto", negocio: "aluguel", tipo: "Comercial",
    bairro: "Zona Industrial Norte", cidade: "Joinville", preco: 18500, iptu: 980,
    area: 1200, quartos: 0, suites: 0, banheiros: 4, vagas: 12,
    resumo: "Galpão com docas, pé-direito de 10 m e escritório no mezanino. Acesso rápido à BR-101.",
    itens: ["2 docas", "Pé-direito 10 m", "Mezanino", "Pátio de manobra", "Energia trifásica", "Portaria"],
    fotos: [U("photo-1586528116311-ad8dd3c8310d"), U("photo-1553413077-190dd305871c"), U("photo-1497366216548-37526070297c")],
  },
  {
    codigo: "VT2140", titulo: "Sobrado moderno com home office", negocio: "venda", tipo: "Sobrado",
    bairro: "Santo Antônio", cidade: "Joinville", preco: 980000, iptu: 260,
    area: 186, quartos: 3, suites: 3, banheiros: 4, vagas: 2, destaque: true,
    resumo: "Projeto contemporâneo com pé-direito duplo, escritório isolado e cozinha integrada.",
    itens: ["Pé-direito duplo", "Home office", "3 suítes", "Cozinha planejada", "Espaço gourmet", "Energia solar"],
    fotos: [U("photo-1600596542815-ffad4c1539a9"), U("photo-1600607687939-ce8a6c25118c"), U("photo-1600566753190-17f0baa2a6c3")],
  },
];

export const BAIRROS = [
  { nome: "América", desc: "Arborizado e perto de tudo", foto: U("photo-1449824913935-59a10b8d2000", 800) },
  { nome: "Atiradores", desc: "Alto padrão e tranquilidade", foto: U("photo-1480074568708-e7b720bb3f09", 800) },
  { nome: "Glória", desc: "Casas amplas e muito verde", foto: U("photo-1512917774080-9991f1c4c750", 800) },
  { nome: "Centro", desc: "Comércio, serviços e mobilidade", foto: U("photo-1477959858617-67f85cf4f1df", 800) },
];

export const CORRETORES = [
  { nome: "Marina Costa", area: "Venda · alto padrão", creci: "CRECI 00001-F", foto: U("photo-1573496359142-b8d87734a5a2", 400) },
  { nome: "Rafael Souza", area: "Locação residencial", creci: "CRECI 00002-F", foto: U("photo-1560250097-0b93528c311a", 400) },
  { nome: "Juliana Prado", area: "Lançamentos", creci: "CRECI 00003-F", foto: U("photo-1580489944761-15a19d654956", 400) },
  { nome: "Carlos Mendes", area: "Imóveis comerciais", creci: "CRECI 00004-F", foto: U("photo-1507003211169-0a1dd7228f2d", 400) },
];

export const UNIDADES = [
  { nome: "Vértice Centro", end: "Rua das Palmeiras, 100 · Centro", horario: "Seg a sex, 8h às 18h · Sáb, 9h às 13h" },
  { nome: "Vértice América", end: "Av. dos Ipês, 2450 · América", horario: "Seg a sex, 9h às 19h" },
  { nome: "Vértice Zona Sul", end: "Rua dos Jacarandás, 780 · Itaum", horario: "Seg a sex, 8h às 18h" },
];

export const DEPOIMENTOS = [
  { nome: "Patrícia e Leandro", texto: "Encontramos o apartamento em uma semana. A corretora entendeu exatamente o que a gente queria e cuidou de toda a papelada.", tipo: "Compraram no América" },
  { nome: "Thiago R.", texto: "Aluguel sem fiador e contrato digital. Assinei pelo celular e peguei as chaves no mesmo dia.", tipo: "Alugou no Bom Retiro" },
  { nome: "Dona Helena", texto: "Atendimento atencioso do começo ao fim. Me explicaram cada etapa do financiamento com paciência.", tipo: "Comprou no Itaum" },
];
