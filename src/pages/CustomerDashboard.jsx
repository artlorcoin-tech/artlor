import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Layout, ShoppingBag, Clock, MapPin, 
  ArrowRight, LogOut, RefreshCw, Compass, Shield, Plus, Paintbrush
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import BrandHeader from '../components/BrandHeader'
import SEO from '../components/SEO'

const REFRESH_INTERVAL = 12 * 1000 // Refresh active matching orders every 12s

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  
  // Orders states
  const [activeOrders, setActiveOrders] = useState([])     // From local Node matching engine
  const [persistentOrders, setPersistentOrders] = useState([]) // From Supabase database
  
  const [loadingActive, setLoadingActive] = useState(false)
  const [loadingPersistent, setLoadingPersistent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. Check/Get Authenticated User
  useEffect(() => {
    async function getUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          navigate('/login', { replace: true })
          return
        }
        setUser(session.user)
      } catch (err) {
        console.error('Error fetching session:', err)
        navigate('/login', { replace: true })
      } finally {
        setLoadingUser(false)
      }
    }
    getUserData()
  }, [navigate])

  // 2. Fetch Active Matching Orders from local backend Express server
  const fetchActiveOrders = useCallback(async (silent = false) => {
    if (!user) return
    if (!silent) setLoadingActive(true)
    setErrorMsg('')
    try {
      // Query local backend orders route
      const res = await fetch('http://localhost:4000/api/orders')
      if (!res.ok) throw new Error('Matching server returned error status')
      const json = await res.json()
      if (json.success) {
        // Filter orders placed by the current authenticated user's email
        const userEmail = user.email.toLowerCase()
        const userActive = json.data.filter(
          (o) => o.customerEmail && o.customerEmail.toLowerCase() === userEmail
        )
        setActiveOrders(userActive)
      }
    } catch (err) {
      console.warn('[CustomerDashboard] Active orders sync warning:', err.message)
      // We don't block the screen, just notify if active orders fail to sync
    } finally {
      setLoadingActive(false)
    }
  }, [user])

  // 3. Fetch Persistent Orders from Supabase database
  const fetchPersistentOrders = useCallback(async () => {
    if (!user) return
    setLoadingPersistent(true)
    try {
      const userEmail = user.email.toLowerCase()
      
      // Query custom_orders and quick_orders matching customer email
      const [customRes, quickRes] = await Promise.all([
        supabase.from('custom_orders').select('*').eq('email', userEmail),
        supabase.from('quick_orders').select('*').eq('email', userEmail)
      ])

      if (customRes.error) throw customRes.error
      if (quickRes.error) throw quickRes.error

      const merged = [
        ...(customRes.data || []).map((o) => ({ ...o, type: 'custom' })),
        ...(quickRes.data || []).map((o) => ({ ...o, type: 'quick' }))
      ]

      // Sort by created_at desc
      merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setPersistentOrders(merged)
    } catch (err) {
      console.error('[CustomerDashboard] Database fetch failed:', err.message)
      setErrorMsg('Failed to fetch persistent orders from database.')
    } finally {
      setLoadingPersistent(false)
    }
  }, [user])

  // Trigger loads once user is loaded
  useEffect(() => {
    if (!user) return
    
    fetchActiveOrders()
    fetchPersistentOrders()

    // Poll active orders for status updates (searching, matched, accepted, etc.)
    const timer = setInterval(() => fetchActiveOrders(true), REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [user, fetchActiveOrders, fetchPersistentOrders])

  // Handle Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Format Date utility
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loadingUser) {
    return (
      <main className="paper-bg page-pad min-h-screen flex flex-col items-center justify-center">
        <BrandHeader />
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--brand-gold)] border-t-transparent" />
          <p className="font-body text-sm text-slate-500">Loading your profile...</p>
        </div>
      </main>
    )
  }

  // Get user profile details
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Artlor Client'
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''

  return (
    <main className="paper-bg page-pad min-h-screen text-slate-800">
      <SEO 
        title="Customer Dashboard" 
        description="View your active art commission requests, live matching status, and persistent order history." 
        robots="noindex, nofollow"
      />
      <BrandHeader />

      <div className="content-max max-w-6xl">
        {/* Profile Header Block */}
        <header className="mb-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt={userName} 
                className="h-16 w-16 rounded-full border-2 border-[var(--brand-gold)] shadow-sm object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border-2 border-[var(--brand-gold)] bg-[var(--brand-cream)] text-[var(--brand-brown)] flex items-center justify-center font-bold text-2xl shadow-sm">
                {userName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">{userName}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-500 font-body mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  Verified Client
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                fetchActiveOrders()
                fetchPersistentOrders()
              }}
              className="pill-btn border border-slate-200 bg-white text-slate-700 px-4 py-2 text-xs font-semibold gap-1.5 cursor-pointer outline-none hover:bg-slate-50"
            >
              <RefreshCw className={`h-3 w-3 ${loadingActive || loadingPersistent ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleLogout}
              className="pill-btn border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 px-4 py-2 text-xs font-semibold gap-1.5 cursor-pointer outline-none"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 font-body text-xs text-rose-600">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left / Active Proximity Matching Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-md">
              <h2 className="font-display text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>Active Live Matches</span>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="font-body text-xs text-slate-400 mt-1">
                Real-time commission matching simulation on our local Node server.
              </p>

              <div className="mt-5 space-y-4">
                {loadingActive && activeOrders.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--brand-gold)] border-t-transparent" />
                  </div>
                ) : activeOrders.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-body text-xs">
                    <Compass className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    No active matching requests
                  </div>
                ) : (
                  activeOrders.map((o) => (
                    <div 
                      key={o._id} 
                      className="rounded-2xl border border-[var(--brand-light)] bg-[var(--brand-cream)]/30 p-4 shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--brand-brown)] tracking-wider">
                            {o.category}
                          </span>
                          <h3 className="font-display font-bold text-slate-800 text-sm mt-0.5">
                            {o.size} Commission
                          </h3>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          o.status === 'searching' 
                            ? 'bg-amber-100 text-amber-800 animate-pulse' 
                            : o.status === 'offered'
                            ? 'bg-blue-100 text-blue-800'
                            : o.status === 'accepted' || o.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {o.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-body">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{o.deliveryAddress || 'Address details saved'}</span>
                      </div>

                      <Link
                        to={`/track/${o._id}`}
                        className="pill-btn pill-btn-primary w-full py-2.5 text-xs font-bold gap-1 flex items-center justify-center shadow-md hover:shadow-lg"
                      >
                        Track Live Match <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-md space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900">Need another painting?</h3>
              <p className="font-body text-xs text-slate-500">
                Order custom canvases or choose instant matching for calligraphy, portraits, and landscapes.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/order"
                  className="pill-btn pill-btn-primary w-full py-3 text-xs font-bold gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Commission Art
                </Link>
                <Link
                  to="/gallery"
                  className="pill-btn border border-slate-200 hover:bg-slate-50 text-slate-700 w-full py-3 text-xs font-semibold gap-1.5"
                >
                  <Paintbrush className="h-4 w-4 text-slate-500" /> Browse Gallery
                </Link>
              </div>
            </div>
          </div>

          {/* Right / Persistent Transaction Records */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-md min-h-[400px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Your Order History</h2>
                    <p className="font-body text-xs text-slate-400 mt-0.5">
                      Persistent database transaction records synchronized with Supabase database.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 font-body text-xs font-bold">
                    {persistentOrders.length} records
                  </span>
                </div>

                {loadingPersistent && persistentOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--brand-gold)] border-t-transparent" />
                    <p className="font-body text-xs text-slate-400">Loading order records...</p>
                  </div>
                ) : persistentOrders.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-body">
                    <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-600">No Orders Placed Yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Once you place a custom order or purchase a painting from the gallery, it will show up here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body text-sm border-collapse min-w-[550px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                          <th className="pb-3 pr-4">Order Number</th>
                          <th className="pb-3 px-4">Art Details</th>
                          <th className="pb-3 px-4">Location</th>
                          <th className="pb-3 px-4">Flow Type</th>
                          <th className="pb-3 pl-4">Placed Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {persistentOrders.map((o) => {
                          const isCustom = o.type === 'custom'
                          return (
                            <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                              {/* Order Num */}
                              <td className="py-4 pr-4 font-mono text-xs font-bold text-[var(--brand-brown)]">
                                {o.id.substring(0, 8).toUpperCase()}
                              </td>

                              {/* Details */}
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900">{o.art_style}</span>
                                  <span className="text-xs text-slate-400">{o.artwork_size}</span>
                                </div>
                              </td>

                              {/* Location */}
                              <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5 max-w-[150px] truncate">
                                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                  {o.city || 'Not specified'}
                                </span>
                              </td>

                              {/* Type */}
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  isCustom 
                                    ? 'bg-[rgba(201,147,74,0.1)] text-[#c9934a]' 
                                    : 'bg-[rgba(126,184,164,0.1)] text-[#7eb8a4]'
                                }`}>
                                  {isCustom ? 'Custom' : 'Quick Order'}
                                </span>
                              </td>

                              {/* Date */}
                              <td className="py-4 pl-4 text-xs text-slate-400 font-semibold">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDate(o.created_at)}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom footer text */}
              <div className="mt-8 border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400 font-body">
                Verified with Supabase database encryption · Transactions are final and secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
