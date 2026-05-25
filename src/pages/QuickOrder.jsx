import emailjs from '@emailjs/browser'
import { supabaseInsert, supabaseSendOtp, supabaseVerifyOtp } from '../lib/supabase'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BrandHeader from '../components/BrandHeader'
import LocationAutocomplete from '../components/LocationAutocomplete'
import SEO from '../components/SEO'
import { publicUrl } from '../publicUrl'
import {
  isValidAuthenticName,
  isValidAuthenticPhone,
  isValidAuthenticEmail,
  isValidAddressField,
  isValidPincode
} from '../lib/validation'

const POPULAR_COUNTRIES = [
  { name: 'United States (+1)', code: '+1' },
  { name: 'United Kingdom (+44)', code: '+44' },
  { name: 'Australia (+61)', code: '+61' },
  { name: 'Canada (+1)', code: '+1' },
  { name: 'United Arab Emirates (+971)', code: '+971' },
  { name: 'Singapore (+65)', code: '+65' },
  { name: 'Germany (+49)', code: '+49' },
  { name: 'France (+33)', code: '+33' },
  { name: 'Saudi Arabia (+966)', code: '+966' },
  { name: 'Qatar (+974)', code: '+974' },
  { name: 'Kuwait (+965)', code: '+965' },
  { name: 'Oman (+968)', code: '+968' },
  { name: 'Bahrain (+973)', code: '+973' },
  { name: 'Other', code: 'custom' },
]

const INTERNATIONAL_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates',
  'Singapore', 'Germany', 'France', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain'
]

const easing = [0.4, 0, 0.2, 1]

const sizeOptions = [
  { name: 'Small', detail: 'A4 / A5' },
  { name: 'Medium', detail: 'A3' },
  { name: 'Large', detail: 'A2 / A1' },
  { name: 'Custom Size', detail: 'Your own dimensions' },
]

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

const QUICK_ORDER_STEPS = 5

