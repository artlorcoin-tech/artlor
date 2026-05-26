import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, BarChart2, LogOut,
  RefreshCw, Paintbrush2, MapPin, Zap, Users, TrendingUp,
  Package
} from 'lucide-react'
import PinGate, { isDashboardAuthenticated } from '../components/dashboard/PinGate'
import StatCard from '../components/dashboard/StatCard'
import OrdersTable from '../components/dashboard/OrdersTable'
import { BarChart, DonutChart, TypeSplit, CityRankings } from '../components/dashboard/AnalyticsCharts'
import { supabaseSelectBoth } from '../lib/supabase'
import { publicUrl } from '../publicUrl'

const REFRESH_INTERVAL = 30 * 1000 // 30 seconds

function computeStats(orders) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const total    = orders.length
  const custom   = orders.filter((o) => o._table === 'custom' || o.order_type === 'custom').length
  const quick    = orders.filter((o) => o._table === 'quick'  || o.order_type === 'quick').length
  const today    = orders.filter((o) => o.created_at && new Date(o.created_at) >= todayStart).length

  // Most popular style
  const styleMap = {}
  orders.forEach((o) => { if (o.art_style) styleMap[o.art_style] = (styleMap[o.art_style] || 0) + 1 })
  const topStyle = Object.entries(styleMap).sort((a, b) => b[1] - a[1])[0]

  // Top city
  const cityMap = {}
  orders.forEach((o) => {
    const city = (o.city || '').split(',')[0].trim()
    if (city) cityMap[city] = (cityMap[city] || 0) + 1
  })
  const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0]

  return {
    total, custom, quick, today,
    topStyle: topStyle?.[0] || '—',
    topCity:  topCity?.[0]  || '—',
  }
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV = [
  { label: 'Overview',   icon: LayoutDashboard, id: 'overview' },
  { label: 'Orders',     icon: ShoppingBag,      id: 'orders'   },
  { label: 'Analytics',  icon: BarChart2,         id: 'analytics'},
]

function Sidebar({ active, onNav, onLogout }) {
  return (
    <aside className="flex h-screen w-56 flex-shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0d0f]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-5">
        <img src={publicUrl('brand/artlor-logo.png')} alt="Artlor" className="h-8 w-8 rounded-full border border-[rgba(201,147,74,0.3)]" />
        <div>
          <p className="font-display text-sm font-medium text-white">Artlor</p>
          <p className="font-body text-[9px] uppercase tracking-widest text-white/30">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {NAV.map(({ label, icon: Icon, id }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium transition cursor-pointer outline-none ${
              active === id
                ? 'bg-[rgba(201,147,74,0.12)] text-[#c9934a]'
                : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
            {active === id && (
              <motion.span
                layoutId="sidebar-active"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c9934a]"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.07] p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-white/40 transition hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer outline-none"
        >
          <LogOut className="h-4 w-4" />
          Lock Dashboard
        </button>
      </div>
    </aside>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(isDashboardAuthenticated)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState('')
  const [activeNav, setActiveNav] = useState('overview')

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const data = await supabaseSelectBoth('order=created_at.desc&limit=200')
      setOrders(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to load orders. Check network connection.')
      console.error('[Dashboard]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    fetchOrders()

    const timer = setInterval(() => fetchOrders(true), REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [authenticated, fetchOrders])

  const handleLogout = () => {
    sessionStorage.removeItem('artlor-dashboard-auth')
    setAuthenticated(false)
  }

  if (!authenticated) {
    return <PinGate onUnlock={() => setAuthenticated(true)} />
  }

  const stats = computeStats(orders)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0c] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar active={activeNav} onNav={setActiveNav} onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0d0d0f] px-6 py-4">
          <div>
            <h1 className="font-display text-lg font-medium text-white">
              {activeNav === 'overview' ? 'Overview' : activeNav === 'orders' ? 'Orders' : 'Analytics'}
            </h1>
            {lastUpdated && (
              <p className="font-body text-[10px] text-white/30">
                Last updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile nav pills */}
            <div className="flex gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5 md:hidden">
              {NAV.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => setActiveNav(id)}
                  className={`rounded-md px-2.5 py-1.5 font-body text-[10px] font-semibold transition cursor-pointer outline-none ${
                    activeNav === id ? 'bg-[rgba(201,147,74,0.2)] text-[#c9934a]' : 'text-white/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchOrders()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-body text-xs text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40 cursor-pointer outline-none"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-body text-sm text-rose-300">
              ⚠ {error}
            </div>
          )}

          {/* ── Overview Section ── */}
          {(activeNav === 'overview' || activeNav === 'orders') && (
            <>
              {/* KPI Stat Cards */}
              {activeNav === 'overview' && (
                <section>
                  <h2 className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-white/30">
                    Key Metrics
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                    <StatCard label="Total Orders"    value={stats.total}    icon={Package}     delay={0}    />
                    <StatCard label="Custom Orders"   value={stats.custom}   icon={Paintbrush2} delay={0.05} accent="#c9934a" />
                    <StatCard label="Quick Orders"    value={stats.quick}    icon={Zap}         delay={0.10} accent="#7eb8a4" />
                    <StatCard label="Orders Today"    value={stats.today}    icon={TrendingUp}  delay={0.15} accent="#9b8ec4" />
                    <StatCard label="Top Style"       value={stats.topStyle} icon={Paintbrush2} delay={0.20} accent="#e07b7b" />
                    <StatCard label="Top City"        value={stats.topCity}  icon={MapPin}      delay={0.25} accent="#60a5fa" />
                  </div>
                </section>
              )}

              {/* Orders Table */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-white/30">
                    {activeNav === 'overview' ? 'Recent Orders' : 'All Orders'}
                  </h2>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-body text-[10px] text-white/40">
                    {orders.length} total
                  </span>
                </div>
                <OrdersTable orders={orders} loading={loading} />
              </section>
            </>
          )}

          {/* ── Analytics Section ── */}
          {activeNav === 'analytics' && (
            <section className="space-y-5">
              <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-white/30">
                Analytics &amp; Insights
              </h2>

              {/* KPI Cards mini row */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total"        value={stats.total}  icon={Package}     delay={0}    />
                <StatCard label="Custom"       value={stats.custom} icon={Paintbrush2} delay={0.05} accent="#c9934a" />
                <StatCard label="Quick"        value={stats.quick}  icon={Zap}         delay={0.10} accent="#7eb8a4" />
                <StatCard label="Today"        value={stats.today}  icon={TrendingUp}  delay={0.15} accent="#9b8ec4" />
              </div>

              {/* Bar chart full width */}
              <BarChart orders={orders} />

              {/* Two column: donut + type split */}
              <div className="grid gap-5 md:grid-cols-2">
                <DonutChart orders={orders} />
                <TypeSplit orders={orders} />
              </div>

              {/* City Rankings */}
              <CityRankings orders={orders} />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
