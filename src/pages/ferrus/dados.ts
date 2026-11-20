/**
 * Ferrus OS — base de dados fictícia da demonstração.
 * Empresa, pessoas, clientes e fornecedores são inventados. Tudo fica só no navegador de quem abre.
 */
import { criarSorteio, diasAtras, iso, type Sorteio } from "./nucleo";

export const EMPRESA = "Metalúrgica Aurora";
export const UNIDADES = ["Unidade Norte", "Unidade Sul", "Unidade Vale"] as const;
export const SETORES = ["Estamparia", "Soldagem", "Usinagem", "Injeção", "Pintura", "Polimento", "Cromagem", "Montagem"] as const;
export const DEFEITOS = ["Rebarba", "Bolha", "Escorrido", "Fora de cor", "Risco", "Falta de solda", "Empenamento", "Rechupe", "Mancha", "Trinca", "Dimensional", "Falta de componente"] as const;
export const CLIENTES = ["Veloce Motors", "Atlas Automotiva", "Kora Eletro", "Nordline Móveis", "Prisma Duas Rodas", "Valença Agro"] as const;

const NOMES = [
  "Marina Alves", "Carlos Mendes", "Juliana Rocha", "Pedro Henrique", "Ana Paula Souza", "Rafael Torres", "Bianca Lopes",
  "Diego Faria", "Larissa Campos", "Thiago Nunes", "Fernanda Lima", "Gustavo Prado", "Camila Ribeiro", "Lucas Martins",
  "Patrícia Gomes", "Renato Dias", "Aline Barros", "Eduardo Pires", "Sabrina Costa", "Vinícius Melo", "Roberta Sales",
  "Henrique Vaz", "Natália Freitas", "Otávio Ramos",
] as const;
export const PECAS = [
  ["AUR-1042", "Suporte lateral do banco"], ["AUR-1187", "Carcaça do motor"], ["AUR-2210", "Pedal de freio"],
  ["AUR-2318", "Grade frontal cromada"], ["AUR-3320", "Braço de suspensão"], ["AUR-3415", "Tampa do reservatório"],
  ["AUR-4021", "Puxador cromado"], ["AUR-4106", "Base do ventilador"], ["AUR-4550", "Moldura do farol"],
  ["AUR-5012", "Pé de mesa tubular"], ["AUR-5230", "Guidão esportivo"], ["AUR-6105", "Engate do implemento"],
] as const;

// ---------------------------------------------------------------- tipos
export type Unidade = (typeof UNIDADES)[number];
export type Registro = {
  id: number; data: string; turno: "A" | "B" | "C"; unidade: Unidade; setor: string; op: string; codigo: string;
  operador: string; inspecionada: number; reprovada: number; defeitos: string[];
};
export type StatusMaquina = "Produzindo" | "Setup" | "Parada" | "Manutenção";
export type Maquina = {
  id: string; nome: string; setor: string; unidade: Unidade; status: StatusMaquina; oee: number;
  disp: number; perf: number; qual: number; op: string; peca: string; produzidas: number; meta: number;
};
export type StatusNC = "Em análise" | "Ação corretiva" | "Verificação" | "Encerrada";
export type NC = {
  id: string; setor: string; unidade: Unidade; desc: string; grav: "Baixa" | "Média" | "Alta"; status: StatusNC;
  data: string; resp: string; origem: "Interna" | "Cliente" | "Fornecedor";
};
export type Reclamacao = { id: string; cliente: string; peca: string; desc: string; data: string; etapa: number; ppm: number };
export type StatusPPAP = "No prazo" | "Atenção" | "Atrasado" | "Aprovado";
export type ProjetoPPAP = {
  id: string; codigo: string; peca: string; cliente: string; nivel: number; fase: number; elementos: number;
  prazo: string; resp: string; status: StatusPPAP;
};
export type StatusECN = "Solicitada" | "Em análise" | "Aprovada" | "Implementada";
export type ECN = { id: string; titulo: string; peca: string; motivo: string; impacto: "Baixo" | "Médio" | "Alto"; status: StatusECN; data: string; resp: string };
export type ItemBOM = { cod: string; nome: string; qtd: number; un: string; custo: number; filhos?: ItemBOM[] };
export type Fornecedor = {
  nome: string; categoria: string; qualidade: number; entrega: number; preco: number; iqf: number;
  classe: "A" | "B" | "C"; gasto: number; cidade: string;
};
export type StatusPedido = "Cotação" | "Aprovação" | "Emitido" | "Em trânsito" | "Recebido" | "Atrasado";
export type Pedido = { id: string; fornecedor: string; item: string; categoria: string; valor: number; emissao: string; previsao: string; status: StatusPedido };
export type Requisicao = { id: string; solicitante: string; setor: string; item: string; qtd: number; valor: number; data: string; urgencia: "Normal" | "Urgente" };
export type ItemEstoque = { cod: string; item: string; categoria: string; saldo: number; minimo: number; maximo: number; un: string; custo: number };
export type EtapaExpedicao = "Separação" | "Conferência" | "Carregado" | "Em trânsito" | "Entregue";
export type Expedicao = { id: string; cliente: string; nf: string; volumes: number; peso: number; etapa: EtapaExpedicao; previsao: string; transportadora: string; noPrazo: boolean };
export type StatusOS = "Aberta" | "Em execução" | "Aguardando peça" | "Concluída";
export type OrdemServico = {
  id: string; maquina: string; unidade: Unidade; tipo: "Corretiva" | "Preventiva" | "Preditiva"; prioridade: "Baixa" | "Média" | "Alta" | "Crítica";
  desc: string; abertura: string; status: StatusOS; tecnico: string; horas: number;
};
export type Molde = { cod: string; nome: string; maquina: string; ciclos: number; limite: number; proxima: string };
export type Instrumento = { cod: string; nome: string; local: string; venc: string; ultima: string; erro: number; tolerancia: number };
export type EstudoMSA = { caracteristica: string; instrumento: string; rr: number; ndc: number };
export type Ensaio = {
  id: string; tipo: string; peca: string; lote: string; resultado: number; min: number; max: number; un: string;
  data: string; analista: string; status: "Na fila" | "Em ensaio" | "Concluído";
};
export type TipoOcorrencia = "Condição insegura" | "Quase acidente" | "Primeiros socorros" | "Sem afastamento" | "Com afastamento";
export type OcorrenciaST = {
  id: string; tipo: TipoOcorrencia; setor: string; unidade: Unidade; data: string; desc: string; status: "Aberta" | "Em tratamento" | "Fechada";
};
export type Treinamento = { nr: string; nome: string; total: number; emDia: number; vencendo: number };
export type StatusChamado = "Novo" | "Em atendimento" | "Aguardando usuário" | "Resolvido";
export type Chamado = {
  id: string; titulo: string; categoria: string; solicitante: string; setor: string; prioridade: "Baixa" | "Média" | "Alta" | "Crítica";
  status: StatusChamado; aberto: string; horas: number; sla: number;
};
export type Ativo = { tag: string; tipo: string; modelo: string; usuario: string; local: string; status: "Em uso" | "Estoque" | "Manutenção"; garantia: string };
export type Usuario = { nome: string; email: string; perfil: string; unidade: string; ultimoAcesso: string; ativo: boolean };
export type Pendente = { nome: string; email: string; unidade: string; pediu: string; setor: string };
export type Auditoria = { quando: string; quem: string; acao: string; modulo: string };
export type AcaoPlano = { id: string; area: string; acao: string; resp: string; prazo: string; progresso: number };

