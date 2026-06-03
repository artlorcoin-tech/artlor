import BrandHeader from '../components/BrandHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'

export default function Terms() {
  const breadcrumbs = [
    { name: 'Terms of Service', path: '/terms' }
  ]

  return (
    <main className="paper-bg page-pad min-h-screen">
      <SEO
        title="Terms of Service"
        description="Terms of service and custom commissioning rules for Artlor. Learn how custom artwork is coordinated, painted, and delivered."
        keywords="terms of service artlor, commission rules, handpainted canvases India"
        robots="noindex, follow"
        breadcrumbPaths={breadcrumbs}
      />
      <BrandHeader />

      <section className="content-max max-w-3xl my-8">
        <article className="card-surface p-6 sm:p-10">
          <h1 className="font-display text-3xl sm:text-4xl text-[var(--brand-dark)] mb-2">Terms of Service</h1>
          <p className="text-xs text-brand-brown/70 mb-6">Last updated: June 2026</p>

          <div className="space-y-6 font-body text-sm text-brand-brown/90 leading-relaxed">
            <p>
              Welcome to Artlor. By accessing our platform or placing a custom artwork commission, you agree to comply with the following Terms of Service.
            </p>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">1. Commission & Artist Matching</h2>
              <p>
                Artlor serves as a specialized network connecting clients with handpicked local painters. When you place a custom order request:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>We review your specifications (style, size, references) and match you with a suitable artist.</li>
                <li>The matched artist will perform a confirmation phone call within 24 hours to discuss specific requirements.</li>
                <li>Physical canvas work begins only after this direct verbal/written alignment.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">2. Handpainted Nature & Variations</h2>
              <p>
                Every painting delivered is 100% handpainted by a local artist. Because these are original handcrafts, minor variations in brushstroke placements, color mixing, and detailing may occur compared to reference gallery photos. These differences showcase the authenticity of individual artist interpretations.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">3. Pricing & Payments</h2>
              <p>
                Prices for custom commissions vary based on canvas size, artist experience, and detailed complexity. The final price quotes and payment schedules will be discussed and agreed upon during the artist matching and confirmation calls.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">4. Framing, Packaging, & Delivery</h2>
              <p>
                All artworks are shipped fully stretched and framed, making them wall-ready. We take extreme packaging care to prevent scuffs or dents. Delivery across Indian metropolitan areas typically takes between 7 to 14 business days from the confirmation call.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">5. Cancellations & Returns</h2>
              <p>
                Since each commission is customized to your exact dimensions and chosen visual designs, we cannot accept standard returns or cancellations once the artist has purchased materials and initiated canvas brushwork.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">6. Contact</h2>
              <p>
                If you have questions regarding these terms, please contact us at <a href="mailto:artlor.co.in@gmail.com" className="underline hover:text-[var(--brand-brown)]">artlor.co.in@gmail.com</a>.
              </p>
            </div>
          </div>
        </article>
      </section>

      <SiteFooter />
    </main>
  )
}
