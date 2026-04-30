/**
 * Absolute URL for files in `public/`. Uses Vite `base` so assets work on GitHub Pages (`/<repo>/`).
 * @param {string} path - e.g. `brand/artlor-logo.png` or `/brand/artlor-logo.png`
 */
export function publicUrl(path) {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}