export type Banco = {
  versao: number; geradoEm: string;
  registros: Registro[]; maquinas: Maquina[];
  ncs: NC[]; reclamacoes: Reclamacao[]; cep: number[];
  ppap: ProjetoPPAP[]; ecns: ECN[]; bom: ItemBOM;
  fornecedores: Fornecedor[]; pedidos: Pedido[]; requisicoes: Requisicao[]; gastoMensal: number[];
  estoque: ItemEstoque[]; expedicoes: Expedicao[]; otdMensal: number[];
  ordens: OrdemServico[]; moldes: Molde[]; custoManutencao: number[]; mtbf: number[];
  instrumentos: Instrumento[]; msa: EstudoMSA[];
  ensaios: Ensaio[];
  ambiental: { agua: number[]; energia: number[]; co2: number[]; residuos: { tipo: string; t: number }[]; reciclagem: number[] };
  licencas: { nome: string; orgao: string; venc: string }[];
  ocorrencias: OcorrenciaST[]; treinamentos: Treinamento[]; ultimoAfastamento: string;
  chamados: Chamado[]; ativos: Ativo[]; sgsi: { dominio: string; conf: number }[]; servicos: { nome: string; uptime: number; ok: boolean }[];
  usuarios: Usuario[]; pendentes: Pendente[]; permissoes: Record<string, string[]>; auditoria: Auditoria[];
  acoes: AcaoPlano[];
  faturamento: { real: number[]; meta: number[] };
};

export const VERSAO = 3;

// ---------------------------------------------------------------- geração
const pad = (n: number, t = 4) => String(n).padStart(t, "0");
const email = (nome: string) =>
  nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ")[0] + "@aurora.ind.br";
const horaAtras = (s: Sorteio, maxH: number) => new Date(Date.now() - s.entre(5, maxH * 60) * 60000).toISOString();

