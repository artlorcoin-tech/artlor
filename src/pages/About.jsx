import { motion, useReducedMotion } from 'framer-motion'
import { Award, Brush, Sparkles, Users } from 'lucide-react'
import BrandHeader from '../components/BrandHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { publicUrl } from '../publicUrl'
import { galleryImages } from '../galleryPaintings'

const founders = [
  {
    name: 'Hammad Riyaz',
    role: 'Co-Founder & Lead Curator',
    bio: 'An art enthusiast dedicated to bridging the gap between local master painters and art collectors. Hammad oversees curation and artist collaborations, ensuring every commissioned canvas aligns with our collectors\' highest standards.',
    social: 'https://instagram.com/hammadriyaz_',
  },
  {
    name: 'Muneef',
    role: 'Co-Founder & Technology Lead',
    bio: 'Dedicated to building a seamless digital experience that connects collectors with local creative talent. Muneef guides the product development and logistics pipeline, ensuring safe, ready-to-hang deliveries across India.',
    social: 'https://instagram.com/m__un__ee_f',
  },
]

const artists = [
  {
    name: 'Maryam',
    specialty: 'Arabic Calligraphy & Nikah Boards',
    experience: '6+ Years',
    bio: 'Maryam specializes in traditional and modern Arabic Calligraphy. Her work on customized Nikah (marriage contract) boards combines intricate script with delicate gold accents, producing highly cherished family heirlooms.',
    image: galleryImages.calligraphyAllahMaryam,
  },
  {
    name: 'Muntaza',
    specialty: 'Gilded Calligraphy & Abstract Art',
    experience: '5+ Years',
    bio: 'Muntaza blends classical scripts with modern abstract fluid pours. Known for her shimmering gilded scripts, her work utilizes metallic foils and marble pours to create contemporary statements for modern spaces.',
    image: galleryImages.calligraphyGoldMuntaza,
  },
  {
    name: 'Hammad',
    specialty: 'Scenic Landscapes & Impressionism',
    experience: '8+ Years',
    bio: 'Hammad captures the beauty of nature through oil and acrylic landscape paintings. From vintage road scenes in autumn forests to tranquil bridge crossings over mountain streams, his canvases bring warmth to any interior.',
    image: galleryImages.landscapeBridgeHammad,
  },
  {
    name: 'Seebah',
    specialty: 'Still Life & Floral Acrylics',
    experience: '4+ Years',
    bio: 'Seebah produces vibrant floral compositions and rich still life studies. Her painting style features bold colors and layered textures that capture the freshness of botanicals in full bloom.',
    image: galleryImages.stillLifeSeebah,
  },
]

