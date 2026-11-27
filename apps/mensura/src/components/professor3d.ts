import * as THREE from "three";

/*
 * Professor em 3D, montado só com formas simples (sem arquivo de modelo para baixar).
 * Jaleco, óculos, crachá e um paquímetro na mão que abre e fecha.
 * A cabeça acompanha o ponteiro do mouse; pisca de tempos em tempos.
 * Devolve uma função que desmonta tudo (libera memória da placa de vídeo).
 */

const COR = {
  pele: 0xe2a882,
  cabelo: 0x2a211c,
  jaleco: 0xf3f4f6,
  jalecoSombra: 0xdfe2e7,
  camisa: 0x14213d,
  gravata: 0xe4572e,
  aco: 0xc3c9d2,
  acoEscuro: 0x8e97a5,
  oculos: 0x14213d,
  olho: 0x1b1b1f,
};

export function montarProfessor(palco: HTMLElement, nome: string): () => void {
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-hidden", "true");
  palco.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.5, 6.9);
  camera.lookAt(0, 0.12, 0);

  // luz: céu/chão suave, luz principal e um contorno laranja (a cor da marca)
  cena.add(new THREE.HemisphereLight(0xffffff, 0xb9c2d0, 1.6));
  const chave = new THREE.DirectionalLight(0xffffff, 2.2);
  chave.position.set(2.5, 3.5, 4);
  cena.add(chave);
  const contorno = new THREE.DirectionalLight(0xff8a65, 1.6);
  contorno.position.set(-3, 2, -2.5);
  cena.add(contorno);

  const descartar: { dispose(): void }[] = [];
  const mat = (cor: number, rough = 0.62, metal = 0) => {
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: rough, metalness: metal });
    descartar.push(m);
    return m;
  };
  const geo = <G extends THREE.BufferGeometry>(g: G) => (descartar.push(g), g);
  const malha = (g: THREE.BufferGeometry, m: THREE.Material, pai: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    pai.add(o);
    return o;
  };

  const M = {
    pele: mat(COR.pele, 0.7),
    cabelo: mat(COR.cabelo, 0.9),
    jaleco: mat(COR.jaleco, 0.75),
    jalecoSombra: mat(COR.jalecoSombra, 0.8),
    camisa: mat(COR.camisa, 0.7),
    gravata: mat(COR.gravata, 0.55),
    aco: mat(COR.aco, 0.28, 0.85),
    acoEscuro: mat(COR.acoEscuro, 0.35, 0.8),
    oculos: mat(COR.oculos, 0.4, 0.3),
    olhoBranco: mat(0xffffff, 0.3),
    olho: mat(COR.olho, 0.3),
    lente: new THREE.MeshStandardMaterial({ color: 0xbfd8ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18 }),
  };
  descartar.push(M.lente);

  const boneco = new THREE.Group();
  cena.add(boneco);

  // ---------- tronco (jaleco) ----------
  const tronco = new THREE.Group();
  boneco.add(tronco);
  const corpo = malha(geo(new THREE.CapsuleGeometry(0.56, 0.9, 8, 32)), M.jaleco, tronco, 0, -0.55, 0);
  corpo.scale.set(1.02, 1, 0.78);

  // camisa e gravata no decote em V
  const decote = new THREE.Shape();
  decote.moveTo(-0.2, 0);
  decote.lineTo(0.2, 0);
  decote.lineTo(0, -0.55);
  decote.closePath();
  malha(geo(new THREE.ShapeGeometry(decote)), M.camisa, tronco, 0, 0.13, 0.452);
  const gravata = new THREE.Shape();
  gravata.moveTo(-0.045, 0);
  gravata.lineTo(0.045, 0);
  gravata.lineTo(0.065, -0.38);
  gravata.lineTo(0, -0.46);
  gravata.lineTo(-0.065, -0.38);
  gravata.closePath();
  malha(geo(new THREE.ShapeGeometry(gravata)), M.gravata, tronco, 0, 0.09, 0.456);
  malha(geo(new THREE.SphereGeometry(0.05, 16, 12)), M.gravata, tronco, 0, 0.1, 0.45).scale.set(1, 0.8, 0.5);

  // lapelas
  for (const lado of [-1, 1]) {
    const l = malha(geo(new THREE.BoxGeometry(0.13, 0.62, 0.03)), M.jalecoSombra, tronco, lado * 0.15, -0.12, 0.44);
    l.rotation.z = lado * 0.32;
    l.rotation.y = lado * -0.25;
  }

  // bolso com canetas (lado esquerdo do professor = direita de quem vê)
  malha(geo(new THREE.BoxGeometry(0.26, 0.22, 0.03)), M.jalecoSombra, tronco, 0.3, -0.42, 0.405).rotation.y = 0.35;
  const caneta = geo(new THREE.CylinderGeometry(0.016, 0.016, 0.18, 10));
  malha(caneta, M.gravata, tronco, 0.26, -0.28, 0.41);
  malha(caneta, M.camisa, tronco, 0.31, -0.27, 0.40);

  // crachá com o nome
  const tela = document.createElement("canvas");
  tela.width = 256;
  tela.height = 128;
  const ctx = tela.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#14213d";
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = "#e4572e";
    ctx.fillRect(0, 0, 256, 26);
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 17px monospace";
    ctx.fillText("MENSURA · METROLOGIA", 14, 19);
    ctx.font = "700 30px sans-serif";
    ctx.fillText(nome.replace(/^Prof\.\s*/, "").split(" ")[0] ?? "", 14, 72);
    ctx.font = "500 20px monospace";
    ctx.fillStyle = "#c9d0de";
    ctx.fillText("INSTRUTOR", 14, 106);
  }
  const textura = new THREE.CanvasTexture(tela);
  textura.colorSpace = THREE.SRGBColorSpace;
  descartar.push(textura);
  const cracha = new THREE.MeshStandardMaterial({ map: textura, roughness: 0.5 });
  descartar.push(cracha);
  const placa = malha(geo(new THREE.PlaneGeometry(0.34, 0.17)), cracha, tronco, -0.3, -0.3, 0.42);
  placa.rotation.y = -0.35;

  // ---------- pescoço e cabeça ----------
  malha(geo(new THREE.CylinderGeometry(0.15, 0.17, 0.3, 20)), M.pele, tronco, 0, 0.28, 0);
  const gola = malha(geo(new THREE.TorusGeometry(0.19, 0.05, 10, 28)), M.jaleco, tronco, 0, 0.18, 0);
  gola.rotation.x = Math.PI / 2;

  const cabeca = new THREE.Group();
  cabeca.position.set(0, 0.78, 0);
  boneco.add(cabeca);
  const cranio = malha(geo(new THREE.SphereGeometry(0.42, 40, 32)), M.pele, cabeca);
  cranio.scale.set(0.95, 1.08, 1);
  // cabelo: calota de cima e nuca
  const cabelo = malha(geo(new THREE.SphereGeometry(0.44, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42)), M.cabelo, cabeca, 0, 0.03, -0.02);
  cabelo.scale.set(0.97, 1.1, 1.02);
  cabelo.rotation.x = -0.25;
  const nuca = malha(geo(new THREE.SphereGeometry(0.43, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55)), M.cabelo, cabeca, 0, 0.02, -0.06);
  nuca.rotation.x = -1.2;
  nuca.scale.set(0.96, 1.05, 1);
  // orelhas e nariz
  for (const lado of [-1, 1]) malha(geo(new THREE.SphereGeometry(0.08, 16, 12)), M.pele, cabeca, lado * 0.4, -0.02, 0).scale.set(0.5, 1, 0.8);
  malha(geo(new THREE.SphereGeometry(0.065, 16, 12)), M.pele, cabeca, 0, -0.06, 0.42).scale.set(0.9, 1, 0.8);

  // olhos (piscam escalando no eixo y)
  const olhos: THREE.Object3D[] = [];
  for (const lado of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(lado * 0.15, 0.04, 0.36);
    malha(geo(new THREE.SphereGeometry(0.06, 20, 16)), M.olhoBranco, g).scale.set(1, 1, 0.6);
    malha(geo(new THREE.SphereGeometry(0.032, 16, 12)), M.olho, g, 0, 0, 0.03);
    cabeca.add(g);
    olhos.push(g);
    const sobrancelha = malha(geo(new THREE.BoxGeometry(0.13, 0.025, 0.03)), M.cabelo, cabeca, lado * 0.15, 0.17, 0.38);
    sobrancelha.rotation.z = lado * -0.12;
  }
  // sorriso
  const sorriso = malha(geo(new THREE.TorusGeometry(0.1, 0.014, 8, 24, Math.PI)), M.olho, cabeca, 0, -0.17, 0.39);
  sorriso.rotation.z = Math.PI;
  sorriso.scale.set(1, 0.6, 1);

  // óculos
  const oculos = new THREE.Group();
  oculos.position.set(0, 0.04, 0.41);
  cabeca.add(oculos);
  for (const lado of [-1, 1]) {
    malha(geo(new THREE.TorusGeometry(0.105, 0.014, 10, 32)), M.oculos, oculos, lado * 0.15, 0, 0);
    malha(geo(new THREE.CircleGeometry(0.1, 24)), M.lente, oculos, lado * 0.15, 0, 0.002);
    const haste = malha(geo(new THREE.BoxGeometry(0.014, 0.014, 0.34)), M.oculos, oculos, lado * 0.25, 0, -0.17);
    haste.rotation.y = lado * 0.12;
  }
  malha(geo(new THREE.BoxGeometry(0.09, 0.014, 0.014)), M.oculos, oculos, 0, 0.01, 0);

  // ---------- braços ----------
  const braco = (lado: number) => {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.6, -0.05, 0);
    tronco.add(ombro);
    const sup = malha(geo(new THREE.CapsuleGeometry(0.15, 0.5, 6, 16)), M.jaleco, ombro, 0, -0.32, 0);
    sup.scale.set(1, 1, 0.95);
    const cotovelo = new THREE.Group();
    cotovelo.position.set(0, -0.62, 0);
    ombro.add(cotovelo);
    malha(geo(new THREE.CapsuleGeometry(0.13, 0.42, 6, 16)), M.jaleco, cotovelo, 0, -0.26, 0);
    const mao = malha(geo(new THREE.SphereGeometry(0.11, 20, 16)), M.pele, cotovelo, 0, -0.56, 0);
    mao.scale.set(1, 1.1, 0.85);
    return { ombro, cotovelo, mao };
  };
  const esq = braco(1);
  esq.ombro.rotation.z = 0.12;
  esq.cotovelo.rotation.x = -0.15;
  const dir = braco(-1);
  dir.ombro.rotation.set(-0.35, 0, -0.32);
  dir.cotovelo.rotation.set(-1.55, 0, 0.55);

  // ---------- paquímetro na mão direita ----------
  const paq = new THREE.Group();
  dir.mao.add(paq);
  paq.position.set(0.05, -0.02, 0.06);
  paq.rotation.set(Math.PI / 2, 0.05, 0.2);
  const regua = new THREE.Group();
  regua.rotation.z = Math.PI / 2;
  paq.add(regua);
  malha(geo(new THREE.BoxGeometry(1.05, 0.08, 0.02)), M.aco, regua, 0.38, 0, 0);
  malha(geo(new THREE.BoxGeometry(0.05, 0.26, 0.022)), M.aco, regua, -0.12, -0.16, 0);
  for (let i = 0; i < 20; i++) {
    malha(geo(new THREE.BoxGeometry(0.004, i % 5 === 0 ? 0.035 : 0.02, 0.003)), M.olho, regua, -0.08 + i * 0.045, 0.02, 0.012);
  }
  const cursor = new THREE.Group();
  regua.add(cursor);
  malha(geo(new THREE.BoxGeometry(0.22, 0.12, 0.04)), M.acoEscuro, cursor, 0.09, -0.01, 0);
  malha(geo(new THREE.BoxGeometry(0.05, 0.26, 0.022)), M.aco, cursor, 0, -0.16, 0);

  // sombra no chão
  const sombraTela = document.createElement("canvas");
  sombraTela.width = sombraTela.height = 128;
  const sctx = sombraTela.getContext("2d");
  if (sctx) {
    const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(20,33,61,0.35)");
    grad.addColorStop(1, "rgba(20,33,61,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 128);
  }
  const sombraTex = new THREE.CanvasTexture(sombraTela);
  descartar.push(sombraTex);
  const sombraMat = new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false });
  descartar.push(sombraMat);
  const sombra = malha(geo(new THREE.PlaneGeometry(2.6, 1.1)), sombraMat, cena, 0, -1.48, 0.1);
  sombra.rotation.x = -Math.PI / 2;

  boneco.rotation.y = -0.18;

  // ---------- interação ----------
  const alvo = { x: 0, y: 0 };
  const onPonteiro = (e: PointerEvent) => {
    const r = palco.getBoundingClientRect();
    alvo.x = THREE.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
    alvo.y = THREE.MathUtils.clamp((e.clientY - (r.top + r.height * 0.3)) / (window.innerHeight / 2), -1, 1);
  };
  window.addEventListener("pointermove", onPonteiro, { passive: true });

  const redimensionar = () => {
    const w = palco.clientWidth;
    const h = palco.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(redimensionar);
  ro.observe(palco);
  redimensionar();

  let visivel = true;
  const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
  io.observe(palco);

  const relogio = new THREE.Clock();
  let proximaPiscada = 2;
  let quadro = 0;
  const desenhar = () => {
    quadro = requestAnimationFrame(desenhar);
    if (!visivel) return;
    const t = relogio.getElapsedTime();
    if (!reduzir) {
      tronco.scale.y = 1 + Math.sin(t * 1.6) * 0.008;
      boneco.position.y = Math.sin(t * 1.6) * 0.012;
      // paquímetro abrindo e fechando, como quem mede uma peça
      cursor.position.x = 0.12 + (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.42;
      dir.cotovelo.rotation.z = 0.55 + Math.sin(t * 0.9) * 0.04;
      // piscada
      const fase = t - proximaPiscada;
      const fechado = fase > 0 && fase < 0.14;
      olhos.forEach((o) => (o.scale.y = fechado ? 0.12 : 1));
      if (fase > 0.14) proximaPiscada = t + 2.5 + Math.random() * 3;
    } else {
      cursor.position.x = 0.34;
    }
    cabeca.rotation.y = THREE.MathUtils.lerp(cabeca.rotation.y, alvo.x * 0.55 + 0.18, 0.08);
    cabeca.rotation.x = THREE.MathUtils.lerp(cabeca.rotation.x, alvo.y * 0.25, 0.08);
    renderer.render(cena, camera);
  };
  desenhar();

  return () => {
    cancelAnimationFrame(quadro);
    window.removeEventListener("pointermove", onPonteiro);
    ro.disconnect();
    io.disconnect();
    descartar.forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
