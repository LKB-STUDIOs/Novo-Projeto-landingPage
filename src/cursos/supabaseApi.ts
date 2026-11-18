import { createClient, type AuthError, type User } from "@supabase/supabase-js";
import { ErroAmigavel, type Aula, type Curso, type CursosApi, type Usuario } from "./tipos";

function traduzirErroDeLogin(e: AuthError): ErroAmigavel {
  const m = (e.message ?? "").toLowerCase();
  if (m.includes("invalid login")) return new ErroAmigavel("E-mail ou senha incorretos.");
  if (m.includes("not confirmed")) return new ErroAmigavel("Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.");
  if (m.includes("already registered") || m.includes("already been registered"))
    return new ErroAmigavel("Já existe uma conta com este e-mail. Tente entrar.");
  if (m.includes("rate limit") || e.status === 429) return new ErroAmigavel("Muitas tentativas. Espere um pouco e tente de novo.");
  if (m.includes("password")) return new ErroAmigavel("Senha fraca demais. Use pelo menos 8 caracteres, com letras e números.");
  return new ErroAmigavel("Não foi possível concluir. Tente de novo em instantes.");
}

const erroGenerico = () => new ErroAmigavel("Não foi possível carregar agora. Verifique sua conexão e tente de novo.");

function paraUsuario(u: User): Usuario {
  const nome = typeof u.user_metadata?.nome === "string" ? u.user_metadata.nome : "";
  return { id: u.id, email: u.email ?? "", nome: nome || (u.email ?? "").split("@")[0] || "Aluno" };
}

interface LinhaCurso {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  descricao: string;
  aulas?: { count: number }[];
}

const paraCurso = (c: LinhaCurso): Curso => ({
  id: c.id,
  slug: c.slug,
  titulo: c.titulo,
  resumo: c.resumo,
  descricao: c.descricao,
  totalAulas: c.aulas?.[0]?.count ?? 0,
});

export function criarApiSupabase(url: string, chavePublica: string, voltarPara: string): CursosApi {
  const db = createClient(url, chavePublica, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  const idDoUsuario = async (): Promise<string | null> => (await db.auth.getSession()).data.session?.user.id ?? null;

  return {
    modo: "supabase",
    async usuarioAtual() {
      const { data } = await db.auth.getSession();
      return data.session ? paraUsuario(data.session.user) : null;
    },
    aoMudarSessao(cb) {
      const { data } = db.auth.onAuthStateChange((_evento, sessao) => cb(sessao ? paraUsuario(sessao.user) : null));
      return () => data.subscription.unsubscribe();
    },
    async cadastrar(nome, email, senha) {
      const { data, error } = await db.auth.signUp({
        email: email.trim(),
        password: senha,
        options: { data: { nome }, emailRedirectTo: voltarPara },
      });
      if (error) throw traduzirErroDeLogin(error);
      // com confirmação de e-mail ligada, a conta nasce sem sessão
      return { precisaConfirmarEmail: !data.session };
    },
    async entrar(email, senha) {
      const { error } = await db.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw traduzirErroDeLogin(error);
    },
    async sair() {
      await db.auth.signOut();
    },
    async listarCursos() {
      const { data, error } = await db
        .from("cursos")
        .select("id,slug,titulo,resumo,descricao,aulas(count)")
        .order("criado_em", { ascending: true });
      if (error) throw erroGenerico();
      return (data as LinhaCurso[]).map(paraCurso);
    },
    async obterCurso(slug) {
      const { data: c, error } = await db
        .from("cursos")
        .select("id,slug,titulo,resumo,descricao")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw erroGenerico();
      if (!c) return null;
      const { data: aulas, error: e2 } = await db
        .from("aulas")
        .select("id,curso_id,ordem,titulo,descricao,minutos")
        .eq("curso_id", c.id)
        .order("ordem", { ascending: true });
      if (e2) throw erroGenerico();
      const lista: Aula[] = (aulas ?? []).map((a) => ({
        id: a.id,
        cursoId: a.curso_id,
        ordem: a.ordem,
        titulo: a.titulo,
        descricao: a.descricao ?? "",
        minutos: a.minutos ?? 0,
      }));
      return { curso: paraCurso({ ...(c as LinhaCurso), aulas: [{ count: lista.length }] }), aulas: lista };
    },
    async minhasInscricoes() {
      const uid = await idDoUsuario();
      if (!uid) return [];
      const { data, error } = await db.from("inscricoes").select("curso_id").eq("user_id", uid);
      if (error) throw erroGenerico();
      return (data ?? []).map((r) => r.curso_id as string);
    },
    async inscrever(cursoId) {
      if (!(await idDoUsuario())) throw new ErroAmigavel("Entre na sua conta para se inscrever.");
      // user_id é preenchido pelo servidor (auth.uid()); o banco recusa inscrição em nome de outra pessoa
      const { error } = await db.from("inscricoes").upsert({ curso_id: cursoId }, { onConflict: "user_id,curso_id", ignoreDuplicates: true });
      if (error) throw new ErroAmigavel("Não foi possível concluir a inscrição. Tente de novo.");
    },
    async videoDaAula(aulaId) {
      // a regra de acesso fica no banco: sem inscrição, a consulta volta vazia
      const { data, error } = await db.from("aulas_video").select("youtube_id").eq("aula_id", aulaId).maybeSingle();
      if (error) throw erroGenerico();
      return (data?.youtube_id as string | undefined) ?? null;
    },
    async aulasConcluidas(cursoId) {
      const uid = await idDoUsuario();
      if (!uid) return [];
      const { data, error } = await db.from("progresso").select("aula_id,aulas!inner(curso_id)").eq("user_id", uid).eq("aulas.curso_id", cursoId);
      if (error) throw erroGenerico();
      return (data ?? []).map((r) => r.aula_id as string);
    },
    async marcarConcluida(aulaId, concluida) {
      const uid = await idDoUsuario();
      if (!uid) throw new ErroAmigavel("Entre na sua conta para marcar aulas.");
      const { error } = concluida
        ? await db.from("progresso").upsert({ aula_id: aulaId }, { onConflict: "user_id,aula_id", ignoreDuplicates: true })
        : await db.from("progresso").delete().eq("user_id", uid).eq("aula_id", aulaId);
      if (error) throw new ErroAmigavel("Não foi possível salvar seu progresso.");
    },
  };
}
