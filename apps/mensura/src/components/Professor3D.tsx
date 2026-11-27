import { useEffect, useRef, useState } from "react";

/** Palco do professor 3D. O three.js só é baixado quando a seção chega perto da tela. */
export function Professor3D({ nome }: { nome: string }) {
  const palco = useRef<HTMLDivElement>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    let desmontar: (() => void) | undefined;
    let cancelado = false;
    const iniciar = async () => {
      try {
        const { montarProfessor } = await import("./professor3d");
        if (!cancelado) desmontar = montarProfessor(el, nome);
      } catch {
        if (!cancelado) setFalhou(true);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        void iniciar();
      }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => {
      cancelado = true;
      io.disconnect();
      desmontar?.();
    };
  }, [nome]);

  const iniciais = nome.split(/\s+/).filter((p) => /^[A-ZÀ-Ú][a-zà-ú]/.test(p) && !p.startsWith("Prof")).slice(0, 2).map((p) => p[0]).join("");

  return (
    <div className="palco3d" ref={palco} role="img" aria-label={`Ilustração 3D de ${nome} segurando um paquímetro`}>
      {falhou && <span className="palco3d-reserva">{iniciais}</span>}
      <span className="palco3d-etiqueta mono">Modelo 3D · mova o mouse</span>
    </div>
  );
}
