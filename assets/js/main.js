/*
 * Animações da página principal (GSAP + ScrollTrigger).
 * A rolagem controla tudo como se fosse a linha do tempo de um vídeo:
 * entrada do hero, texto revelado palavra por palavra, etapas fixadas,
 * nichos em scroll horizontal e a cena de partículas ao fundo.
 */
(function () {
  document.getElementById("ano").textContent = new Date().getFullYear();

  // Se o GSAP não carregar (sem internet / CDN bloqueado), mostra tudo estático.
  if (!window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll(".manifesto-text .w").forEach((w) => (w.style.opacity = 1));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const Scene = window.Scene || { morph: 0 };

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
    // ---------- entrada do hero ----------
    if (window.innerWidth < 720) Scene.dim = 0.5; // no celular a esfera fica atrás do texto
    const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .from(".hero-title .line > span", { yPercent: 110, duration: 1.4, stagger: 0.12 })
      .from(".hero-fade", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, "-=1")
      .from(Scene, { morph: 0, dim: 0, duration: 2, ease: "power2.out" }, 0)
      .from(".nav", { y: -30, opacity: 0, duration: 1 }, 0.3);

    // ---------- hero sai da tela: texto sobe, esfera vira onda ----------
    gsap.timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
    })
      .to(".hero-inner", { yPercent: -30, opacity: 0, ease: "none" }, 0)
      .to(".scroll-hint", { opacity: 0, ease: "none" }, 0)
      .to(Scene, { offsetX: 0, dim: 0.35, morph: 1, spin: 1.2, ease: "none" }, 0);

    // ---------- manifesto: palavras acendem conforme o scroll ----------
    gsap.to(".manifesto-text .w", {
      opacity: 1,
      stagger: 0.05,
      ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top 70%", end: "bottom 60%", scrub: 1 },
    });

    // ---------- processo: cena fixada com 3 etapas ----------
    const steps = gsap.utils.toArray(".step");
    const counter = document.querySelector(".pc-current");
    gsap.set(steps, { autoAlpha: 0, y: 60 });
    gsap.set(steps[0], { autoAlpha: 1, y: 0 });

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
      .to(Scene, { morph: 2, dim: 0.55, offsetX: 0.15, spin: 2.6, ease: "none", duration: 3 }, 0);
    steps.forEach((step, i) => {
      if (i === 0) return;
      proc
        .to(steps[i - 1], { autoAlpha: 0, y: -60, duration: 0.4 }, i - 0.3)
        .to(step, { autoAlpha: 1, y: 0, duration: 0.4 }, i - 0.1);
    });

    // ---------- nichos: scroll horizontal ----------
    const track = document.querySelector(".niches-track");
    const distance = () => track.scrollWidth - window.innerWidth;
    gsap.timeline({
      scrollTrigger: {
        trigger: ".niches",
        start: "top top",
        end: () => "+=" + distance(),
        pin: ".niches-pin",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })
      .to(track, { x: () => -distance(), ease: "none" }, 0)
      .to(Scene, { morph: 3, dim: 0.3, offsetX: 0, spin: 4, ease: "none" }, 0);

    gsap.from(".niche-card", {
      y: 80,
      opacity: 0,
      stagger: 0.08,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".niches", start: "top 70%" },
    });

    // ---------- projetos ----------
    gsap.utils.toArray(".project").forEach((proj) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: proj, start: "top 80%", end: "top 25%", scrub: 1 },
      });
      tl.from(proj.querySelector(".mock"), { y: 120, rotateX: 18, scale: 0.88, opacity: 0, ease: "power2.out" }, 0)
        .from(proj.querySelectorAll(".project-info > *"), { y: 40, opacity: 0, stagger: 0.08, ease: "power2.out" }, 0.1);
      const bars = proj.querySelectorAll(".mock-chart i");
      if (bars.length) tl.from(bars, { scaleY: 0, stagger: 0.04, ease: "back.out(2)" }, 0.2);
    });
    gsap.to(Scene, {
      dim: 0.18,
      ease: "none",
      scrollTrigger: { trigger: ".projects", start: "top bottom", end: "top center", scrub: 1 },
    });

    // ---------- equipe ----------
    gsap.from(".member", {
      y: 60,
      opacity: 0,
      stagger: 0.12,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".team-grid", start: "top 80%" },
    });

    // ---------- contato: casa vira anel, partículas voltam a brilhar ----------
    gsap.to(Scene, {
      morph: 4,
      dim: 0.9,
      spin: 6,
      ease: "none",
      scrollTrigger: { trigger: ".contact", start: "top bottom", end: "center center", scrub: 1 },
    });
    gsap.from(".contact-title", {
      scale: 0.8,
      opacity: 0,
      ease: "power2.out",
      scrollTrigger: { trigger: ".contact", start: "top 80%", end: "center center", scrub: 1 },
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
