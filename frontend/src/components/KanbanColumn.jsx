import { AnimatePresence, motion } from 'framer-motion'

import ApplicationCard from './ApplicationCard'
import { formatStatus } from '../utils/formatters'

const BORDER_ACCENTS = {
  not_applied: 'border-t-white/30',
  applied: 'border-t-accent-blue/80',
  interview: 'border-t-accent-cyan/80',
  rejected: 'border-t-red-500/80',
  selected: 'border-t-emerald-400/80',
}

export default function KanbanColumn({ status, applications, onUpdate, onDelete, onEdit, index }) {
  const accent = BORDER_ACCENTS[status] || BORDER_ACCENTS.not_applied

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.05 }}
      className={`flex h-full w-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl lg:w-[280px] ${accent}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-semibold text-white">{formatStatus(status)}</p>
        <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-white/70">
          {applications.length}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-center text-xs text-slate-400">
            No applications here yet
          </div>
        ) : null}

        <AnimatePresence>
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