function producao(s: Sorteio) {
  const registros: Registro[] = [];
  let id = 50210;
  for (let dia = 0; dia < 14; dia++) {
    for (let k = 0; k < 22; k++) {
      const setor = s.um(SETORES);
      const insp = s.entre(120, 900);
      const taxa = setor === "Pintura" || setor === "Cromagem" ? 0.065 : setor === "Injeção" ? 0.045 : 0.03;
      const rep = Math.round(insp * s.r() * taxa * (dia < 3 ? 0.8 : 1));
      const [cod] = s.um(PECAS);
      registros.push({
        id: id++, data: diasAtras(dia), turno: s.um(["A", "B", "C"] as const), unidade: s.um(UNIDADES), setor,
        op: "OP-" + s.entre(31000, 31999), codigo: cod, operador: s.um(NOMES), inspecionada: insp, reprovada: rep,
        defeitos: rep ? [...new Set([s.peso(DEFEITOS.map((d, i) => [d, 12 - i] as const)), s.um(DEFEITOS)])].slice(0, rep > 8 ? 2 : 1) : [],
      });
    }
  }
  registros.sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);

  const maquinas: Maquina[] = [];
  const tipos: [string, string, number][] = [
    ["Prensa", "Estamparia", 4], ["Robô de solda", "Soldagem", 4], ["Centro CNC", "Usinagem", 3], ["Injetora", "Injeção", 6],
    ["Cabine", "Pintura", 3], ["Politriz", "Polimento", 2], ["Linha galvânica", "Cromagem", 2], ["Célula", "Montagem", 4],
  ];
  for (const [tipo, setor, n] of tipos) {
    for (let i = 1; i <= n; i++) {
      const status = s.peso<StatusMaquina>([["Produzindo", 70], ["Setup", 10], ["Parada", 9], ["Manutenção", 6]]);
      const disp = status === "Produzindo" ? s.real(84, 97) : s.real(55, 80);
      const perf = s.real(78, 96);
      const qual = s.real(94, 99.6);
      const meta = s.entre(8, 40) * 100;
      maquinas.push({
        id: `${tipo.slice(0, 3).toUpperCase()}-${pad(i, 2)}`, nome: `${tipo} ${pad(i, 2)}`, setor, unidade: UNIDADES[(i + n) % 3]!,
        status, disp, perf, qual, oee: (disp * perf * qual) / 10000, op: "OP-" + s.entre(31000, 31999), peca: s.um(PECAS)[1],
        produzidas: Math.round(meta * s.real(0.35, 0.95)), meta,
      });
    }
  }
  return { registros, maquinas };
}

function qualidade(s: Sorteio) {
  const descs: [string, string][] = [
    ["Pintura", "Variação de tonalidade no lote de acabamento grafite"], ["Soldagem", "Falta de fusão no cordão do suporte lateral"],
    ["Injeção", "Rechupe recorrente na cavidade 3 do molde 14"], ["Montagem", "Componente faltante em kit de expedição"],
    ["Polimento", "Riscos após troca do disco de polimento"], ["Cromagem", "Camada de cromo abaixo do especificado"],
    ["Estamparia", "Rebarba acima de 0,2 mm na borda de corte"], ["Usinagem", "Furo fora da tolerância de posição"],
    ["Pintura", "Escorrido na aresta inferior da peça"], ["Injeção", "Empenamento após desmoldagem"],
    ["Soldagem", "Respingos aderidos na face aparente"], ["Montagem", "Torque abaixo do especificado em 3 parafusos"],
    ["Cromagem", "Manchas por contaminação do banho"], ["Estamparia", "Trinca na região de dobra a 90°"],
  ];
  const fluxo: StatusNC[] = ["Em análise", "Ação corretiva", "Verificação", "Encerrada"];
  const ncs: NC[] = descs.map(([setor, desc], i) => ({
    id: "NC-" + pad(318 - i), setor, desc, unidade: s.um(UNIDADES), grav: s.peso([["Baixa", 3], ["Média", 4], ["Alta", 2]] as const),
    status: i < 3 ? "Em análise" : i < 6 ? fluxo[s.entre(0, 2)]! : s.peso([["Verificação", 1], ["Encerrada", 3]] as const),
    data: diasAtras(Math.floor(i * 1.7)), resp: s.um(NOMES), origem: s.peso([["Interna", 6], ["Cliente", 2], ["Fornecedor", 2]] as const),
  }));
  const reclamacoes: Reclamacao[] = ([
    ["Veloce Motors", "Grade frontal cromada", "Bolhas na camada de cromo em 12 peças", 4, 180],
    ["Atlas Automotiva", "Braço de suspensão", "Dimensional fora no furo de fixação", 6, 95],
    ["Kora Eletro", "Base do ventilador", "Peças com rebarba no encaixe", 8, 60],
    ["Prisma Duas Rodas", "Guidão esportivo", "Risco na pintura após transporte", 3, 140],
    ["Nordline Móveis", "Pé de mesa tubular", "Solda com respingos aparentes", 2, 70],
  ] as const).map(([cliente, peca, desc, etapa, ppm], i) => ({ id: "RC-" + pad(77 - i, 3), cliente, peca, desc, etapa, ppm, data: diasAtras(i * 6 + 2) }));
  const cep = [...Array(30)].map((_, i) => +(s.normal(24, 0.55) + (i > 22 ? 0.25 : 0)).toFixed(2));
  return { ncs, reclamacoes, cep };
}

