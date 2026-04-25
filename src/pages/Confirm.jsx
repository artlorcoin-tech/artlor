import { motion, useReducedMotion } from 'framer-motion'
import { BrushCleaning, Package, UserRoundCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import BrandHeader from '../components/BrandHeader'
import SiteFooter from '../components/SiteFooter'

const timeline = [
  {
    title: 'Artist Matched',
    detail: 'within 24 hours',
    icon: UserRoundCheck,
  },
  {
    title: 'Work Begins',
    detail: 'after confirmation call',
    icon: BrushCleaning,
  },
  {
    title: 'Delivered',
    detail: 'estimated 7-14 days',
    icon: Package,
  },
]

const splats = [
  { id: 0, x: -150, y: -80, size: 13, delay: 0, color: '#7A4A2E' },
  { id: 1, x: -120, y: -30, size: 11, delay: 0.03, color: '#C9934A' },
  { id: 2, x: -100, y: 32, size: 16, delay: 0.06, color: '#1F1F1F' },
  { id: 3, x: -70, y: 86, size: 12, delay: 0.09, color: '#EDE5DC' },
  { id: 4, x: -24, y: -98, size: 14, delay: 0.12, color: '#7A4A2E' },
  { id: 5, x: 20, y: -68, size: 10, delay: 0.15, color: '#C9934A' },
  { id: 6, x: 56, y: -20, size: 15, delay: 0.18, color: '#1F1F1F' },
  { id: 7, x: 94, y: 26, size: 17, delay: 0.21, color: '#EDE5DC' },
  { id: 8, x: 128, y: 80, size: 13, delay: 0.24, color: '#7A4A2E' },
  { id: 9, x: 155, y: -42, size: 9, delay: 0.27, color: '#C9934A' },
  { id: 10, x: -155, y: 18, size: 8, delay: 0.3, color: '#1F1F1F' },
  { id: 11, x: -82, y: -112, size: 18, delay: 0.33, color: '#EDE5DC' },
  { id: 12, x: 4, y: 104, size: 12, delay: 0.36, color: '#7A4A2E' },
  { id: 13, x: 72, y: 112, size: 11, delay: 0.39, color: '#C9934A' },
  { id: 14, x: 122, y: -112, size: 14, delay: 0.42, color: '#1F1F1F' },
  { id: 15, x: -14, y: -124, size: 16, delay: 0.45, color: '#EDE5DC' },
]

function Confirm() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const order = location.state?.order ?? {
    name: 'Guest Client',
    artStyle: 'Custom Art Request',
    size: 'Not specified',
    location: 'Location will be confirmed by our team',
    contact: 'Contact details received',
  }

  return (
    <main className="paper-bg page-pad min-h-screen">
      <BrandHeader />
      <section className="form-shell relative mx-auto w-full max-w-3xl overflow-hidden p-5 sm:p-9">
        {!prefersReducedMotion && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            {splats.map((dot) => (
              <motion.span
                key={dot.id}
                initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.75 }}
                animate={{ x: dot.x, y: dot.y, scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.65, delay: dot.delay, ease: [0.4, 0, 0.2, 1] }}
                className="absolute rounded-full"
                style={{
                  width: dot.size,
                  height: dot.size,
                  backgroundColor: dot.color,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 text-center">
          <span className="icon-orb mx-auto mb-4 h-16 w-16 sm:h-[4.4rem] sm:w-[4.4rem]">
            <motion.svg
              viewBox="0 0 52 52"
              className="h-9 w-9 sm:h-10 sm:w-10"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.path
                d="M14 27 l8 8 l16 -16"
                fill="none"
                stroke="#2D9A4A"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                animate={prefersReducedMotion ? {} : { pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </motion.svg>
          </span>
          <h1 className="font-display text-brand-dark text-3xl sm:text-4xl lg:text-5xl">Your Order is Placed! 🎨</h1>
        </div>

        <article className="card-surface relative z-10 mt-8 bg-[var(--brand-cream)] p-5">
          <h2 className="font-display text-brand-dark text-2xl">Order Summary</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-brand-brown/80 font-body text-xs uppercase tracking-wide">Name</dt>
              <dd className="text-brand-dark font-body text-sm">{order.name}</dd>
            </div>
            <div>
              <dt className="text-brand-brown/80 font-body text-xs uppercase tracking-wide">Art Style</dt>
              <dd className="text-brand-dark font-body text-sm">{order.artStyle}</dd>
            </div>
            <div>
              <dt className="text-brand-brown/80 font-body text-xs uppercase tracking-wide">Size</dt>
              <dd className="text-brand-dark font-body text-sm">{order.size}</dd>
            </div>
            <div>
              <dt className="text-brand-brown/80 font-body text-xs uppercase tracking-wide">Location</dt>
              <dd className="text-brand-dark font-body text-sm">{order.location}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-brand-brown/80 font-body text-xs uppercase tracking-wide">Contact</dt>
              <dd className="text-brand-dark font-body text-sm">{order.contact}</dd>
            </div>
          </dl>
        </article>

        <section className="relative z-10 mt-8">
          <h3 className="font-display text-brand-dark text-2xl sm:text-3xl">What happens next?</h3>
          <div className="mt-4 space-y-3">
            {timeline.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.article
                  key={item.title}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  className="card-surface flex items-center gap-3 p-4"
                >
                  <span className="icon-orb h-10 w-10">
                    <Icon className="text-brand-brown h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-body text-sm font-semibold text-[var(--brand-dark)]">{item.title}</p>
                    <p className="text-brand-brown/85 font-body text-xs">{item.detail}</p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        <div className="relative z-10 mt-8 text-center">
          <Link to="/gallery" className="pill-btn pill-btn-primary inline-flex px-7 py-3 text-sm">
            Browse More Art →
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

export default Confirm
