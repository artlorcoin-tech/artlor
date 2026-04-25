import emailjs from '@emailjs/browser'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
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

const styleOptions = [
  { name: 'Abstract', seed: 111 },
  { name: 'Calligraphy', seed: 222 },
  { name: 'Still Life', seed: 333 },
  { name: 'Landscape', seed: 444 },
]

const initialData = {
  name: '',
  artStyle: '',
  artworkSize: '',
  customSize: '',
  city: '',
  pincode: '',
  area: '',
  lane: '',
  phone: '',
  email: '',
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-brand-dark mb-2 block font-body text-sm">{label}</span>
      <input
        {...props}
        className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm text-[var(--brand-dark)] outline-none transition focus:border-[var(--brand-brown)] focus:ring-2 focus:ring-[var(--brand-brown)]/20"
      />
    </label>
  )
}

function OrderForm() {
  const location = useLocation()
  const preselectedStyle = location.state?.painting?.style ?? ''
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(() => ({ ...initialData, artStyle: preselectedStyle }))
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const progress = (step / (6 - 1)) * 100

  const slideMotion = {
    initial: prefersReducedMotion ? false : { x: 60, opacity: 0 },
    animate: prefersReducedMotion ? {} : { x: 0, opacity: 1 },
    exit: prefersReducedMotion ? {} : { x: -60, opacity: 0 },
    transition: { duration: 0.3, ease: easing },
  }

  const canProceed = () => {
    if (step === 0) return form.name.trim().length > 1
    if (step === 1) return Boolean(form.artStyle)
    if (step === 2) {
      if (!form.artworkSize) return false
      if (form.artworkSize === 'Custom Size') return form.customSize.trim().length > 0
      return true
    }
    if (step === 3) {
      return (
        form.city.trim() &&
        form.pincode.trim().length === 6 &&
        form.area.trim() &&
        form.lane.trim()
      )
    }
    if (step === 4) return form.phone.trim().length === 10
    if (step === 5) return /\S+@\S+\.\S+/.test(form.email)
    return false
  }

  const nextStep = () => {
    if (!canProceed()) return
    setStep((current) => Math.min(current + 1, 5))
  }

  const prevStep = () => setStep((current) => Math.max(current - 1, 0))

  const submitOrder = async () => {
    if (!canProceed() || submitting) return

    const payload = {
      from_name: form.name,
      art_style: form.artStyle,
      artwork_size:
        form.artworkSize === 'Custom Size' ? `${form.artworkSize} (${form.customSize})` : form.artworkSize,
      city: form.city,
      pincode: form.pincode,
      area: form.area,
      lane: form.lane,
      phone: form.phone,
      email: form.email,
      order_type: 'custom',
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
            name: form.name,
            artStyle: payload.art_style,
            size: payload.artwork_size,
            location: `${form.lane}, ${form.area}, ${form.city} - ${form.pincode}`,
            contact: `${form.phone} · ${form.email}`,
          },
        },
      })
    } catch (error) {
      console.error('EmailJS submission failed', error)
      alert('Could not place your order right now. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="paper-bg page-pad min-h-screen">
      <BrandHeader />
      <section className="form-shell mx-auto w-full max-w-[560px] p-5 sm:p-8">
        <img src="/brand/artlor-logo.png" alt="Artlor logo" className="brand-logo-round brand-logo-md mb-6" />
        <div className="mb-8">
          <div className="relative mb-5 h-[2px] rounded-full bg-[var(--brand-light)]">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: easing }}
              className="h-full rounded-full bg-[var(--brand-brown)]"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.span
                key={index}
                animate={
                  index <= step
                    ? { scale: 1.15, backgroundColor: 'var(--brand-brown)' }
                    : { scale: 1, backgroundColor: 'var(--brand-light)' }
                }
                transition={{ duration: 0.25, ease: easing }}
                className="h-3 w-3 rounded-full"
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} {...slideMotion} className="space-y-6">
            {step === 0 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  What should we call you?
                </h1>
                <Field
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  What kind of artwork do you want?
                </h1>
                <div className="grid grid-cols-2 gap-3">
                  {styleOptions.map((style) => {
                    const selected = form.artStyle === style.name
                    return (
                      <motion.button
                        key={style.name}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, artStyle: style.name }))}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                        animate={selected && !prefersReducedMotion ? { scale: 1.04 } : { scale: 1 }}
                        transition={{ duration: 0.2, type: 'spring', bounce: 0.3 }}
                        className={`relative overflow-hidden rounded-3xl border text-left ${
                          selected ? 'border-[2px] border-[var(--brand-brown)]' : 'border-[var(--brand-light)]'
                        }`}
                      >
                        <img
                          src={`https://picsum.photos/seed/order-style-${style.seed}/400/300`}
                          alt={style.name}
                          className="h-28 w-full object-cover"
                        />
                        <div className="bg-[var(--brand-cream)] px-3 py-4 font-body text-sm text-[var(--brand-dark)]">
                          {style.name}
                        </div>
                        {selected && (
                          <span className="absolute top-2 right-2 rounded-full bg-[var(--brand-brown)] p-1.5 text-white shadow-[0_8px_15px_rgba(0,0,0,0.2)]">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  How big should your artwork be?
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
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Field
                        label="Enter your size"
                        placeholder="Example: 30 x 48 inches"
                        value={form.customSize}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, customSize: event.target.value }))
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  Where should we deliver your art?
                </h1>
                <div className="space-y-4">
                  <Field
                    label="City"
                    placeholder="Your city"
                    value={form.city}
                    onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                  />
                  <Field
                    label="Pin Code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit pin code"
                    value={form.pincode}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, pincode: event.target.value.replace(/\D/g, '').slice(0, 6) }))
                    }
                  />
                  <Field
                    label="Area/Colony"
                    placeholder="Area or colony"
                    value={form.area}
                    onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
                  />
                  <Field
                    label="Lane/Street"
                    placeholder="Lane or street"
                    value={form.lane}
                    onChange={(event) => setForm((prev) => ({ ...prev, lane: event.target.value }))}
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  How can your artist reach you?
                </h1>
                <label className="block">
                  <span className="text-brand-dark mb-2 block font-body text-sm">Phone Number</span>
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
                      className="w-full bg-[var(--brand-cream)] px-4 py-3 font-body text-sm outline-none"
                      placeholder="10-digit phone number"
                    />
                  </div>
                </label>
              </>
            )}

            {step === 5 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  Where should we send your order confirmation?
                </h1>
                <Field
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
                <p className="text-brand-brown/80 font-body text-sm">We&apos;ll never spam you.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="pill-btn border border-[var(--brand-brown)] px-6 py-3 font-body text-sm text-[var(--brand-brown)] hover:bg-[var(--brand-brown)]/8"
            >
              ← Back
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed()}
              className="pill-btn pill-btn-primary w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              disabled={!canProceed() || submitting}
              onClick={submitOrder}
              className="pill-btn pill-btn-primary w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'Placing Order...' : 'Place My Order →'}
            </button>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

export default OrderForm
