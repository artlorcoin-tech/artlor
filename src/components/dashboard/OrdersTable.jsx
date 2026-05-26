import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Download, Copy, Check, ChevronDown,
  Paintbrush2, MapPin, Phone, Mail, Clock, Zap, Filter
} from 'lucide-react'

const TYPE_TABS = ['All', 'Custom', 'Quick']
const STYLES = ['All Styles', 'Calligraphy', 'Landscape', 'Abstract', 'Still Life']

function fmt(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1)  return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24)  return `${diffHrs}h ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function isRecent(dateStr) {
  if (!dateStr) return false
  return (new Date() - new Date(dateStr)) < 60 * 60 * 1000
}

function exportCSV(orders) {
  const headers = ['Name','Style','Size','City','Phone','Email','Type','Date']
  const rows = orders.map((o) => [
    o.from_name || '',
    o.art_style || '',
    o.artwork_size || '',
    o.city || '',
    o.phone || '',
    o.email || '',
    o._table || o.order_type || '',
    o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : '',
  ])

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `artlor-orders-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback((e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [text])

  return (
    <button
      onClick={copy}
      title="Copy"
      className="ml-1 inline-flex flex-shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-body text-[10px] text-white/40 transition hover:bg-white/10 hover:text-white/80 cursor-pointer outline-none"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

export default function OrdersTable({ orders, loading }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('All')
  const [styleFilter, setStyleFilter] = useState('All Styles')
  const [expanded, setExpanded] = useState(null)

  const filtered = useMemo(() => {
    let list = orders
    if (tab === 'Custom') list = list.filter((o) => o._table === 'custom' || o.order_type === 'custom')
    if (tab === 'Quick')  list = list.filter((o) => o._table === 'quick'  || o.order_type === 'quick')
    if (styleFilter !== 'All Styles') list = list.filter((o) => o.art_style === styleFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((o) =>
        (o.from_name || '').toLowerCase().includes(q) ||
        (o.city || '').toLowerCase().includes(q) ||
        (o.art_style || '').toLowerCase().includes(q) ||
        (o.phone || '').includes(q) ||
        (o.email || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, tab, styleFilter, search])

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search name, city, style, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-4 font-body text-xs text-white placeholder-white/25 outline-none transition focus:border-[rgba(201,147,74,0.4)] focus:bg-white/[0.06]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type tabs */}
          <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
            {TYPE_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 font-body text-xs font-semibold transition cursor-pointer outline-none ${
                  tab === t
                    ? 'bg-[rgba(201,147,74,0.2)] text-[#c9934a]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Style filter */}
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="appearance-none rounded-lg border border-white/[0.08] bg-white/[0.04] py-1.5 pl-7 pr-6 font-body text-xs text-white/70 outline-none transition focus:border-[rgba(201,147,74,0.3)] cursor-pointer"
            >
              {STYLES.map((s) => (
                <option key={s} value={s} className="bg-[#1c1c1e]">{s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
          </div>

          {/* Export */}
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-1.5 rounded-lg border border-[rgba(201,147,74,0.25)] bg-[rgba(201,147,74,0.08)] px-3 py-1.5 font-body text-xs font-semibold text-[#c9934a] transition hover:bg-[rgba(201,147,74,0.15)] cursor-pointer outline-none"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]">
        <span className="font-body text-[10px] text-white/30">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''} shown
        </span>
        {loading && (
          <span className="flex items-center gap-1 font-body text-[10px] text-[#c9934a]">
            <Zap className="h-3 w-3 animate-pulse" /> Refreshing…
          </span>
        )}
      </div>

      {/* Table / Mobile Cards */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-white/30">
            <Paintbrush2 className="h-8 w-8 opacity-30" />
            <p className="font-body text-sm">No orders match your filters</p>
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Customer', 'Style · Size', 'City', 'Contact', 'Type', 'Placed'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-body text-[10px] font-semibold uppercase tracking-widest text-white/30"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((order, i) => {
                  const recent = isRecent(order.created_at)
                  const isCustom = order._table === 'custom' || order.order_type === 'custom'
                  const isExpanded = expanded === (order.id || i)

                  return (
                    <motion.tr
                      key={order.id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                      onClick={() => setExpanded(isExpanded ? null : (order.id || i))}
                      className={`group cursor-pointer border-b border-white/[0.04] transition-colors last:border-0 ${
                        recent
                          ? 'bg-[rgba(201,147,74,0.04)] hover:bg-[rgba(201,147,74,0.08)]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {recent && (
                            <span className="flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#c9934a]">
                              <span className="h-full w-full animate-ping rounded-full bg-[#c9934a] opacity-75" />
                            </span>
                          )}
                          <span className="font-body text-sm font-medium text-white/90 truncate max-w-[130px]">
                            {order.from_name || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Style · Size */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-body text-xs font-semibold text-white/80">
                            {order.art_style || '—'}
                          </span>
                          <span className="font-body text-[10px] text-white/35">
                            {order.artwork_size || '—'}
                          </span>
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-white/60">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="font-body text-xs truncate max-w-[110px]">
                            {order.city || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          {order.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 flex-shrink-0 text-white/30 mr-1" />
                              <span className="font-body text-[11px] text-white/65 font-mono">
                                {order.phone}
                              </span>
                              <CopyButton text={order.phone} />
                            </div>
                          )}
                          {order.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 flex-shrink-0 text-white/30 mr-1" />
                              <span className="font-body text-[10px] text-white/40 truncate max-w-[140px]">
                                {order.email}
                              </span>
                              <CopyButton text={order.email} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-body text-[10px] font-semibold ${
                            isCustom
                              ? 'bg-[rgba(201,147,74,0.12)] text-[#c9934a]'
                              : 'bg-[rgba(126,184,164,0.12)] text-[#7eb8a4]'
                          }`}
                        >
                          {isCustom ? 'Custom' : 'Quick'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-white/40">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="font-body text-[11px]">{fmt(order.created_at)}</span>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
