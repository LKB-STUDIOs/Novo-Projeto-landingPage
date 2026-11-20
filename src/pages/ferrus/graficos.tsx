/** Ferrus OS — gráficos em SVG puro (sem biblioteca), coloridos pelas variáveis do tema. */
import { useId, useState, type ReactNode } from "react";
import { fmt } from "./nucleo";

export const CORES = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)"];
type Fmt = (n: number) => string;
const padrao: Fmt = (n) => fmt(n);

/** Escala "bonita" para o eixo: 0, 250, 500… */
function escala(max: number, min = 0, passos = 4) {
  const bruto = (max - min) / passos || 1;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= bruto) ?? bruto;
  const ini = Math.floor(min / passo) * passo;
  const fim = Math.ceil(max / passo) * passo;
  const ticks: number[] = [];
  for (let v = ini; v <= fim + passo / 2; v += passo) ticks.push(+v.toFixed(6));
  return { ini, fim, ticks };
}

function Dica({ x, y, titulo, linhas }: { x: number; y: number; titulo: string; linhas: [string, string, string][] }) {
  return (
    <div className="fx-dica" style={{ left: `${x}%`, top: `${y}%` }}>
      <b>{titulo}</b>
      {linhas.map(([cor, nome, v]) => (
        <span key={nome}><i style={{ background: cor }} />{nome}<em>{v}</em></span>
      ))}
    </div>
  );
}


function LegendaSeries({ series }: { series: Serie[] }) {
  if (series.length < 2) return null;
  return (
    <div className="fx-leg-series">
      {series.map((s, k) => <span key={s.nome}><i style={{ background: s.cor ?? CORES[k] }} className={s.tracejada ? "tracejada" : ""} />{s.nome}</span>)}
    </div>
  );
}

// ---------------------------------------------------------------- sparkline
export function Sparkline({ valores, cor = "var(--accent)", altura = 36 }: { valores: number[]; cor?: string; altura?: number }) {
  const id = useId();
  if (valores.length < 2) return null;
  const W = 120, H = altura;
  const mx = Math.max(...valores), mn = Math.min(...valores);
  const x = (i: number) => (i / (valores.length - 1)) * W;
  const y = (v: number) => 3 + (1 - (v - mn) / (mx - mn || 1)) * (H - 6);
  const d = valores.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  return (
    <svg className="fx-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={cor} stopOpacity={0.35} /><stop offset="1" stopColor={cor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${d}L${W} ${H}L0 ${H}Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={cor} strokeWidth={1.8} vectorEffect="non-scaling-stroke" className="fx-traco" pathLength={1} />
    </svg>
  );
}

