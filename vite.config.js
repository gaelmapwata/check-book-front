import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'url'
import path from 'path'

// Conversion ESM pour obtenir le dossier courant (remplace __dirname)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }) // Vuetify auto-import des composants et directives
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias @ -> src
      '~': fileURLToPath(new URL('./', import.meta.url))     // Alias ~ -> racine projet
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
