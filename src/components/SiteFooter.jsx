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
]

const muneefLinks = [
  {
    label: 'Gmail',
    href: 'mailto:muhammadmuneef2928@gmail.com',
    display: 'muhammadmuneef2928@gmail.com',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/m__un__ee_f',
    display: '@m__un__ee_f',
  },
  {
    label: 'LinkedIn',
    href: 'https://in.linkedin.com/in/muhammad-muneef',
    display: 'linkedin.com/in/muhammad-muneef',
  },
]

function SiteFooter() {
  return (
    <footer className="page-pad mt-auto pb-8 pt-10" role="contentinfo" aria-label="Site Footer">
      <div className="content-max rounded-[28px] border border-[rgba(31,31,31,0.08)] bg-[rgba(255,255,255,0.78)] px-6 py-8 shadow-[0_14px_35px_rgba(0,0,0,0.06)] backdrop-blur-md sm:px-8 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Column 1: About */}
          <section>
            <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--brand-dark)] sm:text-xl">
              About Artlor
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[var(--brand-brown)]">
              Artlor connects You with Artists across India to commission fully custom, wall-ready handpainted paintings, custom Nikah boards, Customised Calligraphy.
            </p>
            <ul className="mt-4 space-y-2 text-xs">
              {artlorLinks.slice(0, 3).map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                  <span className="font-semibold text-[var(--brand-brown)]/80">{item.label}:</span>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--brand-dark)] underline decoration-[var(--brand-light)] underline-offset-2 hover:text-[var(--brand-brown)] transition"
                  >
                    {item.display}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Column 2: Navigation Links */}
          <section>
            <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--brand-dark)] sm:text-xl">
              Explore
            </h2>
            <nav className="mt-3 flex flex-col space-y-2.5 text-sm" aria-label="Footer navigation">
              <Link to="/" className="text-[var(--brand-dark)] hover:text-[var(--brand-brown)] transition">
                Home Page
              </Link>
              <Link to="/gallery" className="text-[var(--brand-dark)] hover:text-[var(--brand-brown)] transition">
                Curated Gallery
              </Link>
              <Link to="/order" className="text-[var(--brand-dark)] hover:text-[var(--brand-brown)] transition">
                Commission Custom Art
              </Link>
              <Link to="/about" className="text-[var(--brand-dark)] hover:text-[var(--brand-brown)] transition">
                About Our Team
              </Link>
              <Link to="/contact" className="text-[var(--brand-dark)] hover:text-[var(--brand-brown)] transition">
                Contact Curation Team
              </Link>
            </nav>
          </section>

          {/* Column 3: Legal Policy Links */}
          <section>
            <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--brand-dark)] sm:text-xl">
              Legal Info
            </h2>
            <nav className="mt-3 flex flex-col space-y-2.5 text-sm" aria-label="Footer legal links">
              <Link to="/privacy" className="text-[var(--brand-dark)] hover:text-[var(--brand-brown)] transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-[var(--brand-dark)] hover:text-[var(--brand-brown)] transition">
                Terms of Service
              </Link>
              <div className="pt-3 border-t border-[rgba(31,31,31,0.06)] text-xs text-[var(--brand-brown)]/80 leading-relaxed">
                We deliver stretched & framed paintings ready to hang on your wall. Shipping nationwide across major Indian metros.
              </div>
            </nav>
          </section>

          {/* Column 4: Founders info */}
          <section className="space-y-5">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight text-[var(--brand-dark)]">
                Founder: Hammad Riyaz
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs">
                {founderLinks.slice(1).map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--brand-dark)] underline decoration-[var(--brand-light)] underline-offset-2 hover:text-[var(--brand-brown)] transition"
                    >
                      {item.display}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight text-[var(--brand-dark)]">
                Co-Founder: Muneef
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs">
                {muneefLinks.slice(1).map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--brand-dark)] underline decoration-[var(--brand-light)] underline-offset-2 hover:text-[var(--brand-brown)] transition"
                    >
                      {item.display}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <p className="mt-10 border-t border-[rgba(31,31,31,0.08)] pt-8 text-center text-xs text-[var(--brand-brown)]/90">
          © {new Date().getFullYear()} Artlor Art Network. Delivered Framed & Ready to Hang.
        </p>
      </div>
    </footer>
  )
}

export default SiteFooter
