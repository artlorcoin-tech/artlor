import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, WifiOff, MapPin, User, Star, CheckSquare, 
  AlertCircle, Shield, X, BellRing, Phone, Send, Check
} from 'lucide-react'
import { useSocket, SERVER_URL } from '../hooks/useSocket'
import BrandHeader from '../components/BrandHeader'
import SEO from '../components/SEO'

// Seeded artists to choose from for demo/login
const ARTISTS_LIST = [
  { id: '65c1f1000000000000000001', name: 'Hammad Riyaz', city: 'Bangalore' },
  { id: '65c1f1000000000000000002', name: 'Muntaza Shaheen', city: 'Bangalore - Koramangala' },
  { id: '65c1f1000000000000000003', name: 'Maryam Khan', city: 'Mumbai' },
  { id: '65c1f1000000000000000004', name: 'Seebah Fathima', city: 'Delhi' },
  { id: '65c1f1000000000000000005', name: 'Arjun Mehta', city: 'Bangalore - Indiranagar' },
  { id: '65c1f1000000000000000006', name: 'Priya Nair', city: 'Kochi' },
  { id: '65c1f1000000000000000007', name: 'Ravi Shankar', city: 'Chennai' },
  { id: '65c1f1000000000000000008', name: 'Zainab Ahmed', city: 'Pune' },
  { id: '65c1f1000000000000000009', name: 'Vikram Singh', city: 'Jaipur' },
  { id: '65c1f100000000000000000a', name: 'Ananya Iyer', city: 'Hyderabad' },
]