function engenharia(s: Sorteio) {
  const ppap: ProjetoPPAP[] = PECAS.slice(0, 10).map(([codigo, peca], i) => {
    const fase = s.entre(1, 5);
    const elementos = fase === 5 ? 18 : Math.min(17, fase * 3 + s.entre(0, 3));
    const prazo = diasAtras(-s.entre(-6, 70));
    const status: StatusPPAP = elementos === 18 ? "Aprovado" : prazo < diasAtras(0) ? "Atrasado" : s.r() < 0.3 ? "Atenção" : "No prazo";
    return { id: "PPAP-" + pad(2260 + i), codigo, peca, cliente: CLIENTES[i % CLIENTES.length]!, nivel: s.um([2, 3, 3, 3, 4]), fase, elementos, prazo, resp: s.um(NOMES), status };
  });
  const status: StatusECN[] = ["Solicitada", "Em análise", "Em análise", "Aprovada", "Aprovada", "Implementada", "Implementada"];
  const ecns: ECN[] = ([
    ["Troca do aço SAE 1020 por SAE 1010", "Suporte lateral do banco", "Redução de custo"],
    ["Novo raio de dobra na aba de fixação", "Braço de suspensão", "Trinca em campo"],
    ["Inclusão de furo de drenagem", "Carcaça do motor", "Pedido do cliente"],
    ["Alteração da tonalidade para grafite fosco", "Moldura do farol", "Novo modelo do cliente"],
    ["Redução da espessura da camada de níquel", "Puxador cromado", "Otimização de processo"],
    ["Mudança do fornecedor de parafusos M6", "Base do ventilador", "Desempenho do fornecedor"],
    ["Novo dispositivo de solda com 4 pontos", "Pé de mesa tubular", "Melhoria de qualidade"],
  ] as const).map(([titulo, peca, motivo], i) => ({
    id: "ECN-" + pad(145 - i, 3), titulo, peca, motivo, impacto: s.um(["Baixo", "Médio", "Alto"] as const), status: status[i]!, data: diasAtras(i * 5 + 1), resp: s.um(NOMES),
  }));
  const bom: ItemBOM = {
    cod: "AUR-3320", nome: "Braço de suspensão (conjunto)", qtd: 1, un: "UN", custo: 0, filhos: [
      { cod: "AUR-3320-01", nome: "Braço estampado", qtd: 1, un: "UN", custo: 0, filhos: [
        { cod: "MP-0112", nome: "Chapa de aço 3,0 mm", qtd: 1.8, un: "kg", custo: 9.4 },
        { cod: "PR-0031", nome: "Processo de estampagem", qtd: 1, un: "op", custo: 3.1 },
      ] },
      { cod: "AUR-3320-02", nome: "Bucha de borracha", qtd: 2, un: "UN", custo: 4.2 },
      { cod: "AUR-3320-03", nome: "Pino de articulação", qtd: 1, un: "UN", custo: 0, filhos: [
        { cod: "MP-0207", nome: "Barra redonda Ø16", qtd: 0.32, un: "kg", custo: 11.8 },
        { cod: "PR-0045", nome: "Usinagem CNC", qtd: 1, un: "op", custo: 5.6 },
      ] },
      { cod: "AUR-3320-04", nome: "Porca autotravante M12", qtd: 2, un: "UN", custo: 0.9 },
      { cod: "PR-0090", nome: "Pintura e-coat preto", qtd: 1, un: "op", custo: 6.3 },
    ],
  };
  return { ppap, ecns, bom };
}

function suprimentos(s: Sorteio) {
  const base: [string, string, string][] = [
    ["Laminados Serra Azul", "Aço e metais", "Volta Redonda/RJ"], ["Tintas Horizonte", "Tintas e químicos", "Sumaré/SP"],
    ["Polímeros Ipê", "Resinas plásticas", "Camaçari/BA"], ["Fixa Forte Parafusos", "Fixadores", "Caxias do Sul/RS"],
    ["Embalar Pack", "Embalagens", "Joinville/SC"], ["Química Vale Verde", "Tintas e químicos", "Cubatão/SP"],
    ["Abrasivos Pontal", "Abrasivos", "Indaiatuba/SP"], ["Galvânica Andorinha", "Serviços de cromagem", "Guarulhos/SP"],
    ["Ferramentaria Delta", "Ferramentaria", "Jundiaí/SP"], ["Gases Industriais Sol", "Gases", "Betim/MG"],
  ];
  const fornecedores: Fornecedor[] = base.map(([nome, categoria, cidade]) => {
    const qualidade = s.entre(72, 99), entrega = s.entre(65, 99), preco = s.entre(70, 96);
    const iqf = Math.round(qualidade * 0.5 + entrega * 0.3 + preco * 0.2);
    const classe: Fornecedor["classe"] = iqf >= 88 ? "A" : iqf >= 78 ? "B" : "C";
    return { nome, categoria, cidade, qualidade, entrega, preco, iqf, classe, gasto: s.entre(40, 680) * 1000 };
  }).sort((a, b) => b.iqf - a.iqf);
  const itens: [string, string][] = [
    ["Bobina de aço SAE 1010 3,0 mm", "Aço e metais"], ["Tinta pó poliéster preta", "Tintas e químicos"], ["Polipropileno com 20% talco", "Resinas plásticas"],
    ["Parafuso sextavado M8 zincado", "Fixadores"], ["Caixa de papelão ondulado 60x40", "Embalagens"], ["Disco de lixa grão 120", "Abrasivos"],
    ["Ácido crômico (banho)", "Tintas e químicos"], ["Arame de solda ER70S-6", "Aço e metais"], ["Inserto de metal duro", "Ferramentaria"],
    ["Cilindro de argônio", "Gases"], ["Tubo redondo Ø25 x 1,5", "Aço e metais"], ["Filme stretch 50 cm", "Embalagens"],
  ];
  const statusP: StatusPedido[] = ["Cotação", "Aprovação", "Emitido", "Em trânsito", "Recebido", "Atrasado"];
  const pesos = [2, 2, 4, 4, 5, 1];
  const pedidos: Pedido[] = [...Array(18)].map((_, i) => {
    const [item, categoria] = s.um(itens);
    const f = fornecedores.find((x) => x.categoria === categoria) ?? s.um(fornecedores);
    return {
      id: "PC-" + pad(8840 - i), fornecedor: f.nome, item, categoria, valor: s.entre(18, 420) * 100,
      emissao: diasAtras(i + s.entre(0, 3)), previsao: diasAtras(-s.entre(-5, 20)), status: s.peso(statusP.map((st, j) => [st, pesos[j]!] as const)),
    };
  });
  const requisicoes: Requisicao[] = ([
    ["Rafael Torres", "Manutenção", "Rolamento 6205 2RS", 10, 680, "Urgente"], ["Camila Ribeiro", "Pintura", "Bico de pistola eletrostática", 4, 1960, "Normal"],
    ["Lucas Martins", "Usinagem", "Fresa de topo Ø10 metal duro", 6, 2280, "Normal"], ["Aline Barros", "Segurança do trabalho", "Luva nitrílica (caixa)", 30, 1350, "Urgente"],
    ["Henrique Vaz", "TI", "Switch gerenciável 24 portas", 1, 3890, "Normal"],
  ] as const).map(([solicitante, setor, item, qtd, valor, urgencia], i) => ({ id: "RQ-" + pad(5120 - i), solicitante, setor, item, qtd, valor, urgencia, data: diasAtras(i) }));
  const gastoMensal = [...Array(12)].map(() => s.entre(1450, 2150) * 1000);
  const estoque: ItemEstoque[] = itens.map(([item, categoria], i) => {
    const minimo = s.entre(2, 20) * 50;
    return { cod: "MP-" + pad(100 + i * 7), item, categoria, minimo, maximo: minimo * 4, saldo: Math.round(minimo * s.real(i % 4 === 0 ? 0.4 : 0.9, 3.8)), un: s.um(["kg", "UN", "UN", "L", "cx"]), custo: s.real(2, 90) };
  });
  const etapas: EtapaExpedicao[] = ["Separação", "Conferência", "Carregado", "Em trânsito", "Entregue"];
  const expedicoes: Expedicao[] = [...Array(16)].map((_, i) => ({
    id: "EXP-" + pad(9310 - i), cliente: s.um(CLIENTES), nf: "NF " + s.entre(118000, 119999), volumes: s.entre(4, 60), peso: s.entre(120, 4800),
    etapa: etapas[Math.min(4, Math.floor(i / 3.2))]!, previsao: diasAtras(-s.entre(0, 4)), transportadora: s.um(["TransRápido", "Rodovia Sul Cargas", "Frota própria", "Logix Express"]), noPrazo: s.r() > 0.12,
  }));
  const otdMensal = [...Array(12)].map((_, i) => +(s.real(88, 96) + i * 0.25).toFixed(1));
  return { fornecedores, pedidos, requisicoes, gastoMensal, estoque, expedicoes, otdMensal };
}

