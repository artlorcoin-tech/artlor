import { motion, useReducedMotion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { publicUrl } from '../publicUrl'

const links = [
  { label: 'Home', mobileLabel: 'Home', to: '/' },
  { label: 'Gallery', mobileLabel: 'Gallery', to: '/gallery' },
  { label: 'Custom Order', mobileLabel: 'Order', to: '/order' },
]

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.2rem] w-[1.2rem] sm:h-[1.35rem] sm:w-[1.35rem]" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  )
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.2rem] w-[1.2rem] sm:h-[1.35rem] sm:w-[1.35rem]" fill="none" aria-hidden="true">
      <path
        d="M13 20V12.8h2.6l.4-3h-3V8.1c0-.9.3-1.5 1.6-1.5h1.5V4.1c-.7-.1-1.4-.1-2.1-.1-2.2 0-3.7 1.3-3.7 3.9v1.9H8v3h2.3V20h2.7z"
        fill="currentColor"
      />
    </svg>
  )
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.2rem] w-[1.2rem] sm:h-[1.35rem] sm:w-[1.35rem]" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2.8" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.2" cy="9" r="1.15" fill="currentColor" />
      <path d="M7.4 11.1v5.1M11 11.1v5.1M11 13.3c0-1.3.9-2.3 2.2-2.3 1.4 0 2.2 1 2.2 2.8v2.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function BrandHeader() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: -18 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      className="content-max mb-6 w-full rounded-[28px] border border-[rgba(31,31,31,0.08)] bg-[rgba(255,255,255,0.78)] px-2.5 py-2.5 shadow-[0_14px_35px_rgba(0,0,0,0.09)] backdrop-blur-md sm:mb-8 sm:px-4 sm:py-3 md:px-5"
    >
      <div className="grid min-h-[3.2rem] grid-cols-[auto_1fr_auto] items-center gap-2 md:gap-4">
        <Link to="/" className="flex items-center justify-self-start">
          <img src={publicUrl('brand/artlor-logo.png')} alt="Artlor" className="brand-logo-round brand-logo-sm" />
        </Link>

        <nav className="no-scrollbar mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 md:mx-auto md:justify-center">
          {links.map((item) => {
            const active = item.to === location.pathname
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`pill-btn inline-flex h-9 shrink-0 items-center justify-center px-3 py-2 text-[11px] sm:h-10 sm:px-4 sm:text-sm ${
                  active
                    ? 'bg-[var(--brand-dark)] text-[var(--brand-cream)]'
                    : 'text-[var(--brand-dark)] hover:bg-[var(--brand-light)]'
                }`}
              >
                <span className="sm:hidden">{item.mobileLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="https://instagram.com/artlor.co"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram: artlor.co"
            title="Instagram: artlor.co"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-light)] bg-white/80 text-[var(--brand-brown)] transition hover:border-[var(--brand-brown)] hover:bg-[var(--brand-light)] sm:h-10 sm:w-10"
          >
            <InstagramGlyph />
          </a>
          <a
            href="https://facebook.com/artlor"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook: artlor"
            title="Facebook: artlor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-light)] bg-white/80 text-[var(--brand-brown)] transition hover:border-[var(--brand-brown)] hover:bg-[var(--brand-light)] sm:h-10 sm:w-10"
          >
            <FacebookGlyph />
          </a>
          <a
            href="mailto:artlor.co.in@gmail.com"
            aria-label="Email: artlor.co.in@gmail.com"
            title="Email: artlor.co.in@gmail.com"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-light)] bg-white/80 text-[var(--brand-brown)] transition hover:border-[var(--brand-brown)] hover:bg-[var(--brand-light)] sm:h-10 sm:w-10"
          >
            <Mail className="h-[1.2rem] w-[1.2rem] sm:h-[1.35rem] sm:w-[1.35rem]" />
          </a>
          <a
            href="https://linkedin.com/company/artlor"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn: artlor"
            title="LinkedIn: artlor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-light)] bg-white/80 text-[var(--brand-brown)] transition hover:border-[var(--brand-brown)] hover:bg-[var(--brand-light)] sm:h-10 sm:w-10"
          >
            <LinkedInGlyph />
          </a>
        </div>
      </div>
    </motion.header>
  )
}

export default BrandHeader
