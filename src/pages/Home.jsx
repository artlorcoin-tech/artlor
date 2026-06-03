import { motion, useReducedMotion } from 'framer-motion'
import { Brush, MapPinHouse, PackageCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandHeader from '../components/BrandHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { galleryImages } from '../galleryPaintings'
import { publicUrl } from '../publicUrl'

const values = [
  {
    title: 'Local Artists',
    description: 'Handpicked talent from your city, matched to your vision.',
    icon: MapPinHouse,
    image: galleryImages.landscapeVintageHammad,
  },
  {
    title: 'Fully Custom',
    description: 'You describe it, we paint it. Every detail, your way.',
    icon: Brush,
    image: galleryImages.calligraphyNikahMuntaza,
  },
  {
    title: 'Wall-Ready Art',
    description: 'Delivered stretched, framed, and ready to hang.',
    icon: PackageCheck,
    image: galleryImages.calligraphyCustomMuntaza,
  },
]

const styleCards = [
  {
    name: 'Landscape',
    image: galleryImages.landscapeBridgeHammad,
  },
  {
    name: 'Calligraphy',
    image: galleryImages.calligraphyAllahMaryam,
  },
  {
    name: 'Abstract',
    image: galleryImages.abstractMonoMuntaza,
  },
  {
    name: 'Still Life',
    image: galleryImages.stillLifeSeebah,
  },
]

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://artlor.art/#webpage",
  "url": "https://artlor.art/",
  "name": "Artlor — Custom Handpainted Art Commissions & Paintings India",
  "description": "Commission high-quality, fully custom handpainted artwork from handpicked local artists in India. Delivered framed, stretched, and ready to hang on your wall.",
  "isPartOf": {
    "@id": "https://artlor.art/#website"
  }
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does commissioning a custom painting work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "First, select your preferred art style (Landscape, Calligraphy, Abstract, or Still Life) and choice of size. Give us details about your delivery address and contact info. We will then match you with a talented local artist who specializes in that style. The artist will begin work after a quick confirmation call with you, and deliver it to your door in 7-14 days."
      }
    },
    {
      "@type": "Question",
      "name": "What art styles do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We currently offer high-quality custom Landscape paintings, Calligraphy artwork (including custom Nikah boards and gold script), monochrome or flow Abstract paintings, and vibrant Still Life paintings."
      }
    },
    {
      "@type": "Question",
      "name": "Is the artwork delivered ready to hang?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! All custom paintings commissioned through Artlor are delivered fully stretched, framed, and completely wall-ready so you can hang them immediately."
      }
    },
    {
      "@type": "Question",
      "name": "Do you deliver all over India? What are the shipping charges?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we ship custom paintings and calligraphy boards to all pincodes across India, including New Delhi, Mumbai, Bangalore, Pune, Hyderabad, Kolkata, Chennai, and other states. Shipping is 100% free, and we package every canvas in reinforced wooden crates or safe shipping tubes."
      }
    }
  ]
}