function manutencao(s: Sorteio, maquinas: Maquina[]) {
  const defeitos = [
    "Vazamento de óleo hidráulico", "Falha no sensor de presença", "Ruído no redutor", "Troca de correia", "Superaquecimento do motor",
    "Lubrificação geral programada", "Inspeção termográfica do painel", "Análise de vibração", "Troca de filtros", "Desgaste no bico de injeção",
    "Calibração do robô", "Aperto de conexões elétricas", "Falha no CLP", "Substituição de mangueira",
  ];
  const ordens: OrdemServico[] = defeitos.map((desc, i) => {
    const tipo: OrdemServico["tipo"] = /Inspeção|Análise/.test(desc) ? "Preditiva" : /programada|Troca de filtros|Calibração|Aperto/.test(desc) ? "Preventiva" : "Corretiva";
    const m = s.um(maquinas);
    const status: StatusOS = i < 3 ? "Aberta" : i < 6 ? s.um(["Em execução", "Aguardando peça"] as const) : i < 8 ? "Em execução" : "Concluída";
    return {
      id: "OS-" + pad(7720 - i), maquina: m.nome, unidade: m.unidade, tipo, prioridade: tipo === "Corretiva" ? s.um(["Média", "Alta", "Crítica"] as const) : s.um(["Baixa", "Média"] as const),
      desc, abertura: diasAtras(Math.floor(i / 2)), status, tecnico: s.um(["Renato Dias", "Eduardo Pires", "Otávio Ramos", "Vinícius Melo"]), horas: +s.real(0.5, 9).toFixed(1),
    };
  });
  const moldes: Molde[] = [...Array(12)].map((_, i) => {
    const limite = s.entre(4, 12) * 10000;
    return { cod: "MOL-" + pad(i + 1, 3), nome: s.um(PECAS)[1], maquina: `Injetora ${pad((i % 6) + 1, 2)}`, limite, ciclos: Math.round(limite * s.real(0.3, 1.08)), proxima: diasAtras(-s.entre(-3, 34)) };
  });
  const custoManutencao = [...Array(12)].map(() => s.entre(140, 260) * 1000);
  const mtbf = [...Array(12)].map((_, i) => Math.round(s.real(96, 130) + i * 2.5));
  return { ordens, moldes, custoManutencao, mtbf };
}

