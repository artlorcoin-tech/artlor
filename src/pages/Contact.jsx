import { motion, useReducedMotion } from 'framer-motion'
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react'
import { useState } from 'react'
import BrandHeader from '../components/BrandHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'

export default function Contact() {
  const prefersReducedMotion = useReducedMotion()
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all required fields.')
      return
    }

    setSending(true)
    // Emulate sending (connects to emailjs or simple success trigger)
    setTimeout(() => {
      setSending(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 1200)
  }

  const origin = window.location.origin

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${origin}/contact/#webpage`,
    'url': `${origin}/contact`,
    'name': 'Contact Artlor — Commission Art & Customer Support',
    'description': 'Get in touch with the Artlor team for custom oil & acrylic painting inquiries, Nikah board commissions, and general support across India.',
    'isPartOf': {
      '@id': `${origin}/#website`
    }
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${origin}/#organization`,
    'name': 'Artlor',
    'image': `${origin}/brand/hero-painting-bg.png`,
    'telephone': '+91-XXXXXXXXXX', // Placed as generic or placeholder for team contact
    'email': 'artlor.co.in@gmail.com',
    'url': origin,
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'New Delhi',
      'addressRegion': 'Delhi NCR',
      'postalCode': '110001',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '28.6139',
      'longitude': '77.2090'
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      'opens': '09:00',
      'closes': '20:00'
    },
    'sameAs': [
      'https://instagram.com/artlor.co',
      'https://facebook.com/artlor',
      'https://linkedin.com/company/artlor'
    ]
  }

  const breadcrumbs = [
    { name: 'Contact', path: '/contact' }
  ]

  return (
    <main className="paper-bg page-pad min-h-screen">
      <SEO
        title="Contact Us — Inquire Custom Paintings & Calligraphy India"
        description="Reach out to the Artlor team. Submit custom painting inquiries, Nikah board calligraphy requests, or ask questions about shipping in India."
        keywords="contact artlor, custom painting inquiry, order art delhi, calligraphy commissions mumbai, artlor customer care"
        schemaData={[contactSchema, localBusinessSchema]}
        breadcrumbPaths={breadcrumbs}
      />
      <BrandHeader />

      <section className="content-max max-w-5xl">
        {/* Page Hero */}
        <div className="text-center py-8 sm:py-12">
          <span className="icon-orb mx-auto mb-4">
            <MessageSquare className="text-brand-brown h-5 w-5" />
          </span>
          <h1 className="ink-title font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Connect With Artlor
          </h1>
          <p className="text-brand-brown/85 mt-4 max-w-xl mx-auto font-body text-base">
            Have a custom theme, sizing query, or special gifting order? Reach out to our curation team and local artist network.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 mb-12">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <article className="card-surface p-6 sm:p-8">
              <h2 className="font-display text-2xl text-[var(--brand-dark)] mb-6">Contact Channels</h2>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="icon-orb shrink-0 h-10 w-10">
                    <Mail className="h-4.5 w-4.5 text-[var(--brand-brown)]" />
                  </span>
                  <div>
                    <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-brand-brown/70">Email Address</h3>
                    <a href="mailto:artlor.co.in@gmail.com" className="font-body text-sm sm:text-base font-semibold text-[var(--brand-dark)] underline decoration-[var(--brand-light)] underline-offset-2 hover:text-[var(--brand-brown)] transition">
                      artlor.co.in@gmail.com
                    </a>
                    <p className="text-xs text-brand-brown/70 mt-0.5">We respond within 12-24 hours.</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span className="icon-orb shrink-0 h-10 w-10">
                    <Phone className="h-4.5 w-4.5 text-[var(--brand-brown)]" />
                  </span>
                  <div>
                    <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-brand-brown/70">WhatsApp / Call</h3>
                    <p className="font-body text-sm sm:text-base font-semibold text-[var(--brand-dark)]">
                      Available upon order placement
                    </p>
                    <p className="text-xs text-brand-brown/70 mt-0.5">Our artists will call you directly to discuss details.</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span className="icon-orb shrink-0 h-10 w-10">
                    <MapPin className="h-4.5 w-4.5 text-[var(--brand-brown)]" />
                  </span>
                  <div>
                    <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-brand-brown/70">Network Area</h3>
                    <p className="font-body text-sm sm:text-base font-semibold text-[var(--brand-dark)]">
                      Distributed Artist Network, India
                    </p>
                    <p className="text-xs text-brand-brown/70 mt-0.5">Delivering ready-to-hang frames to all pin codes in India.</p>
                  </div>
                </li>
              </ul>
            </article>

            {/* Indian Shipping Promo */}
            <article className="dark-luxe-card p-6 sm:p-8">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-gold)] mb-1 block">
                Pan-India Logistics
              </span>
              <h3 className="font-display text-xl text-white mb-2">Safe Framing & Shipping</h3>
              <p className="font-body text-xs sm:text-sm text-white/80 leading-relaxed">
                All paintings are securely packaged in sturdy wooden crates or reinforced heavy-duty tubes, fully stretched and framed. We ship using top-tier courier networks to ensure your custom commission arrives pristine.
              </p>
            </article>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <article className="form-shell p-6 sm:p-8">
              <h2 className="font-display text-2xl text-[var(--brand-dark)] mb-6">Send an Inquiry</h2>
              
              {submitted ? (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <span className="icon-orb h-12 w-12 mx-auto mb-4 bg-green-50 border-green-200">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <h3 className="font-display text-2xl text-[var(--brand-dark)] mb-2">Message Sent!</h3>
                  <p className="text-brand-brown/85 font-body text-sm max-w-sm mx-auto mb-6">
                    Thank you for reaching out. The Artlor curation team will review your inquiry and get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="pill-btn border border-[var(--brand-brown)] px-6 py-2 text-xs text-[var(--brand-brown)] hover:bg-[var(--brand-brown)]/5 font-semibold"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block mb-2 font-body text-xs font-semibold text-[var(--brand-dark)]/80">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm text-[var(--brand-dark)] outline-none focus:border-[var(--brand-brown)] focus:ring-2 focus:ring-[var(--brand-brown)]/20"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-body text-xs font-semibold text-[var(--brand-dark)]/80">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. rahul@domain.in"
                      className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm text-[var(--brand-dark)] outline-none focus:border-[var(--brand-brown)] focus:ring-2 focus:ring-[var(--brand-brown)]/20"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-body text-xs font-semibold text-[var(--brand-dark)]/80">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g. Custom Calligraphy Size Inquiry"
                      className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm text-[var(--brand-dark)] outline-none focus:border-[var(--brand-brown)] focus:ring-2 focus:ring-[var(--brand-brown)]/20"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-body text-xs font-semibold text-[var(--brand-dark)]/80">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe what you would like to discuss..."
                      className="w-full rounded-[20px] border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3.5 font-body text-sm text-[var(--brand-dark)] outline-none resize-none focus:border-[var(--brand-brown)] focus:ring-2 focus:ring-[var(--brand-brown)]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="pill-btn pill-btn-primary w-full py-3.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending inquiry...' : 'Send Message →'}
                  </button>
                </form>
              )}
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
