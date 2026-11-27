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

/** Quem dá as aulas. TROQUE pelos seus dados. Foto: coloque em public/professor.jpg e escreva "professor.jpg". */
export const PROFESSOR = {
  nome: "[Nome do professor]",
  cargo: "Metrologista e instrutor",
  foto: "",
  bio: [
    "Escreva aqui sua experiência: anos de laboratório, empresas e setores onde trabalhou, formação e certificações.",
    "Conte também o jeito que você ensina: com instrumento na mão, exemplos de chão de fábrica e exercícios corrigidos.",
  ],
};

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