function Home() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <main className="paper-bg page-pad min-h-screen">
      <SEO
        title="Custom Paintings & Art Commissions Online India"
        description="Commission high-quality, fully custom handpainted artwork from handpicked local Indian artists. Delivered framed and ready to hang in Delhi, Mumbai, Bangalore & across India."
        keywords="custom paintings India, commission art Mumbai, calligraphy painting Delhi, Nikah board calligraphy Bangalore, local artists India, handmade canvas paintings, buy paintings online India"
        schemaData={[homeSchema, faqSchema]}
      />
      <BrandHeader />
      <section className="hero-spotlight content-max relative flex min-h-[calc(100svh-8.6rem)] max-w-5xl flex-col items-center justify-center overflow-hidden rounded-[28px] border border-[rgba(122,74,46,0.12)] text-center sm:min-h-[calc(100svh-10.5rem)] lg:min-h-[calc(100svh-11rem)]">
        <img
          src={publicUrl(galleryImages.calligraphyGoldMuntaza)}
          alt="Gilded Script Arabic Calligraphy Painting background"
          aria-hidden="true"
          loading="eager"
          decoding="async"
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
            src={publicUrl('brand/artlor-logo.png')}
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
            Discover handpicked local artists in India. Commission custom canvas paintings, calligraphy boards & modern abstract art. Delivered wall-ready to Srinagar,Delhi, Mumbai, Bangalore, and nationwide.
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
                  src={publicUrl(value.image)}
                  alt={`${value.title} custom painting style showcase`}
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
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
              className="relative h-[280px] w-[220px] min-w-[220px] overflow-hidden rounded-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.28)] sm:h-[300px] sm:w-[240px] sm:min-w-[240px]"
            >
              <img
                src={publicUrl(style.image)}
                alt={`${style.name} custom art category selection`}
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
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

      {/* Visually Stunning, Highly Premium & SEO-Optimized FAQ Section */}
      <section className="content-max mt-16 mb-12 max-w-4xl border-t border-[rgba(122,74,46,0.12)] pt-12 sm:mt-20">
        <h2 className="font-display text-brand-dark mb-8 text-center text-3xl sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <details className="group rounded-[20px] bg-white/50 p-5 shadow-sm transition duration-300 hover:bg-white/80 border border-[var(--brand-light)]">
            <summary className="font-display text-brand-dark text-base sm:text-lg font-semibold cursor-pointer list-none flex justify-between items-center outline-none">
              How does commissioning a custom painting work?
              <span className="text-[var(--brand-gold)] font-bold text-xl group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed pl-1">
              First, select your preferred art style (Landscape, Calligraphy, Abstract, or Still Life) and choice of size. Give us details about your delivery address and contact info. We will then match you with a talented local artist who specializes in that style. The artist will begin work after a quick confirmation call with you, and deliver it to your door in 7-14 days.
            </p>
          </details>
          <details className="group rounded-[20px] bg-white/50 p-5 shadow-sm transition duration-300 hover:bg-white/80 border border-[var(--brand-light)]">
            <summary className="font-display text-brand-dark text-base sm:text-lg font-semibold cursor-pointer list-none flex justify-between items-center outline-none">
              What art styles do you offer?
              <span className="text-[var(--brand-gold)] font-bold text-xl group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed pl-1">
              We currently offer high-quality custom Landscape paintings, Calligraphy artwork (including custom Nikah boards and gold script), monochrome or flow Abstract paintings, and vibrant Still Life paintings.
            </p>
          </details>
          <details className="group rounded-[20px] bg-white/50 p-5 shadow-sm transition duration-300 hover:bg-white/80 border border-[var(--brand-light)]">
            <summary className="font-display text-brand-dark text-base sm:text-lg font-semibold cursor-pointer list-none flex justify-between items-center outline-none">
              Is the artwork delivered ready to hang?
              <span className="text-[var(--brand-gold)] font-bold text-xl group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed pl-1">
              Yes! All custom paintings commissioned through Artlor are delivered fully stretched, framed, and completely wall-ready so you can hang them immediately.
            </p>
          </details>
          <details className="group rounded-[20px] bg-white/50 p-5 shadow-sm transition duration-300 hover:bg-white/80 border border-[var(--brand-light)]">
            <summary className="font-display text-brand-dark text-base sm:text-lg font-semibold cursor-pointer list-none flex justify-between items-center outline-none">
              Do you deliver all over India? What are the shipping charges?
              <span className="text-[var(--brand-gold)] font-bold text-xl group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed pl-1">
              Yes, we ship custom commissions and calligraphy boards to all pincodes in India (including New Delhi, Mumbai, Bangalore, Pune, Hyderabad, Chennai, Kolkata, and tier-2/3 towns). Shipping is 100% free with no hidden charges, and every package is shipped in a reinforced wooden crate or secure tube.
            </p>
          </details>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default Home
