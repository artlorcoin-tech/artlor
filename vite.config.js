import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Default production base is "/" (artlor.art and most hosts). Local dev also uses "/".
// GitHub Pages project site (…github.io/<repo>/): build with VITE_BASE_PATH=/artlor
function productionBase() {
  const raw = process.env.VITE_BASE_PATH
  if (!raw || raw === '/' || raw === '') return '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'serve' ? '/' : productionBase(),
}))
