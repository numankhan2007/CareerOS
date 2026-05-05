import { motion } from 'framer-motion'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'

// Type → hex color mapping matching OpportunityCard type badges.
const TYPE_COLORS = {
  internship: '#3B82F6',
  hackathon: '#8B5CF6',
  fellowship: '#06B6D4',
  competition: '#F59E0B',
}

// Capitalize first letter for axis labels.
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Glassmorphism tooltip.
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0f1a]/90 px-4 py-3 text-xs shadow-xl backdrop-blur">
      <p className="font-semibold text-white">{capitalize(label)}</p>
      <p className="text-slate-300">
        {payload[0].value} opportunit{payload[0].value !== 1 ? 'ies' : 'y'}
      </p>
    </div>
  )
}

export default function OpportunityTypeChart({ byType }) {
  const data = useMemo(() => {
    return Object.entries(byType || {}).map(([key, value]) => ({
      type: key,
      count: value,
      fill: TYPE_COLORS[key] || '#6B7280',
    }))
  }, [byType])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ background: 'transparent' }}
    >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="type"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={capitalize}
          />
          {/* YAxis hidden for cleaner look. */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          >
            {/* Per-bar fill color via Cell, matching the type palette. */}
            {data.map((entry) => (
              <Cell key={entry.type} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
