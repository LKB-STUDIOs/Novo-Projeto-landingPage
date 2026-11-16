/*
 * Cena de partículas 3D desenhada em <canvas>.
 * As partículas se transformam entre "formas" conforme o scroll,
 * criando a sensação de um vídeo controlado pela rolagem da página.
 *
 * Formas: 0 esfera · 1 onda · 2 gráfico de barras (indústria) · 3 casa (imóveis) · 4 anel
 * Uso: Scene.morph = 0..4 (aceita valores fracionados para a transição)
 */
(function () {
  const canvas = document.getElementById("scene");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isSmall = window.innerWidth < 720;
  const N = isSmall ? 900 : 1600;

  // ---------- geradores de forma (coordenadas aprox. entre -1 e 1) ----------
  const rand = (a, b) => a + Math.random() * (b - a);

  function sphere() {
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }
    return pts;
  }

  function wave() {
    const pts = [];
    const side = Math.ceil(Math.sqrt(N));
    for (let i = 0; i < N; i++) {
      const gx = (i % side) / (side - 1) * 2 - 1;
      const gz = Math.floor(i / side) / (side - 1) * 2 - 1;
      const y = Math.sin(gx * 4) * 0.18 + Math.cos(gz * 3) * 0.18;
      pts.push([gx * 1.5, y - 0.1, gz * 1.5]);
    }
    return pts;
  }

  // pontos espalhados nas arestas de uma caixa
  function boxEdges(x0, y0, z0, x1, y1, z1, count, out) {
    const edges = [
      [[x0, y0, z0], [x1, y0, z0]], [[x0, y1, z0], [x1, y1, z0]], [[x0, y0, z1], [x1, y0, z1]], [[x0, y1, z1], [x1, y1, z1]],
      [[x0, y0, z0], [x0, y1, z0]], [[x1, y0, z0], [x1, y1, z0]], [[x0, y0, z1], [x0, y1, z1]], [[x1, y0, z1], [x1, y1, z1]],
      [[x0, y0, z0], [x0, y0, z1]], [[x1, y0, z0], [x1, y0, z1]], [[x0, y1, z0], [x0, y1, z1]], [[x1, y1, z0], [x1, y1, z1]],
    ];
    for (let i = 0; i < count; i++) {
      const [a, b] = edges[i % 12];
      const t = Math.random();
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    }
  }

  function bars() {
    const pts = [];
    const heights = [0.5, 0.9, 0.65, 1.3, 0.8, 1.6, 1.1, 1.9];
    const per = Math.floor(N / heights.length);
    heights.forEach((h, i) => {
      const x = -1.4 + i * 0.4;
      boxEdges(x, -0.9, -0.15, x + 0.25, -0.9 + h, 0.15, i === heights.length - 1 ? N - per * i : per, pts);
    });
    return pts;
  }

  function house() {
    const pts = [];
    const body = Math.floor(N * 0.55);
    boxEdges(-0.8, -0.9, -0.6, 0.8, 0.2, 0.6, body, pts);
    // telhado (prisma)
    const roof = [
      [[-0.95, 0.2, -0.6], [0, 0.95, -0.6]], [[0.95, 0.2, -0.6], [0, 0.95, -0.6]],
      [[-0.95, 0.2, 0.6], [0, 0.95, 0.6]], [[0.95, 0.2, 0.6], [0, 0.95, 0.6]],
      [[0, 0.95, -0.6], [0, 0.95, 0.6]],
      [[-0.95, 0.2, -0.6], [-0.95, 0.2, 0.6]], [[0.95, 0.2, -0.6], [0.95, 0.2, 0.6]],
    ];
    const roofCount = Math.floor(N * 0.33);
    for (let i = 0; i < roofCount; i++) {
      const [a, b] = roof[i % roof.length];
      const t = Math.random();
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    }
    // porta e janela
    const rest = N - pts.length;
    const half = Math.floor(rest / 2);
    boxEdges(-0.15, -0.9, 0.6, 0.15, -0.35, 0.6, half, pts);
    boxEdges(0.35, -0.3, 0.6, 0.6, -0.05, 0.6, rest - half, pts);
    return pts;
  }

  function ring() {
    const pts = [];
    for (let i = 0; i < N; i++) {
      const u = rand(0, Math.PI * 2);
      const v = rand(0, Math.PI * 2);
      const R = 1.05, r = 0.28;
      pts.push([(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)]);
    }
    return pts;
  }

  // embaralha para que cada partícula viaje para um ponto aleatório da próxima forma
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const shapes = [sphere(), shuffle(wave()), shuffle(bars()), shuffle(house()), shuffle(ring())];
  const colors = [
    [198, 255, 74], // lima
    [124, 92, 255], // violeta
    [124, 242, 196], // verde-água (indústria)
    [255, 184, 107], // laranja (imóveis)
    [198, 255, 74],
  ];
  // pequeno ruído individual para dar vida
  const jitter = Array.from({ length: N }, () => [rand(0, 6.28), rand(0.5, 1.5)]);

  const Scene = window.Scene || {};
  for (const [k, v] of Object.entries({ morph: 0, offsetX: 0.28, spin: 0, dim: 1 })) if (!(k in Scene)) Scene[k] = v;
  window.Scene = Scene;

  let w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  const ease = (t) => t * t * (3 - 2 * t);
  let time = 0;

  function frame() {
    time += reduce ? 0 : 0.004;
    ctx.clearRect(0, 0, w, h);

    const m = Math.max(0, Math.min(shapes.length - 1, Scene.morph));
    const i0 = Math.floor(m);
    const i1 = Math.min(shapes.length - 1, i0 + 1);
    const t = ease(m - i0);
    const A = shapes[i0], B = shapes[i1];
    const cA = colors[i0], cB = colors[i1];
    const col = [0, 1, 2].map((k) => Math.round(cA[k] + (cB[k] - cA[k]) * t));

    // durante a transição as partículas "explodem" um pouco
    const burst = Math.sin(t * Math.PI) * 0.35;

    const rotY = time + Scene.spin;
    const rotX = -0.35;
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);

    const scale = Math.min(w, h) * (isSmall ? 0.34 : 0.3);
    const centerX = w * (0.5 + (isSmall ? 0 : Scene.offsetX));
    const centerY = h * 0.5;

    ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    for (let i = 0; i < N; i++) {
      const a = A[i], b = B[i], j = jitter[i];
      let x = a[0] + (b[0] - a[0]) * t;
      let y = a[1] + (b[1] - a[1]) * t;
      let z = a[2] + (b[2] - a[2]) * t;
      const n = Math.sin(time * 2 * j[1] + j[0]);
      x += n * 0.012 + Math.cos(j[0]) * burst;
      y += Math.sin(j[0] * 1.7) * burst;
      z += Math.sin(j[0]) * burst;

      // rotação
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      const y1 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;

      const p = 3 / (3 + z2);
      const px = centerX + x1 * scale * p;
      const py = centerY + y1 * scale * p;
      const size = Math.max(0.6, 1.7 * p);
      ctx.globalAlpha = Math.max(0.15, Math.min(1, 0.95 - z2 * 0.45)) * Scene.dim;
      ctx.fillRect(px, py, size, size);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
