import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Delete, Lock, ShieldCheck } from 'lucide-react'

const CORRECT_PIN = import.meta.env.VITE_DASHBOARD_PIN || '1234'
const SESSION_KEY = 'artlor-dashboard-auth'

const PAD = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['←','0','✓'],
]

export function isDashboardAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export default function PinGate({ onUnlock }) {
  const prefersReducedMotion = useReducedMotion()
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Check session on mount
  useEffect(() => {
    if (isDashboardAuthenticated()) {
      onUnlock()
    }
  }, [onUnlock])

  const handleKey = (key) => {
    if (key === '←') {
      setPin((p) => p.slice(0, -1))
      setError('')
    } else if (key === '✓') {
      verify()
    } else if (pin.length < 6) {
      const next = pin + key
      setPin(next)
      if (next.length === CORRECT_PIN.length) {
        setTimeout(() => verify(next), 120)
      }
    }
  }

  const verify = (value = pin) => {
    if (value === CORRECT_PIN) {
      setSuccess(true)
      sessionStorage.setItem(SESSION_KEY, 'true')
      setTimeout(() => onUnlock(), 800)
    } else {
      setShake(true)
      setError('Incorrect PIN. Try again.')
      setPin('')
      setTimeout(() => setShake(false), 600)
    }
  }

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key)
      else if (e.key === 'Backspace') handleKey('←')
      else if (e.key === 'Enter') handleKey('✓')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0c]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(201,147,74,0.07),transparent)]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(201,147,74,0.04),transparent_70%)]" />
      </div>

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-sm px-6"
      >
        {/* Lock icon */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <motion.div
            animate={success ? { scale: 1.2, rotate: 15 } : {}}
            transition={{ type: 'spring', damping: 12 }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(201,147,74,0.25)] bg-[rgba(201,147,74,0.08)] text-[var(--brand-gold)]"
          >
            {success ? <ShieldCheck className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
          </motion.div>
          <h1 className="font-display text-2xl font-medium tracking-wide text-white">
            {success ? 'Access Granted' : 'Admin Dashboard'}
          </h1>
          <p className="font-body text-xs tracking-widest uppercase text-white/40">
            {success ? 'Welcome, Artlor team' : 'Enter your PIN to continue'}
          </p>
        </div>

        {/* PIN dots */}
        <motion.div
          animate={shake && !prefersReducedMotion ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-center gap-4"
        >
          {Array.from({ length: CORRECT_PIN.length }).map((_, i) => (
            <motion.div
              key={i}
              animate={
                i < pin.length
                  ? { scale: 1.15, backgroundColor: success ? '#22c55e' : 'var(--brand-gold)' }
                  : { scale: 1, backgroundColor: 'rgba(255,255,255,0.1)' }
              }
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="h-3.5 w-3.5 rounded-full"
            />
          ))}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              key="err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-center font-body text-xs font-semibold text-rose-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numeric Pad */}
        <div className="grid grid-cols-3 gap-3">
          {PAD.flat().map((key) => (
            <motion.button
              key={key}
              whileHover={prefersReducedMotion ? {} : { scale: 1.06, backgroundColor: 'rgba(201,147,74,0.14)' }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
              onClick={() => handleKey(key)}
              className={`flex h-14 items-center justify-center rounded-2xl border font-body text-base font-semibold transition-colors outline-none cursor-pointer select-none
                ${key === '✓'
                  ? 'border-[rgba(201,147,74,0.4)] bg-[rgba(201,147,74,0.12)] text-[var(--brand-gold)] hover:bg-[rgba(201,147,74,0.2)]'
                  : key === '←'
                  ? 'border-white/8 bg-white/4 text-white/60 hover:text-white/90'
                  : 'border-white/8 bg-white/4 text-white hover:border-white/20'
                }`}
            >
              {key === '←' ? <Delete className="h-4 w-4" /> : key}
            </motion.button>
          ))}
        </div>

        <p className="mt-8 text-center font-body text-[10px] text-white/20">
          Artlor Admin · Secure Access
        </p>
      </motion.div>
    </div>
  )
}
