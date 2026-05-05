import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

import StatusBadge from '../StatusBadge'
import { calculateDaysAgo } from '../../utils/formatters'

// Dot color matching the application's current status.
const DOT_COLORS = {
  not_applied: 'bg-gray-500',
  applied: 'bg-accent-blue',
  interview: 'bg-accent-cyan',
  rejected: 'bg-red-400',
  selected: 'bg-emerald-400',
}

export default function RecentActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
        <Clock className="h-12 w-12 text-accent-cyan/50" />
        <p className="text-sm font-bold text-white">No recent activity</p>
        <p className="max-w-xs text-xs text-white/50">Your latest application updates will appear here once you start tracking.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => {
        const dotColor = DOT_COLORS[activity.status] || DOT_COLORS.not_applied
        const isLast = index === activities.length - 1

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
            className="flex gap-4"
          >
            {/* Timeline column: dot + connector line */}
            <div className="flex flex-col items-center">
              <div className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${dotColor}`} />
              {!isLast ? <div className="w-px flex-1 bg-white/10" /> : null}
            </div>

            {/* Content */}
            <div className="flex flex-1 items-start justify-between gap-3 pb-5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {activity.opportunity?.title || 'Untitled'}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {activity.opportunity?.company_or_organizer || ''}
                </p>
                <div className="mt-2">
                  <StatusBadge status={activity.status} />
                </div>
              </div>
              <p className="shrink-0 text-xs text-slate-500">
                {calculateDaysAgo(activity.updated_at)}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
