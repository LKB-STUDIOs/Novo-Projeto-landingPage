import { beforeEach, describe, expect, it } from "vitest";
import { criarApiDemo } from "./demoApi";
import { ErroAmigavel, type CursosApi } from "./tipos";

function memoria() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
}

describe("fluxo da plataforma (modo demonstração)", () => {
  let api: CursosApi;
  beforeEach(() => {
    api = criarApiDemo(memoria());
  });

  it("lista cursos para qualquer visitante", async () => {
    expect(await api.usuarioAtual()).toBeNull();
    const cursos = await api.listarCursos();
    expect(cursos.length).toBeGreaterThan(0);
    expect(cursos[0]?.totalAulas).toBeGreaterThan(0);
  });

  it("cadastro entra direto, sair desloga e entrar de novo funciona", async () => {
    await api.cadastrar("Ana", "Ana@Exemplo.com", "senha1234");
    expect((await api.usuarioAtual())?.email).toBe("ana@exemplo.com");
    await api.sair();
    expect(await api.usuarioAtual()).toBeNull();
    await api.entrar("ana@exemplo.com", "senha1234");
    expect((await api.usuarioAtual())?.nome).toBe("Ana");
  });

  it("recusa senha errada e e-mail repetido com mensagem amigável", async () => {
    await api.cadastrar("Ana", "ana@exemplo.com", "senha1234");
    await api.sair();
    await expect(api.entrar("ana@exemplo.com", "errada123")).rejects.toThrow(ErroAmigavel);
    await expect(api.cadastrar("Outra", "ana@exemplo.com", "senha1234")).rejects.toThrow(/já existe/i);
  });

  it("o vídeo só aparece depois da inscrição", async () => {
    const [curso] = await api.listarCursos();
    const { aulas } = (await api.obterCurso(curso!.slug))!;
    const aula = aulas[0]!;

    expect(await api.videoDaAula(aula.id)).toBeNull(); // visitante
    await api.cadastrar("Ana", "ana@exemplo.com", "senha1234");
    expect(await api.videoDaAula(aula.id)).toBeNull(); // logada, mas sem inscrição
    await api.inscrever(curso!.id);
    expect(await api.videoDaAula(aula.id)).not.toBeNull(); // inscrita
    await api.sair();
    expect(await api.videoDaAula(aula.id)).toBeNull(); // saiu
  });

  it("uma pessoa não enxerga a inscrição de outra", async () => {
    const [curso] = await api.listarCursos();
    await api.cadastrar("Ana", "ana@exemplo.com", "senha1234");
    await api.inscrever(curso!.id);
    await api.sair();
    await api.cadastrar("Bia", "bia@exemplo.com", "senha1234");
    expect(await api.minhasInscricoes()).toEqual([]);
  });

  it("inscrever duas vezes não duplica", async () => {
    const [curso] = await api.listarCursos();
    await api.cadastrar("Ana", "ana@exemplo.com", "senha1234");
    await api.inscrever(curso!.id);
    await api.inscrever(curso!.id);
    expect(await api.minhasInscricoes()).toEqual([curso!.id]);
  });

  it("marca e desmarca aulas concluídas, só depois de inscrita", async () => {
    const [curso] = await api.listarCursos();
    const { aulas } = (await api.obterCurso(curso!.slug))!;
    await api.cadastrar("Ana", "ana@exemplo.com", "senha1234");
    await expect(api.marcarConcluida(aulas[0]!.id, true)).rejects.toThrow(ErroAmigavel);
    await api.inscrever(curso!.id);
    await api.marcarConcluida(aulas[0]!.id, true);
    await api.marcarConcluida(aulas[1]!.id, true);
    expect(await api.aulasConcluidas(curso!.id)).toHaveLength(2);
    await api.marcarConcluida(aulas[0]!.id, false);
    expect(await api.aulasConcluidas(curso!.id)).toEqual([aulas[1]!.id]);
  });

  it("curso inexistente devolve null e avisa quem mudou a sessão", async () => {
    expect(await api.obterCurso("nao-existe")).toBeNull();
    const vistos: (string | undefined)[] = [];
    const parar = api.aoMudarSessao((u) => vistos.push(u?.nome));
    await api.cadastrar("Ana", "ana@exemplo.com", "senha1234");
    await api.sair();
    parar();
    await api.entrar("ana@exemplo.com", "senha1234");
    expect(vistos).toEqual(["Ana", undefined]);
  });
});
