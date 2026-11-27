import { useEffect, useState, type FormEvent } from "react";
import { Capa } from "../components/Capa";
import { Check, IconeWhats, Mais, Seta } from "../components/Icones";
import { acharCurso, aulasDe, CURSOS } from "../cursos";
import { ativarCodigo, concluida, definirNome, sair, useAluno } from "../lib/aluno";
import { href } from "../lib/rota";
import { linkWhatsApp } from "../lib/whatsapp";

function FormCodigo({ comNome }: { comNome: boolean }) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (comNome && !nome.trim()) return setMsg({ tipo: "erro", texto: "Digite seu nome." });
    setEnviando(true);
    try {
      const cursos = await ativarCodigo(codigo);
      if (!cursos.length) {
        setMsg({ tipo: "erro", texto: "Código não encontrado. Confira as letras e os traços, ou fale com a gente no WhatsApp." });
      } else {
        if (comNome) definirNome(nome);
        setCodigo("");
        setMsg({ tipo: "ok", texto: `Liberado: ${cursos.join(", ")}.` });
      }
    } catch (err) {
      setMsg({ tipo: "erro", texto: err instanceof Error ? err.message : "Não foi possível verificar o código." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="form-codigo" onSubmit={enviar} noValidate>
      {comNome && (
        <label>
          Seu nome
          <input value={nome} onChange={(e) => setNome(e.target.value.slice(0, 60))} autoComplete="name" placeholder="Como quer ser chamado" />
        </label>
      )}
      <label>
        Código de acesso
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.slice(0, 64))}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Ex.: TURMA-2026-XXXX"
          className="mono"
        />
      </label>
      <button type="submit" className="btn btn-acento" disabled={enviando || !codigo.trim()}>
        {enviando ? "Verificando…" : comNome ? "Entrar" : "Ativar código"}
      </button>
      {msg && <p className={`form-msg ${msg.tipo}`} role={msg.tipo === "erro" ? "alert" : "status"}>{msg.texto}</p>}
    </form>
  );
}

export function PaginaAluno() {
  const aluno = useAluno();
  const [maisCodigo, setMaisCodigo] = useState(false);
  useEffect(() => { document.title = "Área do aluno · Mensura"; }, []);

  if (!aluno.nome || !aluno.liberados.length) {
    return (
      <section className="secao aluno-entrada">
        <div className="conteudo aluno-entrada-grade">
          <div>
            <p className="sobretitulo mono">Área do aluno</p>
            <h1>Entre com seu código de acesso</h1>
            <p>Depois do pagamento você recebe um código pelo WhatsApp. Digite seu nome e o código para liberar seus cursos neste aparelho.</p>
            <ul className="aprendizados">
              <li><Check size={16} /> Seu progresso fica salvo aqui</li>
              <li><Check size={16} /> Continue de onde parou em cada curso</li>
              <li><Check size={16} /> Em outro aparelho, use o mesmo código</li>
            </ul>
            <p className="aluno-ajuda">
              Ainda não tem código?{" "}
              <a href={linkWhatsApp("Olá! Quero comprar um curso e receber meu código de acesso.")} target="_blank" rel="noopener noreferrer">
                <IconeWhats size={16} /> Fale com a gente
              </a>
            </p>
          </div>
          <div className="painel">
            <FormCodigo comNome />
          </div>
        </div>
      </section>
    );
  }

  const meus = CURSOS.filter((c) => aluno.liberados.includes(c.slug));
  const outros = CURSOS.filter((c) => !aluno.liberados.includes(c.slug));
  const ultimoCurso = aluno.ultima && acharCurso(aluno.ultima.curso);
  const ultimaAula = ultimoCurso && aulasDe(ultimoCurso).find((a) => a.id === aluno.ultima?.aula);

  return (
    <section className="secao aluno">
      <div className="conteudo">
        <div className="aluno-cabeca">
          <div>
            <p className="sobretitulo mono">Área do aluno</p>
            <h1>Olá, {aluno.nome.split(" ")[0]}!</h1>
          </div>
          <div className="aluno-cabeca-acoes">
            <button type="button" className="btn btn-contorno btn-pequeno" onClick={() => setMaisCodigo((v) => !v)} aria-expanded={maisCodigo}>
              <Mais size={16} /> Ativar outro código
            </button>
            <button type="button" className="btn btn-texto btn-pequeno" onClick={() => { if (confirm("Sair apaga seu progresso salvo neste aparelho. Continuar?")) sair(); }}>
              Sair
            </button>
          </div>
        </div>

        {maisCodigo && <div className="painel painel-estreito"><FormCodigo comNome={false} /></div>}

        {ultimoCurso && ultimaAula && (
          <a href={href.aula(ultimoCurso.slug, ultimaAula.id)} className="continuar">
            <span className="mono">Continuar assistindo</span>
            <strong>{ultimaAula.titulo}</strong>
            <span>{ultimoCurso.titulo}</span>
            <Seta />
          </a>
        )}

        <h2 className="aluno-h2">Meus cursos</h2>
        <div className="meus-cursos">
          {meus.map((c) => {
            const aulas = aulasDe(c);
            const feitas = aulas.filter((a) => concluida(aluno, c.slug, a.id)).length;
            const pct = Math.round((feitas / aulas.length) * 100);
            const prox = aulas.find((a) => !concluida(aluno, c.slug, a.id)) ?? aulas[0];
            return (
              <article key={c.slug} className="meu-curso">
                <div className="meu-curso-capa"><Capa tipo={c.capa} /></div>
                <div className="meu-curso-corpo">
                  <h3><a href={href.curso(c.slug)}>{c.titulo}</a></h3>
                  <div className="barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso em ${c.titulo}`}>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mono">{pct}% · {feitas} de {aulas.length} aulas</p>
                  <a href={href.aula(c.slug, prox.id)} className="btn btn-escuro btn-pequeno">
                    {pct === 100 ? "Rever o curso" : feitas ? "Continuar" : "Começar"} <Seta size={16} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {outros.length > 0 && (
          <>
            <h2 className="aluno-h2">Continue aprendendo</h2>
            <ul className="outros">
              {outros.map((c) => (
                <li key={c.slug}><a href={href.curso(c.slug)}>{c.titulo} <Seta size={16} /></a></li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
