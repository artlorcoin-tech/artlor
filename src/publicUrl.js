/**
 * Absolute URL for files in `public/`. Uses Vite `base` so assets work on GitHub Pages (`/<repo>/`).
 * Handles full URLs (http, https, data:, blob:) cleanly without breaking them.
 * 
 * @param {string} path - e.g. `brand/artlor-logo.png` or `https://...` or `data:image/...`
 */
export function publicUrl(path) {
  if (!path) return ''
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}
