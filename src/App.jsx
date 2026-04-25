import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
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

function App() {
  return (
    <div className="min-h-screen">
      <AnimatedRoutes />
    </div>
  )
}

export default App
