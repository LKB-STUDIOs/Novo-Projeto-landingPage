import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { obterApi } from "./api";
import type { CursosApi, Usuario } from "./tipos";

interface Estado {
  api: CursosApi;
  usuario: Usuario | null;
}

interface Contextual extends Estado {
  /** Encerra a sessão. Páginas protegidas levam a pessoa para a lista de cursos, e não para o login. */
  sair(): Promise<void>;
  /** Verdadeiro logo depois de a pessoa clicar em "Sair" (vale por 1 segundo). */
  acabouDeSair(): boolean;
}

const Contexto = createContext<Contextual | null>(null);

/**
 * Carrega o servidor e descobre quem está logado antes de mostrar qualquer tela da área de cursos.
 * Assim as páginas nunca piscam "visitante" para quem já está logado.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado | "erro" | null>(null);
  const saindo = useRef(false);

  useEffect(() => {
    let vivo = true;
    let cancelar = () => {};
    obterApi()
      .then(async (api) => {
        const usuario = await api.usuarioAtual();
        if (!vivo) return;
        setEstado({ api, usuario });
        cancelar = api.aoMudarSessao((u) => {
          if (!vivo) return;
          // renovar o token gera um objeto novo, mas a pessoa é a mesma: não precisa redesenhar
          setEstado((prev) => (prev && prev !== "erro" && prev.usuario?.id === u?.id ? prev : { api, usuario: u }));
        });
      })
      .catch(() => vivo && setEstado("erro"));
    return () => {
      vivo = false;
      cancelar();
    };
  }, []);

  const valor = useMemo<Contextual | null>(() => {
    if (estado === null || estado === "erro") return null;
    return {
      ...estado,
      async sair() {
        saindo.current = true;
        try {
          await estado.api.sair();
        } finally {
          setTimeout(() => (saindo.current = false), 1000);
        }
      },
      acabouDeSair: () => saindo.current,
    };
  }, [estado]);

  if (estado === null) return <div className="carregando-rota">Carregando…</div>;
  if (estado === "erro")
    return (
      <div className="carregando-rota" role="alert">
        Não foi possível abrir a plataforma. Recarregue a página.
      </div>
    );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): Contextual {
  const c = useContext(Contexto);
  if (!c) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return c;
}
