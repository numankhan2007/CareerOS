import { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import PageTransitionWrapper from '../components/PageTransitionWrapper'
import { useAuth } from '../context/AuthContext'
import { routeConfig } from '../utils/routeConfig'

function getInitials(name, email) {
  const trimmed = name?.trim() || ''
  const parts = trimmed ? trimmed.split(/\s+/) : []
  const initials = parts.slice(0, 2).map((part) => part[0]).join('')

  if (initials) {
    return initials.toUpperCase()
  }

  if (email) {
    return email[0].toUpperCase()
  }

  return 'CO'
}

export default function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const mainControls = useAnimation()

  const currentRoute = routeConfig.find((route) => location.pathname.startsWith(route.path))
  const pageTitle = currentRoute?.label || 'Dashboard'
  const initials = getInitials(user?.name, user?.email)

  useEffect(() => {
    // Re-trigger a subtle main fade on every route change.
    mainControls.set({ opacity: 0, y: 10 })
    mainControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    })
  }, [location.pathname, mainControls])

  return (
    <div className="min-h-screen bg-background text-slate-100">
      <Sidebar />
      <main className="ml-16 min-h-screen flex-1 overflow-y-auto p-8 sm:ml-60">
        <motion.div animate={mainControls} initial={false}>
          <header className="mb-8 flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
            <h1 className="text-xl font-semibold text-white">{pageTitle}</h1>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-blue/60 text-sm font-semibold text-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.35)]">
              {initials}
            </div>
          </header>

          {/* Animate protected content on route changes. */}
          <PageTransitionWrapper>
            <Outlet />
          </PageTransitionWrapper>
        </motion.div>
      </main>
    </div>
  )
}
