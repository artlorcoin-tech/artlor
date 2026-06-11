import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Confirm from './pages/Confirm'
import Gallery from './pages/Gallery'
import Home from './pages/Home'
import OrderForm from './pages/OrderForm'
import QuickOrder from './pages/QuickOrder'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import EidCelebration from './components/EidCelebration'
import LiveTracker from './pages/LiveTracker'
import ArtistPortal from './pages/ArtistPortal'
import DesignSystemShowcase from './pages/DesignSystemShowcase'


function PageTransition({ children }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/gallery"
          element={
            <PageTransition>
              <Gallery />
            </PageTransition>
          }
        />
        <Route
          path="/order"
          element={
            <PageTransition>
              <OrderForm />
            </PageTransition>
          }
        />
        <Route
          path="/quick-order"
          element={
            <PageTransition>
              <QuickOrder />
            </PageTransition>
          }
        />
        <Route
          path="/confirm"
          element={
            <PageTransition>
              <Confirm />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Contact />
            </PageTransition>
          }
        />
        <Route
          path="/privacy"
          element={
            <PageTransition>
              <Privacy />
            </PageTransition>
          }
        />
        <Route
          path="/terms"
          element={
            <PageTransition>
              <Terms />
            </PageTransition>
          }
        />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/track/:orderId"
          element={
            <PageTransition>
              <LiveTracker />
            </PageTransition>
          }
        />
        <Route
          path="/artist"
          element={
            <PageTransition>
              <ArtistPortal />
            </PageTransition>
          }
        />
        <Route
          path="/design-system"
          element={
            <PageTransition>
              <DesignSystemShowcase />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <div className="min-h-screen">
      <AnimatedRoutes />
      <EidCelebration />
    </div>
  )
}

export default App
