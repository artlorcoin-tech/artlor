import { Link } from 'react-router-dom'

const artlorLinks = [
  { label: 'Instagram', href: 'https://instagram.com/artlor.co', display: '@artlor.co' },
  { label: 'Facebook', href: 'https://facebook.com/artlor', display: 'artlor' },
  { label: 'Email', href: 'mailto:artlor.co.in@gmail.com', display: 'artlor.co.in@gmail.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/artlor', display: 'Artlor (company)' },
]

const founderLinks = [
  { label: 'Gmail', href: 'mailto:hammadriaz7879@gmail.com', display: 'hammadriaz7879@gmail.com' },
  { label: 'Instagram', href: 'https://instagram.com/hammadriyaz_', display: '@hammadriyaz_' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/hammadriyaz',
    display: 'linkedin.com/in/hammadriyaz',
  },
  { label: 'Whatsapp', href: 'https://wa.me/+919541666449', display: 'Chat on WhatsApp' }
]

function SiteFooter() {
  return (
    <footer className="page-pad mt-auto pb-8 pt-10" role="contentinfo" aria-label="Site Footer">
      <div className="content-max rounded-[32px] border border-[rgba(122,74,46,0.16)] bg-[rgba(253,250,246,0.85)] px-6 py-8 shadow-[0_16px_40px_rgba(90,48,27,0.08)] backdrop-blur-xl sm:px-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Column 1: About */}
          <section>
            <h2 className="font-display text-lg font-bold tracking-tight text-[var(--brand-dark)] sm:text-xl">
              About Artlor.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[var(--brand-brown)]/90 font-medium">
              Artlor connects art lovers with talented artists across India to commission custom handpainted canvas paintings, scenery art, calligraphy boards, and modern wall decor.
            </p>
            <ul className="mt-4 space-y-2 text-xs">
              {artlorLinks.slice(0, 3).map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                  <span className="font-semibold text-[var(--brand-brown)]">{item.label}:</span>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--brand-dark)] underline decoration-[var(--brand-gold)]/40 underline-offset-2 hover:text-[var(--brand-gold)] transition"
                  >
                    {item.display}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Column 2: Navigation Links */}
          <section>
            <h2 className="font-display text-lg font-bold tracking-tight text-[var(--brand-dark)] sm:text-xl">
              Explore
            </h2>
            <nav className="mt-3 flex flex-col space-y-2.5 text-xs sm:text-sm font-medium" aria-label="Footer navigation">
              <Link to="/" className="text-[var(--brand-dark)] hover:text-[var(--brand-gold)] transition">
                Home Page
              </Link>
              <Link to="/gallery" className="text-[var(--brand-dark)] hover:text-[var(--brand-gold)] transition">
                Curated Gallery
              </Link>
              <Link to="/order" className="text-[var(--brand-dark)] hover:text-[var(--brand-gold)] transition">
                Order Custom Painting
              </Link>
              <Link to="/about" className="text-[var(--brand-dark)] hover:text-[var(--brand-gold)] transition">
                About Our Artists
              </Link>
              <Link to="/contact" className="text-[var(--brand-dark)] hover:text-[var(--brand-gold)] transition">
                Contact Curation Team
              </Link>
            </nav>
          </section>

          {/* Column 3: Legal Policy Links */}
          <section>
            <h2 className="font-display text-lg font-bold tracking-tight text-[var(--brand-dark)] sm:text-xl">
              Trust & Legal
            </h2>
            <nav className="mt-3 flex flex-col space-y-2.5 text-xs sm:text-sm font-medium" aria-label="Footer legal links">
              <Link to="/privacy" className="text-[var(--brand-dark)] hover:text-[var(--brand-gold)] transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-[var(--brand-dark)] hover:text-[var(--brand-gold)] transition">
                Terms of Service
              </Link>
              <div className="pt-3 border-t border-[rgba(122,74,46,0.1)] text-xs text-[var(--brand-brown)]/85 leading-relaxed font-medium">
                Every canvas is delivered stretched, framed, and 100% wall-ready with free pan-India shipping.
              </div>
            </nav>
          </section>

          {/* Column 4: Founders info */}
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-base font-bold tracking-tight text-[var(--brand-dark)]">
                Founder: Hammad Riyaz
              </h2>
              <ul className="mt-2 space-y-2 text-xs">
                {founderLinks.slice(1).map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--brand-dark)] underline decoration-[var(--brand-gold)]/40 underline-offset-2 hover:text-[var(--brand-gold)] transition font-medium"
                    >
                      {item.display}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <p className="mt-10 border-t border-[rgba(122,74,46,0.12)] pt-6 text-center text-xs font-medium text-[var(--brand-brown)]/90">
          © {new Date().getFullYear()} Artlor. Buy Custom Canvas Paintings Online India. Delivered Framed & Wall-Ready.
        </p>
      </div>
    </footer>
  )
}

export default SiteFooter

