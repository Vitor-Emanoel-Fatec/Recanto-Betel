import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Se quiseres importar variáveis globais automaticamente em todos os ficheiros SCSS,
        // podes descomentar a linha abaixo (ajusta o caminho se necessário):
        // additionalData: `@import "@/styles/_variables.scss";`
      },
    },
  },
});