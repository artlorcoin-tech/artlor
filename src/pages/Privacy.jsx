import BrandHeader from '../components/BrandHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'

export default function Privacy() {
  const breadcrumbs = [
    { name: 'Privacy Policy', path: '/privacy' }
  ]

  return (
    <main className="paper-bg page-pad min-h-screen">
      <SEO
        title="Privacy Policy"
        description="Privacy policy and data protection terms for Artlor. We respect your details and secure your delivery information."
        keywords="privacy policy artlor, security of commissions, local art store privacy"
        robots="noindex, follow"
        breadcrumbPaths={breadcrumbs}
      />
      <BrandHeader />

      <section className="content-max max-w-3xl my-8">
        <article className="card-surface p-6 sm:p-10">
          <h1 className="font-display text-3xl sm:text-4xl text-[var(--brand-dark)] mb-2">Privacy Policy</h1>
          <p className="text-xs text-brand-brown/70 mb-6">Last updated: June 2026</p>

          <div className="space-y-6 font-body text-sm text-brand-brown/90 leading-relaxed">
            <p>
              At Artlor, we take your privacy seriously. This Privacy Policy details how we collect, use, and safeguard your personal information when you order a custom painting commission.
            </p>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">1. Information We Collect</h2>
              <p>When you commission an artwork, we collect details essential to process your request:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Identity Details:</strong> Your name to address your order.</li>
                <li><strong>Contact Information:</strong> Your phone number and email address to verify orders and send confirmations.</li>
                <li><strong>Delivery Address:</strong> Area, lane, city, state, and pin code to ship your framed canvas safely.</li>
                <li><strong>Artwork Details:</strong> Your preferred art style, sizes, and custom specifications.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">2. How We Use Your Information</h2>
              <p>Your details are used solely to facilitate the commission process:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>To match your request with an expert local artist specialized in your chosen style.</li>
                <li>To enable the matched artist to conduct a quick confirmation call before beginning canvas work.</li>
                <li>To coordinate logistics and dispatch physical packages via Indian carrier networks.</li>
                <li>To send digital receipt updates and customer care check-ins.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">3. Data Sharing</h2>
              <p>
                We do not sell, rent, or trade your personal information. We share your address and phone number exclusively with the matched artist painting your piece and the third-party courier services managing delivery.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">4. Data Security</h2>
              <p>
                We execute standard database and system protection protocols. Personal order details are safely recorded in our secure databases to process confirmation calls and billing history.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-[var(--brand-dark)] font-semibold mb-2">5. Your Rights</h2>
              <p>
                You may request access to or deletion of your contact records at any time. Simply reach out to our curation team at <a href="mailto:artlor.co.in@gmail.com" className="underline hover:text-[var(--brand-brown)]">artlor.co.in@gmail.com</a>.
              </p>
            </div>
          </div>
        </article>
      </section>

      <SiteFooter />
    </main>
  )
}
