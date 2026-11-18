/** Nome da plataforma: troque aqui e muda em todas as telas. */
export const PLATAFORMA_NOME = "LBK Cursos";

export interface Usuario {
  id: string;
  email: string;
  nome: string;
}

export interface Curso {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  descricao: string;
  totalAulas: number;
}

export interface Aula {
  id: string;
  cursoId: string;
  ordem: number;
  titulo: string;
  descricao: string;
  minutos: number;
}

export interface CursoCompleto {
  curso: Curso;
  aulas: Aula[];
}

/** Tudo que a interface precisa do servidor. Há duas implementações: Supabase e demonstração. */
export interface CursosApi {
  modo: "supabase" | "demo";
  usuarioAtual(): Promise<Usuario | null>;
  /** Avisa quando a pessoa entra ou sai. Devolve a função que cancela o aviso. */
  aoMudarSessao(cb: (u: Usuario | null) => void): () => void;
  cadastrar(nome: string, email: string, senha: string): Promise<{ precisaConfirmarEmail: boolean }>;
  entrar(email: string, senha: string): Promise<void>;
  sair(): Promise<void>;
  listarCursos(): Promise<Curso[]>;
  obterCurso(slug: string): Promise<CursoCompleto | null>;
  /** Ids dos cursos em que a pessoa está inscrita. */
  minhasInscricoes(): Promise<string[]>;
  inscrever(cursoId: string): Promise<void>;
  /** Código do vídeo no YouTube. Só devolve se a pessoa estiver inscrita no curso. */
  videoDaAula(aulaId: string): Promise<string | null>;
  /** Ids das aulas já concluídas neste curso. */
  aulasConcluidas(cursoId: string): Promise<string[]>;
  marcarConcluida(aulaId: string, concluida: boolean): Promise<void>;
}

/** Erro com texto pronto para mostrar na tela. */
export class ErroAmigavel extends Error {}
