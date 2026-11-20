# Modelos 3D reais

Coloque nesta pasta um arquivo `.glb` por aparelho. O site detecta o arquivo sozinho
e troca o modelo genérico pelo real no **hero** e no **showroom 360°**.
Arquivos com compressão Draco também funcionam.

| Aparelho            | Nome do arquivo     |
| ------------------- | ------------------- |
| iPhone 17 Pro Max   | `ip17promax.glb`    |
| iPhone 17 Pro       | `ip17pro.glb`       |
| iPhone Air          | `ipair.glb`         |
| iPhone 17           | `ip17.glb`          |
| iPhone 16 Pro       | `ip16pro.glb`       |
| iPhone 16           | `ip16.glb`          |
| Galaxy S25 Ultra    | `s25ultra.glb`      |
| Galaxy S25 Edge     | `s25edge.glb`       |
| Galaxy S25+         | `s25plus.glb`       |
| Galaxy S25          | `s25.glb`           |
| Galaxy S24 Ultra    | `s24ultra.glb`      |
| Galaxy S24          | `s24.glb`           |

## Onde conseguir

Procure modelos prontos de cada aparelho (com logo, botões, câmeras e materiais) em:

- **Sketchfab** — filtre por "Downloadable" e baixe no formato glTF/GLB.
- **CGTrader** ou **TurboSquid** — muitos vêm em `.fbx`/`.blend`. Converta para `.glb` no Blender
  (Arquivo → Exportar → glTF 2.0, formato "glTF Binary").

**Atenção à licença:** modelos de produtos com marca costumam ter licença **editorial**.
Confirme que a licença permite uso em site comercial antes de publicar.

Dica: mantenha cada arquivo abaixo de ~8 MB (no Blender, ative a compressão Draco ao exportar)
para o site continuar rápido no celular.

## Ajustes (opcional) em `src/data.ts`

Cada produto aceita um campo `model`:

```ts
model: {
  rotation: [0, Math.PI, 0],          // se o aparelho vier deitado ou de costas
  scale: 1,                           // ajuste fino do tamanho
  tint: { back: ['Back'], frame: ['Frame'] }, // nomes dos materiais que mudam de cor
}
```

A troca de cor do showroom pinta os materiais cujo nome contém `back`, `body`, `housing`
(traseira) ou `frame`, `side`, `metal`, `titanium` (laterais). Se o modelo usar outros nomes,
informe-os em `tint`. Para ver os nomes, abra o arquivo em https://gltf-viewer.donmccurdy.com.
