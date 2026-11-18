import { useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router";
import { useAuth } from "../../cursos/Auth";
import { useTitulo } from "../../cursos/useCarregar";
import { ErroAmigavel, PLATAFORMA_NOME } from "../../cursos/tipos";
import { destinoSeguro, emailValido, erroDeSenha, nomeLimpo, SENHA_MIN } from "../../cursos/validacao";

export default function Entrar() {
  const { api, usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const criando = params.get("modo") === "criar";
  useTitulo(`${criando ? "Criar conta" : "Entrar"} · ${PLATAFORMA_NOME}`);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  // quem já está logado (ou acabou de entrar) vai direto para o destino
  if (usuario) return <Navigate to={destinoSeguro(params.get("voltar"))} replace />;

  function trocarModo(criar: boolean) {
    const novo = new URLSearchParams(params);
    if (criar) novo.set("modo", "criar");
    else novo.delete("modo");
    setParams(novo, { replace: true });
    setErro("");
    setAviso("");
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    const nomeOk = nomeLimpo(nome);
    if (criando && nomeOk.length < 2) return setErro("Digite seu nome.");
    if (!emailValido(email)) return setErro("Digite um e-mail válido.");
    if (criando) {
      const problema = erroDeSenha(senha);
      if (problema) return setErro(problema);
    } else if (!senha) return setErro("Digite sua senha.");

    setEnviando(true);
    try {
      if (criando) {
        const { precisaConfirmarEmail } = await api.cadastrar(nomeOk, email, senha);
        if (precisaConfirmarEmail) {
          trocarModo(false); // limpa avisos antigos; por isso vem antes de mostrar o novo
          setAviso("Conta criada! Enviamos um link de confirmação para o seu e-mail. Clique nele e depois entre aqui.");
          setSenha("");
        }
      } else {
        await api.entrar(email, senha);
      }
      // em caso de sucesso, `usuario` muda e o <Navigate> acima faz o redirecionamento
    } catch (err) {
      setErro(err instanceof ErroAmigavel ? err.message : "Algo deu errado. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cs-form-pagina">
      <div className="cs-abas" role="tablist" aria-label="Acesso">
        <button type="button" role="tab" aria-selected={!criando} className={!criando ? "on" : ""} onClick={() => trocarModo(false)}>Entrar</button>
        <button type="button" role="tab" aria-selected={criando} className={criando ? "on" : ""} onClick={() => trocarModo(true)}>Criar conta</button>
      </div>

      <h1 className="cs-h1-pequeno">{criando ? "Crie sua conta" : "Entre na sua conta"}</h1>

      <form onSubmit={enviar} noValidate className="cs-form">
        {criando && (
          <label>
            Nome
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={80} required />
          </label>
        )}
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" maxLength={254} required />
        </label>
        <label>
          Senha
          <input
            type={verSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={criando ? "new-password" : "current-password"}
            maxLength={72}
            required
          />
          {criando && <small>Pelo menos {SENHA_MIN} caracteres, com letras e números.</small>}
        </label>
        <label className="cs-check">
          <input type="checkbox" checked={verSenha} onChange={(e) => setVerSenha(e.target.checked)} /> Mostrar senha
        </label>

        {erro && <p className="cs-erro" role="alert">{erro}</p>}
        {aviso && <p className="cs-ok" role="status">{aviso}</p>}

        <button className="cs-btn cs-btn--primario" disabled={enviando}>
          {enviando ? "Aguarde…" : criando ? "Criar conta" : "Entrar"}
        </button>
      </form>
    </section>
  );
}