function laboratorio(s: Sorteio) {
  const venc = [48, 9, -3, 120, 21, 4, 66, 180, 13, -1, 95, 30];
  const instrumentos: Instrumento[] = ([
    ["PAQ-011", "Paquímetro digital 150 mm", "Usinagem · Norte"], ["MIC-004", "Micrômetro externo 0–25 mm", "Qualidade · Sul"],
    ["MED-021", "Medidor de camada de tinta", "Pintura · Vale"], ["TRQ-007", "Torquímetro 20–100 Nm", "Montagem · Norte"],
    ["BRL-002", "Brilhômetro 60°", "Polimento · Sul"], ["RUG-003", "Rugosímetro portátil", "Usinagem · Vale"],
    ["DUR-001", "Durômetro Rockwell", "Laboratório · Norte"], ["TRN-005", "Traçador de altura 300 mm", "Qualidade · Norte"],
    ["MED-022", "Medidor de camada de cromo", "Cromagem · Sul"], ["PAQ-019", "Paquímetro analógico 300 mm", "Estamparia · Vale"],
    ["CAL-008", "Calibrador tampão Ø12 H7", "Usinagem · Sul"], ["MAN-003", "Manômetro 0–250 bar", "Injeção · Norte"],
  ] as const).map(([cod, nome, local], i) => ({
    cod, nome, local, venc: diasAtras(-venc[i]!), ultima: diasAtras(s.entre(150, 330)), erro: +s.real(0.001, 0.018).toFixed(3), tolerancia: 0.02,
  }));
  const msa: EstudoMSA[] = ([
    ["Espessura de camada", "MED-021", 8.4, 9], ["Diâmetro do pino", "MIC-004", 6.1, 12], ["Altura da aba", "TRN-005", 14.2, 6],
    ["Torque de aperto", "TRQ-007", 22.6, 4], ["Brilho 60°", "BRL-002", 11.8, 7],
  ] as const).map(([caracteristica, instrumento, rr, ndc]) => ({ caracteristica, instrumento, rr, ndc }));
  const tipos: [string, number, number, string, number, number][] = [
    ["Névoa salina", 240, 999, "h", 300, 60], ["Aderência (quadriculado)", 0, 1, "Gt", 0.5, 0.6], ["Espessura de camada", 20, 40, "µm", 28, 4],
    ["Brilho 60°", 85, 100, "UB", 91, 3], ["Dureza Rockwell", 28, 34, "HRC", 31, 1.6], ["Espessura de cromo", 0.3, 1.2, "µm", 0.7, 0.2],
    ["Tração", 340, 999, "MPa", 380, 22],
  ];
  const ensaios: Ensaio[] = [...Array(20)].map((_, i) => {
    const [tipo, min, max, un, med, dp] = s.um(tipos);
    const resultado = +Math.max(0, s.normal(med, dp)).toFixed(un === "Gt" ? 0 : 2);
    const status: Ensaio["status"] = i < 3 ? "Na fila" : i < 6 ? "Em ensaio" : "Concluído";
    return {
      id: "ENS-" + pad(6400 - i), tipo, peca: s.um(PECAS)[1], lote: "L" + s.entre(24100, 24999), resultado, min, max, un,
      data: diasAtras(Math.floor(i / 3)), analista: s.um(["Natália Freitas", "Gustavo Prado", "Sabrina Costa"]), status,
    };
  });
  return { instrumentos, msa, ensaios };
}

function ambiente(s: Sorteio) {
  const ambiental = {
    agua: [...Array(12)].map((_, i) => Math.round(s.real(2350, 2800) - i * 22)),
    energia: [...Array(12)].map((_, i) => Math.round(s.real(410, 470) - i * 2.4) * 1000),
    co2: [...Array(12)].map((_, i) => +(s.real(118, 140) - i * 1.1).toFixed(1)),
    residuos: [
      { tipo: "Recicláveis", t: 86.4 }, { tipo: "Perigosos (Classe I)", t: 12.7 },
      { tipo: "Não recicláveis", t: 21.9 }, { tipo: "Lodo de ETE", t: 9.3 }, { tipo: "Orgânicos", t: 4.8 },
    ],
    reciclagem: [...Array(12)].map((_, i) => +(58 + i * 1.3 + s.real(-1.5, 1.5)).toFixed(1)),
  };
  const licencas = ([
    ["Licença de operação: Unidade Norte", "Órgão ambiental estadual", 210], ["Licença de operação: Unidade Sul", "Órgão ambiental estadual", 44],
    ["Outorga de captação de água", "Agência de águas", 18], ["Cadastro técnico federal", "Órgão ambiental federal", 96],
    ["Licença de operação: Unidade Vale", "Órgão ambiental estadual", -4], ["Certificado de destinação de resíduos", "Prefeitura", 130],
  ] as const).map(([nome, orgao, d]) => ({ nome, orgao, venc: diasAtras(-d) }));
  return { ambiental, licencas };
}

