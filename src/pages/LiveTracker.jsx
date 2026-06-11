import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Radar, MapPin, User, Star, CheckCircle, AlertTriangle, 
  Terminal, ShieldCheck, Phone, MessageSquare, ArrowRight, Brush
} from 'lucide-react'
import { useSocket, SERVER_URL } from '../hooks/useSocket'
import BrandHeader from '../components/BrandHeader'
import SEO from '../components/SEO'

export default function LiveTracker() {
  const { orderId } = useParams()
  const { socket, isConnected } = useSocket()
  
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('searching') // searching, offered, accepted, rejected, cancelled
  const [attempt, setAttempt] = useState(1)
  const [currentArtistName, setCurrentArtistName] = useState('')
  const [currentDistance, setCurrentDistance] = useState(null)
  const [totalArtists, setTotalArtists] = useState(0)
  const [logs, setLogs] = useState([])
  const [timeLeft, setTimeLeft] = useState(30)
  
  const timerRef = useRef(null)
  const logsEndRef = useRef(null)

  // Add a log entry
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false })
    setLogs((prev) => [...prev, { timestamp, message }])
  }

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Fetch initial order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/orders/${orderId}`)
        const json = await res.json()
        if (json.success) {
          const data = json.data
          setOrder(data)
          setStatus(data.status)
          
          if (data.status === 'accepted' && data.assignedArtist) {
            addLog(`Order accepted by artist: ${data.assignedArtist.name}`)
          } else if (data.status === 'offered' && data.currentOfferArtist) {
            setCurrentArtistName(data.currentOfferArtist.name)
            setCurrentDistance(data.currentOfferDistance)
            setStatus('offered')
            addLog(`Offer sent to ${data.currentOfferArtist.name} (${data.currentOfferDistance} km away)`)
            
            // Calculate remaining time
            if (data.offerSentAt) {
              const elapsed = Math.floor((Date.now() - new Date(data.offerSentAt).getTime()) / 1000)
              const remaining = Math.max(30 - elapsed, 0)
              setTimeLeft(remaining)
            }
          } else if (data.status === 'rejected') {
            setStatus('rejected')
            addLog(`No artists accepted this commission request.`)
          } else {
            addLog(`Order initialized in status: ${data.status}`)
            addLog('Searching for nearby specialized artists...')
          }
        }
      } catch (err) {
        console.error('Failed to load order:', err)
        addLog('Error fetching order status. Retrying...')
      }
    }

    fetchOrder()
  }, [orderId])

  // Socket listener setup
  useEffect(() => {
    if (!socket) return

    // Join order room
    socket.emit('customer:joinOrder', { orderId })
    addLog('[Socket] Connected. Joined live order room.')

    // Listeners
    socket.on('match:searching', (data) => {
      setStatus('offered')
      setCurrentArtistName(data.artistName)
      setCurrentDistance(data.distance)
      setAttempt(data.attemptNumber)
      setTotalArtists(data.totalAvailable)
      setTimeLeft(30)
      
      addLog(`[Attempt ${data.attemptNumber}] Match attempt dispatched to ${data.artistName} (${data.distance} km away).`)
    })

    socket.on('match:rejected', (data) => {
      setStatus('searching')
      setCurrentArtistName('')
      setCurrentDistance(null)
      addLog(`[System] ${data.message}`)
    })

    socket.on('match:accepted', (data) => {
      setStatus('accepted')
      setOrder((prev) => ({
        ...prev,
        status: 'accepted',
        assignedArtist: data.artist,
        matchDistance: data.artist.distance,
      }))
      addLog(`🎉 SUCCESS! Commission accepted by ${data.artist.name}!`)
      addLog(`[Handshake] Artist is now preparing for details.`)
    })

    socket.on('match:noArtists', (data) => {
      setStatus('rejected')
      addLog(`⚠️ [Alert] ${data.message}`)
    })

    return () => {
      socket.off('match:searching')
      socket.off('match:rejected')
      socket.off('match:accepted')
      socket.off('match:noArtists')
    }
  }, [socket, orderId])

  // Countdown timer for offered status
  useEffect(() => {
    if (status === 'offered') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }

    return () => clearInterval(timerRef.current)
  }, [status])

  return (
    <main className="paper-bg page-pad min-h-screen text-slate-800">
      <SEO 
        title="Live Commission Matching Status" 
        description="Real-time artist assignment tracker for your custom Artlor painting commission." 
        robots="noindex, nofollow"
      />
      <BrandHeader />
      
      <div className="content-max max-w-5xl">
        <header className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--brand-brown)] sm:text-4xl">
              Live Assignment Tracker
            </h1>
            <p className="font-body text-sm text-slate-600">
              Order ID: <code className="rounded bg-slate-200/60 px-1.5 py-0.5 text-xs text-[var(--brand-brown)] font-bold">{orderId}</code>
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-semibold">
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {isConnected ? 'Real-Time Sync Active' : 'Connecting to Server...'}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Radar / Status Panel (Left/Center) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-md min-h-[460px]">
            <AnimatePresence mode="wait">
              
              {/* STATUS: SEARCHING OR OFFERED (Radar scan mode) */}
              {(status === 'searching' || status === 'offered' || status === 'pending') && (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  {/* Glowing Radar Circle */}
                  <div className="relative mb-8 flex h-52 w-52 items-center justify-center rounded-full border border-[var(--brand-brown)]/10 bg-[var(--brand-cream)]/20 shadow-[inset_0_0_30px_rgba(122,74,46,0.05)]">
                    {/* Pulsating circles */}
                    <div className="absolute inset-0 rounded-full border border-[var(--brand-brown)]/10 animate-ping opacity-35" />
                    <div className="absolute inset-8 rounded-full border border-[var(--brand-brown)]/15 animate-pulse opacity-50" />
                    <div className="absolute inset-16 rounded-full border border-[var(--brand-brown)]/20" />
                    
                    {/* Scanning sweep */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-[var(--brand-gold)]/5 to-[var(--brand-gold)]/20 animate-[spin_4s_linear_infinite]" 
                         style={{ transformOrigin: 'center' }} />

                    <div className="relative z-10 flex flex-col items-center">
                      <Radar className="h-10 w-10 text-[var(--brand-brown)] animate-[pulse_2s_ease-in-out_infinite]" />
                      {status === 'offered' && (
                        <div className="mt-2 text-xs font-bold text-[var(--brand-brown)]">
                          {timeLeft}s remaining
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-semibold text-[var(--brand-dark)]">
                    {status === 'offered' ? 'Sending Offer...' : 'Locating Nearby Artists...'}
                  </h3>
                  
                  <p className="mt-2 max-w-sm font-body text-sm text-slate-600">
                    {status === 'offered' 
                      ? `We found ${currentArtistName} (${currentDistance} km away). Waiting for confirmation.` 
                      : 'Searching for online painters specialized in ' + (order?.category || 'your style') + ' within 50 km.'}
                  </p>

                  {status === 'offered' && (
                    <div className="mt-6 w-full max-w-xs rounded-full bg-slate-100 h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: timeLeft, ease: 'linear' }}
                        className="bg-[var(--brand-brown)] h-full"
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {/* STATUS: ACCEPTED (Matched celebration card) */}
              {status === 'accepted' && order?.assignedArtist && (
                <motion.div
                  key="accepted"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  
                  <h2 className="font-display text-3xl font-bold text-slate-900">Artist Matched! 🎨</h2>
                  <p className="font-body text-sm text-slate-500 mt-1">
                    Your request has been successfully assigned
                  </p>

                  {/* Premium Artist Card */}
                  <div className="mt-6 w-full max-w-md rounded-3xl border border-[var(--brand-light)] bg-gradient-to-br from-white to-[var(--brand-cream)]/20 p-5 shadow-lg text-left">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-gold)] bg-white text-[var(--brand-brown)] font-bold text-2xl shadow-sm">
                        {order.assignedArtist.name.split(' ').map(n=>n[0]).join('')}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-slate-900">{order.assignedArtist.name}</h3>
                        <p className="mt-1 font-body text-xs text-slate-500 italic max-h-16 overflow-y-auto">
                          {order.assignedArtist.bio || 'Professional custom painting artist at Artlor.'}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap gap-2.5 items-center">
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {order.assignedArtist.rating} Rating
                          </span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                            <Brush className="h-3 w-3 text-[var(--brand-brown)]" />
                            {order.assignedArtist.completedOrders || 0} Finished
                          </span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {order.matchDistance ? `${order.matchDistance} km` : 'Local Match'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-200/60 pt-4 flex gap-3">
                      <a 
                        href={`tel:${order.assignedArtist.phone || '9876543210'}`} 
                        className="flex-1 pill-btn border border-[var(--brand-brown)] hover:bg-[var(--brand-brown)]/5 text-[var(--brand-brown)] py-2.5 text-xs font-bold gap-2"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Artist
                      </a>
                      <a 
                        href={`https://wa.me/91${order.assignedArtist.phone || '9876543210'}?text=Hi%20${encodeURIComponent(order.assignedArtist.name)},%20I'm%20matched%20with%20you%20on%20Artlor%20for%20a%20${encodeURIComponent(order.category)}%20painting!`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 pill-btn pill-btn-primary py-2.5 text-xs font-bold gap-2"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  <Link 
                    to="/gallery" 
                    className="mt-6 font-body text-sm font-semibold text-[var(--brand-brown)] hover:underline inline-flex items-center gap-1.5"
                  >
                    Return to gallery <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}

              {/* STATUS: REJECTED (No matches found) */}
              {status === 'rejected' && (
                <motion.div
                  key="rejected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-10 w-10" />
                  </div>
                  
                  <h3 className="font-display text-2xl font-semibold text-[var(--brand-dark)]">
                    No Artists Available
                  </h3>
                  
                  <p className="mt-2 max-w-sm font-body text-sm text-slate-600">
                    All artists in your area are currently occupied or unavailable for this category. Don't worry! Our support team will manually resolve and match you.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <a 
                      href="tel:+919876543210" 
                      className="flex-1 pill-btn pill-btn-primary py-3 text-sm"
                    >
                      Call Artlor Support
                    </a>
                    <Link 
                      to="/" 
                      className="flex-1 pill-btn border border-slate-300 text-slate-700 py-3 text-sm hover:bg-slate-50"
                    >
                      Go to Home
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom summary card */}
            <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-xs text-slate-500 font-body">
              <span>Category: <b>{order?.category || 'Custom Painting'}</b></span>
              <span>Size: <b>{order?.size || 'Medium'}</b></span>
            </div>
          </div>

          {/* Terminal Logs Panel (Right) */}
          <div className="lg:col-span-5 flex flex-col rounded-[28px] border border-slate-800 bg-[#16161a] p-4 text-slate-300 shadow-2xl h-[460px]">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold text-slate-400">
              <Terminal className="h-4 w-4 text-[var(--brand-gold)]" />
              <span>LOG CONSOLE</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                SECURE
              </span>
            </div>

            {/* Logs scrolling body */}
            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2.5 pr-1 no-scrollbar">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-slate-600">{log.timestamp}</span>
                  <span className="text-slate-500">|</span>
                  <span className={
                    log.message.includes('🎉') || log.message.includes('SUCCESS') 
                      ? 'text-emerald-400 font-semibold' 
                      : log.message.includes('Declined') || log.message.includes('declined') || log.message.includes('⚠️')
                      ? 'text-rose-400' 
                      : log.message.includes('[Attempt') 
                      ? 'text-[var(--brand-gold)]' 
                      : 'text-slate-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
