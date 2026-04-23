import { motion, useReducedMotion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Custom Order', to: '/order' },
]

function BrandHeader() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: -18 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      className="mx-auto mb-8 flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-[rgba(31,31,31,0.08)] bg-[rgba(255,255,255,0.75)] px-4 py-3 shadow-[0_14px_35px_rgba(0,0,0,0.09)] backdrop-blur-md sm:px-6"
    >
      <Link to="/" className="flex items-center gap-3">
        <img src="/brand/artlor-logo.png" alt="Artlor" className="h-8 w-auto sm:h-9" />
      </Link>

      <nav className="hidden items-center gap-2 sm:flex">
        {links.map((item) => {
          const active = item.to === location.pathname
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`pill-btn px-4 py-2 text-sm ${
                active
                  ? 'bg-[var(--brand-dark)] text-[var(--brand-cream)]'
                  : 'text-[var(--brand-dark)] hover:bg-[var(--brand-light)]'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Link to="/quick-order" className="pill-btn pill-btn-primary px-4 py-2 text-sm sm:px-5">
        Quick Order
      </Link>
    </motion.header>
  )
}

export default BrandHeader
