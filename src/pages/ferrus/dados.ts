/** Ferrus OS — dados fictícios da demonstração, salvos só no navegador de quem abre. */

export const SETORES = ["Soldagem", "Pintura", "Polimento", "Lixamento", "Montagem", "Hot stamping", "Injeção", "Cromagem"];
export const UNIDADES = ["Unidade Norte", "Unidade Sul", "Unidade Vale"];
export const DEFEITOS = ["Falta de solda", "Respingo", "Rebarba", "Bolha", "Escorrido", "Fora de cor", "Mancha", "Empenamento", "Risco", "Falta de componente", "Trinca", "Outros"];
const OPERADORES = ["Carlos M.", "Juliana R.", "Pedro H.", "Ana Paula S.", "Rafael T.", "Bianca L.", "Diego F.", "Larissa C."];

export type Registro = {
  id: number; data: string; unidade: string; setor: string; op: string; codigo: string; operador: string;
  inspecionada: number; reprovada: number; defeitos: string[]; obs: string;
};
export type StatusNC = "Em análise" | "Ação corretiva" | "Encerrada";
export type NC = { id: string; setor: string; desc: string; grav: string; status: StatusNC; data: string };
export type Calibracao = { cod: string; nome: string; local: string; venc: string };
export type Usuario = { nome: string; email: string; perfil: string; unidade: string };
export type Pendente = { nome: string; email: string; unidade: string; pediu: string };
export type Banco = { registros: Registro[]; ncs: NC[]; calibracoes: Calibracao[]; usuarios: Usuario[]; pendentes: Pendente[] };

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]!;
const rnd = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const br = (s: string) => s.split("-").reverse().join("/");
export const fmt = (n: number) => n.toLocaleString("pt-BR");
export const diasAtras = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

export function semear(): Banco {
  const registros: Registro[] = [];
  for (let i = 0; i < 120; i++) {
    const insp = rnd(80, 600);
    const rep = Math.round(insp * Math.random() * 0.07);
    registros.push({
      id: 1000 + i,
      data: diasAtras(rnd(0, 6)),
      unidade: pick(UNIDADES),
      setor: pick(SETORES),
      op: "OP-" + rnd(24000, 24999),
      codigo: "AUR-" + rnd(1000, 4999),
      operador: pick(OPERADORES),
      inspecionada: insp,
      reprovada: rep,
      defeitos: rep ? [...new Set([pick(DEFEITOS.slice(0, 9)), pick(DEFEITOS.slice(0, 6))])] : [],
      obs: "",
    });
  }
  registros.sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
  return {
    registros,
    ncs: [
      { id: "NC-0142", setor: "Pintura", desc: "Lote com variação de cor no acabamento grafite", grav: "Alta", status: "Em análise", data: diasAtras(1) },
      { id: "NC-0141", setor: "Soldagem", desc: "Falta de solda em suporte lateral, peça AUR-3320", grav: "Média", status: "Ação corretiva", data: diasAtras(2) },
      { id: "NC-0139", setor: "Injeção", desc: "Rechupe recorrente no molde 14", grav: "Média", status: "Em análise", data: diasAtras(4) },
      { id: "NC-0136", setor: "Montagem", desc: "Componente faltante em kit de expedição", grav: "Baixa", status: "Encerrada", data: diasAtras(6) },
      { id: "NC-0131", setor: "Polimento", desc: "Riscos após troca de disco de polimento", grav: "Baixa", status: "Encerrada", data: diasAtras(9) },
    ],
    calibracoes: [
      { cod: "PAQ-011", nome: "Paquímetro digital 150 mm", local: "Soldagem · Norte", venc: diasAtras(-48) },
      { cod: "MIC-004", nome: "Micrômetro externo 0–25 mm", local: "Qualidade · Sul", venc: diasAtras(-9) },
      { cod: "MED-021", nome: "Medidor de camada de tinta", local: "Pintura · Vale", venc: diasAtras(3) },
      { cod: "TRQ-007", nome: "Torquímetro 20–100 Nm", local: "Montagem · Norte", venc: diasAtras(-120) },
      { cod: "BRL-002", nome: "Brilhômetro 60°", local: "Polimento · Sul", venc: diasAtras(-21) },
      { cod: "RUG-003", nome: "Rugosímetro portátil", local: "Lixamento · Vale", venc: diasAtras(-3) },
    ],
    usuarios: [
      { nome: "Marina Alves", email: "marina@aurora.ind.br", perfil: "Gestora", unidade: "Todas" },
      { nome: "Carlos Mendes", email: "carlos@aurora.ind.br", perfil: "Operador", unidade: "Unidade Norte" },
      { nome: "Juliana Rocha", email: "juliana@aurora.ind.br", perfil: "Inspetora", unidade: "Unidade Sul" },
      { nome: "Pedro Henrique", email: "pedro@aurora.ind.br", perfil: "Líder de setor", unidade: "Unidade Vale" },
    ],
    pendentes: [
      { nome: "Thiago Nunes", email: "thiago@aurora.ind.br", unidade: "Unidade Sul", pediu: diasAtras(0) },
      { nome: "Fernanda Lima", email: "fernanda@aurora.ind.br", unidade: "Unidade Norte", pediu: diasAtras(1) },
    ],
  };
}

const CHAVE = "ferrus-demo-v2";

/** Lê o banco salvo e confere o formato: dados adulterados no navegador são descartados. */
export function carregar(): Banco {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const b = JSON.parse(bruto) as Banco;
      if (Array.isArray(b.registros) && Array.isArray(b.ncs) && Array.isArray(b.calibracoes) && Array.isArray(b.usuarios) && Array.isArray(b.pendentes)) {
        return b;
      }
    }
  } catch {
    /* sem acesso ao armazenamento: segue com dados novos */
  }
  return semear();
}

export function salvar(b: Banco) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(b));
  } catch {
    /* modo privado ou armazenamento cheio: a demo continua funcionando em memória */
  }
}

export function aprovacao(r: Pick<Registro, "inspecionada" | "reprovada">) {
  return r.inspecionada ? ((r.inspecionada - r.reprovada) / r.inspecionada) * 100 : 0;
}

export function paraCSV(rs: Registro[]): string {
  const cab = ["data", "unidade", "setor", "op", "codigo", "operador", "inspecionada", "reprovada", "defeitos"] as const;
  const celula = (v: unknown) => {
    let s = String(Array.isArray(v) ? v.join(", ") : v);
    // evita injeção de fórmula ao abrir no Excel
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cab.join(";"), ...rs.map((r) => cab.map((c) => celula(r[c])).join(";"))].join("\n");
}
