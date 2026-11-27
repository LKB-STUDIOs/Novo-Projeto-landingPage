/*
 * CURSOS E AULAS
 * ---------------------------------------------------------------
 * Em cada aula, no campo `youtube`, cole o link do vídeo
 * (ex.: "https://youtu.be/abc123XYZ00" ou "https://www.youtube.com/watch?v=abc123XYZ00").
 * Enquanto estiver vazio, a aula mostra "vídeo em produção".
 *
 * OS VÍDEOS ATUAIS SÃO EXEMPLOS: aulas públicas de outros canais do YouTube, usadas só para
 * demonstrar o player. Troque pelos seus vídeos antes de vender (e apague o campo `canal`).
 *
 * Dica: publique as aulas pagas como "Não listado" no YouTube e as grátis como "Público".
 * `gratis: true` deixa a aula aberta para qualquer visitante (bom para amostra).
 * `checkout`: link de pagamento (Mercado Pago, Hotmart, Kiwify...). Vazio = compra pelo WhatsApp.
 */

export type Aula = {
  id: string;
  titulo: string;
  duracao: string;
  youtube: string;
  /** Canal dono do vídeo (aparece como crédito abaixo do player). */
  canal?: string;
  gratis?: boolean;
  resumo: string;
};
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
          { id: "boas-vindas", titulo: "Boas-vindas e como estudar", duracao: "02:49", youtube: "https://youtu.be/IFK4Qd8L2hM", canal: "Canal Metrologia", gratis: true, resumo: "Como o curso funciona e o que você vai conseguir fazer ao final." },
          { id: "areas", titulo: "Metrologia científica, industrial e legal", duracao: "14:20", youtube: "https://youtu.be/HNXyfoGfSdc", canal: "PET Mecânica UFC", resumo: "Quem faz o quê no Brasil: Inmetro, RBC, laboratórios e indústria." },
          { id: "si", titulo: "Sistema Internacional de Unidades (SI)", duracao: "09:09", youtube: "https://youtu.be/752KWWVH_VU", canal: "Brasil Escola Oficial", resumo: "As sete unidades de base, prefixos e a escrita correta de grandezas." },
        ],
      },
      {
        titulo: "Vocabulário essencial (VIM)",
        aulas: [
          { id: "erro", titulo: "Mensurando, valor verdadeiro e erro", duracao: "03:00", youtube: "https://youtu.be/kutK949WWmA", canal: "Renan Ramalho", resumo: "Por que nenhuma medição é perfeita e como o erro se divide." },
          { id: "exatidao", titulo: "Exatidão x precisão", duracao: "06:43", youtube: "https://youtu.be/vHR7GQ3cLFw", canal: "Canal Metrologia", resumo: "O exemplo do alvo, com dados reais de medição." },
          { id: "resolucao", titulo: "Resolução, sensibilidade e faixa", duracao: "03:41", youtube: "https://youtu.be/A44Ae3Hu0Yw", canal: "Cursando Técnico", resumo: "Como escolher o instrumento certo para a tolerância da peça." },
        ],
      },
      {
        titulo: "Rastreabilidade",
        aulas: [
          { id: "cadeia", titulo: "Cadeia de rastreabilidade", duracao: "11:53", youtube: "https://youtu.be/QoTDH18etng", canal: "Canal Metrologia", resumo: "Do padrão nacional até o paquímetro da bancada." },
          { id: "certificado", titulo: "Como ler um certificado de calibração", duracao: "15:52", youtube: "https://youtu.be/faUxtLlvP5E", canal: "CECT Metrologia e Qualidade - O Canal que Ensina.", resumo: "Erro, incerteza, fator k e o que fazer com esses números." },
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
          { id: "anatomia-paquimetro", titulo: "Anatomia do paquímetro", duracao: "08:41", youtube: "https://youtu.be/GY-O-Qxt_zU", canal: "CEGTEC - Educação Profissional", gratis: true, resumo: "Cada parte do instrumento e para que serve." },
          { id: "nonio", titulo: "Leitura do nônio: 0,05 e 0,02 mm", duracao: "08:26", youtube: "https://youtu.be/CN2yOBgT7m4", canal: "Prof. Luiz Brito", resumo: "Método passo a passo com exercícios para praticar." },
          { id: "erros-paquimetro", titulo: "Erros comuns de medição", duracao: "07:41", youtube: "https://youtu.be/KzlgvV8NBVU", canal: "CEGTEC - Educação Profissional", resumo: "Paralaxe, força excessiva e peça mal apoiada." },
        ],
      },
      {
        titulo: "Micrômetro",
        aulas: [
          { id: "micrometro-externo", titulo: "Micrômetro externo: leitura em 0,01 mm", duracao: "09:40", youtube: "https://youtu.be/NgqksHVD4P4", canal: "Prof. Luiz Brito", resumo: "Bainha, tambor e catraca: leitura e zeragem." },
          { id: "micrometro-interno", titulo: "Micrômetro interno e de profundidade", duracao: "08:05", youtube: "https://youtu.be/OfqnNai6MP4", canal: "Conhecimento 3.0", resumo: "Quando usar e como ler cada um." },
        ],
      },
      {
        titulo: "Medição por comparação",
        aulas: [
          { id: "relogio", titulo: "Relógio comparador e apalpador", duracao: "08:05", youtube: "https://youtu.be/PKzyZnVM18M", canal: "Prof. Luiz Brito", resumo: "Montagem na base, zeragem com bloco-padrão e leitura." },
          { id: "blocos", titulo: "Blocos-padrão e calibradores passa/não passa", duracao: "09:54", youtube: "https://youtu.be/k9LzzU-2oqo", canal: "Conhecimento 3.0", resumo: "Classes de blocos, aderência e uso de calibradores." },
          { id: "cuidados", titulo: "Cuidados, limpeza e temperatura", duracao: "03:04", youtube: "https://youtu.be/KKlbfRvPw9o", canal: "Focus Metrologia", resumo: "Por que 20 °C importa e como guardar cada instrumento." },
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
          { id: "calibracao-ajuste", titulo: "Calibração, verificação e ajuste", duracao: "07:09", youtube: "https://youtu.be/a393ODlzr5U", canal: "Eng de Sucesso - Projetando", gratis: true, resumo: "Três palavras que vivem sendo confundidas, e por que isso dá problema em auditoria." },
          { id: "periodicidade", titulo: "Plano e periodicidade de calibração", duracao: "03:57", youtube: "https://youtu.be/-4tEQP2yXjY", canal: "Silvani Castanha - ACC Metrologia", resumo: "Como definir o intervalo com base em histórico e risco." },
          { id: "aceitacao", titulo: "Critérios de aceitação do instrumento", duracao: "15:01", youtube: "https://youtu.be/vI20xOwKNXo", canal: "APRENDER MECÂNICA, PRODUÇÃO, INDUSTRIAL, QUALIDADE", resumo: "Erro + incerteza x tolerância: como decidir." },
        ],
      },
      {
        titulo: "Incerteza de medição (GUM)",
        aulas: [
          { id: "tipo-a-b", titulo: "Incertezas tipo A e tipo B", duracao: "08:19", youtube: "https://youtu.be/nIpj12iYb1s", canal: "Canal Metrologia", resumo: "Estatística das repetições e informações de certificados e manuais." },
          { id: "orcamento", titulo: "Orçamento de incerteza passo a passo", duracao: "16:57", youtube: "https://youtu.be/8uRdakeunTI", canal: "CECT Metrologia e Qualidade - O Canal que Ensina.", resumo: "Planilha montada junto com você, fonte por fonte." },
          { id: "fator-k", titulo: "Graus de liberdade e fator k", duracao: "15:23", youtube: "https://youtu.be/PFbb61lz4Zg", canal: "Isaque Brandao", resumo: "Welch-Satterthwaite sem medo." },
          { id: "exemplo-paquimetro", titulo: "Exemplo completo: calibração de paquímetro", duracao: "04:57", youtube: "https://youtu.be/CY_iP5TkUQs", canal: "João pedro Pucinelli", resumo: "Do ensaio ao certificado." },
        ],
      },
      {
        titulo: "ISO/IEC 17025",
        aulas: [
          { id: "requisitos", titulo: "Requisitos para laboratórios", duracao: "04:25", youtube: "https://youtu.be/uaauqgcLyNw", canal: "Setton Gestão", resumo: "O que a norma pede, em linguagem direta." },
          { id: "auditoria", titulo: "Preparação para auditoria", duracao: "03:29", youtube: "https://youtu.be/_RYHWXtSnfo", canal: "Allevant", resumo: "Registros, evidências e as perguntas que o auditor faz." },
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
          { id: "por-que-msa", titulo: "Por que avaliar o sistema de medição", duracao: "05:20", youtube: "https://youtu.be/rjBAfPRd3Bk", canal: "Play Industrial", gratis: true, resumo: "Quando a variação da medição engole a variação da peça." },
          { id: "rr-medias", titulo: "R&R por médias e amplitudes", duracao: "13:31", youtube: "https://youtu.be/FEZz3Byn52A", canal: "Frons Educação", resumo: "Planejamento, coleta e cálculo." },
          { id: "rr-anova", titulo: "R&R por ANOVA e interpretação", duracao: "08:47", youtube: "https://youtu.be/6sRN1lCTqSM", canal: "LEARN & APPLY : Lean and Six Sigma", resumo: "Interação operador × peça e critérios de aceitação." },
          { id: "atributos", titulo: "Estudos por atributos", duracao: "13:57", youtube: "https://youtu.be/76XYhZsqeig", canal: "Luiz Cesar Carpinetti", resumo: "Kappa e concordância entre avaliadores." },
        ],
      },
      {
        titulo: "Controle estatístico do processo",
        aulas: [
          { id: "cartas", titulo: "Cartas de controle X̄-R", duracao: "20:22", youtube: "https://youtu.be/8vxJALkNo_o", canal: "Aprendendo Gestão", resumo: "Limites de controle e regras de instabilidade." },
          { id: "capacidade", titulo: "Capacidade: Cp, Cpk, Pp e Ppk", duracao: "05:30", youtube: "https://youtu.be/3DNfU_Jc0Sg", canal: "Frons Educação", resumo: "O que cada índice mostra e quando usar." },
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
