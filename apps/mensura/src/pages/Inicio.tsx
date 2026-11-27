import { CartaoCurso } from "../components/CartaoCurso";
import { Check, IconeWhats, Seta } from "../components/Icones";
import { Paquimetro } from "../components/Paquimetro";
import { VideoYoutube } from "../components/VideoYoutube";
import { PROFESSOR } from "../config";
import { aulaAmostra, aulasDe, CURSOS, duracaoCurso, formatarDuracao } from "../cursos";
import { href } from "../lib/rota";
import { linkWhatsApp } from "../lib/whatsapp";

const PASSOS = [
  { t: "Escolha o curso", d: "Veja o conteúdo de cada módulo e assista às aulas grátis antes de decidir." },
  { t: "Faça o pagamento", d: "Pix ou cartão, pelo link de pagamento ou direto pelo WhatsApp." },
  { t: "Receba seu código", d: "Você recebe um código de acesso pessoal logo depois da confirmação." },
  { t: "Estude no seu ritmo", d: "Digite o código na Área do Aluno e assista quando e onde quiser. Seu progresso fica salvo." },
];

const PUBLICO = [
  { t: "Inspetores de qualidade", d: "Que medem peça todo dia e querem segurança na leitura e no laudo." },
  { t: "Técnicos de laboratório", d: "Que calibram instrumentos e precisam calcular incerteza de verdade." },
  { t: "Estudantes de engenharia e técnico", d: "Que querem chegar no estágio sabendo usar paquímetro e micrômetro." },
  { t: "Gestores e auditores", d: "Que lidam com IATF 16949, ISO 9001 ou ISO/IEC 17025 e precisam falar a língua do laboratório." },
];

const DUVIDAS = [
  { p: "Onde ficam as aulas?", r: "As aulas são vídeos hospedados no YouTube e tocam aqui dentro do site, na página de cada curso. Funciona no computador, no celular e na TV." },
  { p: "Por quanto tempo tenho acesso?", r: "Defina aqui a sua regra de acesso, por exemplo: acesso por 12 meses, com todas as atualizações do curso incluídas." },
  { p: "Como recebo o acesso depois de pagar?", r: "Você recebe um código pelo WhatsApp. Na Área do Aluno, digite seu nome e o código, e o curso é liberado na hora." },
  { p: "Preciso ter os instrumentos em casa?", r: "Não é obrigatório. As aulas mostram a leitura em close e trazem exercícios. Ter um paquímetro por perto ajuda a praticar." },
  { p: "Tem certificado?", r: "Defina aqui se o curso emite certificado e como o aluno o recebe." },
  { p: "Troquei de celular. Perdi meu progresso?", r: "O progresso fica salvo no aparelho em que você estuda. Em outro aparelho, digite o mesmo código e o curso é liberado de novo." },
];

