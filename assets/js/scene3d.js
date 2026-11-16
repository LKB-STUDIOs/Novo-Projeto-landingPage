/*
 * Cena 3D em WebGL (Three.js), controlada pela rolagem.
 *
 * - Nuvem de partículas que muda de forma direto na GPU:
 *   0 esfera · 1 onda · 2 gráfico de barras (indústria) · 3 casa (imóveis) · 4 anel
 * - Câmera que se aproxima, atravessa e se afasta conforme o scroll
 * - Formas geométricas flutuando em várias profundidades + campo de estrelas
 * - Reage ao movimento do mouse (parallax)
 *
 * API usada pelo main.js (o GSAP anima estes valores):
 *   Scene.morph   0..4   forma atual (valores quebrados = transição)
 *   Scene.offsetX -0.5..0.5  deslocamento horizontal (fração da tela)
 *   Scene.spin    rotação extra
 *   Scene.dim     0..1  brilho
 *   Scene.camZ    distância da câmera
 *   Scene.camY    altura da câmera
 *   Scene.tilt    inclinação da nuvem
 *
 * Se o navegador não tiver WebGL, carrega a versão 2D (particles.js).
 */
(function () {
  const canvas = document.getElementById("scene");
  if (!canvas) return;

  const Scene = { morph: 0, offsetX: 0.22, spin: 0, dim: 1, camZ: 6, camY: 0, tilt: 0 };
  window.Scene = Scene;

  const fallback = () => {
    const s = document.createElement("script");
    s.src = "assets/js/particles.js";
    document.head.appendChild(s);
  };
  if (!window.THREE) return fallback();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return fallback();
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmall = window.innerWidth < 720;
  const N = isSmall ? 2600 : 6000;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07080c, 0.045);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 0, Scene.camZ);

  // ================= formas =================
  const rand = (a, b) => a + Math.random() * (b - a);

  function sphere() {
    const p = [];
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const shell = i % 5 === 0 ? rand(0.55, 0.95) : 1; // um pouco de volume interno
      p.push(Math.cos(g * i) * r * shell, y * shell, Math.sin(g * i) * r * shell);
    }
    return p;
  }

  function wave() {
    const p = [];
    const side = Math.ceil(Math.sqrt(N));
    for (let i = 0; i < N; i++) {
      const x = ((i % side) / (side - 1)) * 2 - 1;
      const z = (Math.floor(i / side) / (side - 1)) * 2 - 1;
      p.push(x * 2.2, Math.sin(x * 5) * 0.22 + Math.cos(z * 4) * 0.22 - 0.2, z * 2.2);
    }
    return p;
  }

  function boxEdges(x0, y0, z0, x1, y1, z1, count, out) {
    const e = [
      [x0, y0, z0, x1, y0, z0], [x0, y1, z0, x1, y1, z0], [x0, y0, z1, x1, y0, z1], [x0, y1, z1, x1, y1, z1],
      [x0, y0, z0, x0, y1, z0], [x1, y0, z0, x1, y1, z0], [x0, y0, z1, x0, y1, z1], [x1, y0, z1, x1, y1, z1],
      [x0, y0, z0, x0, y0, z1], [x1, y0, z0, x1, y0, z1], [x0, y1, z0, x0, y1, z1], [x1, y1, z0, x1, y1, z1],
    ];
    for (let i = 0; i < count; i++) {
      const s = e[i % 12], t = Math.random();
      out.push(s[0] + (s[3] - s[0]) * t, s[1] + (s[4] - s[1]) * t, s[2] + (s[5] - s[2]) * t);
    }
  }

  function bars() {
    const p = [];
    const h = [0.5, 0.9, 0.65, 1.3, 0.8, 1.6, 1.1, 1.9];
    const per = Math.floor(N / h.length);
    h.forEach((v, i) => {
      const x = -1.5 + i * 0.4;
      boxEdges(x, -0.95, -0.15, x + 0.26, -0.95 + v, 0.15, i === h.length - 1 ? N - per * i : per, p);
    });
    return p;
  }

  function house() {
    const p = [];
    boxEdges(-0.8, -0.9, -0.6, 0.8, 0.2, 0.6, Math.floor(N * 0.5), p);
    const roof = [
      [-0.95, 0.2, -0.6, 0, 0.95, -0.6], [0.95, 0.2, -0.6, 0, 0.95, -0.6],
      [-0.95, 0.2, 0.6, 0, 0.95, 0.6], [0.95, 0.2, 0.6, 0, 0.95, 0.6],
      [0, 0.95, -0.6, 0, 0.95, 0.6], [-0.95, 0.2, -0.6, -0.95, 0.2, 0.6], [0.95, 0.2, -0.6, 0.95, 0.2, 0.6],
    ];
    const rc = Math.floor(N * 0.3);
    for (let i = 0; i < rc; i++) {
      const s = roof[i % roof.length], t = Math.random();
      p.push(s[0] + (s[3] - s[0]) * t, s[1] + (s[4] - s[1]) * t, s[2] + (s[5] - s[2]) * t);
    }
    const rest = N - p.length / 3;
    const a = Math.floor(rest * 0.35), b = Math.floor(rest * 0.3);
    boxEdges(-0.15, -0.9, 0.6, 0.15, -0.35, 0.6, a, p); // porta
    boxEdges(0.35, -0.3, 0.6, 0.6, -0.05, 0.6, b, p); // janela
    // chão do terreno
    for (let i = 0; i < rest - a - b; i++) p.push(rand(-1.4, 1.4), -0.9, rand(-1.1, 1.1));
    return p;
  }

  function ring() {
    const p = [];
    for (let i = 0; i < N; i++) {
      const u = rand(0, Math.PI * 2), v = rand(0, Math.PI * 2);
      const R = 1.15, r = 0.3;
      p.push((R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u));
    }
    return p;
  }

  // embaralha os pontos (de 3 em 3) para cada partícula viajar até um lugar aleatório
  function shuffle(arr) {
    for (let i = arr.length / 3 - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      for (let k = 0; k < 3; k++) [arr[i * 3 + k], arr[j * 3 + k]] = [arr[j * 3 + k], arr[i * 3 + k]];
    }
    return arr;
  }

  const shapes = [sphere(), shuffle(wave()), shuffle(bars()), shuffle(house()), shuffle(ring())];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(shapes[0], 3));
  for (let i = 1; i < shapes.length; i++) geo.setAttribute("p" + i, new THREE.Float32BufferAttribute(shapes[i], 3));
  const rnd = new Float32Array(N * 4);
  for (let i = 0; i < N * 4; i++) rnd[i] = Math.random();
  geo.setAttribute("rnd", new THREE.BufferAttribute(rnd, 4));

  const palette = [0xc6ff4a, 0x7c5cff, 0x7cf2c4, 0xffb86b, 0xc6ff4a].map((c) => new THREE.Color(c));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uDim: { value: 1 },
      uSize: { value: (isSmall ? 34 : 30) * renderer.getPixelRatio() },
      uColA: { value: palette[0].clone() },
      uColB: { value: palette[1].clone() },
    },
    vertexShader: `
      attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;
      attribute vec4 rnd;
      uniform float uMorph; uniform float uTime; uniform float uSize;
      varying float vMix; varying float vAlpha;
      float w(float i) { return clamp(1.0 - abs(uMorph - i), 0.0, 1.0); }
      void main() {
        vec3 pos = position * w(0.0) + p1 * w(1.0) + p2 * w(2.0) + p3 * w(3.0) + p4 * w(4.0);
        // explosão suave no meio da transição
        float burst = sin(fract(uMorph) * 3.14159);
        vec3 dir = normalize(rnd.xyz - 0.5);
        pos += dir * burst * (0.5 + rnd.w * 0.9);
        // respiração individual
        pos += dir * sin(uTime * (0.6 + rnd.w) + rnd.x * 6.28) * 0.018;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (0.35 + rnd.y * 0.65) / -mv.z;
        vMix = rnd.z;
        vAlpha = 0.55 + 0.45 * sin(uTime * 1.5 + rnd.x * 20.0);
      }`,
    fragmentShader: `
      uniform vec3 uColA; uniform vec3 uColB; uniform float uDim;
      varying float vMix; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, d);
        glow = pow(glow, 1.6);
        vec3 col = mix(uColA, uColB, vMix * 0.35);
        gl_FragColor = vec4(col, glow * vAlpha * uDim);
      }`,
  });

  const cloud = new THREE.Points(geo, mat);
  const group = new THREE.Group();
  group.add(cloud);
  scene.add(group);

  // ================= estrelas (profundidade) =================
  const starGeo = new THREE.BufferGeometry();
  const SN = isSmall ? 700 : 1600;
  const sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) {
    sp[i * 3] = rand(-30, 30);
    sp[i * 3 + 1] = rand(-30, 30);
    sp[i * 3 + 2] = rand(-60, 4);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0x9aa3c7, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false })
  );
  scene.add(stars);

  // ================= formas flutuantes em wireframe =================
  const floaters = [];
  const floatDefs = [
    [new THREE.IcosahedronGeometry(0.6, 0), 0x7c5cff, [-4.2, 2.2, -4]],
    [new THREE.OctahedronGeometry(0.45, 0), 0xc6ff4a, [4.5, -2.4, -3]],
    [new THREE.TorusGeometry(0.5, 0.14, 8, 24), 0x7cf2c4, [-3.6, -3.2, -7]],
    [new THREE.TetrahedronGeometry(0.5, 0), 0xffb86b, [3.4, 3.4, -9]],
    [new THREE.DodecahedronGeometry(0.55, 0), 0x8fb4ff, [-5.5, 0.4, -12]],
    [new THREE.IcosahedronGeometry(0.9, 1), 0x7c5cff, [6, 1, -16]],
    [new THREE.BoxGeometry(0.7, 0.7, 0.7), 0xff8fab, [-2.5, 4.2, -18]],
    [new THREE.TorusKnotGeometry(0.45, 0.12, 64, 8), 0xc6ff4a, [2.2, -4.5, -22]],
  ];
  floatDefs.forEach(([g, c, pos], i) => {
    const m = new THREE.LineSegments(
      new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.55 })
    );
    m.position.set(...pos);
    m.userData = { base: pos.slice(), speed: rand(0.2, 0.5), phase: rand(0, 6.28), axis: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize() };
    if (isSmall && i % 2) return;
    scene.add(m);
    floaters.push(m);
  });

  // ================= grade no "chão" (aparece na fase da onda) =================
  const grid = new THREE.GridHelper(40, 60, 0x7c5cff, 0x2a2350);
  grid.position.y = -2.6;
  grid.material.transparent = true;
  grid.material.opacity = 0;
  scene.add(grid);

  // ================= mouse =================
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ================= tamanho =================
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ================= loop =================
  const clock = new THREE.Clock();
  const colA = new THREE.Color(), colB = new THREE.Color();
  let visible = true;
  document.addEventListener("visibilitychange", () => (visible = !document.hidden));

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    const m = Math.max(0, Math.min(4, Scene.morph));
    const i0 = Math.floor(m), i1 = Math.min(4, i0 + 1), f = m - i0;
    colA.copy(palette[i0]).lerp(palette[i1], f);
    colB.copy(palette[(i0 + 1) % 5]).lerp(palette[(i1 + 1) % 5], f);
    mat.uniforms.uMorph.value = m;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uDim.value = Scene.dim;
    mat.uniforms.uColA.value.copy(colA);
    mat.uniforms.uColB.value.copy(colB);

    // mouse suavizado
    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;

    // câmera
    camera.position.z += (Scene.camZ - camera.position.z) * 0.08;
    camera.position.y += (Scene.camY - mouse.sy * 0.4 - camera.position.y) * 0.08;
    camera.position.x += (mouse.sx * 0.6 - camera.position.x) * 0.05;
    camera.lookAt(0, Scene.camY * 0.3, 0);

    // nuvem
    const visW = 2 * Math.tan((camera.fov * Math.PI) / 360) * Math.max(1, camera.position.z) * camera.aspect;
    group.position.x += ((isSmall ? 0 : Scene.offsetX) * visW - group.position.x) * 0.08;
    group.rotation.y = (reduce ? 0 : t * 0.12) + Scene.spin + mouse.sx * 0.35;
    group.rotation.x = -0.25 + Scene.tilt + mouse.sy * 0.2;
    const s = isSmall ? 1.25 : 1.6;
    group.scale.setScalar(s);

    // grade aparece só perto da forma "onda"
    grid.material.opacity = Math.max(0, 1 - Math.abs(m - 1)) * 0.35 * Scene.dim;
    grid.position.z = (t * 0.6) % (40 / 60);

    // estrelas e formas
    stars.rotation.y = t * 0.01 + mouse.sx * 0.05;
    floaters.forEach((o) => {
      const u = o.userData;
      o.rotateOnAxis(u.axis, dt * u.speed);
      o.position.y = u.base[1] + Math.sin(t * u.speed + u.phase) * 0.35;
      o.material.opacity = 0.25 + 0.35 * Math.min(1, Scene.dim + 0.3);
    });

    renderer.render(scene, camera);
  }
  frame();
})();
