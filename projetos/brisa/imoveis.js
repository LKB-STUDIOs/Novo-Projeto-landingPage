/*
 * LISTA DE IMÓVEIS — edite aqui para adicionar, remover ou alterar imóveis.
 *
 * airbnb: cole o link do anúncio real, por exemplo
 *         "https://www.airbnb.com.br/rooms/12345678"
 *         Enquanto não houver link, o botão abre a busca do Airbnb na cidade.
 * fotos:  links de imagens (a primeira é a capa). Se uma imagem não carregar,
 *         o site mostra um fundo colorido no lugar.
 * tags:   frente-mar, piscina, pet, home-office
 */
const U = (id) => `https://images.unsplash.com/${id}?w=1200&q=70`;

window.IMOVEIS = [
  {
    id: "casa-mar-azul",
    nome: "Casa Mar Azul",
    tipo: "Casa",
    cidade: "Bombinhas",
    bairro: "Praia de Bombas",
    hospedes: 8, quartos: 4, banheiros: 3,
    diaria: 980, nota: 4.97, avaliacoes: 128,
    tags: ["frente-mar", "piscina", "pet"],
    resumo: "Casa pé na areia com piscina, deck e churrasqueira. Perfeita para famílias grandes.",
    comodidades: ["Piscina privativa", "Churrasqueira", "Wi-Fi 300 MB", "Ar-condicionado", "Garagem para 3 carros", "Aceita pet"],
    fotos: [U("photo-1499793983690-e29da59ef1c2"), U("photo-1600596542815-ffad4c1539a9"), U("photo-1505691938895-1758d7feb511")],
    airbnb: "",
  },
  {
    id: "studio-orla",
    nome: "Studio Orla",
    tipo: "Apartamento",
    cidade: "Balneário Camboriú",
    bairro: "Barra Sul",
    hospedes: 2, quartos: 1, banheiros: 1,
    diaria: 340, nota: 4.92, avaliacoes: 211,
    tags: ["frente-mar", "home-office"],
    resumo: "Studio moderno de frente para o mar, com varanda e mesa de trabalho.",
    comodidades: ["Vista para o mar", "Mesa de trabalho", "Wi-Fi 500 MB", "Ar-condicionado", "Academia no prédio", "Self check-in"],
    fotos: [U("photo-1522708323590-d24dbb6b0267"), U("photo-1502672260266-1c1ef2d93688"), U("photo-1493809842364-78817add7ffb")],
    airbnb: "",
  },
  {
    id: "chale-mata",
    nome: "Chalé da Mata",
    tipo: "Chalé",
    cidade: "Florianópolis",
    bairro: "Lagoa da Conceição",
    hospedes: 4, quartos: 2, banheiros: 1,
    diaria: 520, nota: 4.95, avaliacoes: 96,
    tags: ["pet", "home-office"],
    resumo: "Chalé de madeira cercado de verde, a 5 minutos da Lagoa. Silêncio e natureza.",
    comodidades: ["Lareira", "Banheira", "Jardim", "Wi-Fi 200 MB", "Cozinha completa", "Aceita pet"],
    fotos: [U("photo-1449844908441-8829872d2607"), U("photo-1586023492125-27b2c045efd7"), U("photo-1505691938895-1758d7feb511")],
    airbnb: "",
  },
  {
    id: "cobertura-sol",
    nome: "Cobertura Sol Nascente",
    tipo: "Apartamento",
    cidade: "Balneário Camboriú",
    bairro: "Centro",
    hospedes: 6, quartos: 3, banheiros: 3,
    diaria: 1450, nota: 4.89, avaliacoes: 64,
    tags: ["frente-mar", "piscina"],
    resumo: "Cobertura duplex com piscina e vista panorâmica da orla.",
    comodidades: ["Piscina na cobertura", "Vista panorâmica", "Churrasqueira", "3 suítes", "2 vagas", "Ar-condicionado"],
    fotos: [U("photo-1600585154340-be6161a56a0c"), U("photo-1560448204-e02f11c3d0e2"), U("photo-1522708323590-d24dbb6b0267")],
    airbnb: "",
  },
  {
    id: "casa-penha",
    nome: "Casa Jardim Penha",
    tipo: "Casa",
    cidade: "Penha",
    bairro: "Armação",
    hospedes: 10, quartos: 4, banheiros: 3,
    diaria: 890, nota: 4.9, avaliacoes: 77,
    tags: ["piscina", "pet"],
    resumo: "Casa ampla perto do parque temático e da praia, com área gourmet completa.",
    comodidades: ["Piscina", "Área gourmet", "Playground", "Wi-Fi", "Garagem", "Aceita pet"],
    fotos: [U("photo-1564013799919-ab600027ffc6"), U("photo-1512917774080-9991f1c4c750"), U("photo-1586023492125-27b2c045efd7")],
    airbnb: "",
  },
  {
    id: "loft-centro",
    nome: "Loft Ilha",
    tipo: "Apartamento",
    cidade: "Florianópolis",
    bairro: "Jurerê",
    hospedes: 3, quartos: 1, banheiros: 1,
    diaria: 410, nota: 4.86, avaliacoes: 143,
    tags: ["home-office", "piscina"],
    resumo: "Loft de pé-direito alto a duas quadras da praia de Jurerê.",
    comodidades: ["Piscina no condomínio", "Mesa de trabalho", "Wi-Fi 400 MB", "Ar-condicionado", "Bicicletas", "Self check-in"],
    fotos: [U("photo-1493809842364-78817add7ffb"), U("photo-1502672260266-1c1ef2d93688"), U("photo-1560448204-e02f11c3d0e2")],
    airbnb: "",
  },
];
