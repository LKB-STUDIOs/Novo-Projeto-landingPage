import { AnimatePresence, motion, useScroll, useMotionValueEvent, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/dm-sans";
import "./brisa.css";
import { linkWhatsApp } from "../../lib/contato";
import { IMOVEIS, type Imovel, type Tag } from "./imoveis";

const TAGS: Record<Tag, string> = { "frente-mar": "Frente mar", piscina: "Piscina", pet: "Aceita pet", "home-office": "Home office" };
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const nota = (n: number) => n.toFixed(2).replace(".", ",");

/** Só links https do Airbnb são aceitos; sem link, abre a busca na cidade. */
function linkAirbnb(i: Imovel) {
  try {
    const u = new URL(i.airbnb);
    if (u.protocol === "https:" && /(^|\.)airbnb\.com(\.br)?$/.test(u.hostname)) return u.toString();
  } catch { /* sem link válido */ }
  const busca = new URL(`https://www.airbnb.com.br/s/${encodeURIComponent(i.cidade + ", SC")}/homes`);
  busca.searchParams.set("adults", String(Math.min(i.hospedes, 2)));
  return busca.toString();
}

function Foto({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [erro, setErro] = useState(false);
  if (erro) return <span className={`foto-vazia ${className}`} role="img" aria-label={alt} />;
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setErro(true)} />;
}

export default function Brisa() {
  const [busca, setBusca] = useState({ cidade: "", hospedes: 0, tipo: "" });
  const [rascunho, setRascunho] = useState(busca);
  const [tags, setTags] = useState<Set<Tag>>(new Set());
  const [aberto, setAberto] = useState<Imovel | null>(null);
  const [solida, setSolida] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  const lista = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 800], [0, 220]);
  const escalaHero = useTransform(scrollY, [0, 800], [1.08, 1.2]);
  useMotionValueEvent(scrollY, "change", (y) => setSolida(y > 40));

  useEffect(() => { document.title = "Brisa Temporadas — Casas e apartamentos no litoral"; }, []);
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  const cidades = useMemo(() => [...new Set(IMOVEIS.map((i) => i.cidade))].sort(), []);
  const filtrados = IMOVEIS.filter(
    (i) => (!busca.cidade || i.cidade === busca.cidade) && i.hospedes >= busca.hospedes && (!busca.tipo || i.tipo === busca.tipo) && [...tags].every((t) => i.tags.includes(t)),
  );

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    setBusca(rascunho);
    lista.current?.scrollIntoView({ behavior: "smooth" });
  };
  const alternar = (t: Tag) => setTags((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; });

  return (
    <div className="bz">
      <header className={`nav ${solida ? "solid" : ""}`}>
        <Link to="/projetos/brisa" className="logo"><span className="sun" aria-hidden="true" />Brisa<em>temporadas</em></Link>
        <nav aria-label="Principal">
          <a href="#imoveis">Imóveis</a>
          <a href="#como">Como reservar</a>
          <a href="#proprietario">Seja anfitrião</a>
          <Link to="/" className="voltar">LBK Studio</Link>
          <a href={linkWhatsApp("Olá! Vi o projeto Brisa Temporadas no site da LBK Studio e quero um site assim.")} target="_blank" rel="noopener noreferrer" className="btn btn-sm">WhatsApp</a>
        </nav>
      </header>

      <section className="hero">
        <motion.div className="hero-bg" aria-hidden="true" style={{ y: yHero }}>
          <motion.div className="hero-img" style={{ scale: escalaHero }}>
            <Foto src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1800&q=70" alt="" />
          </motion.div>
        </motion.div>
        <div className="hero-content">
          <motion.p className="kicker" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>Litoral de Santa Catarina</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            Sua próxima temporada<br />começa com <i>vista pro mar.</i>
          </motion.h1>
          <motion.p className="lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            Casas e apartamentos escolhidos a dedo, com reserva e pagamento seguros pelo Airbnb.
          </motion.p>
          <motion.form className="search" onSubmit={buscar} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8 }}>
            <label>Destino
              <select value={rascunho.cidade} onChange={(e) => setRascunho({ ...rascunho, cidade: e.target.value })}>
                <option value="">Todos os destinos</option>
                {cidades.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>Hóspedes
              <select value={rascunho.hospedes} onChange={(e) => setRascunho({ ...rascunho, hospedes: Number(e.target.value) })}>
                <option value={0}>Qualquer</option>{[2, 4, 6, 8].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </label>
            <label>Tipo
              <select value={rascunho.tipo} onChange={(e) => setRascunho({ ...rascunho, tipo: e.target.value })}>
                <option value="">Todos</option><option>Casa</option><option>Apartamento</option><option>Chalé</option>
              </select>
            </label>
            <button className="btn" type="submit">Buscar</button>
          </motion.form>
        </div>
      </section>

      <section className="listing" id="imoveis" ref={lista}>
        <div className="listing-head">
          <div><p className="kicker">Nossos imóveis</p><h2>Escolha onde ficar</h2></div>
          <div className="tags" role="group" aria-label="Filtros rápidos">
            {(Object.keys(TAGS) as Tag[]).map((t) => (
              <button key={t} className={tags.has(t) ? "on" : ""} aria-pressed={tags.has(t)} onClick={() => alternar(t)}>{TAGS[t]}</button>
            ))}
          </div>
        </div>
        <p className="count">{filtrados.length} {filtrados.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}</p>
        <motion.div className="grid" layout>
          <AnimatePresence mode="popLayout">
            {filtrados.map((i, n) => (
              <motion.button
                key={i.id}
                className="card"
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.5, delay: n * 0.05 }}
                onClick={() => setAberto(i)}
                aria-label={`Ver detalhes de ${i.nome}`}
              >
                <div className="card-img"><Foto src={i.fotos[0]!} alt={i.nome} /><span className="badge">{i.tipo}</span></div>
                <div className="card-body">
                  <div className="card-top"><h3>{i.nome}</h3><span className="rate">★ {nota(i.nota)}</span></div>
                  <p className="place">{i.bairro} · {i.cidade}</p>
                  <p className="meta">{i.hospedes} hóspedes · {i.quartos} quartos · {i.banheiros} banheiros</p>
                  <p className="price"><b>{brl(i.diaria)}</b> / noite <small>a partir de</small></p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
          {!filtrados.length && <p className="empty">Nenhum imóvel com esses filtros. Tente remover algum.</p>}
        </motion.div>
      </section>

      <section className="how" id="como">
        <p className="kicker">Como funciona</p>
        <h2>Reservar é simples</h2>
        <ol className="steps">
          {[["Escolha o imóvel", "Veja fotos, comodidades e detalhes de cada casa aqui no site."], ["Reserve no Airbnb", "Você é levado ao anúncio oficial para escolher as datas e pagar com segurança."], ["Aproveite", "Recebemos você com check-in facilitado e suporte durante toda a estadia."]].map(([t, d], i) => (
            <motion.li key={t} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <b>{i + 1}</b><h3>{t}</h3><p>{d}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <motion.section className="owner" id="proprietario" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 0.8 }}>
        <div>
          <p className="kicker">Para proprietários</p>
          <h2>Tem um imóvel no litoral?</h2>
          <p>Cuidamos de tudo: fotos profissionais, anúncio no Airbnb, atendimento aos hóspedes, limpeza e manutenção.</p>
          <a className="btn" href={linkWhatsApp("Olá! Tenho um imóvel no litoral e quero anunciar.")} target="_blank" rel="noopener noreferrer">Quero anunciar</a>
        </div>
        <ul className="owner-stats">
          <li><strong>Fotos</strong><span>profissionais e anúncio otimizado</span></li>
          <li><strong>Hóspedes</strong><span>atendimento do check-in ao check-out</span></li>
          <li><strong>24h</strong><span>de suporte durante a estadia</span></li>
        </ul>
      </motion.section>

      <section className="faq">
        <h2>Perguntas frequentes</h2>
        <details><summary>Por que a reserva é feita no Airbnb?</summary><p>O Airbnb garante o pagamento, a política de cancelamento e a proteção para hóspede e anfitrião.</p></details>
        <details><summary>Posso falar com vocês antes de reservar?</summary><p>Claro. Chame no WhatsApp e tiramos todas as dúvidas sobre o imóvel, a região e a disponibilidade.</p></details>
        <details><summary>Os imóveis têm roupa de cama e toalhas?</summary><p>Sim, todos os imóveis são entregues limpos e com enxoval completo.</p></details>
      </section>

      <footer className="footer">
        <span className="logo"><span className="sun" aria-hidden="true" />Brisa<em>temporadas</em></span>
        <span>Projeto de demonstração criado pela <Link to="/">LBK Studio</Link></span>
      </footer>

      <dialog ref={dlg} onClose={() => setAberto(null)} onClick={(e) => { if (e.target === dlg.current) setAberto(null); }}>
        {aberto && (
          <>
            <button className="close" onClick={() => setAberto(null)} aria-label="Fechar">×</button>
            <div className="gallery">{aberto.fotos.map((f, n) => <Foto key={f + n} src={f} alt={`${aberto.nome} — foto ${n + 1}`} />)}</div>
            <div className="detail">
              <div>
                <p className="kicker">{aberto.tipo} · {aberto.bairro}, {aberto.cidade}</p>
                <h2>{aberto.nome}</h2>
                <p className="meta">{aberto.hospedes} hóspedes · {aberto.quartos} quartos · {aberto.banheiros} banheiros · ★ {nota(aberto.nota)} ({aberto.avaliacoes} avaliações)</p>
                <p>{aberto.resumo}</p>
                <h4>Comodidades</h4>
                <ul className="amen">{aberto.comodidades.map((c) => <li key={c}>{c}</li>)}</ul>
                <div className="tagline">{aberto.tags.map((t) => <span key={t}>{TAGS[t]}</span>)}</div>
              </div>
              <aside className="book">
                <p className="price"><b>{brl(aberto.diaria)}</b> / noite</p>
                <p className="muted">Valor de referência. O preço final depende das datas escolhidas.</p>
                <a className="btn airbnb" href={linkAirbnb(aberto)} target="_blank" rel="noopener noreferrer">Reservar no Airbnb</a>
                <a className="btn ghost" href={linkWhatsApp(`Olá! Tenho interesse no imóvel ${aberto.nome} (Brisa Temporadas).`)} target="_blank" rel="noopener noreferrer">Tirar dúvidas no WhatsApp</a>
                <p className="safe">🔒 Pagamento e cancelamento protegidos pelo Airbnb</p>
              </aside>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