export default function ArtistPortal() {
  const { socket, isConnected } = useSocket()
  
  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [artist, setArtist] = useState(null)
  const [isOnline, setIsOnline] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Simulated Location Coordinates
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [locationSaved, setLocationSaved] = useState(false)

  // Incoming offer state
  const [currentOffer, setCurrentOffer] = useState(null) // { orderId, category, size, customerName, distance, description }
  const [timeLeft, setTimeLeft] = useState(30)
  const [offerStatus, setOfferStatus] = useState('pending') // pending, accepted, rejected, expired
  const timerRef = useRef(null)

  // Fetch artist profile
  const fetchProfile = async (artistId) => {
    setLoading(true)
    try {
      const res = await fetch(`${SERVER_URL}/api/artists/${artistId}`)
      const json = await res.json()
      if (json.success) {
        setArtist(json.data)
        setIsOnline(json.data.isOnline)
        setLat(json.data.location.coordinates[1])
        setLng(json.data.location.coordinates[0])
      }
    } catch (err) {
      console.error('Failed to fetch artist profile:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle artist selection / login
  const handleLogin = (id) => {
    setSelectedArtistId(id)
    fetchProfile(id)
  }

  // Handle online/offline toggle
  const toggleOnline = () => {
    if (!socket || !artist) return
    
    if (!isOnline) {
      // Toggle Online
      socket.emit('artist:online', { artistId: artist._id })
      setIsOnline(true)
    } else {
      // Toggle Offline
      socket.emit('artist:offline', { artistId: artist._id })
      setIsOnline(false)
    }
  }

  // Handle location coordinate updates
  const updateLocation = async () => {
    if (!artist) return
    setLoading(true)
    try {
      const res = await fetch(`${SERVER_URL}/api/artists/${artist._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        }),
      })
      const json = await res.json()
      if (json.success) {
        setArtist(json.data)
        setLocationSaved(true)
        setTimeout(() => setLocationSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to update coordinates:', err)
    } finally {
      setLoading(false)
    }
  }

  // Socket listener setup
  useEffect(() => {
    if (!socket || !artist) return

    // Re-verify online state if socket connects
    socket.on('artist:statusUpdated', (data) => {
      setIsOnline(data.isOnline)
    })

    // Listen for new match orders dispatched to this artist
    socket.on('order:newRequest', (data) => {
      console.log('Received dispatch request:', data)
      setCurrentOffer(data)
      setOfferStatus('pending')
      setTimeLeft(30)
    })

    // Listen if the order gets cancelled by client
    socket.on('order:cancelled', (data) => {
      if (currentOffer && String(currentOffer.orderId) === String(data.orderId)) {
        setOfferStatus('expired')
        setTimeout(() => setCurrentOffer(null), 3000)
      }
    })

    return () => {
      socket.off('artist:statusUpdated')
      socket.off('order:newRequest')
      socket.off('order:cancelled')
    }
  }, [socket, artist, currentOffer])

  // Offer review timer countdown
  useEffect(() => {
    if (currentOffer && offerStatus === 'pending') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setOfferStatus('expired')
            // Trigger automatic reject/timeout update via socket
            socket.emit('order:reject', { 
              orderId: currentOffer.orderId, 
              artistId: artist._id,
              reason: 'Offer timed out (no response)'
            })
            setTimeout(() => setCurrentOffer(null), 3500)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }

    return () => clearInterval(timerRef.current)
  }, [currentOffer, offerStatus])

  // Accept Order Offer
  const handleAccept = () => {
    if (!socket || !currentOffer || !artist) return
    setOfferStatus('accepted')
    socket.emit('order:accept', { 
      orderId: currentOffer.orderId, 
      artistId: artist._id 
    })
    
    // Refresh artist profile to update completed orders count
    setTimeout(() => {
      fetchProfile(artist._id)
      setCurrentOffer(null)
    }, 4000)
  }

  // Reject Order Offer
  const handleReject = (reason = 'Decline request') => {
    if (!socket || !currentOffer || !artist) return
    setOfferStatus('rejected')
    socket.emit('order:reject', { 
      orderId: currentOffer.orderId, 
      artistId: artist._id,
      reason
    })
    setTimeout(() => setCurrentOffer(null), 1500)
  }

  return (
    <main className="paper-bg page-pad min-h-screen text-slate-800">
      <SEO 
        title="Artist Matching Console" 
        description="Portal for local Artlor artists to manage matching sessions and accept painting orders." 
        robots="noindex, nofollow"
      />
      <BrandHeader />

      <div className="content-max max-w-4xl">
        <header className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row border-b border-slate-200 pb-5">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--brand-brown)]">
              Artist Matching Console
            </h1>
            <p className="font-body text-sm text-slate-500">
              Select an artist profile to simulate matching notifications and updates.
            </p>
          </div>

          {/* Login selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedArtistId}
              onChange={(e) => handleLogin(e.target.value)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-[var(--brand-brown)]"
            >
              <option value="">-- Choose Artist Profile --</option>
              {ARTISTS_LIST.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.city})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* PROFILE WORKSPACE */}
        {artist ? (
          <div className="grid gap-6 md:grid-cols-12">
            
            {/* LEFT COLUMN: STATUS & PROFILE SUMMARY */}
            <div className="md:col-span-5 space-y-6">
              
              {/* Online/Offline Status Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Console Connection
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded bg-slate-100 px-2 py-0.5 ${isConnected ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {isOnline ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-800">
                        {isOnline ? 'Online & Active' : 'Offline'}
                      </h3>
                      <p className="font-body text-xs text-slate-400">
                        {isOnline ? 'Accepting commission requests' : 'Status set to offline'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={toggleOnline}
                    disabled={!isConnected}
                    className={`pill-btn text-xs font-bold px-4 py-2 cursor-pointer ${
                      isOnline 
                        ? 'border border-rose-500 text-rose-500 hover:bg-rose-50' 
                        : 'pill-btn-primary'
                    }`}
                  >
                    {isOnline ? 'Go Offline' : 'Go Online'}
                  </button>
                </div>
              </div>

              {/* Artist stats card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-md space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--brand-gold)] bg-[var(--brand-cream)] text-[var(--brand-brown)] font-bold text-xl">
                    {artist.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-800">{artist.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="flex items-center text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-0.5" />
                        {artist.rating}
                      </span>
                      <span>·</span>
                      <span>{artist.completedOrders} Orders finished</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Specializations</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {artist.categories.map((c) => (
                      <span key={c} className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LOCATION MODIFIERS & ACTIVE OFFERS */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Location update console */}
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-md">
                <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--brand-gold)]" />
                  Simulate GPS Location
                </h3>
                <p className="font-body text-xs text-slate-400 mt-1">
                  Change your coordinates to test proximity matching algorithm (50 km search radius).
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-body text-sm text-slate-700 outline-none focus:border-[var(--brand-brown)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-body text-sm text-slate-700 outline-none focus:border-[var(--brand-brown)] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {/* Quick Cities shortcut */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setLat('12.9716'); setLng('77.5946') }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold"
                    >
                      Bangalore
                    </button>
                    <button
                      onClick={() => { setLat('19.0760'); setLng('72.8777') }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold"
                    >
                      Mumbai
                    </button>
                    <button
                      onClick={() => { setLat('28.6139'); setLng('77.2090') }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold"
                    >
                      Delhi
                    </button>
                  </div>

                  <button
                    onClick={updateLocation}
                    disabled={loading}
                    className="pill-btn pill-btn-primary text-xs px-4 py-2 flex gap-1 items-center"
                  >
                    {locationSaved ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                    {locationSaved ? 'Saved!' : 'Save Coordinates'}
                  </button>
                </div>
              </div>

              {/* Status information pane */}
              <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-400 font-body text-sm">
                <BellRing className="h-8 w-8 text-[var(--brand-brown)]/40 mx-auto mb-2" />
                <p className="font-semibold text-slate-500">Awaiting Order Offers...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  When a customer places a matching order near your coordinates, a real-time modal will pop up here. Keep status set to <b>Online</b>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/40 p-12 text-center text-slate-400 font-body">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-600">No Profile Selected</p>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
              Select one of the simulated artist profiles from the dropdown at the top right to start receiving order dispatches.
            </p>
          </div>
        )}

        {/* FULL SCREEN OFFER POPUP */}
        <AnimatePresence>
          {currentOffer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="w-full max-w-lg overflow-hidden rounded-[32px] border border-slate-700 bg-[#16161c] p-6 text-slate-200 shadow-2xl relative"
              >
                {/* Status: Pending review */}
                {offerStatus === 'pending' && (
                  <>
                    {/* Ringing Bell Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] rounded-full flex items-center justify-center border border-[var(--brand-gold)]/20 animate-bounce">
                        <BellRing className="h-8 w-8 animate-pulse" />
                      </div>
                    </div>

                    <h2 className="text-center font-display text-2xl font-bold text-white">
                      New Painting Commission Offer!
                    </h2>
                    <p className="text-center text-xs text-slate-400 font-body mt-1">
                      Distance: <span className="text-[var(--brand-gold)] font-bold">{currentOffer.distance} km</span>
                    </p>

                    {/* Offer details */}
                    <div className="mt-5 bg-slate-900/50 rounded-2xl p-4 border border-slate-800 space-y-3 font-body text-sm">
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">Category</span>
                        <span className="font-bold text-white">{currentOffer.category}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">Artwork Size</span>
                        <span className="font-semibold text-slate-300">{currentOffer.size}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">Customer</span>
                        <span className="font-semibold text-slate-300">{currentOffer.customerName}</span>
                      </div>
                      <div className="flex flex-col gap-1 border-b border-slate-800 pb-2">
                        <span className="text-slate-500">Delivery Address</span>
                        <span className="text-xs text-slate-300">{currentOffer.deliveryAddress}</span>
                      </div>
                      {currentOffer.description && (
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500">Description / Details</span>
                          <span className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800/40 italic">
                            &quot;{currentOffer.description}&quot;
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar Timer */}
                    <div className="mt-5">
                      <div className="flex justify-between text-xs text-slate-500 font-bold mb-1">
                        <span>Offer Timeout</span>
                        <span className="text-[var(--brand-gold)]">{timeLeft}s remaining</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: 30, ease: 'linear' }}
                          className="bg-gradient-to-r from-[var(--brand-gold)] to-amber-500 h-full"
                        />
                      </div>
                    </div>

                    {/* Accept/Reject Buttons */}
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => handleReject('Artist declined request')}
                        className="flex-1 pill-btn border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white py-3 text-sm font-semibold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={handleAccept}
                        className="flex-1 pill-btn pill-btn-primary py-3 text-sm font-bold shadow-lg"
                      >
                        Accept Commission
                      </button>
                    </div>
                  </>
                )}

                {/* Status: Accepted */}
                {offerStatus === 'accepted' && (
                  <div className="text-center py-6">
                    <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 mx-auto mb-4">
                      <Check className="h-8 w-8" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Commission Accepted!</h2>
                    <p className="font-body text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                      You are now assigned to this order. Contact the client to confirm details and start painting!
                    </p>
                  </div>
                )}

                {/* Status: Rejected */}
                {offerStatus === 'rejected' && (
                  <div className="text-center py-6">
                    <div className="h-16 w-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center border border-rose-500/20 mx-auto mb-4">
                      <X className="h-8 w-8" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Offer Declined</h2>
                    <p className="font-body text-sm text-slate-400 mt-2">
                      Moving order dispatch to the next nearest artist...
                    </p>
                  </div>
                )}

                {/* Status: Expired */}
                {offerStatus === 'expired' && (
                  <div className="text-center py-6">
                    <div className="h-16 w-16 bg-slate-500/10 text-slate-400 rounded-full flex items-center justify-center border border-slate-500/20 mx-auto mb-4">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Offer Expired</h2>
                    <p className="font-body text-sm text-slate-400 mt-2">
                      Request timeout exceeded. Moving request to the next artist...
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