export function Inicio() {
  const amostra = aulaAmostra();
  const totalAulas = CURSOS.reduce((t, c) => t + aulasDe(c).length, 0);
  const totalMin = CURSOS.reduce((t, c) => t + duracaoCurso(c), 0);
  const gratis = CURSOS.reduce((t, c) => t + aulasDe(c).filter((a) => a.gratis).length, 0);

  return (
    <>
      <section className="hero">
        <div className="conteudo hero-grade">
          <div className="hero-texto">
            <p className="sobretitulo mono">Escola de metrologia · cursos em vídeo</p>
            <h1>
              Meça certo.
              <br />
              <span className="sublinhado">Decida com confiança.</span>
            </h1>
            <p className="hero-sub">
              Do paquímetro à incerteza de medição: aulas práticas, gravadas por quem vive o laboratório, para você aprender no seu
              ritmo e aplicar no dia seguinte.
            </p>
            <div className="acoes">
              <a href={href.inicio("cursos")} className="btn btn-acento">Ver cursos <Seta /></a>
              <a href={href.inicio("aula-gratis")} className="btn btn-contorno">Assistir aula grátis</a>
            </div>
          </div>
          <div className="hero-paq">
            <p className="mono hero-paq-rotulo">Teste agora: você sabe ler um paquímetro?</p>
            <Paquimetro />
          </div>
        </div>
        <dl className="conteudo numeros">
          <div><dt>Cursos</dt><dd>{CURSOS.length}</dd></div>
          <div><dt>Aulas em vídeo</dt><dd>{totalAulas}</dd></div>
          <div><dt>De conteúdo</dt><dd>{formatarDuracao(totalMin)}</dd></div>
          <div><dt>Aulas grátis</dt><dd>{gratis}</dd></div>
        </dl>
      </section>

      {amostra && (
        <section id="aula-gratis" className="secao secao-escura">
          <div className="conteudo amostra">
            <div>
              <p className="sobretitulo mono">Aula grátis</p>
              <h2>{amostra.aula.titulo}</h2>
              <p>
                Uma aula do curso <b>{amostra.curso.titulo}</b>, sem cadastro. É assim que todas as aulas funcionam: vídeo direto na
                página, com o resumo e a lista de aulas do lado.
              </p>
              <a href={href.curso(amostra.curso.slug)} className="btn btn-claro">Ver o curso completo <Seta /></a>
            </div>
            <VideoYoutube video={amostra.aula.youtube} titulo={amostra.aula.titulo} />
          </div>
        </section>
      )}

      <section id="cursos" className="secao">
        <div className="conteudo">
          <div className="cabeca">
            <p className="sobretitulo mono">Cursos</p>
            <h2>Escolha por onde começar</h2>
            <p>Cada curso tem aulas grátis para você assistir antes de comprar.</p>
          </div>
          <div className="grade-cursos">
            {CURSOS.map((c, i) => <CartaoCurso key={c.slug} curso={c} indice={i} />)}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="secao secao-papel">
        <div className="conteudo">
          <div className="cabeca">
            <p className="sobretitulo mono">Como funciona</p>
            <h2>Da compra à primeira aula em minutos</h2>
          </div>
          <ol className="passos">
            {PASSOS.map((p, i) => (
              <li key={p.t}>
                <span className="passo-n mono">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="secao">
        <div className="conteudo publico">
          <div className="cabeca">
            <p className="sobretitulo mono">Para quem é</p>
            <h2>Feito para quem mede de verdade</h2>
          </div>
          <ul className="lista-publico">
            {PUBLICO.map((p) => (
              <li key={p.t}>
                <span className="icone-check"><Check /></span>
                <div><h3>{p.t}</h3><p>{p.d}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="secao secao-papel">
        <div className="conteudo professor">
          <div className="professor-foto">
            {PROFESSOR.foto ? (
              <img src={`${import.meta.env.BASE_URL}${PROFESSOR.foto}`} alt={PROFESSOR.nome} />
            ) : (
              <span aria-hidden="true">{PROFESSOR.nome.split(/\s+/).filter((p) => /^[A-ZÀ-Ú]/.test(p)).slice(0, 2).map((p) => p[0]).join("") || "M"}</span>
            )}
          </div>
          <div>
            <p className="sobretitulo mono">Quem ensina</p>
            <h2>{PROFESSOR.nome}</h2>
            <p className="professor-cargo">{PROFESSOR.cargo}</p>
            {PROFESSOR.bio.map((b) => <p key={b}>{b}</p>)}
          </div>
        </div>
      </section>

      <section id="duvidas" className="secao">
        <div className="conteudo duvidas">
          <div className="cabeca">
            <p className="sobretitulo mono">Dúvidas</p>
            <h2>Perguntas frequentes</h2>
          </div>
          <div className="faq">
            {DUVIDAS.map((d) => (
              <details key={d.p}>
                <summary>{d.p}</summary>
                <p>{d.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="conteudo chamada">
          <h2>Ficou alguma dúvida sobre qual curso fazer?</h2>
          <p>Conte o que você mede no dia a dia e a gente indica o melhor caminho.</p>
          <a href={linkWhatsApp("Olá! Quero ajuda para escolher um curso de metrologia.")} target="_blank" rel="noopener noreferrer" className="btn btn-whats">
            <IconeWhats /> Conversar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
