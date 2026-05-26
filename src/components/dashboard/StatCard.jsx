import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (typeof target !== 'number') { setCount(target); return }
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.round(ease * target))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return count
}

/**
 * @param {{ label: string, value: number|string, icon: React.ElementType, subtitle?: string, accent?: string, delay?: number }} props
 */
export default function StatCard({ label, value, icon: Icon, subtitle, accent = '#c9934a', delay = 0 }) {
  const isNumber = typeof value === 'number'
  const animated = useCountUp(isNumber ? value : 0)
  const displayed = isNumber ? animated : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3, boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${accent}40` }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111113] p-5 transition-all duration-300 cursor-default"
      style={{
        background: `linear-gradient(135deg, #141416 0%, #0e0e10 100%)`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top glow tint */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
      />

      {/* Corner ambient */}
      <div
        className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}20, transparent 70%)` }}
      />

      <div className="flex items-start justify-between gap-3">
        {/* Icon orb */}
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border"
          style={{
            borderColor: `${accent}30`,
            background: `radial-gradient(circle at 30% 30%, ${accent}18, transparent 70%)`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>

        {/* Value */}
        <div className="min-w-0 flex-1 text-right">
          <p
            className="font-display text-3xl font-semibold leading-none tracking-tight text-white tabular-nums"
          >
            {displayed}
          </p>
          {subtitle && (
            <p className="mt-1 truncate font-body text-[10px] uppercase tracking-wider" style={{ color: accent }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 font-body text-xs font-medium uppercase tracking-widest text-white/40">
        {label}
      </p>

      {/* Bottom gradient line */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
    </motion.div>
  )
}
