import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BrandHeader from '../components/BrandHeader'
import SiteFooter from '../components/SiteFooter'

const filters = ['All', 'Landscape', 'Calligraphy', 'Abstract', 'Still Life']

const paintingData = [
  { id: 1, title: 'Forest Dawn', style: 'Landscape', artist: 'Aarav Menon', seed: 101 },
  { id: 2, title: 'Silent Dunes', style: 'Landscape', artist: 'Nisha Rawal', seed: 202 },
  { id: 3, title: 'Ink Prayer', style: 'Calligraphy', artist: 'Rehan Ali', seed: 303 },
  { id: 4, title: 'Gold Verse', style: 'Calligraphy', artist: 'Sana Khan', seed: 404 },
  { id: 5, title: 'Crimson Echo', style: 'Abstract', artist: 'Kabir Sethi', seed: 505 },
  { id: 6, title: 'Whispered Geometry', style: 'Abstract', artist: 'Maya Kapoor', seed: 606 },
  { id: 7, title: 'Pear Study', style: 'Still Life', artist: 'Tanvi Iyer', seed: 707 },
  { id: 8, title: 'Copper Pot Morning', style: 'Still Life', artist: 'Ishaan Dutta', seed: 808 },
  { id: 9, title: 'Valley Rain', style: 'Landscape', artist: 'Aditi Roy', seed: 909 },
]

function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const style = searchParams.get('style')
  const activeFilter = style && filters.includes(style) ? style : 'All'
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const selectFilter = (filter) => {
    if (filter === 'All') {
      setSearchParams({})
      return
    } 
    setSearchParams({ style: filter })
  }

  const paintings = useMemo(() => {
    if (activeFilter === 'All') {
      return paintingData
    }
    return paintingData.filter((painting) => painting.style === activeFilter)
  }, [activeFilter])

  return (
    <main className="paper-bg page-pad min-h-screen">
      <BrandHeader />
      <section className="content-max max-w-6xl">
        <article className="dark-luxe-card mb-7 p-5 sm:mb-8 sm:p-7">
          <p className="font-body text-xs uppercase tracking-[0.18em] text-[var(--brand-gold)]">
            Curated Collection
          </p>
          <h1 className="font-display mt-2 text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Find the piece that belongs to your wall.
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-[rgba(244,239,234,0.86)]">
            Browse by style, pick an artwork instantly, or request a custom interpretation from nearby artists.
          </p>
        </article>

        <motion.div
          className="mb-7 flex justify-center sm:mb-8"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, -4, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? {}
              : {
                  duration: 2.4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }
          }
        >
          <motion.button
            type="button"
            onClick={() => navigate('/order')}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            animate={
              prefersReducedMotion
                ? {}
                : {
                    boxShadow: [
                      '0 14px 28px rgba(122, 74, 46, 0.28), 0 0 0 rgba(201, 147, 74, 0)',
                      '0 22px 42px rgba(92, 49, 28, 0.36), 0 0 24px rgba(201, 147, 74, 0.25)',
                      '0 14px 28px rgba(122, 74, 46, 0.28), 0 0 0 rgba(201, 147, 74, 0)',
                    ],
                  }
            }
            transition={prefersReducedMotion ? {} : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="pill-btn rounded-full border border-[var(--brand-gold)]/45 bg-[linear-gradient(125deg,var(--brand-brown-deep)_0%,var(--brand-brown)_52%,var(--brand-gold)_100%)] px-7 py-3 text-sm font-semibold tracking-[0.01em] text-[var(--brand-cream)] sm:px-8 sm:text-base"
          >
            Customize Your Own
          </motion.button>
        </motion.div>

        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
          {filters.map((filter) => {
            const active = filter === activeFilter
            return (
              <button
                key={filter}
                type="button"
                onClick={() => selectFilter(filter)}
                className={`pill-btn shrink-0 border px-4 py-2 text-xs font-medium transition-colors duration-300 sm:px-5 sm:text-sm ${
                  active
                    ? 'bg-brand-brown border-brand-brown text-brand-cream'
                    : 'border-brand-brown text-brand-brown hover:bg-brand-brown/10'
                }`}
              >
                {filter}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paintings.map((painting, index) => (
            <motion.article
              key={painting.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: 1.03,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    }
              }
              className="group card-surface overflow-hidden border-[rgba(31,31,31,0.12)]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/artlor-${painting.seed}/900/600`}
                  alt={`${painting.title} by ${painting.artist}`}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
                <span className="absolute top-3 left-3 rounded-full bg-[rgba(122,74,46,0.85)] px-3 py-1 font-body text-[11px] text-white">
                  {painting.style}
                </span>

                <div className="pointer-events-auto absolute inset-x-0 bottom-0 p-3 opacity-100 transition duration-300 sm:pointer-events-none sm:opacity-0 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100">
                  <div className="rounded-2xl border border-white/40 bg-black/30 p-3 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => navigate('/quick-order', { state: { painting } })}
                      className="pill-btn pill-btn-primary w-full px-4 py-2 text-sm"
                    >
                      Order This
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display text-brand-dark text-2xl">{painting.title}</h3>
                <p className="text-brand-brown/80 mt-1 font-body text-sm">{painting.artist}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

export default Gallery
