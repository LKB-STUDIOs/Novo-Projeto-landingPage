/*
 * CURSOS E AULAS
 * ---------------------------------------------------------------
 * Em cada aula, no campo `youtube`, cole o link do vídeo
 * (ex.: "https://youtu.be/abc123XYZ00" ou "https://www.youtube.com/watch?v=abc123XYZ00").
 * Enquanto estiver vazio, a aula mostra "vídeo em produção".
 *
 * Dica: publique as aulas pagas como "Não listado" no YouTube e as grátis como "Público".
 * `gratis: true` deixa a aula aberta para qualquer visitante (bom para amostra).
 * `checkout`: link de pagamento (Mercado Pago, Hotmart, Kiwify...). Vazio = compra pelo WhatsApp.
 */

export type Aula = { id: string; titulo: string; duracao: string; youtube: string; gratis?: boolean; resumo: string };
export type Modulo = { titulo: string; aulas: Aula[] };
export type Curso = {
  slug: string;
  titulo: string;
  chamada: string;
  descricao: string;
  nivel: "Iniciante" | "Intermediário" | "Avançado";
  preco: number;
  checkout: string;
  capa: "regua" | "paquimetro" | "curva" | "alvo";
  aprendizados: string[];
  modulos: Modulo[];
};

export const CURSOS: Curso[] = [
  {
    slug: "fundamentos",
    titulo: "Fundamentos da Metrologia",
    chamada: "A base que todo inspetor, técnico e engenheiro precisa dominar.",
    descricao:
      "Entenda o que é medir de verdade: unidades do SI, o vocabulário do VIM, erro, exatidão, precisão e rastreabilidade. Ao final você lê um certificado de calibração sem travar.",
    nivel: "Iniciante",
    preco: 147,
    checkout: "",
    capa: "regua",
    aprendizados: [
      "Diferenciar metrologia científica, industrial e legal",
      "Usar as unidades do SI e seus múltiplos sem erro",
      "Explicar exatidão, precisão, resolução e erro de medição",
      "Ler um certificado de calibração e entender a rastreabilidade",
    ],
    modulos: [
      {
        titulo: "O que é medir",
        aulas: [
          { id: "boas-vindas", titulo: "Boas-vindas e como estudar", duracao: "06:00", youtube: "", gratis: true, resumo: "Como o curso funciona e o que você vai conseguir fazer ao final." },
          { id: "areas", titulo: "Metrologia científica, industrial e legal", duracao: "12:00", youtube: "", resumo: "Quem faz o quê no Brasil: Inmetro, RBC, laboratórios e indústria." },
          { id: "si", titulo: "Sistema Internacional de Unidades (SI)", duracao: "15:00", youtube: "", resumo: "As sete unidades de base, prefixos e a escrita correta de grandezas." },
        ],
      },
      {
        titulo: "Vocabulário essencial (VIM)",
        aulas: [
          { id: "erro", titulo: "Mensurando, valor verdadeiro e erro", duracao: "14:00", youtube: "", resumo: "Por que nenhuma medição é perfeita e como o erro se divide." },
          { id: "exatidao", titulo: "Exatidão x precisão", duracao: "10:00", youtube: "", resumo: "O exemplo do alvo, com dados reais de medição." },
          { id: "resolucao", titulo: "Resolução, sensibilidade e faixa", duracao: "11:00", youtube: "", resumo: "Como escolher o instrumento certo para a tolerância da peça." },
        ],
      },
      {
        titulo: "Rastreabilidade",
        aulas: [
          { id: "cadeia", titulo: "Cadeia de rastreabilidade", duracao: "13:00", youtube: "", resumo: "Do padrão nacional até o paquímetro da bancada." },
          { id: "certificado", titulo: "Como ler um certificado de calibração", duracao: "18:00", youtube: "", resumo: "Erro, incerteza, fator k e o que fazer com esses números." },
        ],
      },
    ],
  },
  {
    slug: "instrumentos",
    titulo: "Instrumentos de Medição Dimensional",
    chamada: "Paquímetro, micrômetro, relógio comparador e blocos-padrão, na prática.",
    descricao:
      "Aprenda a ler, usar e cuidar dos instrumentos mais comuns do controle dimensional. Cada aula tem leitura comentada em close e os erros que mais reprovam peça boa (ou aprovam peça ruim).",
    nivel: "Iniciante",
    preco: 197,
    checkout: "",
    capa: "paquimetro",
    aprendizados: [
      "Ler paquímetros de 0,05 mm e 0,02 mm e micrômetros de 0,01 mm",
      "Evitar erro de paralaxe, de força e de alinhamento",
      "Usar relógio comparador, blocos-padrão e calibradores passa/não passa",
      "Cuidar dos instrumentos: limpeza, guarda e temperatura de 20 °C",
    ],
    modulos: [
      {
        titulo: "Paquímetro",
        aulas: [
          { id: "anatomia-paquimetro", titulo: "Anatomia do paquímetro", duracao: "09:00", youtube: "", gratis: true, resumo: "Cada parte do instrumento e para que serve." },
          { id: "nonio", titulo: "Leitura do nônio: 0,05 e 0,02 mm", duracao: "16:00", youtube: "", resumo: "Método passo a passo com exercícios para praticar." },
          { id: "erros-paquimetro", titulo: "Erros comuns de medição", duracao: "12:00", youtube: "", resumo: "Paralaxe, força excessiva e peça mal apoiada." },
        ],
      },
      {
        titulo: "Micrômetro",
        aulas: [
          { id: "micrometro-externo", titulo: "Micrômetro externo: leitura em 0,01 mm", duracao: "15:00", youtube: "", resumo: "Bainha, tambor e catraca: leitura e zeragem." },
          { id: "micrometro-interno", titulo: "Micrômetro interno e de profundidade", duracao: "13:00", youtube: "", resumo: "Quando usar e como ler cada um." },
        ],
      },
      {
        titulo: "Medição por comparação",
        aulas: [
          { id: "relogio", titulo: "Relógio comparador e apalpador", duracao: "14:00", youtube: "", resumo: "Montagem na base, zeragem com bloco-padrão e leitura." },
          { id: "blocos", titulo: "Blocos-padrão e calibradores passa/não passa", duracao: "12:00", youtube: "", resumo: "Classes de blocos, aderência e uso de calibradores." },
          { id: "cuidados", titulo: "Cuidados, limpeza e temperatura", duracao: "08:00", youtube: "", resumo: "Por que 20 °C importa e como guardar cada instrumento." },
        ],
      },
    ],
  },
  {
    slug: "calibracao-incerteza",
    titulo: "Calibração e Incerteza de Medição",
    chamada: "Monte um orçamento de incerteza do zero, seguindo o GUM.",
    descricao:
      "Saia do 'o certificado diz que está bom' para entender e calcular a incerteza. Veja como definir critérios de aceitação, periodicidade de calibração e o que a ISO/IEC 17025 exige de um laboratório.",
    nivel: "Intermediário",
    preco: 297,
    checkout: "",
    capa: "curva",
    aprendizados: [
      "Diferenciar calibração, verificação e ajuste",
      "Calcular incertezas tipo A e tipo B",
      "Montar um orçamento de incerteza completo, com fator k",
      "Definir critério de aceitação e periodicidade de calibração",
    ],
    modulos: [
      {
        titulo: "Calibração na prática",
        aulas: [
          { id: "calibracao-ajuste", titulo: "Calibração, verificação e ajuste", duracao: "11:00", youtube: "", gratis: true, resumo: "Três palavras que vivem sendo confundidas, e por que isso dá problema em auditoria." },
          { id: "periodicidade", titulo: "Plano e periodicidade de calibração", duracao: "14:00", youtube: "", resumo: "Como definir o intervalo com base em histórico e risco." },
          { id: "aceitacao", titulo: "Critérios de aceitação do instrumento", duracao: "13:00", youtube: "", resumo: "Erro + incerteza x tolerância: como decidir." },
        ],
      },
      {
        titulo: "Incerteza de medição (GUM)",
        aulas: [
          { id: "tipo-a-b", titulo: "Incertezas tipo A e tipo B", duracao: "17:00", youtube: "", resumo: "Estatística das repetições e informações de certificados e manuais." },
          { id: "orcamento", titulo: "Orçamento de incerteza passo a passo", duracao: "22:00", youtube: "", resumo: "Planilha montada junto com você, fonte por fonte." },
          { id: "fator-k", titulo: "Graus de liberdade e fator k", duracao: "15:00", youtube: "", resumo: "Welch-Satterthwaite sem medo." },
          { id: "exemplo-paquimetro", titulo: "Exemplo completo: calibração de paquímetro", duracao: "25:00", youtube: "", resumo: "Do ensaio ao certificado." },
        ],
      },
      {
        titulo: "ISO/IEC 17025",
        aulas: [
          { id: "requisitos", titulo: "Requisitos para laboratórios", duracao: "16:00", youtube: "", resumo: "O que a norma pede, em linguagem direta." },
          { id: "auditoria", titulo: "Preparação para auditoria", duracao: "12:00", youtube: "", resumo: "Registros, evidências e as perguntas que o auditor faz." },
        ],
      },
    ],
  },
  {
    slug: "msa-cep",
    titulo: "MSA e Controle Estatístico",
    chamada: "Seu sistema de medição é confiável? Prove com R&R, Cp e Cpk.",
    descricao:
      "Avalie o sistema de medição antes de confiar nos dados. Faça estudos de R&R por médias e amplitudes e por ANOVA, estudos por atributos, cartas de controle e índices de capacidade.",
    nivel: "Intermediário",
    preco: 247,
    checkout: "",
    capa: "alvo",
    aprendizados: [
      "Planejar e conduzir um estudo de R&R",
      "Interpretar %R&R, ndc e o gráfico de componentes",
      "Montar cartas X̄-R e identificar causas especiais",
      "Calcular e interpretar Cp, Cpk, Pp e Ppk",
    ],
    modulos: [
      {
        titulo: "Análise do sistema de medição (MSA)",
        aulas: [
          { id: "por-que-msa", titulo: "Por que avaliar o sistema de medição", duracao: "10:00", youtube: "", gratis: true, resumo: "Quando a variação da medição engole a variação da peça." },
          { id: "rr-medias", titulo: "R&R por médias e amplitudes", duracao: "20:00", youtube: "", resumo: "Planejamento, coleta e cálculo." },
          { id: "rr-anova", titulo: "R&R por ANOVA e interpretação", duracao: "18:00", youtube: "", resumo: "Interação operador × peça e critérios de aceitação." },
          { id: "atributos", titulo: "Estudos por atributos", duracao: "14:00", youtube: "", resumo: "Kappa e concordância entre avaliadores." },
        ],
      },
      {
        titulo: "Controle estatístico do processo",
        aulas: [
          { id: "cartas", titulo: "Cartas de controle X̄-R", duracao: "17:00", youtube: "", resumo: "Limites de controle e regras de instabilidade." },
          { id: "capacidade", titulo: "Capacidade: Cp, Cpk, Pp e Ppk", duracao: "19:00", youtube: "", resumo: "O que cada índice mostra e quando usar." },
        ],
      },
    ],
  },
];

export const acharCurso = (slug: string) => CURSOS.find((c) => c.slug === slug);
export const aulasDe = (c: Curso) => c.modulos.flatMap((m) => m.aulas);

/** "12:30" → minutos */
const minutos = (d: string) => {
  const [m, s] = d.split(":").map(Number);
  return (m || 0) + (s || 0) / 60;
};
export const duracaoCurso = (c: Curso) => aulasDe(c).reduce((t, a) => t + minutos(a.duracao), 0);

export function formatarDuracao(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h}h${m ? ` ${String(m).padStart(2, "0")}min` : ""}` : `${m} min`;
}

export const formatarPreco = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: v % 1 ? 2 : 0 });

/** Primeira aula grátis de toda a escola: vira a "aula de amostra" da página inicial. */
export function aulaAmostra() {
  for (const c of CURSOS) for (const a of aulasDe(c)) if (a.gratis) return { curso: c, aula: a };
  return null;
}
