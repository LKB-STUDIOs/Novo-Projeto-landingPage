import { useState } from "react";
import { idYoutube, miniatura, player } from "../lib/youtube";
import { Play } from "./Icones";

/**
 * Player do YouTube que só carrega quando o aluno clica (a página abre rápido e
 * o YouTube não é chamado antes disso). Usa o domínio youtube-nocookie.com.
 */
export function VideoYoutube({ video, titulo, iniciar = false }: { video: string; titulo: string; iniciar?: boolean }) {
  const id = idYoutube(video);
  const [tocando, setTocando] = useState(iniciar);

  if (!id) {
    return (
      <div className="video video-vazio" role="img" aria-label={`Vídeo da aula "${titulo}" ainda não publicado`}>
        <div className="video-vazio-grade" aria-hidden="true" />
        <span className="video-vazio-icone" aria-hidden="true"><Play size={26} /></span>
        <p>Vídeo em produção</p>
        <small>Cole o link do YouTube desta aula em <code>src/cursos.ts</code></small>
      </div>
    );
  }

  if (tocando) {
    return (
      <div className="video">
        <iframe
          src={player(id)}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button type="button" className="video video-capa" onClick={() => setTocando(true)} aria-label={`Assistir: ${titulo}`}>
      <img src={miniatura(id)} alt="" loading="lazy" decoding="async" />
      <span className="video-play" aria-hidden="true"><Play size={30} /></span>
    </button>
  );
}
