import { useGSAP } from "@gsap/react";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/inter-tight";
import { Letreiro } from "../components/Letreiro";
import { Nav } from "../components/Nav";
import { Preloader } from "../components/Preloader";
import { Progresso } from "../components/Progresso";
import { WhatsFlutuante } from "../components/WhatsFlutuante";
import { cena } from "../lib/cena";
import { gsap, iniciarScrollSuave, ScrollTrigger } from "../lib/scroll";
import { Contato } from "../sections/Contato";
import { Equipe } from "../sections/Equipe";
import { Hero } from "../sections/Hero";
import { Manifesto } from "../sections/Manifesto";
import { Nichos } from "../sections/Nichos";
import { Numeros } from "../sections/Numeros";
import { Processo } from "../sections/Processo";
import { Projetos } from "../sections/Projetos";
import { Rodape } from "../sections/Rodape";
import { Seguranca } from "../sections/Seguranca";
import { Servicos } from "../sections/Servicos";
import "./home.css";

// o Three.js (o pedaço mais pesado) é baixado em paralelo, sem travar o primeiro desenho da página
const Cena3D = lazy(() => import("../three/Cena3D"));

function temWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Home() {
  const raiz = useRef<HTMLDivElement>(null);
  const [pronto, setPronto] = useState(false);
  const [webgl] = useState(temWebGL);

  useEffect(() => {
    document.title = "LBK Studio — Sites e sistemas que fazem seu negócio crescer";
    Object.assign(cena, { morph: 0, offsetX: 0.22, spin: 0, dim: 1, camZ: 6, camY: 0, tilt: 0 });
    return iniciarScrollSuave();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const pequeno = window.innerWidth < 720;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (pequeno) cena.dim = 0.5;
        // entrada: a câmera chega de longe
        gsap.from(cena, { camZ: 14, spin: -2, duration: 2.8, ease: "power3.out", delay: 0.2 });

        // hero sai: texto afunda em 3D e a câmera mergulha na esfera
        gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } })
          .to(".hero-inner", { rotateX: 32, z: -280, yPercent: -18, opacity: 0, ease: "none" }, 0)
          .to(".hero-rodape", { opacity: 0, ease: "none" }, 0)
          .to(cena, { camZ: 2.2, offsetX: 0, spin: 0.8, ease: "power1.in" }, 0);

        // manifesto: câmera sobe e vê a onda; palavras acendem uma a uma
        gsap.to(cena, {
          morph: 1, camZ: 6.5, camY: 2.2, dim: 0.4, spin: 1.6, ease: "none",
          scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: 1 },
        });
        gsap.fromTo(".manifesto .w",
          { opacity: 0.1, rotateX: -60, z: -80, filter: "blur(6px)" },
          {
            opacity: 1, rotateX: 0, z: 0, filter: "blur(0px)", stagger: 0.05, ease: "none",
            scrollTrigger: { trigger: ".manifesto", start: "top 75%", end: "bottom 65%", scrub: 1 },
          });

        // serviços: partículas escurecem para não brigar com os cartões
        gsap.to(cena, { dim: 0.25, scrollTrigger: { trigger: ".servicos", start: "top bottom", end: "top 30%", scrub: 1 } });

        // processo: cena fixada, etapas viram como cartas e as partículas viram um gráfico 3D
        const etapas = gsap.utils.toArray<HTMLElement>(".etapa");
        const contador = document.querySelector(".pc-atual");
        gsap.set(etapas, { autoAlpha: 0, rotateX: -70, z: -200, y: 60 });
        gsap.set(etapas[0]!, { autoAlpha: 1, rotateX: 0, z: 0, y: 0 });
        const proc = gsap.timeline({
          scrollTrigger: {
            trigger: ".processo",
            start: "top top",
            end: () => "+=" + window.innerHeight * 3,
            pin: ".processo-pin",
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (st) => {
              const i = Math.min(etapas.length - 1, Math.floor(st.progress * etapas.length));
              if (contador) contador.textContent = String(i + 1).padStart(2, "0");
            },
          },
        });
        proc
          .to(".processo-barra span", { scaleX: 1, ease: "none", duration: 3 }, 0)
          .to(cena, { morph: 2, camY: 0.3, camZ: 6.8, dim: 0.7, offsetX: 0.2, tilt: 0.15, ease: "power1.out", duration: 0.8 }, 0)
          .to(cena, { spin: 3.4, ease: "none", duration: 3 }, 0);
        etapas.forEach((el, i) => {
          if (i === 0) return;
          proc
            .to(etapas[i - 1]!, { autoAlpha: 0, rotateX: 70, z: -200, y: -60, duration: 0.4 }, i - 0.3)
            .to(el, { autoAlpha: 1, rotateX: 0, z: 0, y: 0, duration: 0.4 }, i - 0.1);
        });

        // nichos: carrossel horizontal curvo em 3D; partículas viram uma casa
        const trilho = document.querySelector<HTMLElement>(".nichos-trilho")!;
        const cartoes = gsap.utils.toArray<HTMLElement>(".nicho");
        const distancia = () => trilho.scrollWidth - window.innerWidth;
        const curvar = () => {
          const vw = window.innerWidth;
          cartoes.forEach((c) => {
            const r = c.getBoundingClientRect();
            const d = (r.left + r.width / 2 - vw / 2) / vw;
            gsap.set(c, { rotateY: d * -38, z: -Math.abs(d) * 260, opacity: 1 - Math.min(0.6, Math.abs(d) * 0.5) });
          });
        };
        gsap.timeline({
          scrollTrigger: {
            trigger: ".nichos",
            start: "top top",
            end: () => "+=" + distancia(),
            pin: ".nichos-pin",
            scrub: 1,
            invalidateOnRefresh: true,
          },
          onUpdate: curvar,
        })
          .to(trilho, { x: () => -distancia(), ease: "none" }, 0)
          .to(cena, { morph: 3, camY: 0.6, camZ: 7, dim: 0.35, offsetX: 0, tilt: 0.1, spin: 5.5, ease: "none" }, 0);
        curvar();
        ScrollTrigger.addEventListener("refresh", curvar);

        // projetos: telas entram girando
        gsap.utils.toArray<HTMLElement>(".projeto").forEach((p) => {
          const rev = p.classList.contains("reverso");
          const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: "top 85%", end: "top 25%", scrub: 1 } });
          tl.from(p.querySelector(".mock"), { y: 140, rotateX: 40, rotateY: rev ? -35 : 35, z: -300, opacity: 0, ease: "power2.out" }, 0)
            .from(p.querySelectorAll(".projeto-info > *"), { y: 40, opacity: 0, stagger: 0.08, ease: "power2.out" }, 0.1);
          const barras = p.querySelectorAll(".mock-grafico i");
          if (barras.length) tl.from(barras, { scaleY: 0, stagger: 0.04, ease: "back.out(2)" }, 0.2);
        });
        gsap.to(cena, { dim: 0.18, camZ: 9, scrollTrigger: { trigger: ".projetos", start: "top bottom", end: "top center", scrub: 1 } });

        // contato: casa vira anel em volta do título
        gsap.to(cena, {
          morph: 4, dim: 0.9, camZ: 5, camY: 0, tilt: 0.75, spin: 7.5, ease: "none",
          scrollTrigger: { trigger: ".contato", start: "top bottom", end: "top top", scrub: 1 },
        });
        gsap.from(".contato-titulo", {
          scale: 0.7, rotateX: 50, z: -300, opacity: 0, ease: "power2.out",
          scrollTrigger: { trigger: ".contato", start: "top 85%", end: "top 25%", scrub: 1 },
        });

        // rodapé: letras gigantes sobem
        gsap.from(".rodape-gigante", {
          yPercent: 60, opacity: 0, ease: "power3.out",
          scrollTrigger: { trigger: ".rodape", start: "top bottom", end: "bottom bottom", scrub: 1 },
        });

        return () => ScrollTrigger.removeEventListener("refresh", curvar);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        cena.dim = 0.4;
      });
    },
    { scope: raiz },
  );

  // recalcula as posições depois que fontes e cena 3D terminam de carregar
  useEffect(() => {
    if (!pronto) return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => clearTimeout(t);
  }, [pronto]);

  return (
    <div ref={raiz} className="home">
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>
      <Preloader aoTerminar={() => setPronto(true)} />
      <Progresso />
      {webgl ? (
        <Suspense fallback={null}>
          <Cena3D />
        </Suspense>
      ) : (
        <div className="cena-fallback" aria-hidden="true" />
      )}
      <div className="grao" aria-hidden="true" />
      <Nav />
      <main id="conteudo">
        <Hero pronto={pronto} />
        <Letreiro itens={["Sites", "Landing pages", "Sistemas", "E-commerce", "Automação", "Identidade digital", "SEO"]} />
        <Manifesto />
        <Servicos />
        <Processo />
        <Nichos />
        <Projetos />
        <Numeros />
        <Seguranca />
        <Equipe />
        <Letreiro reverso itens={["Vamos conversar", "Orçamento sem compromisso", "Resposta em até 24h"]} />
        <Contato />
      </main>
      <Rodape />
      <WhatsFlutuante />
    </div>
  );
}
