import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Brush, Mail, MapPin, MapPinHouse, MessageSquare, PackageCheck, Phone, Send, Sparkles } from 'lucide-react'
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
    name: 'Sceneries',
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
  "name": "Artlor — Buy Paintings Online India | Custom Wall Art & Canvas Paintings",
  "description": "Artlor is a platform that connects artists and clients to create custom handpainted paintings. Order custom sceneries, calligraphy art, abstract & still life paintings online. Delivered framed & wall-ready across India.",
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
      "name": "How do I order a custom painting from Artlor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "First, select your preferred art style (Sceneries, Calligraphy, Abstract, or Still Life) and choice of size. Give us details about your delivery address and contact info. We will then match you with a talented local artist who specializes in that style. The artist will begin work after a quick confirmation call with you, and deliver it to your door in 7-14 days."
      }
    },
    {
      "@type": "Question",
      "name": "What art styles do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer scenery paintings, calligraphy paintings (including Nikah boards and gold script calligraphy), abstract wall paintings, and still life & floral paintings. All are 100% handpainted on canvas by local Indian artists."
      }
    },
    {
      "@type": "Question",
      "name": "Is the artwork delivered ready to hang?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! All paintings ordered through Artlor are delivered fully stretched, framed, and completely wall-ready so you can hang them immediately."
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
  const heroRef = useRef(null)

  // 3D Scroll-driven transforms
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  })

  // 3D perspective tilt & scale shifts
  const heroRotateX = useTransform(smoothProgress, [0, 1], [0, 16])
  const heroScale = useTransform(smoothProgress, [0, 1], [1, 0.91])
  const heroY = useTransform(smoothProgress, [0, 1], [0, 45])
  const heroOpacity = useTransform(smoothProgress, [0, 0.85], [1, 0.55])

  // Parallax ambient orbs
  const orbY1 = useTransform(smoothProgress, [0, 1], [0, -140])
  const orbY2 = useTransform(smoothProgress, [0, 1], [0, 180])

  return (
    <main className="paper-bg page-pad min-h-screen relative overflow-x-hidden [perspective:1200px]">
      <SEO
        title="Buy Paintings Online India | Custom Wall Art & Canvas Paintings"
        description="Artlor is a platform that connects artists and clients to create custom handpainted paintings. Order custom sceneries, calligraphy art, abstract & still life paintings online. Delivered framed & wall-ready across India."
        keywords="buy paintings online India, wall paintings, canvas paintings, custom paintings India, handmade paintings, artists near me, wall art online, home decor paintings, landscape paintings, scenery paintings, calligraphy paintings, abstract paintings, still life paintings"
        schemaData={[homeSchema, faqSchema]}
      />
      <BrandHeader />

      {/* Floating 3D Ambient Orbs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            style={{ y: orbY1, willChange: 'transform' }}
            className="pointer-events-none absolute -left-20 top-40 z-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(201,147,74,0.18),transparent_70%)] blur-3xl"
          />
          <motion.div
            style={{ y: orbY2, willChange: 'transform' }}
            className="pointer-events-none absolute -right-20 top-[600px] z-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(122,74,46,0.14),transparent_70%)] blur-3xl"
          />
        </>
      )}

      {/* 3D Hero Spotlight Container */}
      <div ref={heroRef} className="relative z-10 [perspective:1200px]">
        <motion.section
          style={
            prefersReducedMotion
              ? {}
              : {
                  rotateX: heroRotateX,
                  scale: heroScale,
                  y: heroY,
                  opacity: heroOpacity,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity',
                }
          }
          className="hero-spotlight content-max relative flex min-h-[calc(100svh-8.6rem)] max-w-5xl flex-col items-center justify-center overflow-hidden rounded-[32px] border border-[rgba(122,74,46,0.18)] text-center shadow-[0_30px_90px_rgba(90,48,27,0.15)] sm:min-h-[calc(100svh-10.5rem)] lg:min-h-[calc(100svh-11rem)]"
        >
          <img
            src={publicUrl(galleryImages.calligraphyGoldMuntaza)}
            alt="Gilded Script Arabic Calligraphy Painting background"
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-1000 hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,234,0.42),rgba(244,239,234,0.65))]" />
          
          <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-5 sm:px-8 sm:py-7">
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14, rotateX: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="mb-3 rounded-full border border-[var(--brand-light)] bg-white/80 px-4 py-2 font-body text-[10px] uppercase tracking-[0.2em] text-[var(--brand-brown)] shadow-sm backdrop-blur-md sm:mb-4 sm:px-5 sm:text-xs sm:tracking-[0.22em]"
            >
              <Sparkles className="inline-block h-3.5 w-3.5 mr-1 text-[var(--brand-gold)]" /> Online Paintings Store
            </motion.p>

            <motion.img
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, rotateY: 30 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              src={publicUrl('brand/artlor-logo.png')}
              alt="Artlor logo"
              className="brand-logo-round brand-logo-hero mb-3 sm:mb-4 shadow-xl"
            />

            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22, rotateX: 25 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="ink-title font-display text-[1.9rem] leading-tight sm:text-5xl lg:text-7xl drop-shadow-sm"
            >
              Art That Lives On Your Walls
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="text-brand-brown/90 mt-4 max-w-2xl px-1 font-body text-sm sm:mt-5 sm:text-lg leading-relaxed"
            >
              Get your artwork made from talented artists in India. Commission custom canvas paintings, Sceneries, calligraphy boards & modern abstract art. Delivered wall-ready to Srinagar, Delhi, Mumbai, Bangalore, and pan India.
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.9 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="mt-6 sm:mt-8"
            >
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotateZ: 1 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="inline-flex rounded-full shadow-[0_12px_30px_rgba(201,147,74,0.3)]"
              >
                <Link
                  to="/gallery"
                  className="pill-btn pill-btn-primary rounded-full px-10 py-4 text-base sm:px-9 sm:py-3.5 sm:text-base font-bold tracking-wide"
                >
                  Order Now →
                </Link>
              </motion.div>
              <p className="text-brand-brown/80 mt-4 font-body text-sm italic font-medium">
                Sceneries · Calligraphy · Abstract · Still Life
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>

      <section className="content-max mt-6 max-w-6xl pb-8 sm:mt-8 [perspective:1000px]">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.article
                key={value.title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 35, rotateX: 18 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, rotateX: 0 }}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        rotateY: index % 2 === 0 ? -6 : 6,
                        rotateX: 6,
                        scale: 1.04,
                        z: 25,
                        boxShadow: '0 25px 50px rgba(90,48,27,0.18)',
                      }
                }
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                className="card-surface relative overflow-hidden p-6 sm:p-8 cursor-pointer [transform-style:preserve-3d]"
              >
                <img
                  src={publicUrl(value.image)}
                  alt={`${value.title} custom painting style showcase`}
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,234,0.74),rgba(244,239,234,0.58))]" />
                <span className="icon-orb relative z-10 mx-auto shadow-md">
                  <Icon className="text-brand-brown h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <h3 className="font-display text-brand-dark relative z-10 mt-5 text-2xl sm:text-3xl font-bold">
                  {value.title}
                </h3>
                <p className="text-brand-brown/85 relative z-10 mt-3 font-body text-sm leading-relaxed font-medium">
                  {value.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="content-max mt-12 mb-8 max-w-6xl sm:mt-16 sm:mb-10 [perspective:1000px]">
        <h2 className="font-display text-brand-dark mb-6 text-center text-3xl sm:text-4xl font-bold">
          Explore Art Styles
        </h2>
        <div className="no-scrollbar flex gap-5 overflow-x-auto pb-4 pt-2 px-1">
          {styleCards.map((style, idx) => (
            <motion.article
              key={style.name}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30, rotateY: idx % 2 === 0 ? -12 : 12 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, rotateY: 0 }}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                      rotateY: idx % 2 === 0 ? 10 : -10,
                      rotateX: -5,
                      scale: 1.07,
                      z: 30,
                      filter: 'brightness(1.1)',
                      boxShadow: '0 30px 60px rgba(0,0,0,0.38)',
                    }
              }
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08, ease: [0.4, 0, 0.2, 1] }}
              className="relative h-[280px] w-[220px] min-w-[220px] overflow-hidden rounded-[24px] shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:h-[300px] sm:w-[240px] sm:min-w-[240px] cursor-pointer [transform-style:preserve-3d]"
            >
              <img
                src={publicUrl(style.image)}
                alt={`${style.name} custom art category selection`}
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.22),transparent_35%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <Link
                to={`/gallery?style=${encodeURIComponent(style.name)}`}
                className="absolute inset-0 z-10"
                aria-label={`Explore ${style.name} in gallery`}
              />
              <div className="absolute right-0 bottom-0 left-0 p-5">
                <h3 className="font-display text-2xl text-white font-bold">{style.name}</h3>
                <span className="mt-1 inline-block font-body text-sm text-amber-200 font-semibold">Explore →</span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Founder's Message Section with 3D Reveal */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 40, rotateX: 14 }}
        whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="content-max mt-14 mb-10 max-w-5xl [perspective:1000px]"
      >
        <div className="luxe-glass-card relative overflow-hidden rounded-[32px] border border-[rgba(122,74,46,0.18)] p-7 sm:p-10 bg-gradient-to-br from-white/95 via-[var(--brand-cream)]/75 to-white/95 shadow-[0_20px_60px_rgba(122,74,46,0.12)] [transform-style:preserve-3d]">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-brown)] blur-md opacity-60 animate-pulse" />
              <img
                src={publicUrl('brand/hammad-riyaz.jpg')}
                alt="Hammad Riyaz - Founder of Artlor"
                className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-white object-cover shadow-2xl"
              />
              <span className="absolute bottom-1 right-1 rounded-full border border-[var(--brand-gold)] bg-black/85 px-2.5 py-0.5 font-body text-[10px] font-bold text-amber-200 backdrop-blur-md shadow-md">
                Founder
              </span>
            </div>

            <div className="flex-1 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--brand-gold)] animate-ping" />
                <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                  A Message from Our Founder
                </span>
              </div>

              <blockquote className="font-display text-base sm:text-lg text-[var(--brand-dark)] italic leading-relaxed pl-1">
                &quot;In India, buying Paintings has never been easy. You are either forced to choose between buying million-dollar artworks or cheap, soul-less machine prints.
                Despite India being home to an incredible abundance of talented local artists, most artists lack the exposure to be discovered.
                I founded Artlor to bridge this gap. We bring passionate art enthusiasts and handpicked local artists under one unified roof, matching you with the perfect artist for your vision.&quot;
              </blockquote>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(122,74,46,0.14)] pt-3">
                <div>
                  <h4 className="font-display text-sm font-bold text-[var(--brand-dark)]">Hammad Riyaz</h4>
                  <p className="font-body text-xs text-[var(--brand-brown)]/70">Founder &amp; Lead Curator, Artlor</p>
                </div>

                <Link
                  to="/about"
                  className="font-body text-xs font-bold text-[var(--brand-brown)] hover:text-[var(--brand-gold)] transition-colors flex items-center gap-1"
                >
                  Learn More About Our Journey →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Visually Stunning 3D Animated FAQ Section */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 35, rotateX: 12 }}
        whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="content-max mt-16 mb-12 max-w-4xl border-t border-[rgba(122,74,46,0.12)] pt-12 sm:mt-20 [perspective:1000px]"
      >
        <h2 className="font-display text-brand-dark mb-8 text-center text-3xl sm:text-4xl font-bold">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <details className="group rounded-[20px] bg-white/60 p-5 shadow-sm transition duration-300 hover:bg-white/90 border border-[var(--brand-light)] hover:shadow-md cursor-pointer">
            <summary className="font-display text-brand-dark text-base sm:text-lg font-semibold cursor-pointer list-none flex justify-between items-center outline-none">
              How does commissioning a custom painting work?
              <span className="text-[var(--brand-gold)] font-bold text-xl group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed pl-1 font-medium">
              First, select your preferred art style (Sceneries, Calligraphy, Abstract, or Still Life) and choice of size. Give us details about your delivery address and contact info. We will then match you with a talented local artist who specializes in that style. The artist will begin work after a quick confirmation call with you, and deliver it to your door in 7-14 days.
            </p>
          </details>
          <details className="group rounded-[20px] bg-white/60 p-5 shadow-sm transition duration-300 hover:bg-white/90 border border-[var(--brand-light)] hover:shadow-md cursor-pointer">
            <summary className="font-display text-brand-dark text-base sm:text-lg font-semibold cursor-pointer list-none flex justify-between items-center outline-none">
              What art styles do you offer?
              <span className="text-[var(--brand-gold)] font-bold text-xl group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed pl-1 font-medium">
              We currently offer high-quality custom Sceneries paintings, Calligraphy artwork (including custom Nikah boards and gold script), monochrome or flow Abstract paintings, and vibrant Still Life paintings.
            </p>
          </details>
          <details className="group rounded-[20px] bg-white/60 p-5 shadow-sm transition duration-300 hover:bg-white/90 border border-[var(--brand-light)] hover:shadow-md cursor-pointer">
            <summary className="font-display text-brand-dark text-base sm:text-lg font-semibold cursor-pointer list-none flex justify-between items-center outline-none">
              Is the artwork delivered ready to hang?
              <span className="text-[var(--brand-gold)] font-bold text-xl group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed pl-1 font-medium">
              Yes! All custom paintings commissioned through Artlor are delivered fully stretched, framed, and completely wall-ready so you can hang them immediately.
            </p>
          </details>
          <details className="group rounded-[20px] bg-white/60 p-5 shadow-sm transition duration-300 hover:bg-white/90 border border-[var(--brand-light)] hover:shadow-md cursor-pointer">
            <summary className="font-display text-brand-dark text-base sm:text-lg font-semibold cursor-pointer list-none flex justify-between items-center outline-none">
              Do you deliver all over India? What are the shipping charges?
              <span className="text-[var(--brand-gold)] font-bold text-xl group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="text-brand-brown/85 mt-3 font-body text-sm leading-relaxed pl-1 font-medium">
              Yes, we ship custom commissions and calligraphy boards to all pincodes in India (including New Delhi, Mumbai, Bangalore, Pune, Hyderabad, Chennai, Kolkata, and tier-2/3 towns). Shipping is 100% free with no hidden charges, and every package is shipped in a reinforced wooden crate or secure tube.
            </p>
          </details>
        </div>
      </motion.section>

      {/* 3D Elevated Contact & Connect Section */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 40, rotateX: 14 }}
        whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="content-max mt-16 mb-12 max-w-5xl [perspective:1000px]"
      >
        <div className="card-surface relative overflow-hidden rounded-[32px] border border-[rgba(122,74,46,0.18)] p-7 sm:p-10 shadow-[0_25px_60px_rgba(90,48,27,0.1)] bg-gradient-to-b from-white/95 via-[var(--brand-cream)]/60 to-white/95 [transform-style:preserve-3d]">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="icon-orb mx-auto mb-3 h-11 w-11 shadow-md">
              <MessageSquare className="text-[var(--brand-brown)] h-5 w-5" />
            </span>
            <h2 className="font-display text-brand-dark text-3xl sm:text-4xl leading-tight font-bold">
              Connect With Artlor
            </h2>
            <p className="text-brand-brown/85 mt-2.5 font-body text-sm sm:text-base font-medium">
              Have a custom painting inquiry, specific dimension request, or framing question? Reach out to our curation team anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Email card */}
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4, rotateY: -4 }}
              className="flex flex-col items-center text-center p-5 rounded-2xl border border-[var(--brand-light)] bg-white/80 shadow-sm transition-all backdrop-blur-sm"
            >
              <span className="icon-orb mb-3 h-10 w-10">
                <Mail className="h-4.5 w-4.5 text-[var(--brand-brown)]" />
              </span>
              <h3 className="font-display text-base font-bold text-[var(--brand-dark)]">Email Inquiry</h3>
              <a
                href="mailto:artlor.co.in@gmail.com"
                className="mt-1 font-body text-xs sm:text-sm font-semibold text-[var(--brand-brown)] underline decoration-[var(--brand-gold)]/50 underline-offset-2 hover:text-[var(--brand-gold)] transition"
              >
                artlor.co.in@gmail.com
              </a>
              <p className="mt-1 text-[11px] text-brand-brown/70 font-body">Replies within 12–24 hrs</p>
            </motion.div>

            {/* WhatsApp card */}
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4, rotateY: 0 }}
              className="flex flex-col items-center text-center p-5 rounded-2xl border border-[var(--brand-light)] bg-white/80 shadow-sm transition-all backdrop-blur-sm"
            >
              <span className="icon-orb mb-3 h-10 w-10">
                <Phone className="h-4.5 w-4.5 text-[var(--brand-brown)]" />
              </span>
              <h3 className="font-display text-base font-bold text-[var(--brand-dark)]">WhatsApp & Call</h3>
              <a
                href="https://wa.me/+919541666449"
                target="_blank"
                rel="noreferrer"
                className="mt-1 font-body text-xs sm:text-sm font-semibold text-[var(--brand-brown)] underline decoration-[var(--brand-gold)]/50 underline-offset-2 hover:text-[var(--brand-gold)] transition"
              >
                +91 95416 66449
              </a>
              <p className="mt-1 text-[11px] text-brand-brown/70 font-body">Direct artist consultation</p>
            </motion.div>

            {/* Pan-India Delivery card */}
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4, rotateY: 4 }}
              className="flex flex-col items-center text-center p-5 rounded-2xl border border-[var(--brand-light)] bg-white/80 shadow-sm transition-all backdrop-blur-sm"
            >
              <span className="icon-orb mb-3 h-10 w-10">
                <MapPin className="h-4.5 w-4.5 text-[var(--brand-brown)]" />
              </span>
              <h3 className="font-display text-base font-bold text-[var(--brand-dark)]">Pan-India Delivery</h3>
              <p className="mt-1 font-body text-xs sm:text-sm font-semibold text-[var(--brand-dark)]">
                Free Shipping Nationwide
              </p>
              <p className="mt-1 text-[11px] text-brand-brown/70 font-body">Delhi, Mumbai, Srinagar & all pincodes</p>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[rgba(122,74,46,0.12)]">
            <a
              href="https://wa.me/+919541666449"
              target="_blank"
              rel="noreferrer"
              className="pill-btn pill-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
            >
              <Phone className="h-3.5 w-3.5" />
              Chat on WhatsApp
            </a>
            <Link
              to="/contact"
              className="pill-btn border border-[var(--brand-brown)] bg-white/80 px-6 py-2.5 text-xs font-semibold text-[var(--brand-brown)] hover:bg-[var(--brand-brown)]/10 transition flex items-center gap-2 hover:scale-105"
            >
              <Send className="h-3.5 w-3.5" />
              Send Form Inquiry
            </Link>
            <Link
              to="/order"
              className="pill-btn border border-[var(--brand-gold)] bg-[var(--brand-gold)]/15 px-6 py-2.5 text-xs font-semibold text-[var(--brand-dark)] hover:bg-[var(--brand-gold)]/25 transition hover:scale-105"
            >
              Order Custom Artwork →
            </Link>
          </div>
        </div>
      </motion.section>

      <SiteFooter />
    </main>
  )
}

export default Home
