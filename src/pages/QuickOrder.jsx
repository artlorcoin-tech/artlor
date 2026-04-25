import emailjs from '@emailjs/browser'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BrandHeader from '../components/BrandHeader'
import SiteFooter from '../components/SiteFooter'

const easing = [0.4, 0, 0.2, 1]

const sizeOptions = [
  { name: 'Small', detail: 'A4 / A5' },
  { name: 'Medium', detail: 'A3' },
  { name: 'Large', detail: 'A2 / A1' },
  { name: 'Custom Size', detail: 'Your own dimensions' },
]

function QuickOrder() {
  const location = useLocation()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const painting = location.state?.painting
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    artworkSize: '',
    customSize: '',
    city: '',
    pincode: '',
    area: '',
    lane: '',
    phone: '',
    email: '',
  })

  const canProceed = () => {
    if (step === 0) {
      if (!form.artworkSize) return false
      if (form.artworkSize === 'Custom Size') return form.customSize.trim().length > 0
      return true
    }
    if (step === 1) {
      return (
        form.city.trim() &&
        form.pincode.trim().length === 6 &&
        form.area.trim() &&
        form.lane.trim()
      )
    }
    if (step === 2) return form.phone.trim().length === 10 && /\S+@\S+\.\S+/.test(form.email)
    return false
  }

  const submitQuickOrder = async () => {
    if (!canProceed() || submitting) return

    const payload = {
      from_name: 'Quick Order Client',
      art_style: painting?.style ?? 'Selected Painting',
      artwork_size:
        form.artworkSize === 'Custom Size' ? `${form.artworkSize} (${form.customSize})` : form.artworkSize,
      city: form.city,
      pincode: form.pincode,
      area: form.area,
      lane: form.lane,
      phone: form.phone,
      email: form.email,
      order_type: 'quick',
    }

    try {
      setSubmitting(true)
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        payload,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
      navigate('/confirm', {
        state: {
          order: {
            name: painting?.title ?? 'Quick Order',
            artStyle: payload.art_style,
            size: payload.artwork_size,
            location: `${form.lane}, ${form.area}, ${form.city} - ${form.pincode}`,
            contact: `${form.phone} · ${form.email}`,
          },
        },
      })
    } catch (error) {
      console.error('Quick order submission failed', error)
      alert('Could not confirm this order right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="paper-bg page-pad min-h-screen">
      <BrandHeader />
      <section className="form-shell mx-auto w-full max-w-[560px] space-y-4 p-5 sm:p-8">
        <img src="/brand/artlor-logo.png" alt="Artlor logo" className="brand-logo-round brand-logo-md mb-1" />
        <article className="card-surface bg-[var(--brand-cream)] p-4">
          {painting ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={`https://picsum.photos/seed/artlor-${painting.seed}/220/140`}
                alt={painting.title}
                className="h-16 w-24 rounded-2xl object-cover sm:h-20 sm:w-28"
              />
              <div>
                <h2 className="font-display text-brand-dark text-xl sm:text-2xl">{painting.title}</h2>
                <p className="text-brand-brown/85 mt-1 font-body text-sm">{painting.style}</p>
              </div>
            </div>
          ) : (
            <p className="text-brand-brown font-body text-sm">
              No artwork selected. You can still submit a quick request.
            </p>
          )}
        </article>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={prefersReducedMotion ? false : { x: 60, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? {} : { x: -60, opacity: 0 }}
            transition={{ duration: 0.3, ease: easing }}
            className="space-y-5"
          >
            {step === 0 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  Choose your canvas size
                </h1>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {sizeOptions.map((size) => {
                    const selected = form.artworkSize === size.name
                    return (
                      <button
                        key={size.name}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, artworkSize: size.name }))}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? 'border-[var(--brand-brown)] bg-[var(--brand-brown)] text-[var(--brand-cream)]'
                            : 'border-[var(--brand-light)] bg-[var(--brand-cream)] text-[var(--brand-dark)]'
                        }`}
                      >
                        <p className="font-body text-sm font-semibold">{size.name}</p>
                        <p className="mt-1 font-body text-xs opacity-85">{size.detail}</p>
                      </button>
                    )
                  })}
                </div>
                <AnimatePresence>
                  {form.artworkSize === 'Custom Size' && (
                    <motion.input
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      placeholder="Enter your size"
                      value={form.customSize}
                      onChange={(event) => setForm((prev) => ({ ...prev, customSize: event.target.value }))}
                      className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm outline-none"
                    />
                  )}
                </AnimatePresence>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  Where should we deliver your art?
                </h1>
                <div className="space-y-3">
                  <input
                    placeholder="City"
                    value={form.city}
                    onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm outline-none"
                  />
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Pin Code"
                    value={form.pincode}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, pincode: event.target.value.replace(/\D/g, '').slice(0, 6) }))
                    }
                    className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm outline-none"
                  />
                  <input
                    placeholder="Area/Colony"
                    value={form.area}
                    onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
                    className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm outline-none"
                  />
                  <input
                    placeholder="Lane/Street"
                    value={form.lane}
                    onChange={(event) => setForm((prev) => ({ ...prev, lane: event.target.value }))}
                    className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm outline-none"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  Your contact details
                </h1>
                <div className="space-y-3">
                  <div className="flex overflow-hidden rounded-full border border-[var(--brand-light)]">
                    <span className="bg-[var(--brand-light)] px-4 py-3 font-body text-sm text-[var(--brand-dark)]">
                      +91
                    </span>
                    <input
                      inputMode="numeric"
                      maxLength={10}
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))
                      }
                      placeholder="Phone number"
                      className="w-full bg-[var(--brand-cream)] px-4 py-3 font-body text-sm outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm outline-none"
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex flex-col gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((value) => value - 1)}
              className="pill-btn border border-[var(--brand-brown)] px-6 py-3 font-body text-sm text-[var(--brand-brown)]"
            >
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep((value) => value + 1)}
              className="pill-btn pill-btn-primary w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              disabled={!canProceed() || submitting}
              onClick={submitQuickOrder}
              className="pill-btn pill-btn-primary w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'Confirming...' : 'Confirm Order →'}
            </button>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

export default QuickOrder