export default function About() {
  const prefersReducedMotion = useReducedMotion()
  const origin = window.location.origin

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${origin}/about/#webpage`,
    'url': `${origin}/about`,
    'name': 'About Artlor — Supporting Local Indian Artists',
    'description': 'Meet the founders Hammad Riyaz and Muneef, and our curated network of local painters across India bringing bespoke handpainted canvases directly to you.',
    'isPartOf': {
      '@id': `${origin}/#website`
    },
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Artlor',
      'logo': `${origin}/brand/artlor-logo.png`,
      'founder': founders.map(f => ({
        '@type': 'Person',
        'name': f.name,
        'jobTitle': 'Founder'
      }))
    }
  }

  const artistProfilesSchema = artists.map((artist, idx) => ({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${origin}/about/#artist-${artist.name.toLowerCase()}`,
    'url': `${origin}/about`,
    'mainEntity': {
      '@type': 'Person',
      'name': artist.name,
      'jobTitle': 'Artist',
      'knowsAbout': [artist.specialty, 'Painting', 'Fine Arts'],
      'description': artist.bio,
      'image': origin + '/' + artist.image
    }
  }))

  const breadcrumbs = [
    { name: 'About', path: '/about' }
  ]

  return (
    <main className="paper-bg page-pad min-h-screen">
      <SEO
        title="About Us — Supporting Local Artists & Handpainted Art"
        description="Learn about Artlor's mission to connect you with handpicked local artists in India. Meet founders Hammad Riyaz & Muneef and view our master painters."
        keywords="about artlor, hammad riyaz, muneef, custom art india, local art network, calligraphy artists delhi, landscape painters mumbai"
        schemaData={[aboutSchema, ...artistProfilesSchema]}
        breadcrumbPaths={breadcrumbs}
      />
      <BrandHeader />

      <section className="content-max max-w-4xl">
        {/* Page Hero */}
        <div className="text-center py-8 sm:py-12">
          <motion.span
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            className="icon-orb mx-auto mb-4"
          >
            <Brush className="text-brand-brown h-6 w-6" />
          </motion.span>
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            className="ink-title font-display text-4xl sm:text-5xl lg:text-6xl leading-tight"
          >
            The Artlor Story
          </motion.h1>
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-brown/85 mt-4 max-w-2xl mx-auto font-body text-base sm:text-lg"
          >
            We believe that art should live, breathe, and carry a soul. In a world saturated with digital prints and mass manufacturing, Artlor connects art collectors with master local artists across India to create bespoke, fully handpainted canvases.
          </motion.p>
        </div>

        {/* Mission Card */}
        <article className="dark-luxe-card p-6 sm:p-10 mb-12">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)] mb-2">Our Core Mission</p>
          <h2 className="font-display text-2xl sm:text-3xl text-white mb-4">Empowering Local Artists, Enriching Indian Homes</h2>
          <p className="font-body text-sm sm:text-base leading-relaxed text-white/90">
            Artlor is built on a simple foundation: supporting the immense talent of local painters while making high-quality custom commissions accessible. Every stroke of a brush on our canvases is executed by a real artist based in India, paid fairly, and celebrated for their creative genius. From vintage autumn roads to shimmering Arabic calligraphy boards, your order brings authentic art directly to your wall.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8 border-t border-white/10 pt-6">
            <div className="text-center">
              <Award className="h-6 w-6 text-[var(--brand-gold)] mx-auto mb-2" />
              <h4 className="font-display text-lg text-white">100% Handpainted</h4>
              <p className="font-body text-xs text-white/70">Real acrylic & oils</p>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 text-[var(--brand-gold)] mx-auto mb-2" />
              <h4 className="font-display text-lg text-white">Local Talent</h4>
              <p className="font-body text-xs text-white/70">Supporting Indian artists</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-6 w-6 text-[var(--brand-gold)] mx-auto mb-2" />
              <h4 className="font-display text-lg text-white">Bespoke Design</h4>
              <p className="font-body text-xs text-white/70">Customized to your room</p>
            </div>
            <div className="text-center">
              <div className="font-display text-lg font-bold text-[var(--brand-gold)] mb-1">7-14 Days</div>
              <h4 className="font-display text-sm text-white">Fast Nationwide</h4>
              <p className="font-body text-xs text-white/70">Framed & wall-ready</p>
            </div>
          </div>
        </article>

        {/* Founder's Message Section */}
        <section className="card-surface p-6 sm:p-10 mb-12 border-l-4 border-l-[var(--brand-gold)] relative overflow-hidden bg-white/70">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)] mb-3">A Message from Our Founder</p>
          <blockquote className="font-display text-lg sm:text-xl text-[var(--brand-dark)] italic leading-relaxed relative z-10 pl-1">
            &quot;In India, buying Paintings has never been easy. You are either forced to choose between buying million-dollar artworks or cheap, soul-less machine prints.
            Despite India being home to an incredible abundance of talented local artists, most artists lack the exposure to be discovered. Every artist tries their best on social media—some find a few commission orders, while others go completely unnoticed. It creates chaos for buyers and instability for artists.
            I founded Artlor to bridge this gap. We bring passionate art enthusiasts and handpicked local artists under one unified roof, matching you with the perfect artist for your vision. We remove the chaos, simplify custom art commissions, and open doors of opportunity for India&apos;s artistic talent.&quot;
          </blockquote>
          <div className="mt-5 flex items-center gap-3 relative z-10">
            <span className="font-body text-sm font-bold text-[var(--brand-dark)]">Hammad Riyaz</span>
            <span className="text-xs text-brand-brown/70 font-body">— Founder, Artlor</span>
          </div>
        </section>

        {/* Founders Section */}
        <section className="mb-16">
          <h2 className="font-display text-brand-dark text-3xl text-center mb-8">Meet the Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {founders.map((founder, idx) => (
              <article key={founder.name} className="card-surface p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-gold)] mb-1 block">
                    {founder.role}
                  </span>
                  <h3 className="font-display text-2xl text-[var(--brand-dark)] mb-3">{founder.name}</h3>
                  <p className="text-brand-brown/85 font-body text-sm leading-relaxed mb-4">{founder.bio}</p>
                </div>
                <a
                  href={founder.social}
                  target="_blank"
                  rel="noreferrer"
                  className="font-body text-xs font-semibold text-[var(--brand-brown)] hover:underline flex items-center gap-1 mt-2"
                >
                  Connect on LinkedIn & Instagram →
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Artists Section */}
        <section className="mb-12">
          <h2 className="font-display text-brand-dark text-3xl text-center mb-2">Our Master Painters</h2>
          <p className="text-brand-brown/80 font-body text-sm text-center mb-8 max-w-lg mx-auto">
            Get to know the highly skilled, handpicked talent behind your custom masterpieces.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artists.map((artist) => (
              <article key={artist.name} className="card-surface overflow-hidden flex flex-col sm:flex-row">
                <img
                  src={publicUrl(artist.image)}
                  alt={`${artist.specialty} artwork profile sample by ${artist.name}`}
                  className="w-full sm:w-[180px] h-[200px] sm:h-auto object-cover border-b sm:border-b-0 sm:border-r border-[rgba(122,74,46,0.12)]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-display text-2xl text-[var(--brand-dark)]">{artist.name}</h3>
                      <span className="rounded-full bg-[var(--brand-light)] px-2.5 py-0.5 font-body text-[10px] uppercase font-semibold tracking-wider text-[var(--brand-brown)]">
                        {artist.experience} exp
                      </span>
                    </div>
                    <p className="text-[var(--brand-gold)] font-body text-xs font-semibold mt-1 mb-2">
                      {artist.specialty}
                    </p>
                    <p className="text-brand-brown/85 font-body text-xs leading-relaxed">{artist.bio}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <SiteFooter />
    </main>
  )
}
