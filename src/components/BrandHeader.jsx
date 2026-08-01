import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Mail, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { publicUrl } from '../publicUrl'
import { supabase } from '../lib/supabaseClient'

const links = [
  { label: 'Home', mobileLabel: 'Home', to: '/' },
  { label: 'Gallery', mobileLabel: 'Gallery', to: '/gallery' },
  { label: 'Custom Order', mobileLabel: 'Order', to: '/order' },
  { label: 'About Us', mobileLabel: 'About', to: '/about' },
  { label: 'Contact Us', mobileLabel: 'Contact', to: '/contact' },
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
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: -18 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      className="content-max mb-6 w-full rounded-[32px] border border-[rgba(122,74,46,0.16)] bg-[rgba(253,250,246,0.85)] px-3 py-2.5 shadow-[0_16px_40px_rgba(90,48,27,0.08)] backdrop-blur-xl sm:mb-8 sm:px-5 sm:py-3.5"
      role="banner"
    >
      <div className="flex items-center justify-between gap-2 md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
        <Link to="/" className="flex items-center justify-self-start group" aria-label="Artlor home">
          <img src={publicUrl('brand/artlor-logo.png')} alt="Artlor Logo" className="brand-logo-round brand-logo-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(201,147,74,0.4)]" />
        </Link>
 
        <nav className="no-scrollbar mx-1 hidden min-w-0 items-center gap-1.5 overflow-x-auto px-1 md:flex md:mx-auto md:justify-center" aria-label="Main Navigation">
          {links.map((item) => {
            const active = item.to === location.pathname
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`pill-btn inline-flex h-9 shrink-0 items-center justify-center px-3.5 py-2 text-[11px] font-semibold transition-all duration-300 sm:h-10 sm:px-4.5 sm:text-xs tracking-wide ${
                  active
                    ? 'bg-gradient-to-r from-[var(--brand-brown-deep)] via-[var(--brand-brown)] to-[var(--brand-gold)] text-white shadow-[0_6px_20px_rgba(122,74,46,0.3)]'
                    : 'text-[var(--brand-dark)] hover:bg-[var(--brand-cream)] hover:text-[var(--brand-brown)]'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <Link
              to="/customer-dashboard"
              title="View Dashboard"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--brand-gold)]/40 bg-[var(--brand-cream)] px-3 text-[11px] font-bold text-[var(--brand-brown)] shadow-sm transition-all hover:bg-white hover:shadow-md sm:h-10 sm:px-4 sm:text-xs outline-none"
            >
              {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                <img
                  src={user.user_metadata.avatar_url || user.user_metadata.picture}
                  alt="Profile"
                  className="h-5 w-5 rounded-full object-cover border border-[var(--brand-gold)]/50 shrink-0"
                />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[var(--brand-dark)] px-3 text-[11px] font-bold text-[var(--brand-cream)] shadow-sm transition-all hover:bg-[var(--brand-brown)] sm:h-10 sm:px-4.5 sm:text-xs outline-none"
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              Sign In
            </Link>
          )}

          <a
            href="https://instagram.com/artlor.co"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram: artlor.co"
            title="Instagram: artlor.co"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(122,74,46,0.14)] bg-white/90 text-[var(--brand-brown)] shadow-xs transition duration-300 hover:border-[var(--brand-gold)] hover:bg-[var(--brand-cream)] hover:scale-105 sm:h-10 sm:w-10"
          >
            <InstagramGlyph />
          </a>
          <a
            href="https://facebook.com/artlor"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook: artlor"
            title="Facebook: artlor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(122,74,46,0.14)] bg-white/90 text-[var(--brand-brown)] shadow-xs transition duration-300 hover:border-[var(--brand-gold)] hover:bg-[var(--brand-cream)] hover:scale-105 sm:h-10 sm:w-10"
          >
            <FacebookGlyph />
          </a>
          <a
            href="mailto:artlor.co.in@gmail.com"
            aria-label="Email: artlor.co.in@gmail.com"
            title="Email: artlor.co.in@gmail.com"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(122,74,46,0.14)] bg-white/90 text-[var(--brand-brown)] shadow-xs transition duration-300 hover:border-[var(--brand-gold)] hover:bg-[var(--brand-cream)] hover:scale-105 sm:h-10 sm:w-10"
          >
            <Mail className="h-[1.2rem] w-[1.2rem] sm:h-[1.35rem] sm:w-[1.35rem]" />
          </a>
          <a
            href="https://linkedin.com/company/artlor"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn: artlor"
            title="LinkedIn: artlor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(122,74,46,0.14)] bg-white/90 text-[var(--brand-brown)] shadow-xs transition duration-300 hover:border-[var(--brand-gold)] hover:bg-[var(--brand-cream)] hover:scale-105 sm:h-10 sm:w-10"
          >
            <LinkedInGlyph />
          </a>
        </div>
      </div>
    </motion.header>
  )
}

export default BrandHeader
