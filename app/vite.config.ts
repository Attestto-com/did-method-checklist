import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [vue(), tailwindcss()],
  base: command === 'serve' ? '/' : '/did-method-checklist/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
build: {
    outDir: 'dist',
  },
}))
