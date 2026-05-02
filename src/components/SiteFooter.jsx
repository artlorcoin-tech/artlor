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
]

function SiteFooter() {
  return (
    <footer className="page-pad mt-auto pb-8 pt-10">
      <div className="content-max rounded-[28px] border border-[rgba(31,31,31,0.08)] bg-[rgba(255,255,255,0.78)] px-5 py-8 shadow-[0_14px_35px_rgba(0,0,0,0.06)] backdrop-blur-md sm:px-8 sm:py-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <section>
            <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--brand-dark)] sm:text-xl">
              Contact Artlor
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--brand-brown)]">
              Reach the Artlor team for orders, collaborations, and questions.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {artlorLinks.map((item) => (
                <li key={item.label}>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--brand-brown)]/80">
                    {item.label}
                  </span>
                  <br />
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="text-[var(--brand-dark)] underline decoration-[var(--brand-light)] underline-offset-2 transition hover:text-[var(--brand-brown)]"
                  >
                    {item.display}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--brand-dark)] sm:text-xl">
              Founded by
            </h2>
            <p className="mt-2 font-medium text-[var(--brand-dark)]">Hammad Riyaz</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {founderLinks.map((item) => (
                <li key={item.label}>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--brand-brown)]/80">
                    {item.label}
                  </span>
                  <br />
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="break-all text-[var(--brand-dark)] underline decoration-[var(--brand-light)] underline-offset-2 transition hover:text-[var(--brand-brown)]"
                  >
                    {item.display}
                  </a>
                </li>
              ))}
              <li>
                <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--brand-brown)]/80">
                  Facebook
                </span>
                <br />
                <span className="text-[var(--brand-dark)]">Hammad Riyaz</span>
              </li>
            </ul>
          </section>

          <section className="sm:col-span-2 lg:col-span-1">
            <h2
              className="font-display text-lg font-semibold tracking-tight text-[var(--brand-dark)] sm:text-xl hidden lg:invisible lg:block"
              aria-hidden="true"
            >
              Founded by
            </h2>
            <p className="mt-2 font-medium text-[var(--brand-dark)]">Muneef</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {muneefLinks.map((item) => (
                <li key={item.label}>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--brand-brown)]/80">
                    {item.label}
                  </span>
                  <br />
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="break-all text-[var(--brand-dark)] underline decoration-[var(--brand-light)] underline-offset-2 transition hover:text-[var(--brand-brown)]"
                  >
                    {item.display}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-10 border-t border-[rgba(31,31,31,0.08)] pt-8 text-center text-xs text-[var(--brand-brown)]/90">
          © {new Date().getFullYear()} Artlor
        </p>
      </div>
    </footer>
  )
}

export default SiteFooter
