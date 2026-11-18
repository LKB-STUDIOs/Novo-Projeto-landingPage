import { useCallback, useEffect, useRef, useState } from "react";
import { ErroAmigavel } from "./tipos";

interface Estado<T> {
  dados?: T;
  erro?: string;
  carregando: boolean;
}

/**
 * Busca dados quando `deps` mudam. `recarregar()` atualiza em silêncio, mantendo a tela como está
 * (por exemplo, o vídeo não reinicia quando a pessoa marca a aula como concluída).
 */
export function useCarregar<T>(buscar: () => Promise<T>, deps: readonly unknown[]) {
  const [estado, setEstado] = useState<Estado<T>>({ carregando: true });
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;
  const geracao = useRef(0);

  useEffect(() => {
    const minha = ++geracao.current;
    setEstado({ carregando: true });
    buscarRef.current().then(
      (dados) => minha === geracao.current && setEstado({ dados, carregando: false }),
      (e: unknown) =>
        minha === geracao.current &&
        setEstado({ carregando: false, erro: e instanceof ErroAmigavel ? e.message : "Algo deu errado. Tente de novo." }),
    );
    return () => {
      geracao.current++;
    };
  }, deps);

  const recarregar = useCallback(() => {
    const minha = geracao.current;
    buscarRef.current().then(
      (dados) => minha === geracao.current && setEstado({ dados, carregando: false }),
      () => {},
    );
  }, []);

  return { ...estado, recarregar };
}

export function useTitulo(titulo: string) {
  useEffect(() => {
    const antes = document.title;
    document.title = titulo;
    return () => {
      document.title = antes;
    };
  }, [titulo]);
}
