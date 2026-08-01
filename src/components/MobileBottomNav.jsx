import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Palette, ShoppingBag, Info, Mail } from 'lucide-react'

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Gallery', to: '/gallery', icon: Palette },
  { label: 'Order', to: '/order', icon: ShoppingBag },
  { label: 'About', to: '/about', icon: Info },
  { label: 'Contact', to: '/contact', icon: Mail },
]

export default function MobileBottomNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1.25rem)] max-w-lg -translate-x-1/2 md:hidden"
    >
      <div className="flex items-center justify-around rounded-full border border-[rgba(122,74,46,0.2)] bg-[rgba(253,250,246,0.92)] px-2 py-2 shadow-[0_14px_36px_rgba(90,48,27,0.18)] backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-300 ${
                isActive ? 'text-[var(--brand-brown-deep)] font-bold' : 'text-[var(--brand-dark)]/70 hover:text-[var(--brand-brown)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--brand-cream)] via-[rgba(201,147,74,0.15)] to-[var(--brand-cream)] border border-[var(--brand-gold)]/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 ${
                  isActive ? 'scale-110 text-[var(--brand-brown)]' : ''
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 1.8} />
              </div>
              <span
                className={`relative z-10 mt-0.5 text-[10px] tracking-tight transition-all duration-300 ${
                  isActive ? 'font-bold text-[var(--brand-brown-deep)]' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
