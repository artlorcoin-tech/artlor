import { motion, useReducedMotion } from 'framer-motion'
import { Brush, MapPinHouse, PackageCheck } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import BrandHeader from '../components/BrandHeader'

const values = [
  {
    title: 'Local Artists',
    description: 'Handpicked talent from your city, matched to your vision.',
    icon: MapPinHouse,
  },
  {
    title: 'Fully Custom',
    description: 'You describe it, we paint it. Every detail, your way.',
    icon: Brush,
  },
  {
    title: 'Wall-Ready Art',
    description: 'Delivered stretched, framed, and ready to hang.',
    icon: PackageCheck,
  },
]

const styleCards = [
  { name: 'Landscape', color: '#2C4A2E' },
  { name: 'Calligraphy', color: '#1F1F1F' },
  { name: 'Abstract', color: '#7A2E4A' },
  { name: 'Still Life', color: '#2E3A7A' },
]

function Home() {
  const prefersReducedMotion = useReducedMotion()
  const strokeLength = useMemo(() => 800, [])

  return (
    <main className="paper-bg min-h-screen px-5 py-10 sm:px-8 lg:px-14">
      <BrandHeader />
      <section className="hero-spotlight mx-auto flex min-h-[82vh] max-w-5xl flex-col items-center justify-center text-center">
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.4, 0, 0.2, 1] }}
          className="mb-5 rounded-full border border-[var(--brand-light)] bg-white/75 px-5 py-2 font-body text-xs uppercase tracking-[0.22em] text-[var(--brand-brown)]"
        >
          Handcrafted Local Art Marketplace
        </motion.p>

        <motion.img
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          src="/brand/artlor-logo.png"
          alt="Artlor logo"
          className="mb-5 h-16 w-auto sm:h-20"
        />

        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="ink-title font-display text-4xl leading-tight sm:text-5xl lg:text-7xl"
        >
          Art That Lives On Your Walls
        </motion.h1>

        <motion.svg
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          viewBox="0 0 560 56"
          className="mt-4 h-[56px] w-full max-w-[560px]"
          aria-hidden="true"
        >
          <motion.path
            d="M22 34 C 120 10, 220 48, 330 28 S 520 30, 538 24"
            fill="transparent"
            stroke="var(--brand-brown)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={
              prefersReducedMotion
                ? false
                : { strokeDasharray: strokeLength, strokeDashoffset: strokeLength }
            }
            animate={
              prefersReducedMotion
                ? {}
                : { strokeDasharray: strokeLength, strokeDashoffset: 0 }
            }
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </motion.svg>

        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="text-brand-brown/85 mt-5 max-w-2xl font-body text-base sm:text-lg"
        >
          Discover local artists. Commission custom paintings. Delivered to your door.
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="mt-9"
        >
          <Link to="/gallery" className="pill-btn pill-btn-primary inline-flex px-8 py-3 text-base">
            Order Now →
          </Link>
          <p className="text-brand-brown/80 mt-4 font-body text-sm italic">
            Landscapes · Calligraphy · Abstract · Still Life
          </p>
        </motion.div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl pb-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.article
                key={value.title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
                className="card-surface p-8"
              >
                <Icon className="text-brand-brown mx-auto h-11 w-11" />
                <h3 className="font-display text-brand-dark mt-5 text-3xl">{value.title}</h3>
                <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 mb-10 max-w-6xl">
        <h2 className="font-display text-brand-dark mb-6 text-center text-3xl sm:text-4xl">
          Explore Art Styles
        </h2>
        <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2">
          {styleCards.map((style) => (
            <motion.article
              key={style.name}
              whileHover={prefersReducedMotion ? {} : { scale: 1.04, filter: 'brightness(1.12)' }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="relative h-[300px] w-[240px] min-w-[240px] overflow-hidden rounded-2xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
              style={{ backgroundColor: style.color }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.18),transparent_30%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/74 via-black/28 to-transparent" />
              <div className="absolute right-0 bottom-0 left-0 p-5">
                <h3 className="font-display text-2xl text-white">{style.name}</h3>
                <span className="mt-1 inline-block font-body text-sm text-white/90">Explore →</span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
