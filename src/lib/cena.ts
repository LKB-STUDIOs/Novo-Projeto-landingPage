/**
 * Estado compartilhado da cena 3D. O GSAP (scroll) escreve aqui e o Three.js lê a cada quadro,
 * sem passar pelo React, para não renderizar componentes 60 vezes por segundo.
 */
export const cena = {
  morph: 0, // 0 esfera · 1 onda · 2 barras · 3 casa · 4 anel
  offsetX: 0.22,
  spin: 0,
  dim: 1,
  camZ: 6,
  camY: 0,
  tilt: 0,
};
export type Cena = typeof cena;
