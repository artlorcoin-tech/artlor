import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

// Check if current date is inside the 3 days of Eid ul Adha (May 26 - May 29, 2026)
// Or if the query param `?eid=true` is present for testing
const checkIsEidActive = () => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.get('eid') === 'true') return true

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-indexed (Jan = 1)
  const date = now.getDate()

  // 2026 May 26 to May 29 inclusive (Eid-ul-Adha starts May 27/28)
  if (year === 2026 && month === 5) {
    return date >= 26 && date <= 29
  }
  return false
}

// Ornate Islamic Stars for background decoration
const FloatingStar = ({ delay, style }) => (
  <motion.div
    initial={{ opacity: 0.1, scale: 0.6 }}
    animate={{
      opacity: [0.1, 0.8, 0.1],
      scale: [0.6, 1.1, 0.6],
      y: [0, -15, 0],
    }}
    transition={{
      duration: 3.5 + Math.random() * 2,
      repeat: Infinity,
      delay: delay,
      ease: 'easeInOut',
    }}
    className="absolute pointer-events-none text-[var(--brand-gold)]"
    style={style}
  >
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
    </svg>
  </motion.div>
)

export default function EidCelebration() {
  const prefersReducedMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (checkIsEidActive()) {
      const dismissed = localStorage.getItem('artlor-eid-dismissed-2026')
      if (!dismissed) {
        // Delay opening slightly to let the site load and wow the user
        const timer = setTimeout(() => setIsOpen(true), 1200)
        return () => clearTimeout(timer)
      } else {
        setShowBadge(true)
      }
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setShowBadge(true)
    localStorage.setItem('artlor-eid-dismissed-2026', 'true')
  }

  const handleOpenFromBadge = () => {
    setIsOpen(true)
    setShowBadge(false)
  }

  // Trigger a spectacular burst of gold stars and crescent particles
  const triggerCelebration = () => {
    if (prefersReducedMotion) return

    const newParticles = Array.from({ length: 40 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 8
      const isCrescent = Math.random() > 0.75
      
      return {
        id: Date.now() + i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        size: 8 + Math.random() * 14,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        isCrescent,
        opacity: 1,
      }
    })

    setParticles((prev) => [...prev, ...newParticles])
  }

  // Animate the gold particles
  useEffect(() => {
    if (particles.length === 0) return

    const frame = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.12, // Gravity
            opacity: p.opacity - 0.015,
            rotation: p.rotation + p.rotSpeed,
          }))
          .filter((p) => p.opacity > 0)
      )
    })

    return () => cancelAnimationFrame(frame)
  }, [particles])

  return (
    <>
      {/* Exquisite Overlay Celebration Popup */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden">
            {/* Backdrop with highly luxurious dark color and blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-[#121216]/82 backdrop-blur-xl"
            />

            {/* Exploded Confetti Container */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  style={{
                    position: 'absolute',
                    x: p.x,
                    y: p.y,
                    rotate: p.rotation,
                    width: p.size,
                    height: p.size,
                    opacity: p.opacity,
                    color: 'var(--brand-gold)',
                  }}
                  className="pointer-events-none"
                >
                  {p.isCrescent ? (
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current filter drop-shadow-[0_2px_4px_rgba(201,147,74,0.4)]">
                      <path d="M10 21c-4.97 0-9-4.03-9-9s4.03-9 9-9c.56 0 1.11.05 1.64.15A9.003 9.003 0 008.25 12c0 3.9 2.5 7.21 6 8.35-.74.42-1.58.65-2.47.65H10z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current filter drop-shadow-[0_2px_4px_rgba(201,147,74,0.4)]">
                      <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
                    </svg>
                  )}
                </motion.div>
              ))}
            </div>

            {/* The Celebration Card */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-lg overflow-hidden border border-[rgba(201,147,74,0.3)] bg-gradient-to-b from-[#1c1815] via-[#121213] to-[#0e0e10] p-8 md:p-10 text-center rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(201,147,74,0.12)]"
            >
              {/* Gold Filigree Background Texture */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(ellipse_at_center,var(--brand-gold)_0%,transparent_70%)]" />
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'%3E%3Cpath d=\'M30 0 L60 30 L30 60 L0 30 Z\' fill=\'none\' stroke=\'%23c9934a\' stroke-width=\'1\'/%3E%3C/svg%3E")'
              }} />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full border border-white/5 bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer z-20 outline-none"
                aria-label="Close celebration banner"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Decorative Stars */}
              <FloatingStar delay={0.2} style={{ top: '8%', left: '10%' }} />
              <FloatingStar delay={1.4} style={{ top: '15%', right: '12%' }} />
              <FloatingStar delay={0.8} style={{ bottom: '25%', left: '8%' }} />
              <FloatingStar delay={2.0} style={{ bottom: '15%', right: '10%' }} />

              {/* Stunning Hanging & Swinging Lanterns SVG */}
              <div className="flex justify-center gap-10 -mt-2 mb-6">
                {/* Left Lantern */}
                <motion.div
                  animate={prefersReducedMotion ? {} : { rotate: [1.5, -1.5, 1.5] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: 'top center' }}
                  className="w-10 h-24 text-[var(--brand-gold)] filter drop-shadow-[0_0_8px_rgba(201,147,74,0.3)]"
                >
                  <svg viewBox="0 0 40 100" fill="none" className="w-full h-full">
                    {/* Hanging String */}
                    <line x1="20" y1="0" x2="20" y2="35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                    {/* Lantern Top cap */}
                    <path d="M12 35C12 35 15 30 20 30C25 30 28 35 28 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 42C8 38 14 36 20 36C26 36 32 38 32 42" fill="currentColor" opacity="0.3" />
                    <path d="M8 42L12 35H28L32 42H8Z" stroke="currentColor" strokeWidth="1.8" />
                    {/* Glowing body */}
                    <rect x="11" y="42" width="18" height="26" rx="2" fill="#ffd175" opacity="0.18" />
                    <path d="M11 42H29V68H11V42Z" stroke="currentColor" strokeWidth="1.8" />
                    {/* Filigree detail */}
                    <path d="M20 42V68M15 45C15 45 18 55 20 55C22 55 25 45 25 45M15 65C15 65 18 55 20 55C22 55 25 65 25 65" stroke="currentColor" strokeWidth="1.2" />
                    {/* Bottom cap */}
                    <path d="M11 68L15 75H25L29 68H11Z" stroke="currentColor" strokeWidth="1.8" />
                    {/* Ring at bottom */}
                    <circle cx="20" cy="80" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M20 84V94" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </motion.div>

                {/* Center Crescent Moon & Star */}
                <motion.div
                  animate={prefersReducedMotion ? {} : { y: [0, -4, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 self-center text-[var(--brand-gold)] filter drop-shadow-[0_0_15px_rgba(201,147,74,0.4)]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    {/* Crescent Moon */}
                    <path d="M11.5 2C6.48 2 2.37 5.8 2.03 10.72A9.003 9.003 0 0013.25 21.8c2.93-.83 5.31-2.92 6.43-5.69-4.22.45-8.21-2.02-9.45-6.05C8.98 6.03 10.3 3.03 11.5 2z" />
                    {/* Star tucked inside crescent */}
                    <path d="M15 6.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
                  </svg>
                </motion.div>

                {/* Right Lantern (Slightly shorter & different phase) */}
                <motion.div
                  animate={prefersReducedMotion ? {} : { rotate: [-1.2, 1.2, -1.2] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  style={{ transformOrigin: 'top center' }}
                  className="w-8 h-20 text-[var(--brand-gold)] filter drop-shadow-[0_0_8px_rgba(201,147,74,0.3)]"
                >
                  <svg viewBox="0 0 40 100" fill="none" className="w-full h-full">
                    <line x1="20" y1="0" x2="20" y2="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                    <path d="M14 45C14 45 17 41 20 41C23 41 26 45 26 45" stroke="currentColor" strokeWidth="2" />
                    <path d="M10 50L14 45H26L30 50H10Z" stroke="currentColor" strokeWidth="1.8" />
                    <rect x="12" y="50" width="16" height="22" rx="1.5" fill="#ffd175" opacity="0.18" />
                    <path d="M12 50H28V72H12V50Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M20 50V72M16 53C16 53 18 61 20 61C22 61 24 53 24 53" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M12 72L15 78H25L28 72H12Z" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="20" cy="83" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </motion.div>
              </div>

              {/* Title & Greetings */}
              <div className="space-y-3 z-10 relative">
                <span className="font-body text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[var(--brand-gold)] bg-[rgba(201,147,74,0.08)] border border-[rgba(201,147,74,0.18)] px-4 py-1.5 rounded-full inline-block mb-1">
                  Eid-ul-Adha Mubarak
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-wide text-[var(--brand-cream)] select-none">
                  Eid Mubarak
                </h2>
                <p className="text-[var(--brand-gold)] font-display text-sm tracking-[0.06em] italic opacity-95">
                  May your celebrations be filled with beautiful moments
                </p>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[var(--brand-gold)] to-transparent mx-auto my-4 opacity-50" />
                <p className="text-white/80 font-body text-xs sm:text-sm leading-relaxed max-w-sm mx-auto px-2">
                  Artlor wishes you and your family a blessed, joyful, and peaceful Eid. May this special occasion inspire beautiful creativity, bring hearts closer, and fill your home with warmth.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center items-center z-10 relative">
                {/* Celebrate Button */}
                <button
                  onClick={triggerCelebration}
                  className="w-full sm:w-auto min-w-[160px] cursor-pointer rounded-full bg-gradient-to-r from-[#b37e3b] via-[#c9934a] to-[#d6a55e] text-[#121216] font-semibold font-body text-sm py-3 px-6 shadow-[0_10px_25px_rgba(201,147,74,0.35)] hover:shadow-[0_12px_28px_rgba(201,147,74,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group outline-none"
                >
                  <Sparkles className="w-4 h-4 text-[#121216] group-hover:animate-pulse" />
                  Celebrate!
                </button>

                {/* Continue Button */}
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto min-w-[160px] cursor-pointer rounded-full border border-white/12 bg-white/[0.03] text-white/80 font-semibold font-body text-sm py-3 px-6 hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all flex items-center justify-center outline-none"
                >
                  Explore Artlor
                </button>
              </div>

              {/* Sub-footer note */}
              <p className="text-white/40 font-body text-[10px] mt-6 select-none">
                Celebrated with ❤ by Artlor Marketplace
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exquisite Floating Badge in Corner (appears only after first dismissal) */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-5 right-5 z-[9990]"
          >
            <button
              onClick={handleOpenFromBadge}
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[rgba(201,147,74,0.3)] bg-gradient-to-b from-[#1c1815] to-[#121213] text-[var(--brand-gold)] shadow-[0_12px_32px_rgba(0,0,0,0.35),0_0_15px_rgba(201,147,74,0.2)] cursor-pointer hover:border-[rgba(201,147,74,0.6)] transition-all group outline-none"
              title="Open Eid Celebration Greeting"
              aria-label="Open Eid Celebration Greeting"
            >
              {/* Crescent Moon Icon with Glow */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 filter drop-shadow-[0_0_4px_rgba(201,147,74,0.4)] group-hover:scale-110 transition-transform">
                <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9c.56 0 1.11.05 1.64.15A9.003 9.003 0 008.25 12c0 3.9 2.5 7.21 6 8.35-.74.42-1.58.65-2.47.65H10z" />
              </svg>
              {/* Subtle pulsing ring */}
              <span className="absolute inset-0 rounded-full border border-[var(--brand-gold)] opacity-0 group-hover:animate-ping opacity-20 pointer-events-none" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
