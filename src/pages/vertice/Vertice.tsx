import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter-tight";
import "./vertice.css";
import { limparTexto } from "../../lib/contato";
import { BAIRROS, CORRETORES, DEPOIMENTOS, IMOBILIARIA, IMOVEIS, UNIDADES, foto, type Imovel, type Negocio, type Tipo } from "./imoveis";

/* ---------- utilidades ---------- */

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlCentavos = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (n: number) => n.toLocaleString("pt-BR");

/** Link do WhatsApp da imobiliária com a mensagem já escrita (texto limpo e com limite de tamanho). */
function whats(mensagem = `Olá! Vim pelo site da ${IMOBILIARIA.nome} e gostaria de atendimento.`) {
  const url = new URL(`https://wa.me/${IMOBILIARIA.whatsapp}`);
  url.searchParams.set("text", limparTexto(mensagem));
  return url.toString();
}
const externo = { target: "_blank", rel: "noopener noreferrer" } as const;

const CHAVE_FAV = "vertice-favoritos";
function lerFavoritos(): Set<string> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(CHAVE_FAV) ?? "[]");
    return new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  } catch { return new Set(); }
}

const TIPOS: Tipo[] = ["Apartamento", "Casa", "Sobrado", "Cobertura", "Terreno", "Comercial"];
const FAIXAS: Record<Negocio, number[]> = {
  venda: [300000, 500000, 800000, 1200000, 2000000],
  aluguel: [2000, 3000, 5000, 10000, 20000],
};
type Busca = { negocio: Negocio; tipo: "" | Tipo; bairro: string; quartos: number; precoMax: number };
type Filtro = "pet" | "mobiliado" | "lancamento" | "favoritos";
type Ordem = "relevancia" | "menor" | "maior" | "area";
const FILTROS: Record<Filtro, string> = { pet: "Aceita pet", mobiliado: "Mobiliado", lancamento: "Lançamento", favoritos: "Meus favoritos" };
const BUSCA_INICIAL: Busca = { negocio: "venda", tipo: "", bairro: "", quartos: 0, precoMax: 0 };

const precoRotulo = (i: Imovel) => (i.negocio === "aluguel" ? <>{brl(i.preco)}<small>/mês</small></> : brl(i.preco));

/* ---------- ícones ---------- */

const Svg = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const I = {
  Apartamento: () => <Svg><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" /></Svg>,
  Casa: () => <Svg><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></Svg>,
  Sobrado: () => <Svg><path d="M4 9 12 3l8 6" /><path d="M6 8v13h12V8" /><path d="M9 12h2M13 12h2M10 21v-4h4v4" /></Svg>,
  Cobertura: () => <Svg><path d="M3 8h18" /><path d="M6 8V5h12v3" /><rect x="5" y="8" width="14" height="13" /><path d="M9 12h2M13 12h2M9 16h2M13 16h2" /></Svg>,
  Terreno: () => <Svg><path d="M3 20h18" /><path d="M5 20 9 11l4 5 3-4 3 8" /><circle cx="17" cy="6" r="2" /></Svg>,
  Comercial: () => <Svg><path d="M3 9h18l-2-5H5L3 9Z" /><path d="M4 9v11h16V9" /><path d="M9 20v-6h6v6" /></Svg>,
  Area: () => <Svg size={16}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Svg>,
  Quarto: () => <Svg size={16}><path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3H9v5" /><path d="M3 15h18" /><circle cx="6" cy="11" r="1.5" /></Svg>,
  Banho: () => <Svg size={16}><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" /><path d="M6 12V5a2 2 0 0 1 4 0" /></Svg>,
  Vaga: () => <Svg size={16}><path d="M5 16V11l2-5h10l2 5v5" /><path d="M3 16h18v3H3z" /><circle cx="7.5" cy="13" r=".8" /><circle cx="16.5" cy="13" r=".8" /></Svg>,
  Pin: () => <Svg size={16}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>,
  Busca: () => <Svg size={18}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>,
  Seta: ({ dir = 1 }: { dir?: 1 | -1 }) => <Svg size={18}><path d={dir === 1 ? "m9 6 6 6-6 6" : "m15 6-6 6 6 6"} /></Svg>,
  Fone: () => <Svg size={16}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></Svg>,
  Email: () => <Svg size={16}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>,
  Relogio: () => <Svg size={16}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  Check: () => <Svg size={16}><path d="m5 12 5 5 9-10" /></Svg>,
  Menu: () => <Svg><path d="M4 7h16M4 12h16M4 17h16" /></Svg>,
  Fechar: () => <Svg><path d="M6 6l12 12M18 6 6 18" /></Svg>,
};
const Coracao = ({ cheio }: { cheio: boolean }) => (
  <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" fill={cheio ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M12 20s-7-4.4-9-9.2C1.7 7.4 4 4 7.5 4c2 0 3.4 1.1 4.5 2.6C13.1 5.1 14.5 4 16.5 4 20 4 22.3 7.4 21 10.8 19 15.6 12 20 12 20Z" />
  </svg>
);
const IconeWhats = ({ size = 26 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);

/* ---------- peças ---------- */

function Foto({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [erro, setErro] = useState(false);
  if (erro) return <span className={`vt-foto-vazia ${className}`} role="img" aria-label={alt} />;
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setErro(true)} />;
}

const Revelar = ({ children, className, atraso = 0 }: { children: ReactNode; className?: string; atraso?: number }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.7, delay: atraso, ease: [0.16, 1, 0.3, 1] }}>
    {children}
  </motion.div>
);

