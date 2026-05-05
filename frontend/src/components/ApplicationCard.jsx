import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'

import StatusBadge from './StatusBadge'
import { calculateDaysAgo, formatDate, formatStatus } from '../utils/formatters'

const STATUS_OPTIONS = ['not_applied', 'applied', 'interview', 'rejected', 'selected']

export default function ApplicationCard({ application, onUpdate, onDelete, onEdit }) {
  const notesPreview = application.notes?.trim() || 'No notes'
  const appliedDate = formatDate(application.applied_date)
  const daysAgo = calculateDaysAgo(application.updated_at)

  const handleStatusChange = (event) => {
    const nextStatus = event.target.value
    onUpdate(application, { status: nextStatus })
  }

  const handleDelete = () => {
    const confirmed = window.confirm('Delete this application?')
    if (confirmed) {
      onDelete(application)
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            {application.opportunity.company_or_organizer}
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">
            {application.opportunity.title}
          </h3>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate-400">
        <p>Applied date: {appliedDate}</p>
        <p>Updated: {daysAgo}</p>
      </div>

      <p className="mt-3 line-clamp-1 text-xs italic text-white/60">
        {notesPreview}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <select
          value={application.status}
          onChange={handleStatusChange}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none transition focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/40"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(application)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-white/20 hover:text-white"
            aria-label="Edit application"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-red-400/60 hover:text-red-300"
            aria-label="Delete application"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