// ---------------------------------------------------------------- área / linhas
export type Serie = { nome: string; valores: number[]; cor?: string; tracejada?: boolean; area?: boolean };
export function Linhas({
  series, rotulos, formatar = padrao, altura = 240, min, max, faixa,
}: { series: Serie[]; rotulos: string[]; formatar?: Fmt; altura?: number; min?: number; max?: number; faixa?: [number, number] }) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = altura, P = { l: 52, r: 14, t: 14, b: 30 };
  const todos = series.flatMap((s) => s.valores);
  const e = escala(max ?? Math.max(...todos), min ?? Math.min(0, ...todos));
  const n = rotulos.length;
  const x = (i: number) => P.l + (n === 1 ? 0.5 : i / (n - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - (v - e.ini) / (e.fim - e.ini || 1)) * (H - P.t - P.b);
  const passoRotulo = Math.ceil(n / 12);
  return (
    <div className="fx-graf" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map((s) => s.nome).join(", ")}
        onMouseMove={(ev) => {
          const r = ev.currentTarget.getBoundingClientRect();
          const px = ((ev.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(n - 1, Math.round(((px - P.l) / (W - P.l - P.r)) * (n - 1)))));
        }}>
        <defs>
          {series.map((s, k) => (
            <linearGradient key={k} id={`${id}-${k}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.cor ?? CORES[k]} stopOpacity={0.32} /><stop offset="1" stopColor={s.cor ?? CORES[k]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {faixa && <rect className="fx-faixa" x={P.l} width={W - P.l - P.r} y={y(faixa[1])} height={y(faixa[0]) - y(faixa[1])} />}
        {e.ticks.map((t) => (
          <g key={t}>
            <line className="fx-grade" x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} />
            <text className="fx-eixo" x={P.l - 8} y={y(t) + 4} textAnchor="end">{formatar(t)}</text>
          </g>
        ))}
        {rotulos.map((r, i) => (i % passoRotulo === 0 || i === n - 1) && (
          <text key={i} className="fx-eixo" x={x(i)} y={H - 8} textAnchor="middle">{r}</text>
        ))}
        {series.map((s, k) => {
          const d = s.valores.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
          const cor = s.cor ?? CORES[k];
          return (
            <g key={s.nome}>
              {s.area !== false && !s.tracejada && <path d={`${d}L${x(n - 1)} ${y(e.ini)}L${x(0)} ${y(e.ini)}Z`} fill={`url(#${id}-${k})`} className="fx-surge" />}
              <path d={d} fill="none" stroke={cor} strokeWidth={s.tracejada ? 1.6 : 2.4} strokeDasharray={s.tracejada ? "5 5" : undefined}
                strokeLinejoin="round" strokeLinecap="round" className={s.tracejada ? "" : "fx-traco"} pathLength={s.tracejada ? undefined : 1} />
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line className="fx-mira" x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} />
            {series.map((s, k) => s.valores[hover] !== undefined && (
              <circle key={k} cx={x(hover)} cy={y(s.valores[hover]!)} r={4.5} fill="var(--surface)" stroke={s.cor ?? CORES[k]} strokeWidth={2.2} />
            ))}
          </g>
        )}
      </svg>
      <LegendaSeries series={series} />
      {hover !== null && (
        <Dica x={(x(hover) / W) * 100} y={8} titulo={rotulos[hover] ?? ""}
          linhas={series.map((s, k) => [s.cor ?? CORES[k]!, s.nome, formatar(s.valores[hover] ?? 0)])} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- colunas (agrupadas ou empilhadas)
export function Colunas({
  series, rotulos, formatar = padrao, altura = 240, empilhar = false, meta,
}: { series: Serie[]; rotulos: string[]; formatar?: Fmt; altura?: number; empilhar?: boolean; meta?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = altura, P = { l: 52, r: 10, t: 14, b: 30 };
  const n = rotulos.length;
  const totais = rotulos.map((_, i) => (empilhar ? series.reduce((s, se) => s + (se.valores[i] ?? 0), 0) : Math.max(...series.map((se) => se.valores[i] ?? 0))));
  const e = escala(Math.max(...totais, meta ?? 0));
  const banda = (W - P.l - P.r) / n;
  const y = (v: number) => P.t + (1 - v / (e.fim || 1)) * (H - P.t - P.b);
  const larg = empilhar ? banda * 0.56 : (banda * 0.7) / series.length;
  return (
    <div className="fx-graf" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map((s) => s.nome).join(", ")}>
        {e.ticks.map((t) => (
          <g key={t}>
            <line className="fx-grade" x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} />
            <text className="fx-eixo" x={P.l - 8} y={y(t) + 4} textAnchor="end">{formatar(t)}</text>
          </g>
        ))}
        {rotulos.map((r, i) => {
          const x0 = P.l + i * banda;
          let acumulado = 0;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} className={hover !== null && hover !== i ? "fx-apaga" : ""}>
              <rect x={x0} y={P.t} width={banda} height={H - P.t - P.b} fill="transparent" />
              {series.map((s, k) => {
                const v = s.valores[i] ?? 0;
                const cor = s.cor ?? CORES[k];
                if (empilhar) {
                  const yb = y(acumulado), yt = y(acumulado + v);
                  acumulado += v;
                  return <rect key={k} className="fx-barra" x={x0 + (banda - larg) / 2} y={yt} width={larg} height={Math.max(0, yb - yt)} fill={cor} rx={k === series.length - 1 ? 4 : 0} style={{ animationDelay: `${i * 25}ms` }} />;
                }
                return <rect key={k} className="fx-barra" x={x0 + banda * 0.15 + k * larg} y={y(v)} width={larg - 2} height={Math.max(0, y(0) - y(v))} fill={cor} rx={4} style={{ animationDelay: `${i * 25}ms` }} />;
              })}
              <text className="fx-eixo" x={x0 + banda / 2} y={H - 8} textAnchor="middle">{r.length > 10 ? r.slice(0, 9) + "…" : r}</text>
            </g>
          );
        })}
        {meta !== undefined && (
          <g>
            <line className="fx-meta" x1={P.l} x2={W - P.r} y1={y(meta)} y2={y(meta)} />
            <text className="fx-eixo fx-meta-txt" x={W - P.r} y={y(meta) - 6} textAnchor="end">meta {formatar(meta)}</text>
          </g>
        )}
      </svg>
      <LegendaSeries series={series} />
      {hover !== null && (
        <Dica x={((P.l + (hover + 0.5) * banda) / W) * 100} y={6} titulo={rotulos[hover] ?? ""}
          linhas={series.map((s, k) => [s.cor ?? CORES[k]!, s.nome, formatar(s.valores[hover] ?? 0)])} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- barras horizontais (ranking)
export function Ranking({ dados, formatar = padrao, cor = "var(--accent)", max }: { dados: { k: string; v: number; cor?: string; extra?: ReactNode }[]; formatar?: Fmt; cor?: string; max?: number }) {
  const mx = max ?? Math.max(...dados.map((d) => d.v), 1);
  return (
    <ul className="fx-ranking">
      {dados.map((d, i) => (
        <li key={d.k}>
          <div className="fx-ranking-top"><span>{d.k}</span><b>{formatar(d.v)}</b>{d.extra}</div>
          <div className="fx-ranking-trilho"><i style={{ width: `${(d.v / mx) * 100}%`, background: d.cor ?? cor, animationDelay: `${i * 50}ms` }} /></div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------- rosca
export function Rosca({ dados, centro, sub, formatar = padrao, tamanho = 180 }: { dados: { k: string; v: number; cor?: string }[]; centro: string; sub?: string; formatar?: Fmt; tamanho?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = dados.reduce((s, d) => s + d.v, 0) || 1;
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="fx-rosca">
      <svg viewBox="0 0 180 180" width={tamanho} height={tamanho} role="img" aria-label={dados.map((d) => `${d.k}: ${formatar(d.v)}`).join("; ")}>
        <circle cx={90} cy={90} r={R} fill="none" stroke="var(--line)" strokeWidth={18} />
        {dados.map((d, i) => {
          const frac = d.v / total;
          const el = (
            <circle key={d.k} cx={90} cy={90} r={R} fill="none" stroke={d.cor ?? CORES[i % CORES.length]} strokeWidth={hover === i ? 24 : 18}
              strokeDasharray={`${Math.max(0, frac * C - 2)} ${C}`} strokeDashoffset={-acc * C} transform="rotate(-90 90 90)"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="fx-fatia" />
          );
          acc += frac;
          return el;
        })}
        <text x={90} y={hover === null ? 90 : 86} textAnchor="middle" className="fx-rosca-centro" style={{ fontSize: hover === null && centro.length > 6 ? Math.max(13, 22 - (centro.length - 6) * 1.6) : undefined }}>{hover === null ? centro : `${fmt((dados[hover]!.v / total) * 100, 1)}%`}</text>
        <text x={90} y={hover === null ? 110 : 106} textAnchor="middle" className="fx-eixo">{hover === null ? sub : dados[hover]!.k.slice(0, 22)}</text>
      </svg>
      <ul className="fx-legenda">
        {dados.map((d, i) => (
          <li key={d.k} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={hover === i ? "on" : ""}>
            <i style={{ background: d.cor ?? CORES[i % CORES.length] }} />{d.k}<b>{formatar(d.v)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- medidor (meia-lua)
export function Medidor({ valor, rotulo, meta, max = 100, sufixo = "%" }: { valor: number; rotulo: string; meta?: number; max?: number; sufixo?: string }) {
  const R = 80, C = Math.PI * R;
  const frac = Math.max(0, Math.min(1, valor / max));
  const cor = meta === undefined ? "var(--accent)" : valor >= meta ? "var(--ok)" : valor >= meta * 0.92 ? "var(--warn)" : "var(--bad)";
  const ang = Math.PI * (1 - (meta ?? 0) / max);
  return (
    <div className="fx-medidor">
      <svg viewBox="0 0 200 118" role="img" aria-label={`${rotulo}: ${fmt(valor, 1)}${sufixo}`}>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--line)" strokeWidth={14} strokeLinecap="round" />
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={cor} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${frac * C} ${C}`} className="fx-medidor-arco" />
        {meta !== undefined && (
          <line x1={100 + Math.cos(ang) * 66} y1={100 - Math.sin(ang) * 66} x2={100 + Math.cos(ang) * 94} y2={100 - Math.sin(ang) * 94} stroke="var(--text)" strokeWidth={2} opacity={0.55} />
        )}
        <text x={100} y={92} textAnchor="middle" className="fx-medidor-valor">{fmt(valor, 1)}<tspan className="fx-medidor-suf">{sufixo}</tspan></text>
      </svg>
      <p>{rotulo}{meta !== undefined && <span> · meta {fmt(meta)}{sufixo}</span>}</p>
    </div>
  );
}

// ---------------------------------------------------------------- anel de progresso
export function Anel({ valor, tamanho = 44, cor }: { valor: number; tamanho?: number; cor?: string }) {
  const R = 18, C = 2 * Math.PI * R;
  const c = cor ?? (valor >= 85 ? "var(--ok)" : valor >= 70 ? "var(--warn)" : "var(--bad)");
  return (
    <svg className="fx-anel" viewBox="0 0 44 44" width={tamanho} height={tamanho} role="img" aria-label={`${fmt(valor)}%`}>
      <circle cx={22} cy={22} r={R} fill="none" stroke="var(--line)" strokeWidth={4} />
      <circle cx={22} cy={22} r={R} fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${(valor / 100) * C} ${C}`} transform="rotate(-90 22 22)" />
      <text x={22} y={26} textAnchor="middle">{Math.round(valor)}</text>
    </svg>
  );
}

// ---------------------------------------------------------------- pareto
export function Pareto({ dados }: { dados: { k: string; v: number }[] }) {
  const ord = [...dados].sort((a, b) => b.v - a.v);
  const total = ord.reduce((s, d) => s + d.v, 0) || 1;
  let acc = 0;
  const cum = ord.map((d) => ((acc += d.v) / total) * 100);
  const W = 640, H = 250, P = { l: 40, r: 40, t: 14, b: 44 };
  const e = escala(ord[0]?.v ?? 1);
  const banda = (W - P.l - P.r) / Math.max(1, ord.length);
  const y = (v: number) => P.t + (1 - v / e.fim) * (H - P.t - P.b);
  const yp = (p: number) => P.t + (1 - p / 100) * (H - P.t - P.b);
  const cx = (i: number) => P.l + (i + 0.5) * banda;
  return (
    <div className="fx-graf">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pareto de defeitos">
        {e.ticks.map((t) => <g key={t}><line className="fx-grade" x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} /><text className="fx-eixo" x={P.l - 6} y={y(t) + 4} textAnchor="end">{t}</text></g>)}
        {[0, 50, 80, 100].map((p) => <text key={p} className="fx-eixo" x={W - P.r + 6} y={yp(p) + 4}>{p}%</text>)}
        <line className="fx-meta" x1={P.l} x2={W - P.r} y1={yp(80)} y2={yp(80)} />
        {ord.map((d, i) => (
          <g key={d.k}>
            <rect className="fx-barra" x={cx(i) - banda * 0.32} y={y(d.v)} width={banda * 0.64} height={y(0) - y(d.v)} rx={4} fill={cum[i]! <= 80 || i === 0 ? "var(--c1)" : "var(--c2)"} style={{ animationDelay: `${i * 30}ms` }}>
              <title>{`${d.k}: ${d.v} ocorrências`}</title>
            </rect>
            <text className="fx-eixo" x={cx(i)} y={H - 26} textAnchor="middle">{d.k.length > 9 ? d.k.slice(0, 8) + "." : d.k}</text>
          </g>
        ))}
        <path d={cum.map((p, i) => `${i ? "L" : "M"}${cx(i)} ${yp(p)}`).join("")} fill="none" stroke="var(--c3)" strokeWidth={2.2} className="fx-traco" pathLength={1} />
        {cum.map((p, i) => <circle key={i} cx={cx(i)} cy={yp(p)} r={3.5} fill="var(--surface)" stroke="var(--c3)" strokeWidth={2} />)}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------- carta de controle (CEP)
export function CartaControle({ valores, lie, lse, rotulo }: { valores: number[]; lie: number; lse: number; rotulo: string }) {
  const m = valores.reduce((s, v) => s + v, 0) / valores.length;
  const dp = Math.sqrt(valores.reduce((s, v) => s + (v - m) ** 2, 0) / (valores.length - 1));
  const lsc = m + 3 * dp, lic = m - 3 * dp;
  const cp = (lse - lie) / (6 * dp);
  const cpk = Math.min(lse - m, m - lie) / (3 * dp);
  const W = 640, H = 240, P = { l: 46, r: 64, t: 14, b: 24 };
  const lo = Math.min(lie, lic, ...valores) - 0.3, hi = Math.max(lse, lsc, ...valores) + 0.3;
  const x = (i: number) => P.l + (i / (valores.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);
  const linhas: [number, string, string][] = [[lse, "LSE", "var(--bad)"], [lsc, "LSC", "var(--warn)"], [m, "X̄", "var(--muted)"], [lic, "LIC", "var(--warn)"], [lie, "LIE", "var(--bad)"]];
  return (
    <div>
      <div className="fx-graf">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Carta de controle: ${rotulo}`}>
          {linhas.map(([v, n, c]) => (
            <g key={n}>
              <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke={c} strokeDasharray={n === "X̄" ? undefined : "6 5"} strokeWidth={1.2} opacity={0.8} />
              <text className="fx-eixo" x={W - P.r + 6} y={y(v) + 4} fill={c}>{n} {fmt(v, 2)}</text>
            </g>
          ))}
          <path d={valores.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join("")} fill="none" stroke="var(--c2)" strokeWidth={1.8} className="fx-traco" pathLength={1} />
          {valores.map((v, i) => {
            const fora = v > lsc || v < lic;
            return <circle key={i} cx={x(i)} cy={y(v)} r={fora ? 5 : 3.2} fill={fora ? "var(--bad)" : "var(--surface)"} stroke={fora ? "var(--bad)" : "var(--c2)"} strokeWidth={1.8}><title>{`Amostra ${i + 1}: ${fmt(v, 2)}`}</title></circle>;
          })}
        </svg>
      </div>
      <div className="fx-cep-indices">
        <span>Média <b>{fmt(m, 2)}</b></span><span>Desvio <b>{fmt(dp, 3)}</b></span>
        <span>Cp <b className={cp >= 1.33 ? "t-ok" : "t-warn"}>{fmt(cp, 2)}</b></span>
        <span>Cpk <b className={cpk >= 1.33 ? "t-ok" : cpk >= 1 ? "t-warn" : "t-bad"}>{fmt(cpk, 2)}</b></span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- radar
export function Radar({ dados, meta = 85 }: { dados: { k: string; v: number }[]; meta?: number }) {
  const N = dados.length, R = 110, cx = 160, cy = 140;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / N - Math.PI / 2;
    return [cx + Math.cos(a) * R * (v / 100), cy + Math.sin(a) * R * (v / 100)] as const;
  };
  const poli = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  return (
    <div className="fx-graf">
      <svg viewBox="0 0 320 280" role="img" aria-label="Conformidade por domínio">
        {[25, 50, 75, 100].map((r) => <polygon key={r} points={poli(dados.map(() => r))} fill="none" stroke="var(--line)" />)}
        {dados.map((_, i) => { const [x, y] = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" />; })}
        <polygon points={poli(dados.map(() => meta))} fill="none" stroke="var(--muted)" strokeDasharray="4 4" />
        <polygon points={poli(dados.map((d) => d.v))} fill="var(--c2)" fillOpacity={0.2} stroke="var(--c2)" strokeWidth={2} className="fx-surge" />
        {dados.map((d, i) => {
          const [x, y] = pt(i, d.v);
          const [lx, ly] = pt(i, 122);
          return (
            <g key={d.k}>
              <circle cx={x} cy={y} r={3.5} fill={d.v >= meta ? "var(--c2)" : "var(--bad)"}><title>{`${d.k}: ${d.v}%`}</title></circle>
              <text className="fx-eixo" x={lx} y={ly + 3} textAnchor={Math.abs(lx - cx) < 8 ? "middle" : lx > cx ? "start" : "end"}>{d.k}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------- mapa de calor
export function MapaCalor({ linhas, colunas, valor, formatar = padrao, inverter = false }: { linhas: string[]; colunas: string[]; valor: (l: number, c: number) => number; formatar?: Fmt; inverter?: boolean }) {
  const vals = linhas.flatMap((_, l) => colunas.map((__, c) => valor(l, c)));
  const mx = Math.max(...vals), mn = Math.min(...vals);
  return (
    <div className="fx-calor" style={{ gridTemplateColumns: `minmax(90px, auto) repeat(${colunas.length}, 1fr)` }}>
      <span />
      {colunas.map((c) => <span key={c} className="fx-calor-col">{c}</span>)}
      {linhas.map((l, li) => (
        <div key={l} className="fx-calor-linha">
          <span className="fx-calor-rot">{l}</span>
          {colunas.map((c, ci) => {
            const v = valor(li, ci);
            const t = (v - mn) / (mx - mn || 1);
            const i = inverter ? 1 - t : t;
            return <span key={c} className="fx-calor-cel" style={{ ["--i" as string]: String(0.12 + i * 0.88) }} title={`${l} · ${c}: ${formatar(v)}`}>{formatar(v)}</span>;
          })}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- pirâmide (Bird)
export function Piramide({ niveis }: { niveis: { k: string; v: number; cor: string }[] }) {
  return (
    <div className="fx-piramide">
      {niveis.map((n, i) => (
        <div key={n.k} className="fx-piramide-nivel" style={{ width: `${34 + (i / Math.max(1, niveis.length - 1)) * 66}%`, background: n.cor, animationDelay: `${i * 70}ms` }}>
          <b>{n.v}</b><span>{n.k}</span>
        </div>
      ))}
    </div>
  );
}
