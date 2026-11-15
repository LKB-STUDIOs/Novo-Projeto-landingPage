/*
 * Ferrus OS — demonstração estática.
 * Todos os dados são fictícios e ficam salvos no navegador (localStorage).
 * Para virar produto real, troque a camada "store" por chamadas à API do back-end.
 */
(function () {
  const SETORES = ["Soldagem", "Pintura", "Polimento", "Lixamento", "Montagem", "Hot stamping", "Injeção", "Cromagem"];
  const UNIDADES = ["Unidade Norte", "Unidade Sul", "Unidade Vale"];
  const DEFEITOS = ["Falta de solda", "Respingo", "Rebarba", "Bolha", "Escorrido", "Fora de cor", "Mancha", "Empenamento", "Risco", "Falta de componente", "Trinca", "Outros"];
  const OPERADORES = ["Carlos M.", "Juliana R.", "Pedro H.", "Ana Paula S.", "Rafael T.", "Bianca L.", "Diego F.", "Larissa C."];
  const KEY = "ferrus-demo-v1";

  // ---------- utilidades ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const fmt = (n) => n.toLocaleString("pt-BR");
  const iso = (d) => d.toISOString().slice(0, 10);
  const br = (s) => s.split("-").reverse().join("/");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

  // ---------- dados de exemplo ----------
  function seed() {
    const registros = [];
    for (let i = 0; i < 120; i++) {
      const insp = rnd(80, 600);
      const rep = Math.round(insp * (Math.random() * 0.07));
      const defs = rep ? [...new Set([pick(DEFEITOS.slice(0, 9)), pick(DEFEITOS.slice(0, 6))])] : [];
      registros.push({
        id: 1000 + i,
        data: daysAgo(rnd(0, 6)),
        unidade: pick(UNIDADES),
        setor: pick(SETORES),
        op: "OP-" + rnd(24000, 24999),
        codigo: "AUR-" + rnd(1000, 4999),
        operador: pick(OPERADORES),
        inspecionada: insp,
        reprovada: rep,
        defeitos: defs,
        obs: "",
      });
    }
    registros.sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
    return {
      registros,
      ncs: [
        { id: "NC-0142", setor: "Pintura", desc: "Lote com variação de cor no acabamento grafite", grav: "Alta", status: "Em análise", data: daysAgo(1) },
        { id: "NC-0141", setor: "Soldagem", desc: "Falta de solda em suporte lateral, peça AUR-3320", grav: "Média", status: "Ação corretiva", data: daysAgo(2) },
        { id: "NC-0139", setor: "Injeção", desc: "Rechupe recorrente no molde 14", grav: "Média", status: "Em análise", data: daysAgo(4) },
        { id: "NC-0136", setor: "Montagem", desc: "Componente faltante em kit de expedição", grav: "Baixa", status: "Encerrada", data: daysAgo(6) },
        { id: "NC-0131", setor: "Polimento", desc: "Riscos após troca de disco de polimento", grav: "Baixa", status: "Encerrada", data: daysAgo(9) },
      ],
      calibracoes: [
        { cod: "PAQ-011", nome: "Paquímetro digital 150 mm", local: "Soldagem · Norte", venc: daysAgo(-48) },
        { cod: "MIC-004", nome: "Micrômetro externo 0–25 mm", local: "Qualidade · Sul", venc: daysAgo(-9) },
        { cod: "MED-021", nome: "Medidor de camada de tinta", local: "Pintura · Vale", venc: daysAgo(3) },
        { cod: "TRQ-007", nome: "Torquímetro 20–100 Nm", local: "Montagem · Norte", venc: daysAgo(-120) },
        { cod: "BRL-002", nome: "Brilhômetro 60°", local: "Polimento · Sul", venc: daysAgo(-21) },
        { cod: "RUG-003", nome: "Rugosímetro portátil", local: "Lixamento · Vale", venc: daysAgo(-3) },
      ],
      usuarios: [
        { nome: "Marina Alves", email: "marina@aurora.ind.br", perfil: "Gestora", unidade: "Todas" },
        { nome: "Carlos Mendes", email: "carlos@aurora.ind.br", perfil: "Operador", unidade: "Unidade Norte" },
        { nome: "Juliana Rocha", email: "juliana@aurora.ind.br", perfil: "Inspetora", unidade: "Unidade Sul" },
        { nome: "Pedro Henrique", email: "pedro@aurora.ind.br", perfil: "Líder de setor", unidade: "Unidade Vale" },
      ],
      pendentes: [
        { nome: "Thiago Nunes", email: "thiago@aurora.ind.br", unidade: "Unidade Sul", pediu: daysAgo(0) },
        { nome: "Fernanda Lima", email: "fernanda@aurora.ind.br", unidade: "Unidade Norte", pediu: daysAgo(1) },
      ],
    };
  }

  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { db = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };

  // ---------- toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // ---------- login ----------
  function enterApp() {
    $("#login").hidden = true;
    $("#app").hidden = false;
    render();
  }
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    try { sessionStorage.setItem("ferrus-auth", "1"); } catch {}
    enterApp();
  });
  $("#logout").addEventListener("click", () => {
    try { sessionStorage.removeItem("ferrus-auth"); } catch {}
    $("#app").hidden = true;
    $("#login").hidden = false;
  });
  try { if (sessionStorage.getItem("ferrus-auth")) enterApp(); } catch {}

  // ---------- navegação ----------
  const titles = { painel: "Painel", apontamento: "Apontar produção", registros: "Registros de produção", qualidade: "Qualidade", calibracao: "Calibração", usuarios: "Usuários" };
  function go(view) {
    $$(".menu button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    $$(".view").forEach((v) => (v.hidden = v.dataset.view !== view));
    $("#viewTitle").textContent = titles[view];
    $("#sidebar").classList.remove("open");
    render();
  }
  $$(".menu button").forEach((b) => b.addEventListener("click", () => go(b.dataset.view)));
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-goto]");
    if (g) go(g.dataset.goto);
  });
  $("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $("#unit").addEventListener("change", () => {
    const u = $("#unit").value;
    $("#crumb").textContent = "Metalúrgica Aurora" + (u === "todas" ? "" : " · " + u);
    render();
  });
  $("#resetDemo").addEventListener("click", () => {
    db = seed();
    save();
    render();
    toast("Dados de demonstração restaurados");
  });

  const filtered = () => {
    const u = $("#unit").value;
    return u === "todas" ? db.registros : db.registros.filter((r) => r.unidade === u);
  };

  // ---------- gráficos SVG ----------
  function barChart(el, data) {
    const W = 520, H = 230, pad = { l: 8, r: 8, t: 22, b: 36 };
    const max = Math.max(...data.map((d) => d.v), 1);
    const bw = (W - pad.l - pad.r) / data.length;
    const bars = data.map((d, i) => {
      const h = (d.v / max) * (H - pad.t - pad.b);
      const x = pad.l + i * bw + bw * 0.18;
      const y = H - pad.b - h;
      return `<rect class="bar" x="${x}" y="${y}" width="${bw * 0.64}" height="${h}" rx="5"><title>${d.k}: ${fmt(d.v)}</title></rect>
        <text class="val" x="${x + bw * 0.32}" y="${y - 6}" text-anchor="middle">${d.v >= 1000 ? (d.v / 1000).toFixed(1) + "k" : d.v}</text>
        <text x="${x + bw * 0.32}" y="${H - pad.b + 18}" text-anchor="middle">${d.k.length > 9 ? d.k.slice(0, 8) + "." : d.k}</text>`;
    });
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Produção por setor"><line class="grid" x1="0" x2="${W}" y1="${H - pad.b}" y2="${H - pad.b}"/>${bars.join("")}</svg>`;
  }

  function lineChart(el, data) {
    const W = 520, H = 230, pad = { l: 34, r: 12, t: 16, b: 36 };
    const min = 90, max = 100;
    const x = (i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (Math.max(min, v) - min) / (max - min)) * (H - pad.t - pad.b);
    const path = data.map((d, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(d.v).toFixed(1)).join(" ");
    const area = path + ` L${x(data.length - 1)} ${H - pad.b} L${x(0)} ${H - pad.b} Z`;
    const grid = [90, 95, 100].map((v) => `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`).join("");
    const dots = data.map((d, i) => `<circle cx="${x(i)}" cy="${y(d.v)}" r="4" fill="#fff" stroke="var(--accent)" stroke-width="2"><title>${br(d.k)}: ${d.v.toFixed(1)}%</title></circle><text x="${x(i)}" y="${H - pad.b + 18}" text-anchor="middle">${br(d.k).slice(0, 5)}</text>`).join("");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Índice de aprovação por dia">
      <defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0fa58a" stop-opacity=".25"/><stop offset="1" stop-color="#0fa58a" stop-opacity="0"/></linearGradient></defs>
      ${grid}<path d="${area}" fill="url(#ga)"/><path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>${dots}</svg>`;
  }

  // ---------- renderização ----------
  function renderPainel() {
    const rs = filtered();
    const insp = rs.reduce((s, r) => s + r.inspecionada, 0);
    const rep = rs.reduce((s, r) => s + r.reprovada, 0);
    const aprov = insp ? ((insp - rep) / insp) * 100 : 0;
    const ncAbertas = db.ncs.filter((n) => n.status !== "Encerrada").length;
    $("#kpis").innerHTML = [
      ["Peças inspecionadas", fmt(insp), "+8,2%", ""],
      ["Peças aprovadas", fmt(insp - rep), "+6,9%", ""],
      ["Índice de aprovação", aprov.toFixed(1) + "%", "+0,4 p.p.", ""],
      ["NCs abertas", ncAbertas, ncAbertas > 2 ? "atenção" : "ok", ncAbertas > 2 ? "down" : ""],
    ].map(([l, v, d, c]) => `<div class="kpi"><p>${l}</p><strong>${v}</strong><span class="delta ${c}">${d}</span></div>`).join("");

    const porSetor = SETORES.map((k) => ({ k, v: rs.filter((r) => r.setor === k).reduce((s, r) => s + r.inspecionada - r.reprovada, 0) }));
    barChart($("#chartSetores"), porSetor);

    const dias = [...Array(7)].map((_, i) => daysAgo(6 - i)).map((k) => {
      const d = rs.filter((r) => r.data === k);
      const a = d.reduce((s, r) => s + r.inspecionada, 0);
      const b = d.reduce((s, r) => s + r.reprovada, 0);
      return { k, v: a ? ((a - b) / a) * 100 : 100 };
    });
    lineChart($("#chartAprov"), dias);

    const cont = {};
    rs.forEach((r) => r.defeitos.forEach((d) => (cont[d] = (cont[d] || 0) + 1)));
    const top = Object.entries(cont).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const mx = top.length ? top[0][1] : 1;
    $("#defects").innerHTML = top.map(([k, v]) => `<li><span>${esc(k)}</span><div class="track"><span style="width:${(v / mx) * 100}%"></span></div><b>${v}</b></li>`).join("") || `<li class="muted">Nenhum defeito registrado.</li>`;

    $("#recent").innerHTML = `<tr><th>Data</th><th>Setor</th><th>OP</th><th>Aprov.</th></tr>` +
      rs.slice(0, 6).map((r) => `<tr><td>${br(r.data)}</td><td>${esc(r.setor)}</td><td class="mono">${esc(r.op)}</td><td>${pctPill(r)}</td></tr>`).join("");
  }

  function pctPill(r) {
    const p = ((r.inspecionada - r.reprovada) / r.inspecionada) * 100;
    const cls = p >= 97 ? "ok" : p >= 94 ? "warn" : "bad";
    return `<span class="pill ${cls}">${p.toFixed(1)}%</span>`;
  }

  function renderRegistros() {
    const q = $("#search").value.trim().toLowerCase();
    const s = $("#filterSetor").value;
    const rs = filtered().filter((r) =>
      (!s || r.setor === s) && (!q || [r.op, r.codigo, r.operador].some((x) => x.toLowerCase().includes(q))));
    $("#records").innerHTML = `<tr><th>Data</th><th>Unidade</th><th>Setor</th><th>OP</th><th>Código</th><th>Operador</th><th>Insp.</th><th>Reprov.</th><th>Aprovação</th><th>Defeitos</th></tr>` +
      (rs.map((r) => `<tr><td>${br(r.data)}</td><td>${esc(r.unidade)}</td><td>${esc(r.setor)}</td><td class="mono">${esc(r.op)}</td><td class="mono">${esc(r.codigo)}</td><td>${esc(r.operador)}</td><td>${fmt(r.inspecionada)}</td><td>${fmt(r.reprovada)}</td><td>${pctPill(r)}</td><td class="muted">${esc(r.defeitos.join(", ") || "—")}</td></tr>`).join("") ||
        `<tr><td colspan="10" class="muted">Nenhum registro encontrado.</td></tr>`);
    return rs;
  }

  function renderQualidade() {
    const ab = db.ncs.filter((n) => n.status === "Em análise").length;
    const ac = db.ncs.filter((n) => n.status === "Ação corretiva").length;
    const en = db.ncs.filter((n) => n.status === "Encerrada").length;
    $("#ncKpis").innerHTML = [["Em análise", ab], ["Em ação corretiva", ac], ["Encerradas", en]]
      .map(([l, v]) => `<div class="kpi"><p>${l}</p><strong>${v}</strong></div>`).join("");
    const st = { "Em análise": "warn", "Ação corretiva": "bad", "Encerrada": "ok" };
    const next = { "Em análise": "Ação corretiva", "Ação corretiva": "Encerrada" };
    $("#ncTable").innerHTML = `<tr><th>Nº</th><th>Abertura</th><th>Setor</th><th>Descrição</th><th>Gravidade</th><th>Status</th><th></th></tr>` +
      db.ncs.map((n, i) => `<tr><td class="mono">${n.id}</td><td>${br(n.data)}</td><td>${esc(n.setor)}</td><td>${esc(n.desc)}</td><td>${n.grav}</td><td><span class="pill ${st[n.status]}">${n.status}</span></td>
        <td>${next[n.status] ? `<button class="link" data-nc="${i}">Avançar →</button>` : ""}</td></tr>`).join("");
    $$("[data-nc]").forEach((b) => b.addEventListener("click", () => {
      const n = db.ncs[b.dataset.nc];
      n.status = next[n.status];
      save(); render();
      toast(`${n.id} movida para "${n.status}"`);
    }));
  }

  function renderCalibracao() {
    const hoje = new Date(iso(new Date()));
    $("#calTable").innerHTML = `<tr><th>Código</th><th>Instrumento</th><th>Local</th><th>Vencimento</th><th>Situação</th></tr>` +
      [...db.calibracoes].sort((a, b) => a.venc.localeCompare(b.venc)).map((c) => {
        const dias = Math.round((new Date(c.venc) - hoje) / 864e5);
        const [cls, txt] = dias < 0 ? ["bad", `Vencida há ${-dias} dia(s)`] : dias <= 15 ? ["warn", `Vence em ${dias} dia(s)`] : ["ok", "Em dia"];
        return `<tr><td class="mono">${c.cod}</td><td>${esc(c.nome)}</td><td>${esc(c.local)}</td><td>${br(c.venc)}</td><td><span class="pill ${cls}">${txt}</span></td></tr>`;
      }).join("");
  }

  function renderUsuarios() {
    $("#pending").innerHTML = db.pendentes.map((p, i) => `<div class="pending-item"><div><b>${esc(p.nome)}</b><span class="muted small">${esc(p.email)} · ${esc(p.unidade)} · pediu em ${br(p.pediu)}</span></div>
      <div class="acts"><button class="btn" data-rej="${i}">Recusar</button><button class="btn primary" data-apr="${i}">Liberar acesso</button></div></div>`).join("") ||
      `<p class="muted">Nenhum cadastro aguardando liberação.</p>`;
    $("#userTable").innerHTML = `<tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Unidade</th></tr>` +
      db.usuarios.map((u) => `<tr><td>${esc(u.nome)}</td><td>${esc(u.email)}</td><td>${esc(u.perfil)}</td><td>${esc(u.unidade)}</td></tr>`).join("");
    $$("[data-apr]").forEach((b) => b.addEventListener("click", () => {
      const [p] = db.pendentes.splice(b.dataset.apr, 1);
      db.usuarios.push({ nome: p.nome, email: p.email, perfil: "Operador", unidade: p.unidade });
      save(); render(); toast(`Acesso liberado para ${p.nome}`);
    }));
    $$("[data-rej]").forEach((b) => b.addEventListener("click", () => {
      const [p] = db.pendentes.splice(b.dataset.rej, 1);
      save(); render(); toast(`Cadastro de ${p.nome} recusado`);
    }));
  }

  function render() {
    $("#pendBadge").textContent = db.pendentes.length || "";
    const view = $(".menu button.active").dataset.view;
    ({ painel: renderPainel, registros: renderRegistros, qualidade: renderQualidade, calibracao: renderCalibracao, usuarios: renderUsuarios }[view] || (() => {}))();
  }

  // ---------- formulário de apontamento ----------
  const opts = SETORES.map((s) => `<option>${s}</option>`).join("");
  $("#setorSelect").innerHTML = opts;
  $("#ncSetor").innerHTML = opts;
  $("#filterSetor").innerHTML += opts;
  $("#defectPick").innerHTML = DEFEITOS.map((d) => `<label><input type="checkbox" name="defeitos" value="${d}">${d}</label>`).join("");
  const form = $("#prodForm");
  form.data.value = iso(new Date());
  const calc = () => {
    const a = +form.inspecionada.value, b = +form.reprovada.value;
    $("#calcInfo").textContent = a ? `Aprovadas: ${fmt(Math.max(0, a - b))} · Aprovação: ${(((a - b) / a) * 100).toFixed(1)}%` : "Aprovadas: —";
  };
  form.addEventListener("input", calc);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const insp = +f.get("inspecionada"), rep = +f.get("reprovada");
    if (rep > insp) { toast("A quantidade reprovada não pode ser maior que a inspecionada"); return; }
    const defs = f.getAll("defeitos");
    if (rep > 0 && !defs.length) { toast("Marque pelo menos um defeito para as peças reprovadas"); return; }
    db.registros.unshift({
      id: Date.now(), data: f.get("data"), unidade: f.get("unidade"), setor: f.get("setor"),
      op: f.get("op").trim(), codigo: f.get("codigo").trim(), operador: f.get("operador").trim(),
      inspecionada: insp, reprovada: rep, defeitos: defs, obs: f.get("obs").trim(),
    });
    save();
    form.reset();
    form.data.value = iso(new Date());
    calc();
    toast("Apontamento salvo com sucesso");
    go("registros");
  });

  // ---------- registros ----------
  $("#search").addEventListener("input", renderRegistros);
  $("#filterSetor").addEventListener("change", renderRegistros);
  $("#exportCsv").addEventListener("click", () => {
    const rs = renderRegistros();
    const head = ["data", "unidade", "setor", "op", "codigo", "operador", "inspecionada", "reprovada", "defeitos"];
    const csv = [head.join(";"), ...rs.map((r) => head.map((h) => `"${String(Array.isArray(r[h]) ? r[h].join(", ") : r[h]).replace(/"/g, '""')}"`).join(";"))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `ferrus-registros-${iso(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`${rs.length} registros exportados`);
  });

  // ---------- nova NC ----------
  const dlg = $("#ncDialog");
  $("#newNc").addEventListener("click", () => { $("#ncForm").reset(); dlg.showModal(); });
  dlg.addEventListener("close", () => {
    if (dlg.returnValue !== "ok") return;
    const f = new FormData($("#ncForm"));
    const num = Math.max(...db.ncs.map((n) => +n.id.slice(3))) + 1;
    db.ncs.unshift({ id: "NC-" + String(num).padStart(4, "0"), setor: f.get("setor"), desc: f.get("desc").trim(), grav: f.get("grav"), status: "Em análise", data: iso(new Date()) });
    save(); render(); toast("Não conformidade aberta");
  });
})();