function Specs({ i }: { i: Imovel }) {
  return (
    <ul className="vt-specs">
      <li><I.Area />{num(i.area)} m²</li>
      {i.quartos > 0 && <li><I.Quarto />{i.quartos} {i.quartos === 1 ? "quarto" : "quartos"}</li>}
      {i.banheiros > 0 && <li><I.Banho />{i.banheiros} {i.banheiros === 1 ? "banheiro" : "banheiros"}</li>}
      {i.vagas > 0 && <li><I.Vaga />{i.vagas} {i.vagas === 1 ? "vaga" : "vagas"}</li>}
    </ul>
  );
}

function Card({ i, fav, alternarFav, abrir }: { i: Imovel; fav: boolean; alternarFav: (c: string) => void; abrir: (i: Imovel) => void }) {
  return (
    <article className="vt-card">
      <button className="vt-card-img" onClick={() => abrir(i)} aria-label={`Ver detalhes: ${i.titulo}, ${i.bairro}`}>
        <Foto src={i.fotos[0]!} alt="" />
        <span className={`vt-selo ${i.negocio}`}>{i.negocio === "venda" ? "Venda" : "Aluguel"}</span>
        {i.lancamento && <span className="vt-selo lanc">Lançamento</span>}
      </button>
      <button className={`vt-fav ${fav ? "on" : ""}`} onClick={() => alternarFav(i.codigo)} aria-pressed={fav} aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}>
        <Coracao cheio={fav} />
      </button>
      <div className="vt-card-body" onClick={() => abrir(i)}>
        <p className="vt-card-tipo">{i.tipo} · cód. {i.codigo}</p>
        <h3>{i.titulo}</h3>
        <p className="vt-local"><I.Pin />{i.bairro}, {i.cidade}</p>
        <Specs i={i} />
        <div className="vt-card-preco">
          <strong>{precoRotulo(i)}</strong>
          {i.condominio ? <span>Cond. {brl(i.condominio)}</span> : null}
        </div>
      </div>
    </article>
  );
}

/* ---------- simulador ---------- */

function Simulador({ valorInicial }: { valorInicial: number }) {
  const [valor, setValor] = useState(valorInicial);
  const [entrada, setEntrada] = useState(20);
  const [anos, setAnos] = useState(30);
  const [juros, setJuros] = useState(10.5);
  useEffect(() => setValor(valorInicial), [valorInicial]);

  const financiado = valor * (1 - entrada / 100);
  const n = anos * 12;
  const i = Math.pow(1 + juros / 100, 1 / 12) - 1;
  const price = i > 0 ? financiado * (i / (1 - Math.pow(1 + i, -n))) : financiado / n;
  const sacPrimeira = financiado / n + financiado * i;
  const sacUltima = financiado / n + (financiado / n) * i;
  const renda = sacPrimeira / 0.3;

  return (
    <div className="vt-sim">
      <div className="vt-sim-campos">
        <label>Valor do imóvel <output>{brl(valor)}</output>
          <input type="range" min={150000} max={3000000} step={10000} value={valor} onChange={(e) => setValor(Number(e.target.value))} />
        </label>
        <label>Entrada <output>{entrada}% · {brl(valor * entrada / 100)}</output>
          <input type="range" min={10} max={80} step={5} value={entrada} onChange={(e) => setEntrada(Number(e.target.value))} />
        </label>
        <label>Prazo <output>{anos} anos</output>
          <input type="range" min={5} max={35} step={1} value={anos} onChange={(e) => setAnos(Number(e.target.value))} />
        </label>
        <label>Juros ao ano <output>{juros.toFixed(1).replace(".", ",")}%</output>
          <input type="range" min={7} max={14} step={0.1} value={juros} onChange={(e) => setJuros(Number(e.target.value))} />
        </label>
      </div>
      <div className="vt-sim-res" aria-live="polite">
        <p className="vt-kicker">Estimativa</p>
        <div className="vt-sim-linha"><span>Valor financiado</span><b>{brl(financiado)}</b></div>
        <div className="vt-sim-destaque">
          <div><span>1ª parcela (SAC)</span><strong>{brlCentavos(sacPrimeira)}</strong><small>última: {brlCentavos(sacUltima)}</small></div>
          <div><span>Parcela fixa (Price)</span><strong>{brlCentavos(price)}</strong><small>{n} parcelas</small></div>
        </div>
        <div className="vt-sim-linha"><span>Renda familiar sugerida</span><b>{brl(renda)}</b></div>
        <p className="vt-mini">Simulação ilustrativa, sem seguros e taxas. As condições reais dependem da análise de crédito do banco.</p>
        <a className="vt-btn" href={whats(`Olá! Fiz uma simulação no site: imóvel de ${brl(valor)}, entrada de ${entrada}% e prazo de ${anos} anos. Quero falar com um especialista em financiamento.`)} {...externo}>
          Falar com um especialista
        </a>
      </div>
    </div>
  );
}

