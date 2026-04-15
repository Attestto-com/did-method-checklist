import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '/did-extensions/explorer/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
build: {
    outDir: 'dist',
  },
})
