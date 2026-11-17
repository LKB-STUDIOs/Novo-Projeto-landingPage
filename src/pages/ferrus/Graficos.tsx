import { br, fmt } from "./dados";

export function GraficoBarras({ dados }: { dados: { k: string; v: number }[] }) {
  const W = 520, H = 230, pad = { l: 8, r: 8, t: 22, b: 36 };
  const max = Math.max(...dados.map((d) => d.v), 1);
  const bw = (W - pad.l - pad.r) / dados.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Produção por setor">
      <line className="grid" x1={0} x2={W} y1={H - pad.b} y2={H - pad.b} />
      {dados.map((d, i) => {
        const h = (d.v / max) * (H - pad.t - pad.b);
        const x = pad.l + i * bw + bw * 0.18;
        const y = H - pad.b - h;
        return (
          <g key={d.k}>
            <rect className="bar" x={x} y={y} width={bw * 0.64} height={h} rx={5}>
              <title>{`${d.k}: ${fmt(d.v)}`}</title>
            </rect>
            <text className="val" x={x + bw * 0.32} y={y - 6} textAnchor="middle">
              {d.v >= 1000 ? (d.v / 1000).toFixed(1) + "k" : d.v}
            </text>
            <text x={x + bw * 0.32} y={H - pad.b + 18} textAnchor="middle">
              {d.k.length > 9 ? d.k.slice(0, 8) + "." : d.k}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function GraficoLinha({ dados }: { dados: { k: string; v: number }[] }) {
  const W = 520, H = 230, pad = { l: 34, r: 12, t: 16, b: 36 };
  const min = 90, max = 100;
  const x = (i: number) => pad.l + (i / (dados.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (Math.max(min, v) - min) / (max - min)) * (H - pad.t - pad.b);
  const caminho = dados.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.v).toFixed(1)}`).join(" ");
  const area = `${caminho} L${x(dados.length - 1)} ${H - pad.b} L${x(0)} ${H - pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Índice de aprovação por dia">
      <defs>
        <linearGradient id="fx-ga" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0fa58a" stopOpacity={0.25} />
          <stop offset="1" stopColor="#0fa58a" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[90, 95, 100].map((v) => (
        <g key={v}>
          <line className="grid" x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end">{v}%</text>
        </g>
      ))}
      <path d={area} fill="url(#fx-ga)" />
      <path d={caminho} fill="none" stroke="#0fa58a" strokeWidth={2.5} strokeLinejoin="round" />
      {dados.map((d, i) => (
        <g key={d.k}>
          <circle cx={x(i)} cy={y(d.v)} r={4} fill="#fff" stroke="#0fa58a" strokeWidth={2}>
            <title>{`${br(d.k)}: ${d.v.toFixed(1)}%`}</title>
          </circle>
          <text x={x(i)} y={H - pad.b + 18} textAnchor="middle">{br(d.k).slice(0, 5)}</text>
        </g>
      ))}
    </svg>
  );
}
