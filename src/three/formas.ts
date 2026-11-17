/** Formas que as partículas assumem (coordenadas aproximadas entre -1 e 1). */

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function esfera(n: number): number[] {
  const p: number[] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const casca = i % 5 === 0 ? rand(0.55, 0.95) : 1;
    p.push(Math.cos(g * i) * r * casca, y * casca, Math.sin(g * i) * r * casca);
  }
  return p;
}

function onda(n: number): number[] {
  const p: number[] = [];
  const lado = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const x = ((i % lado) / (lado - 1)) * 2 - 1;
    const z = (Math.floor(i / lado) / (lado - 1)) * 2 - 1;
    p.push(x * 2.2, Math.sin(x * 5) * 0.22 + Math.cos(z * 4) * 0.22 - 0.2, z * 2.2);
  }
  return p;
}

function arestas(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, qtd: number, out: number[]) {
  const e = [
    [x0, y0, z0, x1, y0, z0], [x0, y1, z0, x1, y1, z0], [x0, y0, z1, x1, y0, z1], [x0, y1, z1, x1, y1, z1],
    [x0, y0, z0, x0, y1, z0], [x1, y0, z0, x1, y1, z0], [x0, y0, z1, x0, y1, z1], [x1, y0, z1, x1, y1, z1],
    [x0, y0, z0, x0, y0, z1], [x1, y0, z0, x1, y0, z1], [x0, y1, z0, x0, y1, z1], [x1, y1, z0, x1, y1, z1],
  ];
  for (let i = 0; i < qtd; i++) {
    const s = e[i % 12]!;
    const t = Math.random();
    out.push(s[0]! + (s[3]! - s[0]!) * t, s[1]! + (s[4]! - s[1]!) * t, s[2]! + (s[5]! - s[2]!) * t);
  }
}

function barras(n: number): number[] {
  const p: number[] = [];
  const h = [0.5, 0.9, 0.65, 1.3, 0.8, 1.6, 1.1, 1.9];
  const por = Math.floor(n / h.length);
  h.forEach((v, i) => {
    const x = -1.5 + i * 0.4;
    arestas(x, -0.95, -0.15, x + 0.26, -0.95 + v, 0.15, i === h.length - 1 ? n - por * i : por, p);
  });
  return p;
}

function casa(n: number): number[] {
  const p: number[] = [];
  arestas(-0.8, -0.9, -0.6, 0.8, 0.2, 0.6, Math.floor(n * 0.5), p);
  const telhado = [
    [-0.95, 0.2, -0.6, 0, 0.95, -0.6], [0.95, 0.2, -0.6, 0, 0.95, -0.6],
    [-0.95, 0.2, 0.6, 0, 0.95, 0.6], [0.95, 0.2, 0.6, 0, 0.95, 0.6],
    [0, 0.95, -0.6, 0, 0.95, 0.6], [-0.95, 0.2, -0.6, -0.95, 0.2, 0.6], [0.95, 0.2, -0.6, 0.95, 0.2, 0.6],
  ];
  const qt = Math.floor(n * 0.3);
  for (let i = 0; i < qt; i++) {
    const s = telhado[i % telhado.length]!;
    const t = Math.random();
    p.push(s[0]! + (s[3]! - s[0]!) * t, s[1]! + (s[4]! - s[1]!) * t, s[2]! + (s[5]! - s[2]!) * t);
  }
  const resto = n - p.length / 3;
  const a = Math.floor(resto * 0.35);
  const b = Math.floor(resto * 0.3);
  arestas(-0.15, -0.9, 0.6, 0.15, -0.35, 0.6, a, p);
  arestas(0.35, -0.3, 0.6, 0.6, -0.05, 0.6, b, p);
  for (let i = 0; i < resto - a - b; i++) p.push(rand(-1.4, 1.4), -0.9, rand(-1.1, 1.1));
  return p;
}

function anel(n: number): number[] {
  const p: number[] = [];
  for (let i = 0; i < n; i++) {
    const u = rand(0, Math.PI * 2);
    const v = rand(0, Math.PI * 2);
    const R = 1.15, r = 0.3;
    p.push((R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u));
  }
  return p;
}

/** Embaralha de 3 em 3 para cada partícula viajar até um ponto aleatório da próxima forma. */
function embaralhar(arr: number[]): number[] {
  for (let i = arr.length / 3 - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    for (let k = 0; k < 3; k++) {
      const t = arr[i * 3 + k]!;
      arr[i * 3 + k] = arr[j * 3 + k]!;
      arr[j * 3 + k] = t;
    }
  }
  return arr;
}

export function gerarFormas(n: number): Float32Array[] {
  return [esfera(n), embaralhar(onda(n)), embaralhar(barras(n)), embaralhar(casa(n)), embaralhar(anel(n))].map(
    (f) => new Float32Array(f),
  );
}
