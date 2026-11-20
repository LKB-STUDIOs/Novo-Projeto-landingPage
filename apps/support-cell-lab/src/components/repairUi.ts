import { BatteryCharging, Box, Cable, Camera, Cpu, Layers, ScanFace, Smartphone, Volume2 } from 'lucide-react'
import type { PartId } from '../data'

export const REPAIR_ICONS: Record<PartId, typeof Cpu> = {
  tela: Smartphone,
  bateria: BatteryCharging,
  traseira: Layers,
  camera: Camera,
  frontal: ScanFace,
  conector: Cable,
  altofalante: Volume2,
  placa: Cpu,
  carcaca: Box,
}

/** Envia um reparo do Laboratório 3D para o orçamento. */
export function addRepairToQuote(id: PartId) {
  window.dispatchEvent(new CustomEvent('supportcell:add-repair', { detail: id }))
  document.getElementById('orcamento')?.scrollIntoView({ behavior: 'smooth' })
}