function seguranca(s: Sorteio) {
  const tipos: (readonly [TipoOcorrencia, number])[] = [
    ["Condição insegura", 40], ["Quase acidente", 22], ["Primeiros socorros", 8], ["Sem afastamento", 3], ["Com afastamento", 0.4],
  ];
  const descs: Record<TipoOcorrencia, string[]> = {
    "Condição insegura": ["Proteção da prensa removida", "Piso com óleo no corredor", "Extintor obstruído por paletes", "Fiação exposta no painel"],
    "Quase acidente": ["Queda de peça da talha", "Empilhadeira passou rente ao pedestre", "Escorregão na área de lavagem"],
    "Primeiros socorros": ["Pequeno corte na mão", "Irritação ocular por respingo", "Batida no joelho"],
    "Sem afastamento": ["Entorse leve no tornozelo", "Corte que precisou de sutura"],
    "Com afastamento": ["Fratura no dedo durante setup"],
  };
  const ocorrencias: OcorrenciaST[] = [...Array(26)].map((_, i) => {
    const tipo = i === 20 ? "Com afastamento" : s.peso(tipos.slice(0, 4));
    const status: OcorrenciaST["status"] = i < 4 ? "Aberta" : i < 8 ? "Em tratamento" : "Fechada";
    return { id: "ST-" + pad(1290 - i), tipo, setor: s.um(SETORES), unidade: s.um(UNIDADES), data: i === 20 ? diasAtras(187) : diasAtras(i * 3 + s.entre(0, 2)), desc: s.um(descs[tipo]), status };
  });
  const treinamentos: Treinamento[] = ([
    ["NR-12", "Segurança em máquinas", 214, 9], ["NR-10", "Segurança em eletricidade", 38, 3], ["NR-35", "Trabalho em altura", 26, 5],
    ["NR-33", "Espaço confinado", 14, 0], ["NR-11", "Operação de empilhadeira", 22, 2], ["NR-23", "Brigada de incêndio", 46, 6],
  ] as const).map(([nr, nome, total, vencendo]) => ({ nr, nome, total, vencendo, emDia: total - vencendo - s.entre(0, 2) }));
  return { ocorrencias, treinamentos, ultimoAfastamento: diasAtras(187) };
}

function ti(s: Sorteio) {
  const tit: [string, string][] = [
    ["Impressora da expedição não imprime etiquetas", "Impressoras"], ["Sem acesso à pasta da engenharia", "Acessos"], ["Notebook lento após atualização", "Hardware"],
    ["Coletor de dados do almoxarifado sem rede", "Rede"], ["Criar usuário para novo inspetor", "Acessos"], ["Erro ao exportar relatório de produção", "Sistemas"],
    ["Troca de monitor na portaria", "Hardware"], ["Wi-fi instável no galpão 2", "Rede"], ["E-mail suspeito recebido no financeiro", "Segurança"],
    ["Instalar software de CAD", "Sistemas"], ["Câmera do refeitório offline", "Rede"], ["Redefinir senha do ERP", "Acessos"],
    ["Teclado com teclas falhando", "Hardware"], ["Backup do servidor de arquivos com aviso", "Infraestrutura"],
  ];
  const slaPorPrioridade = { Crítica: 4, Alta: 8, Média: 24, Baixa: 48 } as const;
  const chamados: Chamado[] = tit.map(([titulo, categoria], i) => {
    const prioridade: Chamado["prioridade"] = categoria === "Segurança" ? "Crítica" : s.um(["Baixa", "Média", "Média", "Alta"] as const);
    const status: StatusChamado = i < 4 ? "Novo" : i < 8 ? "Em atendimento" : i < 10 ? "Aguardando usuário" : "Resolvido";
    return {
      id: "CH-" + pad(15880 - i), titulo, categoria, solicitante: s.um(NOMES), setor: s.um([...SETORES, "Financeiro", "Compras", "RH"]), prioridade,
      status, aberto: horaAtras(s, 60), horas: +s.real(0.2, 30).toFixed(1), sla: slaPorPrioridade[prioridade],
    };
  });
  const modelos: [string, string][] = [["Desktop", "OptiCore 7090"], ["Notebook", "Lumina 14 G5"], ["Notebook", "ProBook X360"], ["Impressora", "Laser M428"], ["Coletor", "ScanPad CT40"], ["Servidor", "Rack R650"], ["Switch", "Core 2930F"]];
  const ativos: Ativo[] = [...Array(24)].map((_, i) => {
    const [tipo, modelo] = s.um(modelos);
    return {
      tag: "TI-" + pad(3100 + i * 3), tipo, modelo, usuario: tipo === "Servidor" || tipo === "Switch" ? "Infraestrutura" : s.um(NOMES), local: s.um([...UNIDADES]),
      status: s.peso([["Em uso", 18], ["Estoque", 3], ["Manutenção", 2]] as const), garantia: diasAtras(-s.entre(-200, 900)),
    };
  });
  const sgsi = ([
    ["Políticas", 96], ["Organização", 88], ["Ativos", 82], ["Acesso", 91], ["Criptografia", 74],
    ["Física", 93], ["Operações", 85], ["Comunicações", 79], ["Fornecedores", 68], ["Incidentes", 87], ["Continuidade", 72], ["Conformidade", 90],
  ] as const).map(([dominio, conf]) => ({ dominio, conf }));
  const servicos = ([
    ["ERP", 99.98, true], ["E-mail", 99.95, true], ["Servidor de arquivos", 99.9, true], ["VPN", 99.4, true], ["Backup em nuvem", 98.7, false], ["Wi-fi industrial", 99.2, true],
  ] as const).map(([nome, uptime, ok]) => ({ nome, uptime, ok }));
  return { chamados, ativos, sgsi, servicos };
}

