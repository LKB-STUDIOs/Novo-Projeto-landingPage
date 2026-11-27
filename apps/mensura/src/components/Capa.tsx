import type { Curso } from "../cursos";

/** Ilustração técnica de cada curso, desenhada em SVG (sem imagens para baixar). */
export function Capa({ tipo }: { tipo: Curso["capa"] }) {
  return (
    <svg className="capa" viewBox="0 0 320 180" aria-hidden="true">
      <defs>
        <pattern id={`g-${tipo}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="currentColor" strokeOpacity="0.12" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill={`url(#g-${tipo})`} />
      {tipo === "regua" && (
        <g>
          <rect x="30" y="70" width="260" height="46" rx="3" className="capa-corpo" />
          {Array.from({ length: 51 }, (_, i) => (
            <line key={i} x1={40 + i * 4.8} x2={40 + i * 4.8} y1="70" y2={70 + (i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9)} className="capa-traco" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <text key={n} x={40 + n * 48} y="108" className="capa-num" textAnchor="middle">{n}</text>
          ))}
          <path d="M160 40v22" className="capa-destaque" />
          <circle cx="160" cy="36" r="5" className="capa-ponto" />
        </g>
      )}
      {tipo === "paquimetro" && (
        <g>
          <rect x="24" y="64" width="276" height="26" rx="2" className="capa-corpo" />
          <path d="M40 64v-36h22v36M40 90v62l22-26v-36" className="capa-peca" />
          <rect x="150" y="56" width="74" height="44" rx="4" className="capa-cursor" />
          <path d="M150 100v52l22-26v-26" className="capa-peca" />
          {Array.from({ length: 41 }, (_, i) => (
            <line key={i} x1={70 + i * 5.5} x2={70 + i * 5.5} y1="64" y2={64 + (i % 10 === 0 ? 14 : i % 5 === 0 ? 10 : 6)} className="capa-traco" />
          ))}
          <path d="M62 132h88" className="capa-destaque" strokeDasharray="4 4" />
        </g>
      )}
      {tipo === "curva" && (
        <g>
          <path d="M30 150h260" className="capa-traco" />
          <path d="M40 150C100 150 115 40 160 40s60 110 120 110" className="capa-linha" />
          <path d="M160 40v110" className="capa-destaque" strokeDasharray="4 4" />
          <path d="M120 128h80" className="capa-destaque" />
          <path d="M120 122v12M200 122v12" className="capa-destaque" />
          <text x="160" y="120" className="capa-num" textAnchor="middle">±U (k=2)</text>
        </g>
      )}
      {tipo === "alvo" && (
        <g>
          {[62, 46, 30, 14].map((r) => (
            <circle key={r} cx="160" cy="92" r={r} className="capa-traco" fill="none" />
          ))}
          {[[152, 86], [166, 98], [158, 100], [170, 88], [149, 95], [162, 84]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" className="capa-ponto" />
          ))}
          <path d="M160 22v20M160 142v20M90 92h20M210 92h20" className="capa-traco" />
        </g>
      )}
    </svg>
  );
}
