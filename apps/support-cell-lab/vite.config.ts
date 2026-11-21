import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rolldownOptions: {
      // duas páginas: o site e o painel da loja (painel/index.html)
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        painel: resolve(import.meta.dirname, 'painel/index.html'),
      },
      output: {
        // React separado do 3D: assim o painel não baixa o three.js
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 3 },
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 2 },
            { name: 'r3f', test: /node_modules[\\/]@react-three[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
