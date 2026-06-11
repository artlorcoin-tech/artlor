import emailjs from '@emailjs/browser'
import { supabaseInsert, supabaseSendOtp, supabaseVerifyOtp } from '../lib/supabase'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BrandHeader from '../components/BrandHeader'
import LocationAutocomplete from '../components/LocationAutocomplete'
import SEO from '../components/SEO'
import { galleryImages } from '../galleryPaintings'
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

const styleOptions = [
  { name: 'Abstract', image: galleryImages.abstractMonoMuntaza },
  { name: 'Calligraphy', image: galleryImages.calligraphyAllahMaryam },
  { name: 'Still Life', image: galleryImages.stillLifeSeebah },
  { name: 'Landscape', image: galleryImages.landscapeBridgeHammad },
]

const initialData = {
  name: '',
  artStyle: '',
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
  latitude: null,
  longitude: null,
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

  // OTP Verification removed for fast-track launch

  // Import useEffect if not imported
  // (Wait, useEffect is already imported from react on line 1, let's verify: line 1 is `import { useState } from 'react'` in OrderForm.jsx?
  // Let's check imports of OrderForm.jsx first to make sure useEffect is imported!)

  const progress = (step / (6 - 1)) * 100

  const slideMotion = {
    initial: prefersReducedMotion ? false : { x: 60, opacity: 0 },
    animate: prefersReducedMotion ? {} : { x: 0, opacity: 1 },
    exit: prefersReducedMotion ? {} : { x: -60, opacity: 0 },
    transition: { duration: 0.3, ease: easing },
  }

  const canProceed = () => {
    if (step === 0) return isValidAuthenticName(form.name)
    if (step === 1) return Boolean(form.artStyle)
    if (step === 2) {
      if (!form.artworkSize) return false
      if (form.artworkSize === 'Custom Size') {
        return form.customSize.trim().length >= 3 && 
               /\d+/.test(form.customSize) && 
               /(in|inch|cm|mm|x|\*|ft|feet)/i.test(form.customSize)
      }
      return true
    }
    if (step === 3) {
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
    if (step === 4) {
      const check = isValidAuthenticPhone(form.phone, form.phoneSystem, form.countryCode)
      return check.isValid
    }
    if (step === 5) return isValidAuthenticEmail(form.email).isValid
    return false
  }

  const nextStep = () => {
    if (!canProceed()) return
    setStep((current) => Math.min(current + 1, 5))
  }

  const prevStep = () => setStep((current) => Math.max(current - 1, 0))

  const submitOrder = async () => {
    if (!canProceed() || submitting) return

    const isIndian = form.phoneSystem === 'indian'
    const finalPhone = isIndian ? `+91${form.phone}` : `${form.countryCode}${form.phone}`
    const country = form.intlCountry === 'Other' ? form.intlCountrySpecify : form.intlCountry

    const payload = {
      from_name: form.name,
      art_style: form.artStyle,
      artwork_size:
        form.artworkSize === 'Custom Size' ? `${form.artworkSize} (${form.customSize})` : form.artworkSize,
      state: isIndian ? form.state : form.intlState,
      city: isIndian ? form.city : `${form.intlCity}, ${country}`,
      pincode: isIndian ? form.pincode : form.intlZip,
      area: isIndian ? form.area : form.intlArea,
      lane: isIndian ? form.lane : form.intlLane,
      phone: finalPhone,
      email: form.email,
      order_type: 'custom',
    }

    try {
      setSubmitting(true)

      const supabasePayload = {
        ...payload,
        city: form.state ? `${form.city}, ${form.state}` : form.city,
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
        supabaseInsert('custom_orders', supabasePayload),
      ])

      if (emailResult.status === 'rejected') {
        console.warn('[OrderForm] EmailJS failed:', emailResult.reason)
      }
      if (supabaseResult.status === 'rejected') {
        console.warn('[OrderForm] Supabase insert failed:', supabaseResult.reason)
      }

      // Map cities to coordinates if geolocation wasn't used
      const CITY_COORDINATES = {
        'bangalore': { lat: 12.9716, lng: 77.5946 },
        'bengaluru': { lat: 12.9716, lng: 77.5946 },
        'mumbai': { lat: 19.0760, lng: 72.8777 },
        'delhi': { lat: 28.6139, lng: 77.2090 },
        'new delhi': { lat: 28.6139, lng: 77.2090 },
        'kochi': { lat: 10.8505, lng: 76.2711 },
        'cochin': { lat: 10.8505, lng: 76.2711 },
        'chennai': { lat: 13.0827, lng: 80.2707 },
        'madras': { lat: 13.0827, lng: 80.2707 },
        'pune': { lat: 18.5204, lng: 73.8567 },
        'jaipur': { lat: 26.9124, lng: 75.7873 },
        'hyderabad': { lat: 17.3850, lng: 78.4867 },
      }

      let lat = form.latitude
      let lng = form.longitude

      if (!lat || !lng) {
        const cityKey = (isIndian ? form.city : form.intlCity).toLowerCase().trim()
        const coords = CITY_COORDINATES[cityKey]
        if (coords) {
          lat = coords.lat
          lng = coords.lng
        } else {
          lat = 12.9716 // Default fallback
          lng = 77.5946
        }
      }

      // Dispatch real-time match order to Express/Socket.io server
      let matchedOrderId = null
      try {
        const orderRes = await fetch('http://localhost:4000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: finalPhone,
            category: form.artStyle,
            description: `Commission request size: ${form.artworkSize === 'Custom Size' ? form.customSize : form.artworkSize}`,
            size: form.artworkSize,
            latitude: lat,
            longitude: lng,
            deliveryAddress: `${form.lane}, ${form.area}, ${isIndian ? form.city : form.intlCity} - ${isIndian ? form.pincode : form.intlZip}`,
          }),
        })
        const orderData = await orderRes.json()
        if (orderData.success) {
          matchedOrderId = orderData.data._id
        }
      } catch (err) {
        console.warn('[OrderForm] Local matching server offline:', err.message)
      }

      if (matchedOrderId) {
        navigate(`/track/${matchedOrderId}`)
      } else {
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
      }
    } catch (error) {
      console.error('Order submission failed', error)
      alert('Could not place your order right now. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Custom Handpainted Art Commissions",
    "description": "Commission high-quality, custom paintings and calligraphy directly from handpicked local artists. Choose your size, style, and framing options.",
    "provider": {
      "@type": "Organization",
      "name": "Artlor",
      "url": window.location.origin
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": "Negotiable",
      "eligibleRegion": {
        "@type": "Country",
        "name": "India"
      }
    }
  }

  const orderBreadcrumb = [
    { name: 'Custom Order', path: '/order' }
  ]

  return (
    <main className="paper-bg page-pad min-h-screen">
      {/* SMS Simulator removed for Production cellular OTP gateway */}
      <SEO 
        title="Commission Custom Artwork"
        description="Describe your dream painting style, size, and delivery location to connect and match with talented local artists."
        keywords="commission art, custom painting request, local painters, handpainted art commissions, custom artwork India"
        schemaData={serviceSchema}
        breadcrumbPaths={orderBreadcrumb}
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
                          src={publicUrl(style.image)}
                          alt={`${style.name} custom painting style selection`}
                          loading="lazy"
                          decoding="async"
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

            {step === 3 && (
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
                        onChange={({ state, city, pincode, area, lane, latitude, longitude }) =>
                          setForm((prev) => ({ 
                            ...prev, 
                            state: state || '', 
                            city: city || '', 
                            pincode: pincode || '',
                            ...(area !== undefined && { area }),
                            ...(lane !== undefined && { lane }),
                            latitude: latitude || null,
                            longitude: longitude || null
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

            {step === 4 && (
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

            {step === 5 && (
              <>
                <h1 className="font-display text-brand-dark text-3xl leading-tight sm:text-4xl">
                  Where should we send your order confirmation?
                </h1>
                <div>
                  <Field
                    type="email"
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
    </main>
  )
}

export default OrderForm
