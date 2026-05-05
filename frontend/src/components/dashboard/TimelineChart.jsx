import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'

// Glassmorphism tooltip for the area chart.
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0f1a]/90 px-4 py-3 text-xs shadow-xl backdrop-blur">
      <p className="font-semibold text-white">{label}</p>
      <p className="text-slate-300">
        {payload[0].value} application{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default function TimelineChart({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ background: 'transparent' }}
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          {/* Gradient definition for the filled area. */}
          <defs>
            <linearGradient id="areaBlueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Subtle dashed grid lines, no vertical lines. */}
          <CartesianGrid
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="3 3"
            vertical={false}
          />

          {/* Week labels along the bottom. */}
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />

          {/* YAxis hidden — visual chart without numeric scale. */}

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="count"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#areaBlueGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
