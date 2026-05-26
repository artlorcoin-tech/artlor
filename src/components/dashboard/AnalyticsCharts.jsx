import { useMemo } from 'react'
import { motion } from 'framer-motion'

const STYLE_COLORS = {
  Calligraphy: '#c9934a',
  Landscape:   '#7eb8a4',
  Abstract:    '#9b8ec4',
  'Still Life': '#e07b7b',
  Other:        '#6b7280',
}

function getLast14Days() {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function fmt(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

// ─── 14-Day Bar Chart ────────────────────────────────────────────────────────
function BarChart({ orders }) {
  const days = getLast14Days()

  const counts = useMemo(() => {
    return days.map((day) =>
      orders.filter((o) => o.created_at?.slice(0, 10) === day).length
    )
  }, [orders, days])

  const max = Math.max(...counts, 1)
  const W = 560
  const H = 140
  const barW = Math.floor(W / days.length) - 4

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
      <h3 className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-white/40">
        Orders — Last 14 Days
      </h3>
      <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" aria-hidden>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0} y1={H - H * f} x2={W} y2={H - H * f}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />
        ))}

        {/* Bars */}
        {counts.map((count, i) => {
          const bh = max === 0 ? 0 : Math.max((count / max) * H, count > 0 ? 4 : 0)
          const x = i * (W / days.length) + 2
          const y = H - bh
          const isToday = i === days.length - 1

          return (
            <g key={days[i]}>
              <motion.rect
                x={x}
                y={H}
                width={barW}
                height={0}
                rx={4}
                fill={isToday ? '#c9934a' : 'rgba(201,147,74,0.35)'}
                animate={{ y, height: bh }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: [0.4, 0, 0.2, 1] }}
              />
              {count > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize={9}
                  fontFamily="DM Sans, sans-serif"
                >
                  {count}
                </text>
              )}
            </g>
          )
        })}

        {/* X-axis labels — show every 2nd */}
        {days.map((day, i) => {
          if (i % 2 !== 0) return null
          const x = i * (W / days.length) + barW / 2 + 2
          return (
            <text
              key={day}
              x={x}
              y={H + 18}
              textAnchor="middle"
              fill="rgba(255,255,255,0.3)"
              fontSize={8.5}
              fontFamily="DM Sans, sans-serif"
            >
              {fmt(day)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ orders }) {
  const styleCounts = useMemo(() => {
    const map = {}
    orders.forEach((o) => {
      const s = o.art_style || 'Other'
      map[s] = (map[s] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [orders])

  const total = orders.length || 1
  const R = 52
  const CX = 70
  const CY = 70
  const strokeWidth = 18
  const circumference = 2 * Math.PI * R

  let offset = 0
  const slices = styleCounts.map(([style, count]) => {
    const fraction = count / total
    const stroke = fraction * circumference
    const dashOffset = -offset * circumference
    offset += fraction
    return { style, count, stroke, dashOffset, color: STYLE_COLORS[style] || STYLE_COLORS.Other }
  })

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
      <h3 className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-white/40">
        Orders by Art Style
      </h3>
      {orders.length === 0 ? (
        <p className="py-8 text-center font-body text-sm text-white/30">No orders yet</p>
      ) : (
        <div className="flex items-center gap-6">
          {/* Donut */}
          <svg viewBox="0 0 140 140" className="w-32 flex-shrink-0" aria-hidden>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
            {slices.map(({ style, stroke, dashOffset, color }) => (
              <motion.circle
                key={style}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${stroke} ${circumference - stroke}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${stroke} ${circumference - stroke}` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px` }}
              />
            ))}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="white" fontSize={20} fontWeight="600" fontFamily="Playfair Display, serif">
              {total}
            </text>
            <text x={CX} y={CY + 10} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="DM Sans, sans-serif">
              orders
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-col gap-2.5 min-w-0">
            {slices.map(({ style, count, color }) => (
              <div key={style} className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="truncate font-body text-xs text-white/70">{style}</span>
                <span className="ml-auto pl-2 font-body text-xs font-semibold text-white/50">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Custom vs Quick Split ────────────────────────────────────────────────────
function TypeSplit({ orders }) {
  const custom = orders.filter((o) => o._table === 'custom' || o.order_type === 'custom').length
  const quick  = orders.filter((o) => o._table === 'quick'  || o.order_type === 'quick').length
  const total  = custom + quick || 1
  const customPct = Math.round((custom / total) * 100)
  const quickPct  = 100 - customPct

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
      <h3 className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-white/40">
        Custom vs Quick Orders
      </h3>
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between font-body text-xs text-white/60">
            <span>Custom Commission</span>
            <span className="font-semibold text-[#c9934a]">{custom} ({customPct}%)</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#b37e3b] to-[#c9934a]"
              initial={{ width: 0 }}
              animate={{ width: `${customPct}%` }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex justify-between font-body text-xs text-white/60">
            <span>Gallery Quick Order</span>
            <span className="font-semibold text-[#7eb8a4]">{quick} ({quickPct}%)</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#5f9e8a] to-[#7eb8a4]"
              initial={{ width: 0 }}
              animate={{ width: `${quickPct}%` }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── City Rankings ────────────────────────────────────────────────────────────
function CityRankings({ orders }) {
  const cityCounts = useMemo(() => {
    const map = {}
    orders.forEach((o) => {
      const raw = o.city || ''
      // Normalize — take just the city part before comma
      const city = raw.split(',')[0].trim()
      if (city) map[city] = (map[city] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [orders])

  const max = cityCounts[0]?.[1] || 1

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
      <h3 className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-white/40">
        Top Cities by Orders
      </h3>
      {cityCounts.length === 0 ? (
        <p className="py-4 text-center font-body text-sm text-white/30">No data yet</p>
      ) : (
        <div className="space-y-3">
          {cityCounts.map(([city, count], i) => (
            <motion.div
              key={city}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="w-4 flex-shrink-0 text-right font-body text-[10px] text-white/30">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex justify-between">
                  <span className="truncate font-body text-xs text-white/80">{city}</span>
                  <span className="ml-2 font-body text-xs font-semibold text-[#c9934a]">{count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #b37e3b, #c9934a)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / max) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export { BarChart, DonutChart, TypeSplit, CityRankings }
