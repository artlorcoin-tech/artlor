import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Image as ImageIcon, Sparkles } from 'lucide-react'
import BrandHeader from '../components/BrandHeader'
import SEO from '../components/SEO'
import GalleryReferenceModal from '../components/GalleryReferenceModal'
import { galleryPaintings as initialGalleryPaintings } from '../galleryPaintings'
import { publicUrl } from '../publicUrl'
import { supabaseGetGalleryReferences, supabaseGetGalleryPaintings } from '../lib/supabase'

const defaultFilters = ['All', 'Sceneries', 'Calligraphy', 'Abstract', 'Still Life']

function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const style = searchParams.get('style')
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const [paintingsData, setPaintingsData] = useState(initialGalleryPaintings)
  const [references, setReferences] = useState([])
  const [selectedPaintingForModal, setSelectedPaintingForModal] = useState(null)

  useEffect(() => {
    // Load dynamic paintings (with updated titles & categories)
    supabaseGetGalleryPaintings()
      .then((data) => {
        if (data && data.length > 0) setPaintingsData(data)
      })
      .catch((err) => console.warn('[Gallery] Error loading paintings:', err))

    // Load reference photos
    supabaseGetGalleryReferences()
      .then((data) => setReferences(data || []))
      .catch((err) => console.warn('[Gallery] Error loading references:', err))
  }, [])

  // Dynamically compute category filters
  const filters = useMemo(() => {
    const categories = new Set(defaultFilters)
    paintingsData.forEach((p) => {
      if (p.style) categories.add(p.style)
    })
    return Array.from(categories)
  }, [paintingsData])

  const activeFilter = style && filters.includes(style) ? style : 'All'

  const selectFilter = (filter) => {
    if (filter === 'All') {
      setSearchParams({})
      return
    }
    setSearchParams({ style: filter })
  }

  const paintings = useMemo(() => {
    if (activeFilter === 'All') {
      return paintingsData
    }
    return paintingsData.filter((painting) => painting.style === activeFilter)
  }, [activeFilter, paintingsData])


  const gallerySchema = useMemo(() => {
    const origin = window.location.origin
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Artlor Curated ${activeFilter === 'All' ? 'Art' : activeFilter} Gallery`,
      "description": `Browse our collection of handpainted ${activeFilter === 'All' ? 'sceneries, calligraphy, abstract and still life' : activeFilter.toLowerCase()} paintings. Buy wall art online India from local artists.`,
      "numberOfItems": paintings.length,
      "itemListElement": paintings.map((painting, index) => {
        const imagePath = painting.image.startsWith('/') ? painting.image : `/${painting.image}`
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "VisualArtwork",
            "name": painting.title,
            "creator": {
              "@type": "Person",
              "name": painting.artist
            },
            "genre": painting.style,
            "artform": "Painting",
            "artMedium": painting.style === 'Calligraphy' ? 'Acrylic, Ink' : 'Oil, Acrylic',
            "artworkSurface": "Canvas",
            "image": origin + imagePath
          }
        }
      })
    }
  }, [paintings, activeFilter])

  const galleryBreadcrumb = useMemo(() => {
    const paths = [{ name: 'Gallery', path: '/gallery' }]
    if (activeFilter !== 'All') {
      paths.push({ name: activeFilter, path: `/gallery?style=${encodeURIComponent(activeFilter)}` })
    }
    return paths
  }, [activeFilter])

  const selectedPaintingRefs = useMemo(() => {
    if (!selectedPaintingForModal) return []
    return references.filter((r) => String(r.painting_id) === String(selectedPaintingForModal.id))
  }, [references, selectedPaintingForModal])

  return (
    <main className="paper-bg page-pad min-h-screen">
      <SEO
        title={`${activeFilter === 'All' ? 'Paintings Gallery' : activeFilter + ' Paintings'} | Buy Wall Art Online India`}
        description={`Browse and buy handpainted ${activeFilter === 'All' ? 'sceneries, calligraphy, abstract and still life' : activeFilter.toLowerCase()} paintings online. Wall art & canvas paintings by local Indian artists.`}
        keywords={`buy paintings online India, ${activeFilter.toLowerCase()} paintings, wall paintings, canvas art, handmade paintings, wall art India, home decor paintings`}
        schemaData={gallerySchema}
        breadcrumbPaths={galleryBreadcrumb}
      />
      <BrandHeader />
      <section className="content-max max-w-6xl">
        <article className="art-frame-shadow relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[var(--brand-dark)] via-[#361f14] to-[var(--brand-brown-deep)] mb-8 p-6 text-white sm:p-9 shadow-[0_20px_50px_rgba(31,31,31,0.25)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[var(--brand-gold)]/20 to-transparent pointer-events-none" />
          <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-gold)]">
            Curated Collection
          </p>
          <h1 className="font-display mt-2 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl text-white">
            Find the piece that belongs to your wall.
          </h1>
          <p className="mt-3 max-w-2xl font-body text-sm font-medium text-white/80 leading-relaxed">
            Browse by style, inspect real customer reference photos, or request a custom interpretation from nearby Indian artists.
          </p>
        </article>

        <motion.div
          className="mb-10 flex justify-center"
          animate={
            prefersReducedMotion
              ? {}
              : {
                y: [0, -6, 0],
                rotate: [-1, 0, -1],
                scale: [1, 1.02, 1],
              }
          }
          transition={
            prefersReducedMotion
              ? {}
              : {
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
              }
          }
        >
          <motion.button
            type="button"
            onClick={() => navigate('/order')}
            whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotate: -1.5 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
            animate={
              prefersReducedMotion
                ? {}
                : {
                  boxShadow: [
                    '0 12px 35px rgba(31, 14, 7, 0.7), 0 0 15px rgba(201, 147, 74, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
                    '0 20px 50px rgba(31, 14, 7, 0.9), 0 0 28px rgba(201, 147, 74, 0.6), inset 0 3px 6px rgba(255, 255, 255, 0.35)',
                    '0 12px 35px rgba(31, 14, 7, 0.7), 0 0 15px rgba(201, 147, 74, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
                  ],
                }
            }
            transition={prefersReducedMotion ? {} : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="group relative -rotate-1 inline-flex items-center justify-center rounded-full border-2 border-[var(--brand-gold)] bg-[linear-gradient(135deg,#1f0e07_0%,#3d1e10_50%,#26130a_100%)] backdrop-blur-2xl px-6 py-2.5 shadow-2xl transition-all duration-300 sm:px-8 sm:py-3 cursor-pointer overflow-hidden"
          >
            {/* Deep Dark Brown Ambient Glass Glow */}
            <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[var(--brand-brown-deep)]/80 via-[var(--brand-gold)]/50 to-[#1f0e07]/90 blur-lg opacity-85 group-hover:opacity-100 transition duration-500 animate-pulse pointer-events-none" />

            {/* Top Glossy Glass Reflection */}
            <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none" />

            {/* High-Contrast Fluff Plush Font Text */}
            <span
              className="relative z-10 font-plush text-lg font-bold tracking-wider text-[#fef3c7] drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)] sm:text-xl"
              style={{ fontFamily: "'Fluff Plush', 'FluffPlush', 'DynaPuff', 'Bubblegum Sans', 'Sniglet', cursive, sans-serif" }}
            >
              Customise from Scratch!
            </span>
          </motion.button>
        </motion.div>

        {/* Filter Pills */}
        <div className="no-scrollbar mb-8 flex gap-2.5 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:gap-3">
          {filters.map((filter) => {
            const active = filter === activeFilter
            return (
              <button
                key={filter}
                type="button"
                onClick={() => selectFilter(filter)}
                className={`pill-btn shrink-0 rounded-full border px-5 py-2 text-xs font-semibold tracking-wide transition-all duration-300 sm:px-6 sm:text-sm ${active
                  ? 'bg-gradient-to-r from-[var(--brand-brown-deep)] to-[var(--brand-gold)] text-white border-transparent shadow-[0_6px_20px_rgba(122,74,46,0.3)]'
                  : 'border-[rgba(122,74,46,0.2)] bg-white/80 text-[var(--brand-brown)] hover:bg-[var(--brand-cream)] hover:border-[var(--brand-gold)]'
                  }`}
              >
                {filter}
              </button>
            )
          })}
        </div>

        {/* Artwork Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paintings.map((painting, index) => {
            const itemRefs = references.filter((r) => String(r.painting_id) === String(painting.id))
            const refCount = itemRefs.length

            return (
              <motion.article
                key={painting.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                className="art-frame-shadow group relative overflow-hidden rounded-[24px] bg-white cursor-pointer"
                onClick={() => setSelectedPaintingForModal(painting)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={publicUrl(painting.image)}
                    alt={`${painting.title} by ${painting.artist}`}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={index < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70 transition-opacity duration-300 group-hover:opacity-90" />

                  {/* Style Badge */}
                  <span className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 font-body text-[11px] font-semibold text-white backdrop-blur-md">
                    {painting.style}
                  </span>

                  {/* Reference Photos Count Badge */}
                  {refCount > 0 && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-[var(--brand-gold)]/40 bg-black/65 px-2.5 py-1 font-body text-[10px] font-bold text-amber-200 backdrop-blur-md">
                      <ImageIcon className="h-3 w-3 text-[var(--brand-gold)]" />
                      {refCount} {refCount === 1 ? 'Reference' : 'References'}
                    </span>
                  )}

                  {/* Quick Action Overlay */}
                  <div className="pointer-events-auto absolute inset-x-0 bottom-0 p-3 opacity-100 transition duration-300 sm:pointer-events-none sm:opacity-0 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100">
                    <div className="flex gap-2 rounded-2xl border border-white/30 bg-black/50 p-2 backdrop-blur-md">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPaintingForModal(painting)
                        }}
                        className="flex-1 rounded-xl border border-white/20 bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/25 transition"
                      >
                        Inspect Details
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate('/quick-order', { state: { painting } })
                        }}
                        className="pill-btn pill-btn-primary flex-1 py-2 text-xs font-bold shadow-md"
                      >
                        Order This
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between bg-white">
                  <div>
                    <h3 className="font-display text-[var(--brand-dark)] text-xl font-bold">{painting.title || painting.style || 'Artwork'}</h3>
                    <p className="text-[var(--brand-brown)]/80 mt-0.5 font-body text-xs font-medium">{painting.style} by {painting.artist || 'Artlor Artist'}</p>
                  </div>

                  {refCount > 0 && (
                    <span className="text-[10px] font-body font-bold text-[var(--brand-brown)] bg-[var(--brand-cream)] px-2.5 py-1 rounded-full border border-[var(--brand-gold)]/30">
                      {refCount} photos
                    </span>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      {/* Reference & Artwork Lightbox Modal */}
      {selectedPaintingForModal && (
        <GalleryReferenceModal
          painting={selectedPaintingForModal}
          references={selectedPaintingRefs}
          onClose={() => setSelectedPaintingForModal(null)}
        />
      )}
    </main>
  )
}

export default Gallery

