/**
 * LocationAutocomplete
 *
 * Three coordinated fields for Indian addresses:
 *   State  →  dropdown of all Indian states (static list)
 *   City   →  searchable combobox filtered by the selected state
 *   Pincode → searchable combobox that calls the India Post API
 *
 * When the user types a 6-digit pincode we fetch live data and
 * auto-populate city + state.  When the user types a city name
 * the pincode field shows matching pincodes from the API.
 *
 * The "Next" button stays disabled until all three have been
 * confirmed from the dropdown (not free-typed).
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Loader2, LocateFixed, MapPin, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { INDIAN_DISTRICTS, INDIAN_STATES } from '../lib/indianDistricts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/**
 * Fetch post office data from the India Post API.
 * Returns an array of { city, state, pincode } objects.
 */
async function fetchByPincode(pin) {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
  const [data] = await res.json()
  if (data.Status !== 'Success') return []
  return data.PostOffice.map((po) => ({
    city: po.District,
    state: po.State,
    pincode: pin,
    area: po.Name,
  }))
}

async function fetchByCity(city) {
  const res = await fetch(
    `https://api.postalpincode.in/postoffice/${encodeURIComponent(city)}`,
  )
  const [data] = await res.json()
  if (data.Status !== 'Success') return []
  // De-dupe by District + State + Pincode
  const seen = new Set()
  return data.PostOffice.reduce((acc, po) => {
    const key = `${po.District}|${po.State}|${po.Pincode}`
    if (!seen.has(key)) {
      seen.add(key)
      acc.push({ city: po.District, state: po.State, pincode: po.Pincode })
    }
    return acc
  }, [])
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } },
}

