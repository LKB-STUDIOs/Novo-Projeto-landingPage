import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { cena } from "../lib/cena";
import { gerarFormas } from "./formas";

const PALETA = [0xc6ff4a, 0x7c5cff, 0x7cf2c4, 0xffb86b, 0xc6ff4a].map((c) => new THREE.Color(c));

const vertex = /* glsl */ `
  attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;
  attribute vec4 rnd;
  uniform float uMorph; uniform float uTime; uniform float uSize;
  varying float vMix; varying float vAlpha;
  float w(float i) { return clamp(1.0 - abs(uMorph - i), 0.0, 1.0); }
  void main() {
    vec3 pos = position * w(0.0) + p1 * w(1.0) + p2 * w(2.0) + p3 * w(3.0) + p4 * w(4.0);
    float burst = sin(fract(uMorph) * 3.14159);
    vec3 dir = normalize(rnd.xyz - 0.5);
    pos += dir * burst * (0.5 + rnd.w * 0.9);
    pos += dir * sin(uTime * (0.6 + rnd.w) + rnd.x * 6.28) * 0.018;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.35 + rnd.y * 0.65) / -mv.z;
    vMix = rnd.z;
    vAlpha = 0.55 + 0.45 * sin(uTime * 1.5 + rnd.x * 20.0);
  }`;

const fragment = /* glsl */ `
  uniform vec3 uColA; uniform vec3 uColB; uniform float uDim;
  varying float vMix; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = pow(smoothstep(0.5, 0.0, d), 1.6);
    gl_FragColor = vec4(mix(uColA, uColB, vMix * 0.35), glow * vAlpha * uDim);
  }`;

function Particulas({ n, pequeno }: { n: number; pequeno: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const { gl } = useThree();

  const [geo, mat] = useMemo(() => {
    const formas = gerarFormas(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(formas[0]!, 3));
    for (let i = 1; i < formas.length; i++) g.setAttribute(`p${i}`, new THREE.BufferAttribute(formas[i]!, 3));
    const rnd = new Float32Array(n * 4).map(() => Math.random());
    g.setAttribute("rnd", new THREE.BufferAttribute(rnd, 4));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uMorph: { value: 0 },
        uTime: { value: 0 },
        uDim: { value: 1 },
        uSize: { value: (pequeno ? 34 : 30) * gl.getPixelRatio() },
        uColA: { value: PALETA[0]!.clone() },
        uColB: { value: PALETA[1]!.clone() },
      },
    });
    return [g, m];
  }, [n, pequeno, gl]);

  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = Math.max(0, Math.min(4, cena.morph));
    const i0 = Math.floor(m);
    const i1 = Math.min(4, i0 + 1);
    const f = m - i0;
    colA.copy(PALETA[i0]!).lerp(PALETA[i1]!, f);
    colB.copy(PALETA[(i0 + 1) % 5]!).lerp(PALETA[(i1 + 1) % 5]!, f);
    const u = mat.uniforms;
    u.uMorph!.value = m;
    u.uTime!.value = t;
    u.uDim!.value = cena.dim;
    (u.uColA!.value as THREE.Color).copy(colA);
    (u.uColB!.value as THREE.Color).copy(colB);

    const g = grupo.current;
    if (!g) return;
    const cam = state.camera as THREE.PerspectiveCamera;
    const largura = 2 * Math.tan((cam.fov * Math.PI) / 360) * Math.max(1, cam.position.z) * cam.aspect;
    g.position.x += ((pequeno ? 0 : cena.offsetX) * largura - g.position.x) * 0.08;
    g.rotation.y = t * 0.12 + cena.spin + state.pointer.x * 0.35;
    g.rotation.x = -0.25 + cena.tilt - state.pointer.y * 0.2;
    g.scale.setScalar(pequeno ? 1.25 : 1.6);
  });

  return (
    <group ref={grupo}>
      <points geometry={geo} material={mat} />
    </group>
  );
}

