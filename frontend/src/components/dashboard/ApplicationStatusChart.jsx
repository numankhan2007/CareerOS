import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { formatStatus } from '../../utils/formatters'

// Status → hex color mapping matching StatusBadge palette.
const STATUS_COLORS = {
  not_applied: '#6B7280',
  applied: '#3B82F6',
  interview: '#06B6D4',
  rejected: '#EF4444',
  selected: '#10B981',
}

// Glassmorphism tooltip rendered inside chart overlay.
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const { name, value, percent } = payload[0].payload
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0f1a]/90 px-4 py-3 text-xs shadow-xl backdrop-blur">
      <p className="font-semibold text-white">{formatStatus(name)}</p>
      <p className="text-slate-300">
        {value} application{value !== 1 ? 's' : ''} · {(percent * 100).toFixed(1)}%
      </p>
    </div>
  )
}

export default function ApplicationStatusChart({ byStatus }) {
  const { data, total } = useMemo(() => {
    const entries = Object.entries(byStatus || {}).map(([key, value]) => ({
      name: key,
      value,
    }))
    const sum = entries.reduce((acc, entry) => acc + entry.value, 0)
    // Recharts needs at least one non-zero slice to render properly.
    // Attach computed percent for the tooltip.
    const withPercent = entries.map((entry) => ({
      ...entry,
      percent: sum > 0 ? entry.value / sum : 0,
    }))
    return { data: withPercent, total: sum }
  }, [byStatus])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Donut chart with center label */}
      <div className="relative" style={{ background: 'transparent' }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              animationDuration={800}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6B7280'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center total overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
      </div>

      {/* Horizontal legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[entry.name] }}
            />
            <span>{formatStatus(entry.name)}</span>
            <span className="text-slate-500">{entry.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