/* ---------- página ---------- */

export default function Vertice() {
  const [rascunho, setRascunho] = useState<Busca>(BUSCA_INICIAL);
  const [busca, setBusca] = useState<Busca>(BUSCA_INICIAL);
  const [filtros, setFiltros] = useState<Set<Filtro>>(new Set());
  const [ordem, setOrdem] = useState<Ordem>("relevancia");
  const [favs, setFavs] = useState<Set<string>>(lerFavoritos);
  const [aberto, setAberto] = useState<Imovel | null>(null);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [codigo, setCodigo] = useState("");
  const [avisoCodigo, setAvisoCodigo] = useState("");
  const [menu, setMenu] = useState(false);
  const [rolou, setRolou] = useState(false);
  const [valorSim, setValorSim] = useState(600000);
  const [contato, setContato] = useState({ nome: "", interesse: "Comprar um imóvel", mensagem: "" });
  const dlg = useRef<HTMLDialogElement>(null);
  const lista = useRef<HTMLElement>(null);
  const trilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `${IMOBILIARIA.nome} — Casas e apartamentos para comprar e alugar em Joinville`;
    const r = () => setRolou(window.scrollY > 30);
    r();
    window.addEventListener("scroll", r, { passive: true });
    return () => window.removeEventListener("scroll", r);
  }, []);
  useEffect(() => { try { localStorage.setItem(CHAVE_FAV, JSON.stringify([...favs])); } catch { /* sem storage */ } }, [favs]);
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  const bairros = useMemo(() => [...new Set(IMOVEIS.map((i) => i.bairro))].sort((a, b) => a.localeCompare(b, "pt-BR")), []);
  const destaques = IMOVEIS.filter((i) => i.destaque);
  const lancamentos = IMOVEIS.filter((i) => i.lancamento);

  const resultados = useMemo(() => {
    const r = IMOVEIS.filter((i) =>
      i.negocio === busca.negocio &&
      (!busca.tipo || i.tipo === busca.tipo) &&
      (!busca.bairro || i.bairro === busca.bairro) &&
      i.quartos >= busca.quartos &&
      (!busca.precoMax || i.preco <= busca.precoMax) &&
      (!filtros.has("pet") || i.aceitaPet) &&
      (!filtros.has("mobiliado") || i.mobiliado) &&
      (!filtros.has("lancamento") || i.lancamento) &&
      (!filtros.has("favoritos") || favs.has(i.codigo)),
    );
    if (ordem === "menor") r.sort((a, b) => a.preco - b.preco);
    if (ordem === "maior") r.sort((a, b) => b.preco - a.preco);
    if (ordem === "area") r.sort((a, b) => b.area - a.area);
    if (ordem === "relevancia") r.sort((a, b) => Number(!!b.destaque) - Number(!!a.destaque));
    return r;
  }, [busca, filtros, ordem, favs]);

  const irParaLista = () => requestAnimationFrame(() => lista.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  const aplicar = (b: Partial<Busca>) => {
    const nova = { ...BUSCA_INICIAL, negocio: busca.negocio, ...b };
    setRascunho(nova); setBusca(nova); irParaLista();
  };
  const buscar = (e: FormEvent) => { e.preventDefault(); setBusca(rascunho); irParaLista(); };
  const buscarCodigo = (e: FormEvent) => {
    e.preventDefault();
    const c = codigo.trim().toUpperCase().replace(/\s/g, "");
    const achado = IMOVEIS.find((i) => i.codigo === c || i.codigo === `VT${c}`);
    if (achado) { setAvisoCodigo(""); abrir(achado); } else setAvisoCodigo(c ? `Nenhum imóvel com o código ${c}.` : "Digite um código, por exemplo VT1042.");
  };
  const alternarFiltro = (f: Filtro) => setFiltros((s) => { const n = new Set(s); if (n.has(f)) n.delete(f); else n.add(f); return n; });
  const alternarFav = (c: string) => setFavs((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const abrir = (i: Imovel) => { setFotoAtiva(0); setAberto(i); };
  const rolarTrilho = (d: 1 | -1) => trilho.current?.scrollBy({ left: d * Math.min(trilho.current.clientWidth * 0.85, 760), behavior: "smooth" });
  const simular = (valor: number) => { setAberto(null); setValorSim(valor); requestAnimationFrame(() => document.getElementById("financiamento")?.scrollIntoView({ behavior: "smooth" })); };
  const trocarNegocio = (n: Negocio) => setRascunho((r) => ({ ...r, negocio: n, precoMax: 0 }));

  const contarTipo = (t: Tipo) => IMOVEIS.filter((i) => i.tipo === t).length;
  const NAV = [["#imoveis", "Comprar", () => aplicar({ negocio: "venda" })], ["#imoveis", "Alugar", () => aplicar({ negocio: "aluguel" })], ["#lancamentos", "Lançamentos"], ["#financiamento", "Financiamento"], ["#corretores", "Corretores"], ["#unidades", "Unidades"], ["#contato", "Contato"]] as const;

  const enviarContato = (e: FormEvent) => {
    e.preventDefault();
    const txt = [`Olá! Meu nome é ${limparTexto(contato.nome, 80) || "—"}.`, `Interesse: ${contato.interesse}`, contato.mensagem && `\n${limparTexto(contato.mensagem, 400)}`].filter(Boolean).join("\n");
    window.open(whats(txt), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="vt">
      <a className="vt-pular" href="#imoveis">Pular para os imóveis</a>

      <div className="vt-topo">
        <span><I.Fone />{IMOBILIARIA.telefone}</span>
        <span className="vt-some-m"><I.Email />{IMOBILIARIA.email}</span>
        <span className="vt-some-m"><I.Relogio />Seg a sex, 8h às 18h · Sáb, 9h às 13h</span>
        <span className="vt-topo-dir">{IMOBILIARIA.creci}</span>
      </div>

      <header className={`vt-header ${rolou ? "solido" : ""}`}>
        <a href="#inicio" className="vt-logo" aria-label={`${IMOBILIARIA.nome}, início`}>
          <span className="vt-logo-marca" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M4 26 16 5l12 21H20l-4-7-4 7Z" fill="currentColor" /></svg></span>
          <span>Vértice<em>imóveis</em></span>
        </a>
        <nav className={`vt-nav ${menu ? "aberto" : ""}`} aria-label="Principal">
          {NAV.map(([href, rotulo, acao]) => (
            <a key={rotulo} href={href} onClick={(e) => { setMenu(false); if (acao) { e.preventDefault(); acao(); } }}>{rotulo}</a>
          ))}
          <Link to="/" className="vt-voltar">← LBK Studio</Link>
        </nav>
        <div className="vt-header-acoes">
          <button className="vt-fav-topo" onClick={() => { setFiltros(new Set(["favoritos"])); irParaLista(); }} aria-label={`Favoritos: ${favs.size}`}>
            <Coracao cheio={favs.size > 0} />{favs.size > 0 && <b>{favs.size}</b>}
          </button>
          <a className="vt-btn vt-btn-sm vt-some-m" href={whats()} {...externo}><IconeWhats size={18} />Fale conosco</a>
          <button className="vt-menu-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Abrir menu">{menu ? <I.Fechar /> : <I.Menu />}</button>
        </div>
      </header>

      <section className="vt-hero" id="inicio">
        <div className="vt-hero-bg" aria-hidden="true"><Foto src={foto("photo-1600585154340-be6161a56a0c", 1900)} alt="" /></div>
        <div className="vt-hero-conteudo">
          <motion.p className="vt-kicker claro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>Imobiliária em {IMOBILIARIA.cidade}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            O lugar certo para o<br /><i>seu próximo capítulo.</i>
          </motion.h1>
          <motion.p className="vt-lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Casas, apartamentos e salas comerciais para comprar ou alugar, com corretores que conhecem cada bairro.
          </motion.p>

          <motion.div className="vt-busca" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}>
            <div className="vt-abas" role="tablist" aria-label="Tipo de negócio">
              {(["venda", "aluguel"] as Negocio[]).map((n) => (
                <button key={n} role="tab" aria-selected={rascunho.negocio === n} className={rascunho.negocio === n ? "on" : ""} onClick={() => trocarNegocio(n)}>
                  {n === "venda" ? "Comprar" : "Alugar"}
                </button>
              ))}
            </div>
            <form className="vt-busca-campos" onSubmit={buscar}>
              <label>Tipo
                <select value={rascunho.tipo} onChange={(e) => setRascunho({ ...rascunho, tipo: e.target.value as Busca["tipo"] })}>
                  <option value="">Todos os tipos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label>Bairro
                <select value={rascunho.bairro} onChange={(e) => setRascunho({ ...rascunho, bairro: e.target.value })}>
                  <option value="">Todos os bairros</option>{bairros.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
              <label>Quartos
                <select value={rascunho.quartos} onChange={(e) => setRascunho({ ...rascunho, quartos: Number(e.target.value) })}>
                  <option value={0}>Qualquer</option>{[1, 2, 3, 4].map((q) => <option key={q} value={q}>{q}+</option>)}
                </select>
              </label>
              <label>Valor até
                <select value={rascunho.precoMax} onChange={(e) => setRascunho({ ...rascunho, precoMax: Number(e.target.value) })}>
                  <option value={0}>Sem limite</option>{FAIXAS[rascunho.negocio].map((v) => <option key={v} value={v}>{brl(v)}</option>)}
                </select>
              </label>
              <button className="vt-btn" type="submit"><I.Busca />Buscar</button>
            </form>
            <form className="vt-codigo" onSubmit={buscarCodigo}>
              <label htmlFor="vt-cod">Já sabe o código?</label>
              <input id="vt-cod" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex.: VT1042" maxLength={10} autoComplete="off" />
              <button type="submit">Ir</button>
              {avisoCodigo && <span role="status">{avisoCodigo}</span>}
            </form>
          </motion.div>
        </div>
      </section>

      <section className="vt-tipos" aria-label="Buscar por tipo de imóvel">
        {TIPOS.map((t, n) => {
          const Icone = I[t];
          return (
            <Revelar key={t} atraso={n * 0.05}>
              <button className="vt-tipo" onClick={() => aplicar({ tipo: t, negocio: IMOVEIS.find((i) => i.tipo === t && i.negocio === busca.negocio) ? busca.negocio : IMOVEIS.find((i) => i.tipo === t)!.negocio })}>
                <span className="vt-tipo-icone"><Icone /></span>
                <b>{t === "Comercial" ? "Comerciais" : `${t}s`}</b>
                <small>{contarTipo(t)} {contarTipo(t) === 1 ? "imóvel" : "imóveis"}</small>
              </button>
            </Revelar>
          );
        })}
      </section>

      <section className="vt-secao" aria-labelledby="vt-dest">
        <div className="vt-secao-topo">
          <div><p className="vt-kicker">Seleção da semana</p><h2 id="vt-dest">Imóveis em destaque</h2></div>
          <div className="vt-setas">
            <button onClick={() => rolarTrilho(-1)} aria-label="Anteriores"><I.Seta dir={-1} /></button>
            <button onClick={() => rolarTrilho(1)} aria-label="Próximos"><I.Seta /></button>
          </div>
        </div>
        <div className="vt-trilho" ref={trilho}>
          {destaques.map((i) => <Card key={i.codigo} i={i} fav={favs.has(i.codigo)} alternarFav={alternarFav} abrir={abrir} />)}
        </div>
      </section>

      <section className="vt-secao vt-lista" id="imoveis" ref={lista} aria-labelledby="vt-res">
        <div className="vt-secao-topo">
          <div>
            <p className="vt-kicker">{busca.negocio === "venda" ? "Para comprar" : "Para alugar"}</p>
            <h2 id="vt-res">{resultados.length} {resultados.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}</h2>
          </div>
          <div className="vt-lista-ctrl">
            <div className="vt-abas mini" role="group" aria-label="Negócio">
              {(["venda", "aluguel"] as Negocio[]).map((n) => (
                <button key={n} className={busca.negocio === n ? "on" : ""} aria-pressed={busca.negocio === n} onClick={() => { const b = { ...busca, negocio: n, precoMax: 0 }; setBusca(b); setRascunho(b); }}>
                  {n === "venda" ? "Comprar" : "Alugar"}
                </button>
              ))}
            </div>
            <label className="vt-ordem">Ordenar
              <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
                <option value="relevancia">Relevância</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="area">Maior área</option>
              </select>
            </label>
          </div>
        </div>
        <div className="vt-chips" role="group" aria-label="Filtros rápidos">
          {(Object.keys(FILTROS) as Filtro[]).map((f) => (
            <button key={f} className={filtros.has(f) ? "on" : ""} aria-pressed={filtros.has(f)} onClick={() => alternarFiltro(f)}>
              {filtros.has(f) && <I.Check />}{FILTROS[f]}{f === "favoritos" && favs.size > 0 ? ` (${favs.size})` : ""}
            </button>
          ))}
          {(busca.tipo || busca.bairro || busca.quartos || busca.precoMax || filtros.size > 0) ? (
            <button className="vt-limpar" onClick={() => { const b = { ...BUSCA_INICIAL, negocio: busca.negocio }; setBusca(b); setRascunho(b); setFiltros(new Set()); }}>Limpar filtros</button>
          ) : null}
        </div>
        <motion.div className="vt-grade" layout>
          <AnimatePresence mode="popLayout">
            {resultados.map((i) => (
              <motion.div key={i.codigo} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.4 }}>
                <Card i={i} fav={favs.has(i.codigo)} alternarFav={alternarFav} abrir={abrir} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {!resultados.length && (
          <div className="vt-vazio">
            <p>{filtros.has("favoritos") && !favs.size ? "Você ainda não salvou nenhum imóvel. Toque no coração de um card para guardar aqui." : "Nenhum imóvel com esses filtros por enquanto."}</p>
            <a className="vt-btn" href={whats(`Olá! Procuro ${busca.tipo ? busca.tipo.toLowerCase() : "um imóvel"} para ${busca.negocio === "venda" ? "comprar" : "alugar"}${busca.bairro ? ` no bairro ${busca.bairro}` : ""}. Podem me avisar quando surgir uma opção?`)} {...externo}>
              Avise-me quando surgir
            </a>
          </div>
        )}
      </section>

      <section className="vt-lanc" id="lancamentos">
        <Revelar className="vt-lanc-texto">
          <p className="vt-kicker claro">Lançamentos</p>
          <h2>Compre na planta e pague durante a obra</h2>
          <p>Condições direto com a construtora, tabela de lançamento e acompanhamento da obra pelo seu corretor.</p>
          <ul>
            <li><I.Check />Entrada parcelada em até 36 vezes</li>
            <li><I.Check />Valorização até a entrega das chaves</li>
            <li><I.Check />Plantas personalizáveis</li>
          </ul>
          <button className="vt-btn claro" onClick={() => { setFiltros(new Set(["lancamento"])); aplicar({ negocio: "venda" }); }}>Ver lançamentos</button>
        </Revelar>
        <div className="vt-lanc-cards">
          {lancamentos.map((i, n) => (
            <Revelar key={i.codigo} atraso={n * 0.1}>
              <button className="vt-lanc-card" onClick={() => abrir(i)}>
                <Foto src={i.fotos[0]!} alt="" />
                <span><b>{i.titulo}</b>{i.bairro} · a partir de {brl(i.preco)}</span>
              </button>
            </Revelar>
          ))}
        </div>
      </section>

      <section className="vt-secao" aria-labelledby="vt-bairros">
        <div className="vt-secao-topo"><div><p className="vt-kicker">Explore a cidade</p><h2 id="vt-bairros">Bairros mais procurados</h2></div></div>
        <div className="vt-bairros">
          {BAIRROS.map((b, n) => (
            <Revelar key={b.nome} atraso={n * 0.08}>
              <button className="vt-bairro" onClick={() => aplicar({ bairro: b.nome, negocio: IMOVEIS.some((i) => i.bairro === b.nome && i.negocio === busca.negocio) ? busca.negocio : IMOVEIS.find((i) => i.bairro === b.nome)?.negocio ?? busca.negocio })}>
                <Foto src={b.foto} alt="" />
                <span><b>{b.nome}</b><small>{b.desc}</small><em>{IMOVEIS.filter((i) => i.bairro === b.nome).length} imóveis →</em></span>
              </button>
            </Revelar>
          ))}
        </div>
      </section>

      <section className="vt-secao vt-fin" id="financiamento" aria-labelledby="vt-fin">
        <Revelar className="vt-fin-intro">
          <p className="vt-kicker">Financiamento</p>
          <h2 id="vt-fin">Quanto fica a parcela?</h2>
          <p>Mexa nos valores e veja na hora uma estimativa pelas tabelas SAC e Price. Nossa equipe cuida da aprovação de crédito com os principais bancos.</p>
        </Revelar>
        <Simulador valorInicial={valorSim} />
      </section>

      <section className="vt-numeros" aria-label="A Vértice em números">
        {[["28", "anos de mercado"], ["4.300+", "famílias atendidas"], ["1.200", "imóveis administrados"], ["3", "unidades na cidade"]].map(([v, r], n) => (
          <Revelar key={r} atraso={n * 0.08}><strong>{v}</strong><span>{r}</span></Revelar>
        ))}
      </section>

      <section className="vt-secao vt-servicos" aria-labelledby="vt-serv">
        <div className="vt-secao-topo"><div><p className="vt-kicker">Por que a Vértice</p><h2 id="vt-serv">Do primeiro clique à entrega das chaves</h2></div></div>
        <div className="vt-serv-grade">
          {[
            ["Aluguel sem fiador", "Seguro-fiança ou título de capitalização, com análise em até 24 horas."],
            ["Contrato digital", "Assine tudo pelo celular, com validade jurídica e sem filas."],
            ["Vistoria com fotos", "Laudo de vistoria detalhado na entrada e na saída do imóvel."],
            ["Assessoria jurídica", "Conferimos documentação, certidões e matrícula antes de você assinar."],
          ].map(([t, d], n) => (
            <Revelar key={t} atraso={n * 0.08} className="vt-serv">
              <span>{String(n + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p>
            </Revelar>
          ))}
        </div>
      </section>

      <section className="vt-secao" id="corretores" aria-labelledby="vt-corr">
        <div className="vt-secao-topo"><div><p className="vt-kicker">Nossa equipe</p><h2 id="vt-corr">Fale direto com um corretor</h2></div></div>
        <div className="vt-corretores">
          {CORRETORES.map((c, n) => (
            <Revelar key={c.nome} atraso={n * 0.08} className="vt-corretor">
              <Foto src={c.foto} alt={`Foto de ${c.nome}`} />
              <h3>{c.nome}</h3>
              <p>{c.area}</p>
              <small>{c.creci}</small>
              <a href={whats(`Olá, ${c.nome.split(" ")[0]}! Vim pelo site da ${IMOBILIARIA.nome} e gostaria de atendimento.`)} {...externo}><IconeWhats size={16} />Chamar no WhatsApp</a>
            </Revelar>
          ))}
        </div>
      </section>

      <section className="vt-depo" aria-labelledby="vt-depo">
        <p className="vt-kicker">Depoimentos</p>
        <h2 id="vt-depo">Quem já encontrou o seu lugar</h2>
        <div className="vt-depo-grade">
          {DEPOIMENTOS.map((d, n) => (
            <Revelar key={d.nome} atraso={n * 0.1} className="vt-depo-card">
              <p className="vt-estrelas" aria-label="5 de 5 estrelas">★★★★★</p>
              <blockquote>“{d.texto}”</blockquote>
              <p><b>{d.nome}</b> · {d.tipo}</p>
            </Revelar>
          ))}
        </div>
      </section>

      <section className="vt-secao vt-contato" id="contato" aria-labelledby="vt-cont">
        <div id="unidades" className="vt-unidades">
          <p className="vt-kicker">Unidades</p>
          <h2 id="vt-cont">Venha tomar um café com a gente</h2>
          {UNIDADES.map((u) => (
            <div key={u.nome} className="vt-unidade">
              <h3>{u.nome}</h3>
              <p><I.Pin />{u.end}</p>
              <p><I.Relogio />{u.horario}</p>
            </div>
          ))}
        </div>
        <form className="vt-form" onSubmit={enviarContato}>
          <h3>Envie uma mensagem</h3>
          <p className="vt-mini">A conversa abre no WhatsApp. Nada é guardado neste site.</p>
          <label>Seu nome<input required maxLength={80} value={contato.nome} onChange={(e) => setContato({ ...contato, nome: e.target.value })} autoComplete="name" /></label>
          <label>Quero
            <select value={contato.interesse} onChange={(e) => setContato({ ...contato, interesse: e.target.value })}>
              {["Comprar um imóvel", "Alugar um imóvel", "Financiamento", "Avaliação de imóvel", "Outro assunto"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label>Mensagem<textarea rows={4} maxLength={400} value={contato.mensagem} onChange={(e) => setContato({ ...contato, mensagem: e.target.value })} placeholder="Conte o que você procura: bairro, número de quartos, faixa de valor…" /></label>
          <button className="vt-btn" type="submit"><IconeWhats size={18} />Enviar pelo WhatsApp</button>
        </form>
      </section>

      <footer className="vt-rodape">
        <div className="vt-rodape-grade">
          <div>
            <span className="vt-logo"><span className="vt-logo-marca" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M4 26 16 5l12 21H20l-4-7-4 7Z" fill="currentColor" /></svg></span><span>Vértice<em>imóveis</em></span></span>
            <p>Comprar, vender e alugar com segurança em {IMOBILIARIA.cidade}.</p>
            <p className="vt-mini">{IMOBILIARIA.creci}</p>
          </div>
          <nav aria-label="Imóveis">
            <h4>Imóveis</h4>
            <a href="#imoveis" onClick={(e) => { e.preventDefault(); aplicar({ negocio: "venda" }); }}>Comprar</a>
            <a href="#imoveis" onClick={(e) => { e.preventDefault(); aplicar({ negocio: "aluguel" }); }}>Alugar</a>
            <a href="#lancamentos">Lançamentos</a>
            <a href="#financiamento">Financiamento</a>
          </nav>
          <nav aria-label="Institucional">
            <h4>Atendimento</h4>
            <a href="#corretores">Corretores</a>
            <a href="#unidades">Unidades</a>
            <a href="#contato">Contato</a>
          </nav>
          <div>
            <h4>Fale com a gente</h4>
            <p><I.Fone />{IMOBILIARIA.telefone}</p>
            <p><IconeWhats size={16} />{IMOBILIARIA.whatsappExibicao}</p>
            <p><I.Email />{IMOBILIARIA.email}</p>
          </div>
        </div>
        <div className="vt-rodape-base">
          <span>Site demonstrativo: a Vértice Imóveis, seus imóveis e corretores são fictícios.</span>
          <span>Criado pela <Link to="/">LBK Studio</Link></span>
        </div>
      </footer>

      {/* WhatsApp sempre visível, acompanhando a rolagem */}
      <motion.a
        className="vt-whats"
        href={whats(aberto ? `Olá! Tenho interesse no imóvel ${aberto.codigo} (${aberto.titulo}, ${aberto.bairro}).` : undefined)}
        {...externo}
        aria-label={`Conversar no WhatsApp com a ${IMOBILIARIA.nome}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.6 }}
      >
        <IconeWhats size={30} />
        <span className="vt-whats-dica">Fale com um corretor</span>
        <span className="vt-whats-pulso" aria-hidden="true" />
      </motion.a>

      <dialog ref={dlg} className="vt-dialog" onClose={() => setAberto(null)} onClick={(e) => { if (e.target === dlg.current) setAberto(null); }} aria-label={aberto?.titulo}>
        {aberto && (
          <>
            <button className="vt-fechar" onClick={() => setAberto(null)} aria-label="Fechar"><I.Fechar /></button>
            <div className="vt-galeria">
              <div className="vt-galeria-principal">
                <AnimatePresence mode="wait">
                  <motion.div key={fotoAtiva} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <Foto src={aberto.fotos[fotoAtiva]!} alt={`${aberto.titulo}, foto ${fotoAtiva + 1} de ${aberto.fotos.length}`} />
                  </motion.div>
                </AnimatePresence>
                <button className="vt-gal-seta esq" onClick={() => setFotoAtiva((f) => (f - 1 + aberto.fotos.length) % aberto.fotos.length)} aria-label="Foto anterior"><I.Seta dir={-1} /></button>
                <button className="vt-gal-seta dir" onClick={() => setFotoAtiva((f) => (f + 1) % aberto.fotos.length)} aria-label="Próxima foto"><I.Seta /></button>
                <span className="vt-gal-cont">{fotoAtiva + 1} / {aberto.fotos.length}</span>
              </div>
              <div className="vt-miniaturas">
                {aberto.fotos.map((f, n) => (
                  <button key={f + n} className={n === fotoAtiva ? "on" : ""} onClick={() => setFotoAtiva(n)} aria-label={`Ver foto ${n + 1}`}><Foto src={f} alt="" /></button>
                ))}
              </div>
            </div>
            <div className="vt-detalhe">
              <div>
                <p className="vt-kicker">{aberto.tipo} para {aberto.negocio === "venda" ? "venda" : "alugar"} · cód. {aberto.codigo}</p>
                <h2>{aberto.titulo}</h2>
                <p className="vt-local"><I.Pin />{aberto.bairro}, {aberto.cidade}</p>
                <Specs i={aberto} />
                {aberto.suites > 0 && <p className="vt-mini">{aberto.suites} {aberto.suites === 1 ? "suíte" : "suítes"}</p>}
                <p className="vt-resumo">{aberto.resumo}</p>
                <h4>Características</h4>
                <ul className="vt-itens">{aberto.itens.map((c) => <li key={c}><I.Check />{c}</li>)}</ul>
              </div>
              <aside className="vt-caixa">
                <p className="vt-caixa-rot">{aberto.negocio === "venda" ? "Valor de venda" : "Aluguel"}</p>
                <p className="vt-caixa-preco">{precoRotulo(aberto)}</p>
                <dl>
                  {aberto.condominio ? <><dt>Condomínio</dt><dd>{brl(aberto.condominio)}</dd></> : null}
                  {aberto.iptu ? <><dt>IPTU (mês)</dt><dd>{brl(aberto.iptu)}</dd></> : null}
                  {aberto.negocio === "aluguel" && <><dt>Total estimado</dt><dd><b>{brl(aberto.preco + (aberto.condominio ?? 0) + (aberto.iptu ?? 0))}</b></dd></>}
                </dl>
                <a className="vt-btn" href={whats(`Olá! Quero agendar uma visita ao imóvel ${aberto.codigo}: ${aberto.titulo}, no bairro ${aberto.bairro}.`)} {...externo}><IconeWhats size={18} />Agendar visita</a>
                {aberto.negocio === "venda" && <button className="vt-btn contorno" onClick={() => simular(aberto.preco)}>Simular financiamento</button>}
                <button className={`vt-btn contorno ${favs.has(aberto.codigo) ? "fav-on" : ""}`} onClick={() => alternarFav(aberto.codigo)} aria-pressed={favs.has(aberto.codigo)}>
                  <Coracao cheio={favs.has(aberto.codigo)} />{favs.has(aberto.codigo) ? "Salvo nos favoritos" : "Salvar imóvel"}
                </button>
                <p className="vt-mini">Valores de referência. Confirme disponibilidade com o corretor.</p>
              </aside>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
