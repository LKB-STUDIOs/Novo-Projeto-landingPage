import { Navigate } from "react-router";
import { useAuth } from "./Auth";

/** Para páginas só de quem está logado: manda para o login e, depois dele, de volta para `voltar`. */
export function ExigeLogin({ voltar }: { voltar: string }) {
  const { acabouDeSair } = useAuth();
  // quem acabou de clicar em "Sair" não quer ver a tela de login
  const destino = acabouDeSair() ? "/cursos" : `/cursos/entrar?voltar=${encodeURIComponent(voltar)}`;
  return <Navigate to={destino} replace />;
}
