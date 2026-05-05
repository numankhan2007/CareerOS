import { motion } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'

import { logoutUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { routeConfig } from '../utils/routeConfig'

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // Ignore request errors; clear local auth state regardless.
    }
    await logout(false)
    navigate('/login')
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 top-0 z-40 flex h-full w-16 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl sm:w-60"
    >
      <div className="flex items-center justify-center px-4 py-6 sm:justify-start">
        <span className="text-lg font-semibold tracking-wide text-accent-blue drop-shadow-[0_0_12px_rgba(59,130,246,0.75)]">
          <span className="sm:hidden">CO</span>
          <span className="hidden sm:inline">CareerOS</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-2">
        {routeConfig.map((route) => {
          const Icon = route.icon

          return (
            <motion.div key={route.path} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
              <NavLink
                to={route.path}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl border-l-2 px-3 py-2 text-sm transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60',
                    isActive
                      ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                      : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">{route.label}</span>
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      <div className="mt-auto px-3 pb-6">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur">
          <p className="text-[0.65rem] font-semibold text-white sm:text-xs">{user?.name || 'User'}</p>
          <p className="text-[0.6rem] text-slate-400 sm:text-[0.65rem]">{user?.email || ''}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
