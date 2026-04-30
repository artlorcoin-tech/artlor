import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages project sites live under /<repo>/; `public/` and router need that prefix in production.
// Local dev uses "/" so http://localhost:5173/ works as usual.
// Root-hosted deploy (e.g. custom domain): build with VITE_BASE_PATH=/
function productionBase() {
  const raw = process.env.VITE_BASE_PATH ?? '/artlor'
  if (raw === '/' || raw === '') return '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'serve' ? '/' : productionBase(),
}))
