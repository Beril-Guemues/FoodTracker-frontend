import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  // ===== SERVER (lokal) =====
  server: {
    port: 5173,
    strictPort: true,
    historyApiFallback: true, // ← WICHTIG: Für SPA-Routing
  },

  // ===== PREVIEW (für Render) =====
  preview: {
    port: 4173,
    strictPort: true,
    historyApiFallback: true, // ← WICHTIG: Für SPA-Routing auf Render
  },

  // ===== BUILD =====
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
