import { motion, useReducedMotion } from 'framer-motion'
import { Brush, MapPinHouse, PackageCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandHeader from '../components/BrandHeader'

const values = [
  {
    title: 'Local Artists',
    description: 'Handpicked talent from your city, matched to your vision.',
    icon: MapPinHouse,
    image:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Fully Custom',
    description: 'You describe it, we paint it. Every detail, your way.',
    icon: Brush,
    image:
      'https://images.unsplash.com/photo-1452802447250-470a88ac82bc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Wall-Ready Art',
    description: 'Delivered stretched, framed, and ready to hang.',
    icon: PackageCheck,
    image:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  },
]

const styleCards = [
  {
    name: 'Landscape',
    color: '#2C4A2E',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Calligraphy',
    color: '#1F1F1F',
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Abstract',
    color: '#7A2E4A',
    image:
      'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Still Life',
    color: '#2E3A7A',
    image:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
  },
]

function Home() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <main className="paper-bg page-pad min-h-screen">
      <BrandHeader />
      <section className="hero-spotlight content-max relative flex min-h-[calc(100svh-8.6rem)] max-w-5xl flex-col items-center justify-center overflow-hidden rounded-[28px] border border-[rgba(122,74,46,0.12)] text-center sm:min-h-[calc(100svh-10.5rem)] lg:min-h-[calc(100svh-11rem)]">
        <img
          src="/brand/hero-painting-bg.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,234,0.42),rgba(244,239,234,0.62))]" />
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-5 sm:px-8 sm:py-7">
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: [0.4, 0, 0.2, 1] }}
            className="mb-3 rounded-full border border-[var(--brand-light)] bg-white/75 px-4 py-2 font-body text-[10px] uppercase tracking-[0.2em] text-[var(--brand-brown)] sm:mb-4 sm:px-5 sm:text-xs sm:tracking-[0.22em]"
          >
            Painting Marketplace
          </motion.p>

          <motion.img
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            src="/brand/artlor-logo.png"
            alt="Artlor logo"
            className="brand-logo-round brand-logo-hero mb-3 sm:mb-4"
          />

          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="ink-title font-display text-[1.9rem] leading-tight sm:text-5xl lg:text-7xl"
          >
            Art That Lives On Your Walls
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="text-brand-brown/90 mt-4 max-w-2xl px-1 font-body text-sm sm:mt-5 sm:text-lg"
          >
            Discover local artists. Commission custom paintings. Delivered to your door.
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="mt-5 sm:mt-7"
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [0, -5, 0],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: 2.1,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'loop',
                    }
              }
              style={{ willChange: 'transform' }}
              className="inline-flex rounded-full"
            >
              <Link
                to="/gallery"
                className="pill-btn pill-btn-primary rounded-full px-10 py-4 text-base sm:px-8 sm:py-3 sm:text-base"
              >
                Order Now →
              </Link>
            </motion.div>
            <p className="text-brand-brown/80 mt-4 font-body text-sm italic">
              Landscapes · Calligraphy · Abstract · Still Life
            </p>
          </motion.div>
        </div>
      </section>

      <section className="content-max mt-6 max-w-6xl pb-8 sm:mt-8">
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
                className="card-surface relative overflow-hidden p-6 sm:p-8"
              >
                <img
                  src={value.image}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,234,0.74),rgba(244,239,234,0.58))]" />
                <span className="icon-orb relative z-10 mx-auto">
                  <Icon className="text-brand-brown h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <h3 className="font-display text-brand-dark relative z-10 mt-5 text-2xl sm:text-3xl">
                  {value.title}
                </h3>
                <p className="text-brand-brown/85 relative z-10 mt-3 font-body text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="content-max mt-12 mb-8 max-w-6xl sm:mt-16 sm:mb-10">
        <h2 className="font-display text-brand-dark mb-6 text-center text-3xl sm:text-4xl">
          Explore Art Styles
        </h2>
        <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2">
          {styleCards.map((style) => (
            <motion.article
              key={style.name}
              whileHover={prefersReducedMotion ? {} : { scale: 1.04, filter: 'brightness(1.12)' }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="relative h-[280px] w-[220px] min-w-[220px] overflow-hidden rounded-[20px] border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.28)] sm:h-[300px] sm:w-[240px] sm:min-w-[240px]"
              style={{ backgroundColor: style.color }}
            >
              <img
                src={style.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.18),transparent_30%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/74 via-black/28 to-transparent" />
              <Link
                to={`/gallery?style=${encodeURIComponent(style.name)}`}
                className="absolute inset-0 z-10"
                aria-label={`Explore ${style.name} in gallery`}
              />
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
