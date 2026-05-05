import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { fetchOpportunities } from '../api/opportunities'
import NotesEditor from './NotesEditor'
import StatusBadge from './StatusBadge'
import { formatStatus } from '../utils/formatters'

const STATUS_OPTIONS = ['not_applied', 'applied', 'interview', 'rejected', 'selected']

export default function ApplicationModal({
  mode,
  application,
  prefillOpportunityId,
  onClose,
  onSave,
}) {
  const isEditMode = mode === 'edit'
  const [opportunities, setOpportunities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formState, setFormState] = useState({
    opportunity_id: '',
    status: 'not_applied',
    applied_date: '',
    notes: '',
  })

  useEffect(() => {
    let isMounted = true

    async function loadOpportunities() {
      setLoading(true)
      try {
        const data = await fetchOpportunities()
        if (isMounted) {
          setOpportunities(data)
        }
      } catch {
        if (isMounted) {
          setErrors((prev) => ({ ...prev, load: 'Unable to load opportunities.' }))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOpportunities()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isEditMode && application) {
      setFormState({
        opportunity_id: String(application.opportunity_id),
        status: application.status,
        applied_date: application.applied_date || '',
        notes: application.notes || '',
      })
      return
    }

    setFormState((prev) => ({
      ...prev,
      opportunity_id: prefillOpportunityId ? String(prefillOpportunityId) : '',
      status: 'not_applied',
      applied_date: '',
      notes: '',
    }))
  }, [application, isEditMode, prefillOpportunityId])

  const filteredOpportunities = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) {
      return opportunities
    }
    return opportunities.filter((opportunity) => {
      const title = opportunity.title.toLowerCase()
      const company = opportunity.company_or_organizer.toLowerCase()
      return title.includes(needle) || company.includes(needle)
    })
  }, [opportunities, search])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrors({})

    const nextErrors = {}
    if (!isEditMode && !formState.opportunity_id) {
      nextErrors.opportunity_id = 'Select an opportunity.'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)

    const payload = {
      opportunity_id: Number(formState.opportunity_id),
      status: formState.status,
      applied_date: formState.applied_date || null,
      notes: formState.notes.trim() || null,
    }

    try {
      const result = await onSave(payload)
      if (result !== false) {
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">
                {isEditMode ? 'Edit Application' : 'Add Application'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {isEditMode ? 'Update your progress' : 'Track a new application'}
              </h2>
            </div>
            <StatusBadge status={formState.status} />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Opportunity</label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search opportunities"
                disabled={isEditMode}
                className="mb-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none transition focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/40 disabled:opacity-60"
              />
              <select
                value={formState.opportunity_id}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, opportunity_id: event.target.value }))
                }
                disabled={isEditMode}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/40 disabled:opacity-60"
              >
                <option value="">Select an opportunity</option>
                {filteredOpportunities.map((opportunity) => (
                  <option key={opportunity.id} value={opportunity.id}>
                    {opportunity.title} - {opportunity.company_or_organizer}
                  </option>
                ))}
              </select>
              {errors.opportunity_id ? (
                <p className="mt-2 text-xs text-red-300">{errors.opportunity_id}</p>
              ) : null}
              {errors.load ? (
                <p className="mt-2 text-xs text-red-300">{errors.load}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Status</label>
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, status: event.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/40"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Applied date</label>
              <input
                type="date"
                value={formState.applied_date}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, applied_date: event.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Notes</label>
              <NotesEditor
                value={formState.notes}
                onChange={(value) => setFormState((prev) => ({ ...prev, notes: value }))}
                placeholder="Add interview notes, follow-up reminders, or key insights"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="rounded-full bg-accent-blue px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isEditMode ? 'Save Changes' : 'Add Application'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
