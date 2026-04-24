import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import SiteFooter from './components/SiteFooter'
import Confirm from './pages/Confirm'
import Gallery from './pages/Gallery'
import Home from './pages/Home'
import OrderForm from './pages/OrderForm'
import QuickOrder from './pages/QuickOrder'

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return null
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <div className="flex-1">
        <AnimatedRoutes />
      </div>
      <SiteFooter />
    </div>
  )
}

export default App