function QuickOrder() {
  const location = useLocation()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const painting = location.state?.painting
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    artworkSize: '',
    customSize: '',
    state: '',
    city: '',
    pincode: '',
    area: '',
    lane: '',
    phone: '',
    email: '',
    phoneSystem: 'indian',
    countryCode: '+1',
    intlCountry: '',
    intlCountrySpecify: '',
    intlState: '',
    intlCity: '',
    intlZip: '',
    intlArea: '',
    intlLane: '',
  })

  // OTP Verification removed for fast-track launch

  const progress = (step / (QUICK_ORDER_STEPS - 1)) * 100    

  const canProceed = () => {
    if (step === 0) return isValidAuthenticName(form.name)
    if (step === 1) {
      if (!form.artworkSize) return false
      if (form.artworkSize === 'Custom Size') {
        return form.customSize.trim().length >= 3 && 
               /\d+/.test(form.customSize) && 
               /(in|inch|cm|mm|x|\*|ft|feet)/i.test(form.customSize)
      }
      return true
    }
    if (step === 2) {
      if (form.phoneSystem === 'indian') {
        return (
          form.state.trim() &&
          form.city.trim() &&
          isValidPincode(form.pincode, 'indian') &&
          isValidAddressField(form.area) &&
          isValidAddressField(form.lane)
        )
      } else {
        const country = form.intlCountry === 'Other' ? form.intlCountrySpecify : form.intlCountry
        return (
          country && country.trim().length >= 2 &&
          form.intlState.trim().length >= 2 &&
          form.intlCity.trim().length >= 2 &&
          isValidPincode(form.intlZip, 'international') &&
          isValidAddressField(form.intlArea) &&
          isValidAddressField(form.intlLane)
        )
      }
    }
    if (step === 3) {
      const check = isValidAuthenticPhone(form.phone, form.phoneSystem, form.countryCode)
      return check.isValid
    }
    if (step === 4) return isValidAuthenticEmail(form.email).isValid
    return false
  }

  const selectedArtworkLabel = painting
    ? `${painting.title} (${painting.style})`
    : 'Selected from gallery'

  const submitQuickOrder = async () => {
    if (!canProceed() || submitting) return

    const isIndian = form.phoneSystem === 'indian'
    const finalPhone = isIndian ? `+91${form.phone}` : `${form.countryCode}${form.phone}`
    const country = form.intlCountry === 'Other' ? form.intlCountrySpecify : form.intlCountry

    const payload = {
      from_name: form.name,
      art_style: selectedArtworkLabel,
      artwork_size:
        form.artworkSize === 'Custom Size' ? `${form.artworkSize} (${form.customSize})` : form.artworkSize,
      state: isIndian ? form.state : form.intlState,
      city: isIndian ? form.city : `${form.intlCity}, ${country}`,
      pincode: isIndian ? form.pincode : form.intlZip,
      area: isIndian ? form.area : form.intlArea,
      lane: isIndian ? form.lane : form.intlLane,
      phone: finalPhone,
      email: form.email,
      order_type: 'quick',
    }

    try {
      setSubmitting(true)

      // Supabase row includes gallery painting info for traceability
      const supabasePayload = {
        ...payload,
        city: form.state ? `${form.city}, ${form.state}` : form.city,
        painting_id: painting?.id ?? null,
        painting_title: painting?.title ?? null,
        painting_image: painting?.image ? `${window.location.origin}${publicUrl(painting.image)}` : null,
      }
      delete supabasePayload.state

      // Send email notification AND save to Supabase in parallel
      const [emailResult, supabaseResult] = await Promise.allSettled([
        emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          payload,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        ),
        supabaseInsert('quick_orders', supabasePayload),
      ])

      if (emailResult.status === 'rejected') {
        console.warn('[QuickOrder] EmailJS failed:', emailResult.reason)
      }
      if (supabaseResult.status === 'rejected') {
        console.warn('[QuickOrder] Supabase insert failed:', supabaseResult.reason)
      }

      // Navigate to confirmation even if one channel failed
      navigate('/confirm', {
        state: {
          order: {
            name: form.name,
            artStyle: selectedArtworkLabel,
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

  const productSchema = painting ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": painting.title,
    "image": window.location.origin + '/' + painting.image.replace(/^\//, ''),
    "description": `Commission a custom handpainted version of ${painting.title} by artist ${painting.artist}. Fully framed, stretched and delivered to your wall.`,
    "brand": {
      "@type": "Brand",
      "name": "Artlor"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": "Negotiable",
      "availability": "https://schema.org/PreOrder",
      "seller": {
        "@type": "Organization",
        "name": "Artlor"
      }
    }
  } : null

  const quickOrderBreadcrumb = [
    { name: 'Gallery', path: '/gallery' },
    { name: painting ? `Order ${painting.title}` : 'Quick Order', path: '/quick-order' }
  ]

  return (
    <main className="paper-bg page-pad min-h-screen">
      {/* SMS Simulator removed for Production cellular OTP gateway */}
      <SEO 
        title={painting ? `Order ${painting.title}` : "Quick Art Order"}
        description={painting ? `Commission a handpainted custom version of ${painting.title} by ${painting.artist} from talented local painters.` : "Instantly place a custom painting order with local art talent."}
        keywords="commission painting, buy local art, handpainted reproductions, custom calligraphy order"
        schemaData={productSchema}
        breadcrumbPaths={quickOrderBreadcrumb}
      />
      <BrandHeader />
      <section className="form-shell mx-auto w-full max-w-[560px] p-5 sm:p-8">
        <img src={publicUrl('brand/artlor-logo.png')} alt="Artlor logo" decoding="async" className="brand-logo-round brand-logo-md mb-6" />
        <div className="mb-8">
          <div className="relative mb-5 h-[2px] rounded-full bg-[var(--brand-light)]">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: easing }}
              className="h-full rounded-full bg-[var(--brand-brown)]"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: QUICK_ORDER_STEPS }).map((_, index) => (
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
        <article className="card-surface mb-6 bg-[var(--brand-cream)] p-4">
          {painting ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={publicUrl(painting.image)}
                alt={`${painting.title} custom painting request preview`}
                loading="eager"
                decoding="async"
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
            className="space-y-6"
          >
            {step === 0 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  What should we call you?
                </h1>
                <Field
                  label="Full name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                 {form.name.trim().length > 0 && !isValidAuthenticName(form.name) && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs font-semibold text-rose-600 font-body px-2"
                  >
                    ⚠️ Please enter an authentic name (at least 4 letters total). Anonymous values, numbers, and mock names (like &apos;test&apos; or &apos;panda&apos;) are strictly blocked.
                  </motion.p>
                )}
              </>
            )}

            {step === 1 && (
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
                       {form.customSize.trim().length > 0 && !(form.customSize.trim().length >= 3 && /\d+/.test(form.customSize) && /(in|inch|cm|mm|x|\*|ft|feet)/i.test(form.customSize)) && (
                        <p className="mt-2 text-xs font-semibold text-rose-600 font-body px-2">
                          ⚠️ Please enter realistic dimensions (e.g. &quot;30 * 48 inches&quot;, &quot;30 x 48&quot;, or &quot;20*30 cm&quot;). Mock text is blocked.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  Where should we deliver your art?
                </h1>
                <div className="space-y-4">
                  {form.phoneSystem === 'indian' ? (
                    <>
                      <LocationAutocomplete
                        state={form.state}
                        city={form.city}
                        pincode={form.pincode}
                        onChange={({ state, city, pincode, area, lane }) =>
                          setForm((prev) => ({ 
                            ...prev, 
                            state: state || '', 
                            city: city || '', 
                            pincode: pincode || '',
                            ...(area !== undefined && { area }),
                            ...(lane !== undefined && { lane })
                          }))
                        }
                      />
                      <div>
                        <Field
                          label="Area/Colony"
                          placeholder="Area or colony"
                          value={form.area}
                          onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
                        />
                        {form.area.trim().length > 0 && !isValidAddressField(form.area) && (
                          <p className="mt-1 text-xs text-rose-600 font-semibold font-body px-2">
                            ⚠️ Area cannot be purely numeric or contain mock terms like &apos;test&apos; or &apos;panda&apos;.
                          </p>
                        )}
                      </div>
                      <div>
                        <Field
                          label="Lane/Street"
                          placeholder="Lane or street"
                          value={form.lane}
                          onChange={(event) => setForm((prev) => ({ ...prev, lane: event.target.value }))}
                        />
                        {form.lane.trim().length > 0 && !isValidAddressField(form.lane) && (
                          <p className="mt-1 text-xs text-rose-600 font-semibold font-body px-2">
                            ⚠️ Street/Lane cannot be purely numeric or contain mock terms like &apos;test&apos; or &apos;panda&apos;.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 font-body text-sm text-[var(--brand-dark)]">Country</label>
                        <select
                          value={form.intlCountry}
                          onChange={(e) => setForm(prev => ({ ...prev, intlCountry: e.target.value, intlCountrySpecify: '' }))}
                          className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-5 py-3 font-body text-sm text-[var(--brand-dark)] outline-none focus:border-[var(--brand-brown)]"
                        >
                          <option value="">Select country</option>
                          {INTERNATIONAL_COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {form.intlCountry === 'Other' && (
                        <Field
                          label="Specify Country"
                          placeholder="Enter your country"
                          value={form.intlCountrySpecify}
                          onChange={(e) => setForm(prev => ({ ...prev, intlCountrySpecify: e.target.value }))}
                        />
                      )}
                      
                      <Field
                        label="State / Province / Region"
                        placeholder="Enter state or province"
                        value={form.intlState}
                        onChange={(e) => setForm(prev => ({ ...prev, intlState: e.target.value }))}
                      />
                      
                      <Field
                        label="City"
                        placeholder="Enter city"
                        value={form.intlCity}
                        onChange={(e) => setForm(prev => ({ ...prev, intlCity: e.target.value }))}
                      />
                      
                      <div>
                        <Field
                          label="ZIP / Postal Code"
                          placeholder="Enter postal code"
                          value={form.intlZip}
                          onChange={(e) => setForm(prev => ({ ...prev, intlZip: e.target.value }))}
                        />
                        {form.intlZip.trim().length > 0 && !isValidPincode(form.intlZip, 'international') && (
                          <p className="mt-1 text-xs text-rose-600 font-semibold font-body px-2">
                            ⚠️ Invalid postal code. Must be 3-10 alphanumeric characters. Repeating or sequential digits are blocked.
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Field
                          label="Area / Neighborhood / District"
                          placeholder="Enter area or district"
                          value={form.intlArea}
                          onChange={(e) => setForm(prev => ({ ...prev, intlArea: e.target.value }))}
                        />
                        {form.intlArea.trim().length > 0 && !isValidAddressField(form.intlArea) && (
                          <p className="mt-1 text-xs text-rose-600 font-semibold font-body px-2">
                            ⚠️ Area cannot be purely numeric or contain mock terms like &apos;test&apos; or &apos;panda&apos;.
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Field
                          label="Street Address / Lane"
                          placeholder="Enter street address"
                          value={form.intlLane}
                          onChange={(e) => setForm(prev => ({ ...prev, intlLane: e.target.value }))}
                        />
                        {form.intlLane.trim().length > 0 && !isValidAddressField(form.intlLane) && (
                          <p className="mt-1 text-xs text-rose-600 font-semibold font-body px-2">
                            ⚠️ Street/Lane cannot be purely numeric or contain mock terms like &apos;test&apos; or &apos;panda&apos;.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  How can your artist reach you?
                </h1>
                
                <div className="space-y-4">
                  {/* System Selector Tab */}
                  <div className="flex rounded-full bg-[var(--brand-light)]/20 p-1 border border-[var(--brand-light)]">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, phoneSystem: 'indian', phone: '' }))
                      }}
                      className={`flex-1 rounded-full py-2 text-xs font-bold font-body transition-all ${
                        form.phoneSystem === 'indian'
                          ? 'bg-[var(--brand-brown)] text-[var(--brand-cream)] shadow-sm'
                          : 'text-[var(--brand-dark)] hover:bg-[var(--brand-brown)]/5'
                      }`}
                    >
                      🇮🇳 Indian System (+91)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, phoneSystem: 'international', phone: '' }))
                      }}
                      className={`flex-1 rounded-full py-2 text-xs font-bold font-body transition-all ${
                        form.phoneSystem === 'international'
                          ? 'bg-[var(--brand-brown)] text-[var(--brand-cream)] shadow-sm'
                          : 'text-[var(--brand-dark)] hover:bg-[var(--brand-brown)]/5'
                      }`}
                    >
                      🌐 International System
                    </button>
                  </div>

                  {form.phoneSystem === 'international' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block mb-1.5 font-body text-xs text-[var(--brand-dark)]/70">Select Country</label>
                        <select
                          value={POPULAR_COUNTRIES.some(c => c.code === form.countryCode && c.name !== 'Other') ? form.countryCode : 'custom'}
                          onChange={(e) => {
                            const val = e.target.value
                            setForm(prev => ({ 
                              ...prev, 
                              countryCode: val === 'custom' ? '+' : val,
                              phone: ''
                            }))
                          }}
                          className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-4 py-2.5 font-body text-sm text-[var(--brand-dark)] outline-none focus:border-[var(--brand-brown)]"
                        >
                          {POPULAR_COUNTRIES.map(c => (
                            <option key={c.name} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {(!POPULAR_COUNTRIES.some(c => c.code === form.countryCode && c.name !== 'Other') || form.countryCode === '+') && (
                        <div>
                          <label className="block mb-1.5 font-body text-xs text-[var(--brand-dark)]/70">Country Code</label>
                          <input
                            type="text"
                            value={form.countryCode}
                            onChange={(e) => {
                              let val = e.target.value
                              if (!val.startsWith('+')) val = '+' + val.replace(/\D/g, '')
                              else val = '+' + val.slice(1).replace(/\D/g, '')
                              setForm(prev => ({ ...prev, countryCode: val.slice(0, 5), phone: '' }))
                            }}
                            placeholder="+1"
                            className="w-full rounded-full border border-[var(--brand-light)] bg-[var(--brand-cream)] px-4 py-2.5 font-body text-sm text-[var(--brand-dark)] outline-none focus:border-[var(--brand-brown)]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <label className="block">
                    <span className="text-brand-dark mb-2 block font-body text-sm">Phone Number</span>
                    <div className="flex overflow-hidden rounded-full border border-[var(--brand-light)]">
                      <span className="bg-[var(--brand-light)] px-4 py-3 font-body text-sm text-[var(--brand-dark)] flex items-center">
                        {form.phoneSystem === 'indian' ? '+91' : form.countryCode}
                      </span>
                      <input
                        inputMode="numeric"
                        maxLength={form.phoneSystem === 'indian' ? 10 : 12}
                        value={form.phone}
                        onChange={(event) => {
                          const val = event.target.value.replace(/\D/g, '').slice(0, form.phoneSystem === 'indian' ? 10 : 12)
                          setForm((prev) => ({ ...prev, phone: val }))
                        }}
                        className="w-full bg-[var(--brand-cream)] px-4 py-3 font-body text-sm outline-none"
                        placeholder={form.phoneSystem === 'indian' ? "10-digit mobile number" : "Local phone number"}
                      />
                    </div>
                  </label>

                  {/* Real-time Phone Authenticity Warnings */}
                  {form.phone.trim().length > 0 && (
                    (() => {
                      const check = isValidAuthenticPhone(form.phone, form.phoneSystem, form.countryCode)
                      if (!check.isValid && check.error) {
                        return (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-semibold text-rose-600 font-body px-2"
                          >
                            ⚠️ {check.error}
                          </motion.p>
                        )
                      }
                      return null
                    })()
                  )}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  Where should we send your order confirmation?
                </h1>
                <div>
                  <Field
                    type="email"
                    label="Email"
                    placeholder="you@domain.com"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                  {form.email.trim().length > 0 && (
                    (() => {
                      const check = isValidAuthenticEmail(form.email)
                      if (!check.isValid && check.error) {
                        return (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-xs font-semibold text-rose-600 font-body px-2"
                          >
                            ⚠️ {check.error}
                          </motion.p>
                        )
                      }
                      return null
                    })()
                  )}
                </div>
                <p className="text-brand-brown/80 font-body text-sm">We&apos;ll never spam you.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((value) => value - 1)}
              className="pill-btn border border-[var(--brand-brown)] px-6 py-3 font-body text-sm text-[var(--brand-brown)] hover:bg-[var(--brand-brown)]/8"
            >
              ← Back
            </button>
          )}
          {step < QUICK_ORDER_STEPS - 1 ? (
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
              {submitting ? 'Placing Order...' : 'Place My Order →'}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default QuickOrder
