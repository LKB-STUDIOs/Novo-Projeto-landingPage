import { ErroAmigavel, type Aula, type Curso, type CursosApi, type Usuario } from "./tipos";

/**
 * Versão de demonstração: tudo fica no navegador (localStorage), sem servidor.
 * Só é usada quando o Supabase não está configurado. NÃO é segura: serve para ver a tela funcionando.
 */
type Armazenamento = Pick<Storage, "getItem" | "setItem">;

interface Banco {
  contas: { id: string; nome: string; email: string; senha: string }[];
  sessao: string | null;
  inscricoes: { userId: string; cursoId: string }[];
  concluidas: { userId: string; aulaId: string }[];
}

const CURSOS: Curso[] = [
  {
    id: "c1",
    slug: "introducao-ao-marketing-digital",
    titulo: "Introdução ao marketing digital",
    resumo: "Do zero ao primeiro anúncio no ar.",
    descricao:
      "Aprenda a posicionar o seu negócio, criar uma presença online e medir resultados. Curso de exemplo para a demonstração da plataforma.",
    totalAulas: 4,
  },
  {
    id: "c2",
    slug: "organizacao-financeira-para-autonomos",
    titulo: "Organização financeira para autônomos",
    resumo: "Separe o pessoal do profissional e sobra dinheiro no fim do mês.",
    descricao: "Fluxo de caixa, reserva, impostos e preço justo. Curso de exemplo para a demonstração da plataforma.",
    totalAulas: 3,
  },
];

const TITULOS: Record<string, string[]> = {
  c1: ["Boas-vindas e como estudar", "Quem é o seu cliente", "Escolhendo os canais", "Seu primeiro anúncio"],
  c2: ["Separando as contas", "Fluxo de caixa simples", "Quanto cobrar"],
};

const AULAS: Aula[] = Object.entries(TITULOS).flatMap(([cursoId, titulos]) =>
  titulos.map((titulo, i) => ({
    id: `${cursoId}-a${i + 1}`,
    cursoId,
    ordem: i + 1,
    titulo,
    descricao: "Descrição da aula de exemplo.",
    minutos: 6 + i * 3,
  })),
);

const CHAVE = "lbk-cursos-demo-v1";
const nova = <T,>(x: T): T => structuredClone(x);

export function criarApiDemo(storage: Armazenamento): CursosApi {
  const ouvintes = new Set<(u: Usuario | null) => void>();

  const ler = (): Banco => {
    try {
      const bruto = storage.getItem(CHAVE);
      if (bruto) return JSON.parse(bruto) as Banco;
    } catch {
      /* armazenamento bloqueado ou corrompido: começa vazio */
    }
    return { contas: [], sessao: null, inscricoes: [], concluidas: [] };
  };
  const gravar = (b: Banco) => {
    try {
      storage.setItem(CHAVE, JSON.stringify(b));
    } catch {
      /* sem espaço ou bloqueado: a sessão atual continua valendo só até recarregar */
    }
  };
  const usuarioDe = (b: Banco): Usuario | null => {
    const c = b.contas.find((x) => x.id === b.sessao);
    return c ? { id: c.id, nome: c.nome, email: c.email } : null;
  };
  const avisar = () => {
    const u = usuarioDe(ler());
    ouvintes.forEach((cb) => cb(u));
  };
  const exigirLogin = (b: Banco): Usuario => {
    const u = usuarioDe(b);
    if (!u) throw new ErroAmigavel("Entre na sua conta para continuar.");
    return u;
  };
  const inscrito = (b: Banco, userId: string, cursoId: string) =>
    b.inscricoes.some((i) => i.userId === userId && i.cursoId === cursoId);

  return {
    modo: "demo",
    async usuarioAtual() {
      return usuarioDe(ler());
    },
    aoMudarSessao(cb) {
      ouvintes.add(cb);
      return () => ouvintes.delete(cb);
    },
    async cadastrar(nome, email, senha) {
      const b = ler();
      const e = email.trim().toLowerCase();
      if (b.contas.some((c) => c.email === e)) throw new ErroAmigavel("Já existe uma conta com este e-mail. Tente entrar.");
      const id = `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      b.contas.push({ id, nome, email: e, senha });
      b.sessao = id;
      gravar(b);
      avisar();
      return { precisaConfirmarEmail: false };
    },
    async entrar(email, senha) {
      const b = ler();
      const c = b.contas.find((x) => x.email === email.trim().toLowerCase() && x.senha === senha);
      if (!c) throw new ErroAmigavel("E-mail ou senha incorretos.");
      b.sessao = c.id;
      gravar(b);
      avisar();
    },
    async sair() {
      const b = ler();
      b.sessao = null;
      gravar(b);
      avisar();
    },
    async listarCursos() {
      return nova(CURSOS);
    },
    async obterCurso(slug) {
      const curso = CURSOS.find((c) => c.slug === slug);
      if (!curso) return null;
      return nova({ curso, aulas: AULAS.filter((a) => a.cursoId === curso.id).sort((a, b) => a.ordem - b.ordem) });
    },
    async minhasInscricoes() {
      const b = ler();
      const u = usuarioDe(b);
      return u ? b.inscricoes.filter((i) => i.userId === u.id).map((i) => i.cursoId) : [];
    },
    async inscrever(cursoId) {
      const b = ler();
      const u = exigirLogin(b);
      if (!CURSOS.some((c) => c.id === cursoId)) throw new ErroAmigavel("Curso não encontrado.");
      if (!inscrito(b, u.id, cursoId)) b.inscricoes.push({ userId: u.id, cursoId });
      gravar(b);
    },
    async videoDaAula(aulaId) {
      const b = ler();
      const u = usuarioDe(b);
      const aula = AULAS.find((a) => a.id === aulaId);
      if (!u || !aula || !inscrito(b, u.id, aula.cursoId)) return null;
      return "demo"; // não há vídeo real na demonstração
    },
    async aulasConcluidas(cursoId) {
      const b = ler();
      const u = usuarioDe(b);
      if (!u) return [];
      const ids = new Set(AULAS.filter((a) => a.cursoId === cursoId).map((a) => a.id));
      return b.concluidas.filter((c) => c.userId === u.id && ids.has(c.aulaId)).map((c) => c.aulaId);
    },
    async marcarConcluida(aulaId, concluida) {
      const b = ler();
      const u = exigirLogin(b);
      const aula = AULAS.find((a) => a.id === aulaId);
      if (!aula || !inscrito(b, u.id, aula.cursoId)) throw new ErroAmigavel("Inscreva-se no curso para marcar aulas.");
      b.concluidas = b.concluidas.filter((c) => !(c.userId === u.id && c.aulaId === aulaId));
      if (concluida) b.concluidas.push({ userId: u.id, aulaId });
      gravar(b);
    },
  };
}
