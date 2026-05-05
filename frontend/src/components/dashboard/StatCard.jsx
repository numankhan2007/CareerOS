import { animate, useMotionValue } from 'framer-motion'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const COLOR_MAP = {
  blue: {
    icon: 'bg-accent-blue/20 text-accent-blue',
    border: 'hover:border-accent-blue/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    delta: 'bg-accent-blue/15 text-accent-blue',
  },
  purple: {
    icon: 'bg-accent-purple/20 text-accent-purple',
    border: 'hover:border-accent-purple/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    delta: 'bg-accent-purple/15 text-accent-purple',
  },
  cyan: {
    icon: 'bg-accent-cyan/20 text-accent-cyan',
    border: 'hover:border-accent-cyan/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    delta: 'bg-accent-cyan/15 text-accent-cyan',
  },
  green: {
    icon: 'bg-emerald-500/20 text-emerald-400',
    border: 'hover:border-emerald-400/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    delta: 'bg-emerald-500/15 text-emerald-400',
  },
  red: {
    icon: 'bg-red-500/20 text-red-400',
    border: 'hover:border-red-400/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    delta: 'bg-red-500/15 text-red-400',
  },
}

export default function StatCard({ label, value, icon: Icon, color = 'blue', delta }) {
  const scheme = COLOR_MAP[color] || COLOR_MAP.blue
  const motionValue = useMotionValue(0)
  const [displayValue, setDisplayValue] = useState(0)

  // Animate the counter from 0 → value on mount / when value changes.
  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: 'easeOut' })
    return () => controls.stop()
  }, [motionValue, value])

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return () => unsubscribe()
  }, [motionValue])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all ${scheme.border}`}
    >
      {/* Neon-colored icon circle */}
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${scheme.icon}`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Animated number */}
      <p className="mt-4 text-3xl font-bold text-white">{displayValue}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>

      {/* Optional delta badge */}
      {delta ? (
        <span
          className={`absolute bottom-4 right-4 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${scheme.delta}`}
        >
          {delta}
        </span>
      ) : null}
    </motion.div>
  )
}
