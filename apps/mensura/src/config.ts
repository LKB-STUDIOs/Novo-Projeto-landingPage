/*
 * ================================================================
 *  CONFIGURAÇÃO DA ESCOLA: tudo que você precisa trocar fica aqui.
 *  Cursos, aulas e vídeos ficam em src/cursos.ts.
 * ================================================================
 */

export const MARCA = {
  nome: "Mensura",
  descricao: "Escola de Metrologia",
};

/** WhatsApp que recebe as mensagens (só números, com 55 e DDD). TROQUE pelo seu. */
export const WHATSAPP = {
  numero: "5547999687738",
  exibicao: "(47) 9 9968-7738",
};

/*
 * DADOS FICTÍCIOS DE DEMONSTRAÇÃO: professor, números e depoimentos abaixo foram inventados
 * para mostrar o site funcionando. TROQUE pelos reais antes de publicar (ou apague os depoimentos).
 */
export const DEMONSTRACAO = true;

/** Quem dá as aulas. Na página inicial ele aparece como um boneco 3D (src/components/Professor3D.ts). */
export const PROFESSOR = {
  nome: "Prof. Rafael Monteiro",
  cargo: "Metrologista · Engenheiro mecânico",
  bio: [
    "Há 18 anos no laboratório: começou como técnico de inspeção numa autopeças de Joinville, coordenou um laboratório de calibração dimensional acreditado e hoje dá consultoria para fábricas que estão se preparando para auditoria.",
    "Nas aulas, a regra é simples: instrumento na mão, leitura em close e exercício corrigido. Nada de decorar fórmula sem saber de onde ela vem.",
  ],
  fatos: [
    { valor: "18", unidade: "anos", rotulo: "de laboratório" },
    { valor: "2.430", unidade: "", rotulo: "alunos formados" },
    { valor: "4,9", unidade: "/5", rotulo: "avaliação média" },
  ],
};

export const DEPOIMENTOS = [
  {
    nome: "Camila Ferreira",
    cargo: "Inspetora de qualidade · Indústria de autopeças",
    texto: "Eu media no paquímetro havia dois anos e mesmo assim errava a leitura do nônio de vez em quando. Depois do módulo de instrumentos, nunca mais tive peça reprovada na reinspeção.",
    curso: "Instrumentos de Medição Dimensional",
  },
  {
    nome: "Diego Santana",
    cargo: "Técnico de laboratório de calibração",
    texto: "O orçamento de incerteza montado passo a passo foi o que me faltava. Refiz as planilhas do laboratório e passamos na auditoria da 17025 sem nenhuma não conformidade nesse item.",
    curso: "Calibração e Incerteza de Medição",
  },
  {
    nome: "Juliana Prado",
    cargo: "Estudante de Engenharia de Produção",
    texto: "Cheguei no estágio sabendo fazer um estudo de R&R sozinha. Meu supervisor achou que eu já tinha experiência na área.",
    curso: "MSA e Controle Estatístico",
  },
];

/**
 * Códigos de acesso que o aluno digita na Área do Aluno para liberar um curso.
 * Guardamos só o "hash" do código (não o código em si). Para criar um código novo:
 *   npm run codigo -- TURMA-MARCO-26
 * e cole a linha que aparecer aqui. cursos: lista de slugs de src/cursos.ts, ou "todos".
 *
 * O código DEMO-METRO libera tudo para você testar. APAGUE antes de vender.
 */
export const CODIGOS_ACESSO: { hash: string; cursos: string[] | "todos" }[] = [
  { hash: "cd1635168df56e032169bb6a5a8b9b51505ebceefa1163460f6340b16b045b4e", cursos: "todos" },
];
