(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const TAG_LABEL = { "frente-mar": "Frente mar", piscina: "Piscina", pet: "Aceita pet", "home-office": "Home office" };
  const imoveis = window.IMOVEIS || [];

  // link do Airbnb: anúncio real, ou busca na cidade enquanto não houver link
  const airbnbUrl = (i) =>
    i.airbnb || `https://www.airbnb.com.br/s/${encodeURIComponent(i.cidade + ", SC")}/homes?adults=${Math.min(i.hospedes, 2)}`;

  // imagem com fallback colorido caso não carregue
  const img = (src, alt, cls = "") =>
    `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.classList.add('broken');this.removeAttribute('src')">`;

  // ---------- filtros ----------
  const cidades = [...new Set(imoveis.map((i) => i.cidade))].sort();
  $("#sCidade").innerHTML += cidades.map((c) => `<option>${esc(c)}</option>`).join("");
  const state = { cidade: "", hospedes: 0, tipo: "", tags: new Set() };

  $("#search").addEventListener("submit", (e) => {
    e.preventDefault();
    state.cidade = $("#sCidade").value;
    state.hospedes = +$("#sHosp").value;
    state.tipo = $("#sTipo").value;
    render();
    $("#imoveis").scrollIntoView({ behavior: "smooth" });
  });
  $$("#tags button").forEach((b) =>
    b.addEventListener("click", () => {
      const t = b.dataset.tag;
      state.tags.has(t) ? state.tags.delete(t) : state.tags.add(t);
      b.classList.toggle("on", state.tags.has(t));
      b.setAttribute("aria-pressed", state.tags.has(t));
      render();
    })
  );

  // ---------- grade ----------
  function render() {
    const list = imoveis.filter(
      (i) =>
        (!state.cidade || i.cidade === state.cidade) &&
        i.hospedes >= state.hospedes &&
        (!state.tipo || i.tipo === state.tipo) &&
        [...state.tags].every((t) => i.tags.includes(t))
    );
    $("#count").textContent = `${list.length} ${list.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}`;
    $("#grid").innerHTML =
      list
        .map(
          (i) => `
      <article class="card" data-id="${i.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${esc(i.nome)}">
        <div class="card-img">${img(i.fotos[0], i.nome)}<span class="badge">${esc(i.tipo)}</span></div>
        <div class="card-body">
          <div class="card-top"><h3>${esc(i.nome)}</h3><span class="rate">★ ${i.nota.toFixed(2).replace(".", ",")}</span></div>
          <p class="place">${esc(i.bairro)} · ${esc(i.cidade)}</p>
          <p class="meta">${i.hospedes} hóspedes · ${i.quartos} quartos · ${i.banheiros} banheiros</p>
          <p class="price"><b>${brl(i.diaria)}</b> / noite <small>a partir de</small></p>
        </div>
      </article>`
        )
        .join("") || `<p class="empty">Nenhum imóvel com esses filtros. Tente remover algum.</p>`;
  }

  // ---------- modal de detalhes ----------
  const modal = $("#modal");
  function open(id) {
    const i = imoveis.find((x) => x.id === id);
    if (!i) return;
    $("#modalBody").innerHTML = `
      <div class="gallery">${i.fotos.map((f, n) => img(f, `${i.nome} — foto ${n + 1}`)).join("")}</div>
      <div class="detail">
        <div>
          <p class="kicker">${esc(i.tipo)} · ${esc(i.bairro)}, ${esc(i.cidade)}</p>
          <h2>${esc(i.nome)}</h2>
          <p class="meta">${i.hospedes} hóspedes · ${i.quartos} quartos · ${i.banheiros} banheiros · ★ ${i.nota.toFixed(2).replace(".", ",")} (${i.avaliacoes} avaliações)</p>
          <p>${esc(i.resumo)}</p>
          <h4>Comodidades</h4>
          <ul class="amen">${i.comodidades.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
          <div class="tagline">${i.tags.map((t) => `<span>${TAG_LABEL[t] || t}</span>`).join("")}</div>
        </div>
        <aside class="book">
          <p class="price"><b>${brl(i.diaria)}</b> / noite</p>
          <p class="muted">Valor de referência. O preço final depende das datas escolhidas.</p>
          <a class="btn airbnb" href="${esc(airbnbUrl(i))}" target="_blank" rel="noopener">Reservar no Airbnb</a>
          <a class="btn ghost" href="https://wa.me/5500000000000?text=${encodeURIComponent("Olá! Tenho interesse no imóvel " + i.nome)}" target="_blank" rel="noopener">Tirar dúvidas no WhatsApp</a>
          <p class="safe">🔒 Pagamento e cancelamento protegidos pelo Airbnb</p>
        </aside>
      </div>`;
    modal.showModal();
    document.body.style.overflow = "hidden";
  }
  $("#grid").addEventListener("click", (e) => {
    const c = e.target.closest(".card");
    if (c) open(c.dataset.id);
  });
  $("#grid").addEventListener("keydown", (e) => {
    const c = e.target.closest(".card");
    if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(c.dataset.id); }
  });
  $("#closeModal").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  modal.addEventListener("close", () => (document.body.style.overflow = ""));

  // ---------- nav com fundo ao rolar ----------
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  render();
})();