export const MODULOS_ID = ["visao", "producao", "qualidade", "engenharia", "compras", "logistica", "manutencao", "metrologia", "laboratorio", "ambiental", "seguranca", "ti", "acesso"] as const;
export const PERFIS = ["Diretoria", "Gestor", "Engenharia", "Qualidade", "Inspetor", "Compras", "Manutenção", "TI", "Operador"] as const;

function acesso(s: Sorteio) {
  const usuarios: Usuario[] = NOMES.slice(0, 16).map((nome, i) => ({
    nome, email: email(nome), perfil: i === 0 ? "Diretoria" : PERFIS[(i % (PERFIS.length - 1)) + 1]!, unidade: i < 3 ? "Todas" : s.um([...UNIDADES]),
    ultimoAcesso: horaAtras(s, 96), ativo: i !== 13,
  }));
  const pendentes: Pendente[] = [
    { nome: "Igor Batista", email: "igor@aurora.ind.br", unidade: "Unidade Sul", setor: "Pintura", pediu: diasAtras(0) },
    { nome: "Letícia Moura", email: "leticia@aurora.ind.br", unidade: "Unidade Norte", setor: "Qualidade", pediu: diasAtras(1) },
    { nome: "Caio Fontes", email: "caio@aurora.ind.br", unidade: "Unidade Vale", setor: "Logística", pediu: diasAtras(2) },
  ];
  const tudo = [...MODULOS_ID];
  const permissoes: Record<string, string[]> = {
    Diretoria: tudo, Gestor: tudo.filter((m) => m !== "acesso"), Engenharia: ["visao", "producao", "engenharia", "qualidade", "laboratorio"],
    Qualidade: ["visao", "producao", "qualidade", "metrologia", "laboratorio"], Inspetor: ["producao", "qualidade", "metrologia"],
    Compras: ["visao", "compras", "logistica"], Manutenção: ["producao", "manutencao", "seguranca"], TI: ["visao", "ti", "acesso"], Operador: ["producao"],
  };
  const acoes = [
    ["entrou no sistema", "Acesso"], ["apontou produção", "Produção"], ["abriu uma NC", "Qualidade"], ["aprovou requisição", "Compras"],
    ["exportou registros", "Produção"], ["alterou permissão", "Acesso"], ["concluiu OS", "Manutenção"], ["atualizou PPAP", "Engenharia"],
  ] as const;
  const auditoria: Auditoria[] = [...Array(14)].map((_, i) => {
    const [acao, modulo] = s.um(acoes);
    return { quando: new Date(Date.now() - (i * 37 + s.entre(1, 30)) * 60000).toISOString(), quem: s.um(NOMES), acao, modulo };
  });
  return { usuarios, pendentes, permissoes, auditoria };
}

export function semear(): Banco {
  const s = criarSorteio(20261120);
  const prod = producao(s);
  const meta = [...Array(12)].map((_, i) => 9_000_000 + i * 120_000);
  return {
    versao: VERSAO, geradoEm: iso(new Date()),
    ...prod, ...qualidade(s), ...engenharia(s), ...suprimentos(s), ...manutencao(s, prod.maquinas), ...laboratorio(s), ...ambiente(s), ...seguranca(s), ...ti(s), ...acesso(s),
    acoes: ([
      ["Ambiental", "Reuso da água de enxágue da pintura", "Fernanda Lima", 32, 65], ["Ambiental", "Troca da iluminação do galpão 2 por LED", "Gustavo Prado", -4, 100],
      ["Qualidade", "Poka-yoke no dispositivo de solda", "Juliana Rocha", 12, 70], ["Segurança", "Cortina de luz nas prensas 03 e 04", "Aline Barros", 20, 40],
      ["Manutenção", "Plano de lubrificação das injetoras", "Renato Dias", 8, 85], ["TI", "Autenticação em dois fatores no ERP", "Henrique Vaz", 25, 55],
    ] as const).map(([area, acao, resp, d, progresso], i) => ({ id: "PA-" + pad(410 - i, 3), area, acao, resp, prazo: diasAtras(-d), progresso })),
    // o mês atual ainda está em andamento: faturamento parcial
    faturamento: { meta, real: meta.map((m, i) => Math.round(m * s.real(0.9, 1.08) - (i === 11 ? m * 0.32 : 0))) },
  };
}

const CHAVE = "ferrus-demo-v3";

/** Lê o banco salvo e confere o formato: dados de outro dia ou adulterados são descartados. */
export function carregar(): Banco {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const b = JSON.parse(bruto) as Partial<Banco>;
      if (b.versao === VERSAO && b.geradoEm === iso(new Date()) && Array.isArray(b.registros) && Array.isArray(b.ncs) && Array.isArray(b.chamados) && b.permissoes) {
        return b as Banco;
      }
    }
  } catch {
    /* sem acesso ao armazenamento: segue com dados novos */
  }
  return semear();
}

export function salvar(b: Banco) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(b));
  } catch {
    /* modo privado ou armazenamento cheio: a demo continua funcionando em memória */
  }
}

export function limparSalvo() {
  try { localStorage.removeItem(CHAVE); } catch { /* ok */ }
}

export const aprovacao = (rs: Pick<Registro, "inspecionada" | "reprovada">[]) => {
  const i = rs.reduce((s, r) => s + r.inspecionada, 0);
  const rp = rs.reduce((s, r) => s + r.reprovada, 0);
  return i ? ((i - rp) / i) * 100 : 100;
};
