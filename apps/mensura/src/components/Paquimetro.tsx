import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/*
 * Paquímetro com nônio de 20 divisões (resolução 0,05 mm): 20 traços do nônio ocupam 19 mm.
 * Modo livre: arraste o cursor e veja a leitura explicada. Modo desafio: leia a medida da peça.
 */

const PX = 14; // pixels por milímetro no desenho
const X0 = 60; // face do bico fixo
const CURSO_MAX = 30; // abertura máxima, em mm
const N = 20;
const PASSO = 19 / N; // 0,95 mm entre traços do nônio
const ESCALA = 56; // traços da escala fixa

const arred = (v: number) => Math.round(v * 20) / 20;
const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sortear = () => arred(3 + Math.random() * (CURSO_MAX - 6));

export function Paquimetro() {
  const [modo, setModo] = useState<"livre" | "desafio">("livre");
  const [x, setX] = useState(12.35);
  const [alvo, setAlvo] = useState(sortear);
  const [resposta, setResposta] = useState("");
  const [resultado, setResultado] = useState<null | "certo" | "errado" | "revelado">(null);
  const [acertos, setAcertos] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const pega = useRef<number | null>(null);

  const medida = modo === "livre" ? x : alvo;
  const vx = X0 + medida * PX;
  const inteiro = Math.floor(medida + 1e-9);
  const traco = Math.round((medida - inteiro) * 20); // traço do nônio que coincide
  const mostrarLeitura = modo === "livre" || resultado === "revelado" || resultado === "certo";

  const mmNoPonteiro = (e: PointerEvent) => {
    const el = svg.current;
    const ctm = el?.getScreenCTM();
    if (!el || !ctm) return 0;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return (p.x - X0) / PX;
  };

  const mover = (v: number) => setX(Math.min(CURSO_MAX, Math.max(0, arred(v))));

  const onDown = (e: PointerEvent<SVGGElement>) => {
    if (modo !== "livre") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pega.current = mmNoPonteiro(e) - x;
  };
  const onMove = (e: PointerEvent<SVGGElement>) => {
    if (pega.current === null) return;
    mover(mmNoPonteiro(e) - pega.current);
  };
  const onUp = () => (pega.current = null);
  const onKey = (e: KeyboardEvent) => {
    if (modo !== "livre") return;
    const passo = e.shiftKey ? 1 : 0.05;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") mover(x + passo);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") mover(x - passo);
    else if (e.key === "Home") mover(0);
    else if (e.key === "End") mover(CURSO_MAX);
    else return;
    e.preventDefault();
  };

  const conferir = () => {
    const v = Number(resposta.replace(",", ".").replace(/[^\d.]/g, ""));
    if (!resposta.trim() || Number.isNaN(v)) return;
    const ok = Math.abs(v - alvo) < 0.026;
    setResultado(ok ? "certo" : "errado");
    if (ok) setAcertos((a) => a + 1);
  };
  const proxima = () => {
    setAlvo(sortear());
    setResposta("");
    setResultado(null);
  };

  return (
    <div className="paq">
      <div className="paq-topo">
        <div className="paq-abas" role="tablist" aria-label="Modo do paquímetro">
          <button role="tab" aria-selected={modo === "livre"} onClick={() => setModo("livre")}>Explorar</button>
          <button role="tab" aria-selected={modo === "desafio"} onClick={() => { setModo("desafio"); proxima(); }}>Desafio</button>
        </div>
        <span className="paq-res">nônio 0,05 mm</span>
      </div>

      <div className="paq-quadro">
        <svg ref={svg} viewBox="0 0 880 222" className="paq-svg" role="img" aria-label={mostrarLeitura ? `Paquímetro marcando ${fmt(medida)} milímetros` : "Paquímetro medindo uma peça"}>
          {/* peça medida */}
          {modo === "desafio" && <rect x={X0} y="140" width={medida * PX} height="54" className="paq-peca" rx="2" />}

          {/* régua (escala fixa) */}
          <rect x="16" y="20" width="848" height="70" rx="4" className="paq-regua" />
          <path d={`M16 90H${X0}V200L40 214 16 176Z`} className="paq-bico" />
          {Array.from({ length: ESCALA + 1 }, (_, i) => {
            const h = i % 10 === 0 ? 24 : i % 5 === 0 ? 16 : 10;
            const lx = X0 + i * PX;
            const dest = mostrarLeitura && modo === "livre" && i === inteiro + traco;
            return <line key={i} x1={lx} x2={lx} y1={90 - h} y2="90" className={dest ? "paq-t paq-t-dest" : "paq-t"} />;
          })}
          {Array.from({ length: ESCALA / 10 + 1 }, (_, i) => (
            <text key={i} x={X0 + i * 10 * PX} y="56" className="paq-num" textAnchor="middle">{i}</text>
          ))}
          <text x="836" y="40" className="paq-un" textAnchor="end">cm</text>

          {/* cursor com nônio: arraste */}
          <g
            className={modo === "livre" ? "paq-cursor paq-arrasta" : "paq-cursor"}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            tabIndex={modo === "livre" ? 0 : -1}
            role="slider"
            aria-label="Cursor do paquímetro"
            aria-valuemin={0}
            aria-valuemax={CURSO_MAX}
            aria-valuenow={modo === "livre" ? x : undefined}
            aria-valuetext={modo === "livre" ? `${fmt(x)} mm` : undefined}
            onKeyDown={onKey}
          >
            <rect x={vx - 22} y="90" width={N * PASSO * PX + 50} height="40" rx="3" className="paq-nonio" />
            <path d={`M${vx} 130V200L${vx + 20} 214 ${vx + 44} 176V130Z`} className="paq-bico" />
            {Array.from({ length: N + 1 }, (_, i) => {
              const lx = vx + i * PASSO * PX;
              const dest = mostrarLeitura && modo === "livre" && i === traco;
              return <line key={i} x1={lx} x2={lx} y1="90" y2={i % 2 === 0 ? 104 : 99} className={dest ? "paq-t paq-t-dest" : "paq-t"} />;
            })}
            {Array.from({ length: 11 }, (_, i) => (
              <text key={i} x={vx + i * 2 * PASSO * PX} y="120" className="paq-num-n" textAnchor="middle">{i}</text>
            ))}
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={vx + 277 + i * 4} x2={vx + 277 + i * 4} y1="98" y2="122" className="paq-grip" />
            ))}
          </g>
        </svg>
      </div>

      {modo === "livre" ? (
        <div className="paq-leitura" aria-live="polite">
          <strong className="paq-valor">{fmt(x)} <small>mm</small></strong>
          <p>
            Escala fixa antes do zero do nônio: <b>{inteiro} mm</b>. Traço do nônio que coincide: <b>{traco}</b> × 0,05 ={" "}
            <b>{fmt(traco * 0.05)} mm</b>.
          </p>
          <p className="paq-dica">Arraste o cursor (ou use as setas do teclado).</p>
        </div>
      ) : (
        <div className="paq-leitura">
          <form className="paq-form" onSubmit={(e) => { e.preventDefault(); if (resultado === "certo" || resultado === "revelado") proxima(); else conferir(); }}>
            <label htmlFor="paq-resp">Quanto mede a peça?</label>
            <div className="paq-campo">
              <input
                id="paq-resp"
                inputMode="decimal"
                autoComplete="off"
                placeholder="ex.: 12,35"
                value={resposta}
                onChange={(e) => { setResposta(e.target.value.slice(0, 8)); if (resultado === "errado") setResultado(null); }}
                disabled={resultado === "certo" || resultado === "revelado"}
              />
              <span>mm</span>
              {resultado === "certo" || resultado === "revelado" ? (
                <button type="submit" className="btn btn-escuro">Próxima</button>
              ) : (
                <button type="submit" className="btn btn-escuro">Conferir</button>
              )}
            </div>
          </form>
          <p className="paq-feedback" aria-live="polite">
            {resultado === "certo" && <span className="ok">Certo! {fmt(alvo)} mm. Acertos: {acertos}</span>}
            {resultado === "errado" && (
              <span className="erro">
                Ainda não. Procure o traço do nônio que se alinha com a escala.{" "}
                <button type="button" className="link" onClick={() => setResultado("revelado")}>Ver resposta</button>
              </span>
            )}
            {resultado === "revelado" && <span>Resposta: <b>{fmt(alvo)} mm</b> ({inteiro} mm + traço {traco} × 0,05).</span>}
          </p>
        </div>
      )}
    </div>
  );
}