function Combobox({ label, value, placeholder, options, onSelect, onClear, loading, disabled, icon, onInputChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const displayValue = value || ''
  const filteredOptions =
    query.length > 0
      ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
      : options

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleFocus() {
    setOpen(true)
    if (value) setQuery('')
  }

  function handleChange(e) {
    setQuery(e.target.value)
    setOpen(true)
    if (e.target.value === '') onClear?.()
    if (onInputChange) onInputChange(e.target.value)
  }

  function handleSelect(option) {
    onSelect(option)
    setQuery('')
    setOpen(false)
  }

  const inputDisplay = open ? query : displayValue

  return (
    <div ref={containerRef} className="relative">
      <label className="block">
        <span className="text-brand-dark mb-2 block font-body text-sm">{label}</span>
        <div
          className={`flex items-center overflow-hidden rounded-full border transition ${
            open
              ? 'border-[var(--brand-brown)] ring-2 ring-[var(--brand-brown)]/20'
              : value
              ? 'border-[var(--brand-brown)]/60'
              : 'border-[var(--brand-light)]'
          } bg-[var(--brand-cream)]`}
        >
          {icon && (
            <span className="pl-4 text-[var(--brand-brown)]/60">{icon}</span>
          )}
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            placeholder={placeholder}
            value={inputDisplay}
            onFocus={handleFocus}
            onChange={handleChange}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-body text-sm text-[var(--brand-dark)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {loading ? (
            <Loader2 className="mr-3 h-4 w-4 animate-spin text-[var(--brand-brown)]/60" />
          ) : value ? (
            <button
              type="button"
              onClick={() => { onClear?.(); setQuery(''); inputRef.current?.focus() }}
              className="mr-1 rounded-full p-1.5 text-[var(--brand-brown)]/60 hover:bg-[var(--brand-brown)]/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <ChevronDown
              className={`mr-3 h-4 w-4 text-[var(--brand-brown)]/60 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </label>

      <AnimatePresence>
        {open && filteredOptions.length > 0 && (
          <motion.ul
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-50 mt-1.5 max-h-52 w-full overflow-y-auto rounded-2xl border border-[var(--brand-light)] bg-[var(--brand-cream)] shadow-xl"
          >
            {filteredOptions.map((option, i) => {
              const isSelected = option === value
              return (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(option)}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left font-body text-sm transition hover:bg-[var(--brand-brown)]/8 ${
                      isSelected ? 'bg-[var(--brand-brown)]/10 font-semibold text-[var(--brand-brown)]' : 'text-[var(--brand-dark)]'
                    } ${i === 0 ? 'rounded-t-2xl' : ''} ${i === filteredOptions.length - 1 ? 'rounded-b-2xl' : ''}`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--brand-brown)]" />}
                    <span>{option}</span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}

        {open && !loading && filteredOptions.length === 0 && query.length > 1 && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-50 mt-1.5 w-full rounded-2xl border border-[var(--brand-light)] bg-[var(--brand-cream)] px-4 py-3 font-body text-sm text-[var(--brand-dark)]/60 shadow-xl"
          >
            No results found
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Pincode Combobox (API-driven) ────────────────────────────────────────────

function PincodeCombobox({ label, value, cityQuery, onSelect, onClear, disabled }) {
  const [open, setOpen] = useState(false)
  const [rawInput, setRawInput] = useState(value || '')
  const [options, setOptions] = useState([]) // array of { city, state, pincode }
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  const debouncedInput = useDebounce(rawInput, 400)

  // Fetch when pincode digits typed
  useEffect(() => {
    if (debouncedInput.length === 6 && /^\d{6}$/.test(debouncedInput)) {
      setLoading(true)
      fetchByPincode(debouncedInput)
        .then((results) => {
          setOptions(results)
          // If a valid pin code is typed, auto-select the first match
          // to instantly fill the State and City/District fields!
          if (results && results.length > 0) {
            onSelect(results[0])
          }
        })
        .finally(() => setLoading(false))
    } else if (debouncedInput.length < 6) {
      setOptions([])
    }
  }, [debouncedInput])

  // Fetch when city changes (reverse lookup)
  useEffect(() => {
    if (cityQuery && cityQuery.length > 2 && !value) {
      setLoading(true)
      fetchByCity(cityQuery)
        .then((results) => setOptions(results))
        .finally(() => setLoading(false))
    }
  }, [cityQuery, value])

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keep rawInput in sync when parent changes the value (e.g., auto-fills or clears)
  useEffect(() => {
    setRawInput(value || '')
  }, [value])

  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
    
    // Indian PIN codes cannot start with 0
    if (digits.length > 0 && digits[0] === '0') {
      return
    }
    
    setRawInput(digits)
    setOpen(true)
    
    if (digits.length === 6) {
      // Proactively notify parent state immediately so they aren't blocked
      // if the external government postal API is slow or down!
      onSelect({ pincode: digits })
    } else {
      onClear?.()
    }
  }

  function handleSelect(item) {
    setRawInput(item.pincode)
    setOpen(false)
    onSelect(item) // { city, state, pincode }
  }

  const displayOptions = options.slice(0, 8)

  return (
    <div ref={containerRef} className="relative">
      <label className="block">
        <span className="text-brand-dark mb-2 block font-body text-sm">{label}</span>
        <div
          className={`flex items-center overflow-hidden rounded-full border transition ${
            open
              ? 'border-[var(--brand-brown)] ring-2 ring-[var(--brand-brown)]/20'
              : value
              ? 'border-[var(--brand-brown)]/60'
              : 'border-[var(--brand-light)]'
          } bg-[var(--brand-cream)]`}
        >
          <input
            type="text"
            inputMode="numeric"
            disabled={disabled}
            placeholder="6-digit pin code"
            value={rawInput}
            onFocus={() => setOpen(true)}
            onChange={handleChange}
            className="min-w-0 flex-1 bg-transparent px-5 py-3 font-body text-sm text-[var(--brand-dark)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {loading ? (
            <Loader2 className="mr-3 h-4 w-4 animate-spin text-[var(--brand-brown)]/60" />
          ) : value ? (
            <button
              type="button"
              onClick={() => { onClear?.(); setRawInput(''); setOptions([]) }}
              className="mr-1 rounded-full p-1.5 text-[var(--brand-brown)]/60 hover:bg-[var(--brand-brown)]/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </label>

      <AnimatePresence>
        {open && displayOptions.length > 0 && (
          <motion.ul
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-50 mt-1.5 max-h-52 w-full overflow-y-auto rounded-2xl border border-[var(--brand-light)] bg-[var(--brand-cream)] shadow-xl"
          >
            {displayOptions.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  className={`flex w-full flex-col px-4 py-2.5 text-left transition hover:bg-[var(--brand-brown)]/8 ${
                    i === 0 ? 'rounded-t-2xl' : ''
                  } ${i === displayOptions.length - 1 ? 'rounded-b-2xl' : ''}`}
                >
                  <span className="font-body text-sm font-semibold text-[var(--brand-dark)]">
                    {item.pincode}
                  </span>
                  <span className="font-body text-xs text-[var(--brand-dark)]/60">
                    {item.city}, {item.state}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}

        {open && !loading && rawInput.length === 6 && displayOptions.length === 0 && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-50 mt-1.5 w-full rounded-2xl border border-[var(--brand-light)] bg-[var(--brand-cream)] px-4 py-3 font-body text-sm text-[var(--brand-dark)]/60 shadow-xl"
          >
            No results for this pin code
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Props:
 *   state    {string}   controlled value
 *   city     {string}   controlled value
 *   pincode  {string}   controlled value
 *   onChange {function} called with { state, city, pincode }
 */
export default function LocationAutocomplete({ state, city, pincode, onChange }) {
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState('')

  // Cities/Districts are loaded statically based on the selected state
  const cityOptions = state && INDIAN_DISTRICTS[state] ? INDIAN_DISTRICTS[state] : []

  async function handleAutoDetect() {
    if (!navigator.geolocation) {
      setDetectError('Geolocation not supported by your browser.')
      return
    }

    setDetecting(true)
    setDetectError('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Free reverse geocoding via OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`
          )
          const data = await res.json()
          if (data && data.address) {
            const addr = data.address
            
            // Meticulously extract and clean the 6-digit Indian Pin Code
            let foundPincode = ''
            if (addr.postcode) {
              const matched = addr.postcode.replace(/\s/g, '').match(/\d{6}/)
              if (matched) {
                foundPincode = matched[0]
              }
            }
            
            // Try to perfectly match the state
            let foundState = ''
            if (addr.state) {
              const exact = INDIAN_STATES.find(s => s.toLowerCase() === addr.state.toLowerCase())
              foundState = exact || addr.state
            }
            
            // Try to extract and perfectly match the district
            let rawCity = addr.state_district || addr.district || addr.city || addr.county || ''
            // Clean up common OSM suffixes
            rawCity = rawCity.replace(/ district$/i, '').trim()
            
            let foundCity = rawCity
            if (foundState && INDIAN_DISTRICTS[foundState] && rawCity) {
              const matched = INDIAN_DISTRICTS[foundState].find(
                d => d.toLowerCase() === rawCity.toLowerCase()
              )
              if (matched) foundCity = matched
            }

            // Build a super-accurate Lane/Street address using every available detail
            const laneParts = [
              addr.house_number || addr.house_name,
              addr.building || addr.office || addr.apartment || addr.amenity,
              addr.road || addr.residential || addr.pedestrian || addr.path
            ].filter(Boolean)
            const foundLane = laneParts.join(', ')

            // Build a super-accurate Area/Colony address
            const areaParts = [
              addr.neighbourhood,
              addr.suburb,
              addr.village || addr.town || addr.city_district
            ].filter(Boolean)
            // Remove duplicates (e.g. if suburb and town are identical)
            const foundArea = [...new Set(areaParts)].join(', ')

            onChange({ 
              state: foundState, 
              city: foundCity, 
              pincode: foundPincode,
              area: foundArea,
              lane: foundLane,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            })
          } else {
            setDetectError('Could not determine address from location.')
          }
        } catch (err) {
          setDetectError('Network error while detecting location.')
        } finally {
          setDetecting(false)
        }
      },
      (err) => {
        setDetecting(false)
        if (err.code === 1) setDetectError('Location access denied by user.')
        else setDetectError('Unable to get your location. Please check browser settings.')
      },
      // Setting maximumAge: 0 forces a fresh GPS coordinate reading (super-accurate!)
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  // When state changes, reset city & pincode
  function handleStateSelect(newState) {
    onChange({ state: newState, city: '', pincode: '' })
  }

  function handleCitySelect(newCity) {
    onChange({ state, city: newCity, pincode: '' })
  }

  // Pincode selection auto-fills city + state
  function handlePincodeSelect({ city: c, state: s, pincode: p }) {
    onChange({ state: s, city: c, pincode: p })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className="flex items-center gap-2 rounded-full border border-[var(--brand-brown)]/40 bg-[var(--brand-brown)]/5 px-4 py-2 font-body text-sm font-medium text-[var(--brand-brown)] transition hover:bg-[var(--brand-brown)]/10 disabled:opacity-50"
        >
          {detecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {detecting ? 'Detecting...' : 'Auto-detect Location'}
        </button>
        {detectError && (
          <p className="font-body text-xs text-red-500">{detectError}</p>
        )}
      </div>

      {/* State */}
      <div className="relative">
        <Combobox
          label="State"
          value={state}
          placeholder="Select your state"
          icon={<MapPin className="h-4 w-4" />}
          options={INDIAN_STATES}
          onSelect={handleStateSelect}
          onClear={() => onChange({ state: '', city: '', pincode: '' })}
        />
      </div>

      {/* City */}
      <div className="relative">
        <Combobox
          label="City / District"
          value={city}
          placeholder={state ? 'Select your city/district' : 'Select a state first'}
          disabled={!state}
          options={cityOptions}
          onSelect={handleCitySelect}
          onClear={() => onChange({ state, city: '', pincode: '' })}
        />
      </div>

      {/* Pincode */}
      <PincodeCombobox
        label="Pin Code"
        value={pincode}
        cityQuery={city}
        onSelect={handlePincodeSelect}
        onClear={() => onChange({ state, city, pincode: '' })}
        disabled={!state}
      />
    </div>
  )
}
