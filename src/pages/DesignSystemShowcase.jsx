import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Info, Palette, Type, SquareDot, ArrowRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const SWATCHES = [
  { name: 'Primary (Brown)', hex: '#7A4A2E', role: 'Main branding, titles, solid filled buttons, core styling contrast' },
  { name: 'Secondary (Terracotta)', hex: '#C4916A', role: 'Secondary branding, borders, hover badges, text accents' },
  { name: 'Accent (Ivory)', hex: '#F5E6D3', role: 'Light cards backdrop, hover states, badges, highlight panels' },
  { name: 'Background (Warm White)', hex: '#FDFAF6', role: 'Page baseline background, card bodies, clean margins' },
  { name: 'Text Dark (Espresso)', hex: '#2A1A10', role: 'Primary typography color for maximum readability and luxury look' },
  { name: 'Text Muted', hex: '#6E5A4E', role: 'Body summaries, metadata labels, secondary descriptors' }
]

function DesignSystemShowcase() {
  const [copiedHex, setCopiedHex] = useState('')

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(''), 2000)
  }

  return (
    <div className="min-h-screen bg-[#FDFAF6] py-12 px-4 sm:px-6 lg:px-8 font-body text-[#2A1A10]">
      {/* 1. Sticky Nav Header Utility Preview */}
      <div className="w-full max-w-5xl mx-auto mb-16">
        <div className="text-xs uppercase tracking-[0.2em] text-[#C4916A] mb-3 text-center font-semibold">Nav Header Utility In Action</div>
        <header className="nav-header-luxe flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Embedded Logo Icon */}
            <svg viewBox="0 0 200 200" className="w-9 h-9" fill="none">
              <linearGradient id="brushPrimaryShow" x1="0%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stop-color="#5A331E" />
                <stop offset="100%" stop-color="#7A4A2E" />
              </linearGradient>
              <linearGradient id="brushSecondaryShow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#C4916A" />
                <stop offset="100%" stop-color="#7A4A2E" />
              </linearGradient>
              <g transform="translate(15, 10) scale(0.95)">
                <path d="M 42 115 C 43 100, 48 72, 66 43 C 71 35, 77 28, 83 22 C 86 19, 89 17, 91 15 C 91 15, 92 14, 93 14 L 95 16 C 95 16, 92 22, 88 32 C 82 50, 77 75, 74 115 Z" fill="url(#brushPrimaryShow)" />
                <path d="M 93 14 C 93 14, 99 21, 106 29 C 117 42, 126 62, 134 85 C 141 102, 144 116, 141 120 C 137 124, 129 120, 122 113 C 111 102, 102 85, 95 68 Z" fill="url(#brushSecondaryShow)" />
                <path d="M 58 78 C 66 75, 82 73, 104 77 C 110 78, 116 79, 118 80 C 120 81, 118 85, 111 86 C 95 89, 72 88, 58 83 C 56 82, 56 79, 58 78 Z" fill="#C4916A" />
                <path d="M 111 84 Q 111 96, 107 101 A 5 5 0 1 0 115 101 Q 111 96, 111 84 Z" fill="#C4916A" />
              </g>
            </svg>
            <span className="font-heading text-xl font-bold text-[#7A4A2E]">Artlor</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <span className="nav-link-luxe active">Showcase</span>
            <Link to="/" className="nav-link-luxe">Back to Site</Link>
          </nav>
          <div>
            <Link to="/" className="btn-luxe btn-luxe-primary !px-5 !py-2.5 !text-[11px] tracking-[0.06em]">
              Return Home
            </Link>
          </div>
        </header>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Intro */}
        <div className="text-center mb-16">
          <span className="badge-luxe mb-4">Design System Specification</span>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-[#7A4A2E] tracking-tight mb-4">
            artlor.art Design System
          </h1>
          <p className="font-body text-lg text-[#6E5A4E] max-w-2xl mx-auto">
            A cohesive collection of CSS tokens, luxury color combinations, elegant serif &amp; sans-serif font pairings, and interactive components.
          </p>
        </div>

        {/* 2. Color Palette Section */}
        <section className="mb-20">
          <div className="flex items-center gap-3 border-b border-[#7A4A2E]/10 pb-4 mb-8">
            <Palette className="w-6 h-6 text-[#7A4A2E]" />
            <h2 className="font-heading text-3xl font-bold text-[#7A4A2E]">Color Architecture</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SWATCHES.map((swatch) => (
              <div 
                key={swatch.hex}
                className="bg-white rounded-3xl border border-[#7A4A2E]/12 overflow-hidden shadow-[0_4px_20px_rgba(122,74,46,0.03)] hover:shadow-[0_12px_36px_rgba(122,74,46,0.08)] transition-all duration-300"
              >
                <div 
                  className="h-32 w-full transition-transform duration-300 hover:scale-[1.02]" 
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-heading text-lg font-bold text-[#2A1A10]">{swatch.name}</span>
                    <button 
                      onClick={() => handleCopy(swatch.hex)}
                      className="text-[#6E5A4E] hover:text-[#7A4A2E] transition-colors p-1.5 rounded-lg hover:bg-[#F5E6D3]/30"
                      title="Copy HEX to clipboard"
                    >
                      {copiedHex === swatch.hex ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <code className="text-xs text-[#7A4A2E] font-semibold block mb-3">{swatch.hex}</code>
                  <p className="text-xs text-[#6E5A4E] leading-relaxed">{swatch.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Typography Showcase */}
        <section className="mb-20">
          <div className="flex items-center gap-3 border-b border-[#7A4A2E]/10 pb-4 mb-8">
            <Type className="w-6 h-6 text-[#7A4A2E]" />
            <h2 className="font-heading text-3xl font-bold text-[#7A4A2E]">Typography Pairing</h2>
          </div>

          <div className="bg-white border border-[#7A4A2E]/12 rounded-3xl p-6 sm:p-10 shadow-[0_4px_20px_rgba(122,74,46,0.03)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Headings */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#C4916A] mb-4 font-bold">Heading Font: Cormorant Garamond</h3>
                <div className="space-y-4 font-heading text-[#2A1A10]">
                  <h1 className="text-5xl font-bold border-b border-[#7A4A2E]/5 pb-2">H1 Header Large (5xl)</h1>
                  <h2 className="text-4xl font-bold border-b border-[#7A4A2E]/5 pb-2">H2 Section Header (4xl)</h2>
                  <h3 className="text-3xl font-semibold border-b border-[#7A4A2E]/5 pb-2">H3 Subsection (3xl)</h3>
                  <h4 className="text-2xl font-semibold">H4 Segment (2xl)</h4>
                  <p className="italic text-lg text-[#7A4A2E]">Classical Serif style ideal for luxury custom art headlines</p>
                </div>
              </div>

              {/* Body */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#C4916A] mb-4 font-bold">Body Font: DM Sans</h3>
                <div className="space-y-4 font-body text-[#6E5A4E] leading-relaxed text-sm">
                  <p className="text-base font-medium text-[#2A1A10]">
                    Medium weight (16px) - DM Sans provides a clean, elegant sans-serif base that pairs perfectly with serif headings.
                  </p>
                  <p>
                    Regular weight (14px) - Used for description fields, custom inputs, list styles, and card bodies. Highly legible and maintains optimal spacing guidelines.
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#C4916A]">
                    Small Labels &amp; Badges (12px) - Used for small uppercase highlights, metadata descriptors, and badges.
                  </p>
                  <div className="border border-[#7A4A2E]/8 rounded-xl p-4 bg-[#FDFAF6]">
                    <span className="font-heading block text-[#2A1A10] font-bold text-base mb-1">Pairing Integration Code:</span>
                    <code className="text-xs block text-[#7A4A2E] overflow-x-auto whitespace-pre">
                      font-family: var(--font-headings); /* Cormorant Garamond */<br />
                      font-family: var(--font-body);     /* DM Sans */
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Interactive Components Showcase */}
        <section className="mb-20">
          <div className="flex items-center gap-3 border-b border-[#7A4A2E]/10 pb-4 mb-8">
            <SquareDot className="w-6 h-6 text-[#7A4A2E]" />
            <h2 className="font-heading text-3xl font-bold text-[#7A4A2E]">Utility Components</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buttons Swatches */}
            <div className="card-luxe">
              <h3 className="card-luxe-title">Button Utilities</h3>
              <p className="card-luxe-body mb-8">
                Designed to support luxurious touchpoints. Features micro-elevation animations and active state shrinkages.
              </p>

              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#C4916A] block mb-3 font-semibold">Primary Filled (.btn-luxe-primary)</span>
                  <div className="flex flex-wrap gap-4 items-center">
                    <button className="btn-luxe btn-luxe-primary">Primary Filled</button>
                    <button className="btn-luxe btn-luxe-primary" disabled>Disabled</button>
                  </div>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-[#C4916A] block mb-3 font-semibold">Secondary Outlined (.btn-luxe-secondary)</span>
                  <div className="flex flex-wrap gap-4 items-center">
                    <button className="btn-luxe btn-luxe-secondary">Secondary Outlined</button>
                    <button className="btn-luxe btn-luxe-secondary" disabled>Disabled</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Showcase */}
            <div className="card-luxe card-luxe-interactive">
              <span className="badge-luxe mb-4">Interactive Luxe Card</span>
              <h3 className="card-luxe-title">Card Component</h3>
              <p className="card-luxe-body mb-6">
                Standard container `.card-luxe` with custom borders, ivory interior colors, and standard padding. Add `.card-luxe-interactive` for scale-lift translation and ambient gradient glow expansion.
              </p>
              <div className="flex items-center gap-2 text-[#7A4A2E] font-bold text-xs uppercase tracking-wider">
                <span>Hover over this card</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. SVG Logo Concept */}
        <section className="mb-20">
          <div className="flex items-center gap-3 border-b border-[#7A4A2E]/10 pb-4 mb-8">
            <Info className="w-6 h-6 text-[#7A4A2E]" />
            <h2 className="font-heading text-3xl font-bold text-[#7A4A2E]">SVG Brand Logo Concept</h2>
          </div>

          <div className="bg-white border border-[#7A4A2E]/12 rounded-3xl p-6 sm:p-10 shadow-[0_4px_20px_rgba(122,74,46,0.03)] text-center">
            <p className="text-sm text-[#6E5A4E] max-w-xl mx-auto mb-8">
              A stylized vector representation of the letter <strong>A</strong> behaving as a paint brush tip, coupled with the wordmark "Artlor" and tagline in Cormorant Garamond and DM Sans.
            </p>

            <div className="border border-[#7A4A2E]/8 rounded-2xl p-6 mb-8 bg-[#FDFAF6] inline-flex items-center justify-center max-w-full">
              {/* Full SVG Logo embed */}
              <img src="/brand/artlor-logo.svg" alt="Artlor Paint Brush A Logo Concept" className="max-w-[320px] sm:max-w-[420px] h-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="border border-[#7A4A2E]/8 rounded-2xl p-5 bg-[#FDFAF6]">
                <h4 className="font-heading text-[#7A4A2E] font-bold text-lg mb-2">Paint Brush Apex</h4>
                <p className="text-xs text-[#6E5A4E] leading-relaxed">
                  The intersection of the A represents a high-gloss point formed by soft brush bristles tapering off to capture the essence of fine paintings.
                </p>
              </div>

              <div className="border border-[#7A4A2E]/8 rounded-2xl p-5 bg-[#FDFAF6]">
                <h4 className="font-heading text-[#7A4A2E] font-bold text-lg mb-2">Branding Typography</h4>
                <p className="text-xs text-[#6E5A4E] leading-relaxed">
                  Wordmark utilizes <em>Cormorant Garamond</em> with precise spacing, bringing classical museum-grade prestige to the brand name.
                </p>
              </div>

              <div className="border border-[#7A4A2E]/8 rounded-2xl p-5 bg-[#FDFAF6]">
                <h4 className="font-heading text-[#7A4A2E] font-bold text-lg mb-2">Color Splatters</h4>
                <p className="text-xs text-[#6E5A4E] leading-relaxed">
                  The crossbar represents a terracotta paint sweep `#C4916A` containing a teardrop droplet accent, emphasizing the handmade artisan origin.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <a href="/brand/artlor-logo.svg" target="_blank" rel="noreferrer" className="btn-luxe btn-luxe-secondary inline-flex items-center gap-2">
                <span>Open Raw SVG</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DesignSystemShowcase
