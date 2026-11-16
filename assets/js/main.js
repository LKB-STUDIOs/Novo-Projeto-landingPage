/*
 * Animações da página principal (GSAP + ScrollTrigger).
 * A rolagem é a linha do tempo de um "vídeo": controla a câmera da cena 3D,
 * a forma das partículas e as transições 3D dos elementos da página.
 */
(function () {
  document.getElementById("ano").textContent = new Date().getFullYear();

  // Se o GSAP não carregar (sem internet / CDN bloqueado), mostra tudo estático.
  if (!window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll(".manifesto-text .w").forEach((w) => (w.style.opacity = 1));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const Scene = window.Scene || (window.Scene = { morph: 0, dim: 1 });
  const isSmall = window.innerWidth < 720;

  // ---------- divide o manifesto em palavras ----------
  const manifesto = document.querySelector("[data-reveal]");
  manifesto.innerHTML = manifesto.textContent
    .trim()
    .split(/\s+/)
    .map((w) => `<span class="w">${w}</span>`)
    .join(" ");

  // ---------- barra de progresso ----------
  gsap.to(".progress span", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
  });

  // ---------- contadores ----------
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: end,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => (el.textContent = Math.round(obj.v) + suffix),
        }),
    });
  });

  const mm = gsap.matchMedia();

  // =====================================================================
  // Movimento completo
  // =====================================================================
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // ---------- entrada do hero: linhas giram em 3D ----------
    if (isSmall) Scene.dim = 0.5; // no celular a esfera fica atrás do texto
    gsap
      .timeline({ defaults: { ease: "expo.out" } })
      .from(".hero-title .line > span", { yPercent: 110, rotateX: -80, duration: 1.6, stagger: 0.12 })
      .from(".hero-fade", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, "-=1.1")
      .from(Scene, { dim: 0, camZ: 14, spin: -2, duration: 2.6, ease: "power3.out" }, 0)
      .from(".nav", { y: -30, opacity: 0, duration: 1 }, 0.3);

    // ---------- hero sai: texto afunda em 3D, câmera mergulha na esfera ----------
    gsap
      .timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } })
      .to(".hero-inner", { rotateX: 35, z: -300, yPercent: -20, opacity: 0, ease: "none" }, 0)
      .to(".scroll-hint", { opacity: 0, ease: "none" }, 0)
      .to(Scene, { camZ: 2.2, offsetX: 0, spin: 0.8, ease: "power1.in" }, 0);

    // ---------- manifesto: câmera sai por cima e vê a onda ----------
    gsap
      .timeline({ scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: 1 } })
      .to(Scene, { morph: 1, camZ: 6.5, camY: 2.2, dim: 0.4, spin: 1.6, ease: "none" }, 0);

    gsap.fromTo(
      ".manifesto-text .w",
      { opacity: 0.12, rotateX: -50, z: -80 },
      {
        opacity: 1,
        rotateX: 0,
        z: 0,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top 70%", end: "bottom 60%", scrub: 1 },
      }
    );

    // ---------- processo: cena fixada, etapas viram como cartas ----------
    const steps = gsap.utils.toArray(".step");
    const counter = document.querySelector(".pc-current");
    gsap.set(steps, { autoAlpha: 0, rotateX: -70, z: -200, y: 60 });
    gsap.set(steps[0], { autoAlpha: 1, rotateX: 0, z: 0, y: 0 });

    const proc = gsap.timeline({
      scrollTrigger: {
        trigger: ".process",
        start: "top top",
        end: "+=" + window.innerHeight * 3,
        pin: ".process-pin",
        scrub: 1,
        onUpdate: (self) => {
          const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
          counter.textContent = String(idx + 1).padStart(2, "0");
        },
      },
    });
    proc
      .to(".process-bar span", { scaleX: 1, ease: "none", duration: 3 }, 0)
      // o gráfico de barras se forma logo na 1ª etapa e depois gira enquanto as etapas passam
      .to(Scene, { morph: 2, camY: 0.3, camZ: 6.8, dim: 0.7, offsetX: 0.2, tilt: 0.15, ease: "power1.out", duration: 0.8 }, 0)
      .to(Scene, { spin: 3.4, ease: "none", duration: 3 }, 0);
    steps.forEach((step, i) => {
      if (i === 0) return;
      proc
        .to(steps[i - 1], { autoAlpha: 0, rotateX: 70, z: -200, y: -60, duration: 0.4 }, i - 0.3)
        .to(step, { autoAlpha: 1, rotateX: 0, z: 0, y: 0, duration: 0.4 }, i - 0.1);
    });

    // ---------- nichos: carrossel horizontal em 3D ----------
    const track = document.querySelector(".niches-track");
    const cards = gsap.utils.toArray(".niche-card");
    const distance = () => track.scrollWidth - window.innerWidth;
    const bend = () => {
      const vw = window.innerWidth;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = (r.left + r.width / 2 - vw / 2) / vw; // -1..1 distância do centro
        gsap.set(c, { rotateY: d * -38, z: -Math.abs(d) * 260, opacity: 1 - Math.min(0.6, Math.abs(d) * 0.5) });
      });
    };
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".niches",
          start: "top top",
          end: () => "+=" + distance(),
          pin: ".niches-pin",
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: bend,
      })
      .to(track, { x: () => -distance(), ease: "none" }, 0)
      .to(Scene, { morph: 3, camY: 0.6, camZ: 7, dim: 0.35, offsetX: 0, tilt: 0.1, spin: 5.5, ease: "none" }, 0);
    bend();
    ScrollTrigger.addEventListener("refresh", bend);

    gsap.from(".niches-head > *", {
      y: 50,
      opacity: 0,
      rotateX: -40,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".niches", start: "top 70%" },
    });

    // ---------- projetos: telas entram girando em 3D ----------
    gsap.utils.toArray(".project").forEach((proj) => {
      const rev = proj.classList.contains("reverse");
      const tl = gsap.timeline({ scrollTrigger: { trigger: proj, start: "top 85%", end: "top 25%", scrub: 1 } });
      tl.from(proj.querySelector(".mock"), { y: 140, rotateX: 40, rotateY: rev ? -35 : 35, z: -300, opacity: 0, ease: "power2.out" }, 0)
        .from(proj.querySelectorAll(".project-info > *"), { y: 40, opacity: 0, stagger: 0.08, ease: "power2.out" }, 0.1);
      const bars = proj.querySelectorAll(".mock-chart i");
      if (bars.length) tl.from(bars, { scaleY: 0, stagger: 0.04, ease: "back.out(2)" }, 0.2);
    });
    gsap.to(Scene, {
      dim: 0.2,
      camZ: 9,
      ease: "none",
      scrollTrigger: { trigger: ".projects", start: "top bottom", end: "top center", scrub: 1 },
    });

    // ---------- equipe ----------
    gsap.from(".member", {
      y: 80,
      rotateY: -45,
      z: -200,
      opacity: 0,
      stagger: 0.12,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: { trigger: ".team-grid", start: "top 80%" },
    });

    // ---------- contato: casa vira anel, câmera volta para perto ----------
    gsap.to(Scene, {
      morph: 4,
      dim: 0.9,
      camZ: 5,
      camY: 0,
      tilt: 0.75,
      spin: 7.5,
      ease: "none",
      scrollTrigger: { trigger: ".contact", start: "top bottom", end: "center center", scrub: 1 },
    });
    gsap.from(".contact-title", {
      scale: 0.7,
      rotateX: 50,
      z: -300,
      opacity: 0,
      ease: "power2.out",
      scrollTrigger: { trigger: ".contact", start: "top 80%", end: "center center", scrub: 1 },
    });
  });

  // =====================================================================
  // Inclinação 3D com o mouse (cards, telas e membros)
  // =====================================================================
  mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const target = el.querySelector("[data-tilt-target]") || el;
      const max = +el.dataset.tilt || 10;
      const rx = gsap.quickTo(target, "rotationX", { duration: 0.5, ease: "power3.out" });
      const ry = gsap.quickTo(target, "rotationY", { duration: 0.5, ease: "power3.out" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
      el.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  });

  // =====================================================================
  // Movimento reduzido: sem fixações nem scroll horizontal
  // =====================================================================
  mm.add("(prefers-reduced-motion: reduce)", () => {
    Scene.dim = 0.4;
    document.querySelector(".niches-track").style.cssText = "flex-wrap:wrap;width:auto";
    document.querySelector(".niches-pin").style.height = "auto";
    document.querySelector(".process-steps").style.height = "auto";
    document.querySelectorAll(".step").forEach((s) => (s.style.position = "static"));
  });
})();
