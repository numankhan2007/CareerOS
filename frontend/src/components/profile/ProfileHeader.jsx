import { animate, motion, useMotionValue } from 'framer-motion'
import { Bookmark, Calendar, Layers, Mail, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatDate } from '../../utils/formatters'

// Animated number that counts from 0 → target on mount.
function AnimatedCount({ value }) {
  const motionVal = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 0.8, ease: 'easeOut' })
    return () => controls.stop()
  }, [motionVal, value])

  useEffect(() => {
    const unsub = motionVal.on('change', (v) => setDisplay(Math.round(v)))
    return () => unsub()
  }, [motionVal])

  return <span>{display}</span>
}

// Initials from full name for the avatar circle.
function getInitials(name) {
  if (!name) return 'CO'
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

const STAT_PILLS = [
  { key: 'total_applications', label: 'Applications', icon: Layers, color: 'text-accent-blue' },
  { key: 'bookmarks_count', label: 'Bookmarked', icon: Bookmark, color: 'text-accent-purple' },
  { key: 'selected_count', label: 'Selected', icon: Trophy, color: 'text-emerald-400' },
]

export default function ProfileHeader({ user, stats, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="h-20 w-20 rounded-full bg-white/10" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-40 rounded bg-white/10" />
            <div className="h-4 w-56 rounded bg-white/10" />
            <div className="h-4 w-36 rounded bg-white/10" />
          </div>
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-24 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-purple text-2xl font-bold text-white ring-2 ring-accent-blue/50 ring-offset-2 ring-offset-[#0B0F1A]">
          {getInitials(user?.name)}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white">{user?.name || 'User'}</h2>
          <div className="mt-2 flex flex-col gap-1 text-sm text-slate-400">
            <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
              <Mail className="h-4 w-4" />
              {user?.email}
            </span>
            <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
              <Calendar className="h-4 w-4" />
              Member since {formatDate(stats?.member_since || user?.created_at)}
            </span>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex gap-3">
          {STAT_PILLS.map((pill) => (
            <div
              key={pill.key}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
            >
              <pill.icon className={`h-4 w-4 ${pill.color}`} />
              <span className="text-lg font-bold text-white">
                <AnimatedCount value={stats?.[pill.key] || 0} />
              </span>
              <span className="text-[0.65rem] text-slate-400">{pill.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