function Estrelas({ n }: { n: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 60;
      p[i * 3 + 1] = (Math.random() - 0.5) * 60;
      p[i * 3 + 2] = -Math.random() * 64 + 4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [n]);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.01 + s.pointer.x * 0.05;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={0x9aa3c7} size={0.05} transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

const FLUTUANTES: [THREE.BufferGeometry, number, [number, number, number]][] = [
  [new THREE.IcosahedronGeometry(0.6, 0), 0x7c5cff, [-4.2, 2.2, -4]],
  [new THREE.OctahedronGeometry(0.45, 0), 0xc6ff4a, [4.5, -2.4, -3]],
  [new THREE.TorusGeometry(0.5, 0.14, 8, 24), 0x7cf2c4, [-3.6, -3.2, -7]],
  [new THREE.TetrahedronGeometry(0.5, 0), 0xffb86b, [3.4, 3.4, -9]],
  [new THREE.DodecahedronGeometry(0.55, 0), 0x8fb4ff, [-5.5, 0.4, -12]],
  [new THREE.IcosahedronGeometry(0.9, 1), 0x7c5cff, [6, 1, -16]],
  [new THREE.BoxGeometry(0.7, 0.7, 0.7), 0xff8fab, [-2.5, 4.2, -18]],
  [new THREE.TorusKnotGeometry(0.45, 0.12, 64, 8), 0xc6ff4a, [2.2, -4.5, -22]],
];

function Flutuante({ geo, cor, pos, i }: { geo: THREE.BufferGeometry; cor: number; pos: [number, number, number]; i: number }) {
  const ref = useRef<THREE.LineSegments>(null);
  const bordas = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const vel = 0.2 + (i % 4) * 0.08;
  useFrame((s, dt) => {
    const o = ref.current;
    if (!o) return;
    o.rotation.x += dt * vel;
    o.rotation.y += dt * vel * 0.7;
    o.position.y = pos[1] + Math.sin(s.clock.elapsedTime * vel + i) * 0.35;
    (o.material as THREE.LineBasicMaterial).opacity = 0.25 + 0.35 * Math.min(1, cena.dim + 0.3);
  });
  return (
    <lineSegments ref={ref} geometry={bordas} position={pos}>
      <lineBasicMaterial color={cor} transparent opacity={0.55} />
    </lineSegments>
  );
}

function Grade() {
  const ref = useRef<THREE.GridHelper>(null);
  useFrame((s) => {
    const g = ref.current;
    if (!g) return;
    const m = g.material as THREE.Material;
    m.transparent = true;
    m.opacity = Math.max(0, 1 - Math.abs(cena.morph - 1)) * 0.35 * cena.dim;
    g.position.z = (s.clock.elapsedTime * 0.6) % (40 / 60);
  });
  return <gridHelper ref={ref} args={[40, 60, 0x7c5cff, 0x2a2350]} position={[0, -2.6, 0]} />;
}

function Camera() {
  useFrame((s) => {
    const c = s.camera;
    c.position.z += (cena.camZ - c.position.z) * 0.08;
    c.position.y += (cena.camY - s.pointer.y * -0.4 - c.position.y) * 0.08;
    c.position.x += (s.pointer.x * 0.6 - c.position.x) * 0.05;
    c.lookAt(0, cena.camY * 0.3, 0);
  });
  return null;
}

export default function Cena3D() {
  const pequeno = typeof window !== "undefined" && window.innerWidth < 720;
  return (
    <Canvas
      className="cena3d"
      dpr={[1, 2]}
      camera={{ fov: 50, position: [0, 0, 6], near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
      aria-hidden="true"
    >
      <fogExp2 attach="fog" args={[0x07080c, 0.045]} />
      <Camera />
      <Particulas n={pequeno ? 2600 : 6000} pequeno={pequeno} />
      <Estrelas n={pequeno ? 700 : 1600} />
      {FLUTUANTES.filter((_, i) => !pequeno || i % 2 === 0).map(([g, c, p], i) => (
        <Flutuante key={i} geo={g} cor={c} pos={p} i={i} />
      ))}
      <Grade />
    </Canvas>
  );
}
