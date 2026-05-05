import { animate, useMotionValue } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Award, CheckCircle2, KanbanSquare, Layers, MessageCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  createApplication,
  deleteApplication,
  fetchApplications,
  fetchApplicationStats,
  updateApplication,
} from '../api/applications'
import ApplicationModal from '../components/ApplicationModal'
import KanbanColumn from '../components/KanbanColumn'
import Toast from '../components/Toast'
import { getStatusColor } from '../utils/formatters'
import { parseError } from '../utils/errorHandler'

const STATUS_ORDER = ['not_applied', 'applied', 'interview', 'rejected', 'selected']

const buildEmptyColumns = () => ({
  not_applied: [],
  applied: [],
  interview: [],
  rejected: [],
  selected: [],
})

const deriveStatsFromColumns = (columns) => {
  const by_status = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = columns[status]?.length || 0
    return acc
  }, {})

  const total = Object.values(by_status).reduce((sum, value) => sum + value, 0)
  const success_rate = total ? (by_status.selected / total) * 100 : 0

  return {
    total,
    by_status,
    recent_activity: [],
    success_rate: Number(success_rate.toFixed(2)),
  }
}

function StatsPill({ icon: Icon, label, value, tone }) {
  const motionValue = useMotionValue(0)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.6, ease: 'easeOut' })
    return () => controls.stop()
  }, [motionValue, value])

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return () => unsubscribe()
  }, [motionValue])

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
      <Icon className={`h-5 w-5 ${tone}`} />
      <div>
        <p className="text-lg font-semibold text-white">{displayValue}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  )
}

export default function Tracker() {
  const [columns, setColumns] = useState(buildEmptyColumns)
  const [stats, setStats] = useState(deriveStatsFromColumns(buildEmptyColumns()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editingApplication, setEditingApplication] = useState(null)
  const [prefillOpportunityId, setPrefillOpportunityId] = useState(null)

  const loadApplications = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchApplications()
      const normalized = { ...buildEmptyColumns(), ...data }
      setColumns(normalized)
      setStats(deriveStatsFromColumns(normalized))

      try {
        const statsData = await fetchApplicationStats()
        setStats(statsData)
      } catch {
        // Stats are optional; fall back to derived values.
      }
    } catch (err) {
      setError(parseError(err).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadApplications()
  }, [loadApplications])

  const applyColumnUpdate = (updater) => {
    setColumns((prev) => {
      const next = updater(prev)
      setStats(deriveStatsFromColumns(next))
      return next
    })
  }

  const moveApplication = (current, application) => {
    const next = buildEmptyColumns()
    STATUS_ORDER.forEach((status) => {
      next[status] = (current[status] || []).filter((item) => item.id !== application.id)
    })
    next[application.status] = [application, ...next[application.status]]
    return next
  }

  const handleInlineUpdate = async (application, patch) => {
    const previousColumns = columns
    const optimisticApplication = { ...application, ...patch }
    const optimisticColumns = moveApplication(previousColumns, optimisticApplication)

    setColumns(optimisticColumns)
    setStats(deriveStatsFromColumns(optimisticColumns))

    try {
      const updated = await updateApplication(application.id, patch)
      const nextColumns = moveApplication(optimisticColumns, updated)
      setColumns(nextColumns)
      setStats(deriveStatsFromColumns(nextColumns))
    } catch {
      setColumns(previousColumns)
      setStats(deriveStatsFromColumns(previousColumns))
      setToast({ message: 'Unable to update application. Please try again.', variant: 'error' })
    }
  }

  const handleDelete = async (application) => {
    const previousColumns = columns

    applyColumnUpdate((prev) => {
      const next = buildEmptyColumns()
      STATUS_ORDER.forEach((status) => {
        next[status] = prev[status].filter((item) => item.id !== application.id)
      })
      return next
    })

    try {
      await deleteApplication(application.id)
    } catch {
      setColumns(previousColumns)
      setStats(deriveStatsFromColumns(previousColumns))
      setToast({ message: 'Unable to delete application. Please try again.', variant: 'error' })
    }
  }

  const openAddModal = () => {
    setModalMode('add')
    setEditingApplication(null)
    setPrefillOpportunityId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (application) => {
    setModalMode('edit')
    setEditingApplication(application)
    setPrefillOpportunityId(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingApplication(null)
    setPrefillOpportunityId(null)
  }

  const handleModalSave = async (payload) => {
    if (modalMode === 'add') {
      try {
        const created = await createApplication(payload)
        applyColumnUpdate((prev) => moveApplication(prev, created))
        setToast({ message: 'Application added to tracker.', variant: 'success' })
        return true
      } catch (error) {
        const detail = error?.response?.data?.detail
        setToast({ message: detail || 'Unable to add application.', variant: 'error' })
        return false
      }
    }

    if (!editingApplication) {
      return false
    }

    try {
      const updated = await updateApplication(editingApplication.id, {
        status: payload.status,
        notes: payload.notes,
        applied_date: payload.applied_date,
      })
      applyColumnUpdate((prev) => moveApplication(prev, updated))
      setToast({ message: 'Application updated.', variant: 'success' })
      return true
    } catch {
      setToast({ message: 'Unable to update application.', variant: 'error' })
      return false
    }
  }

  const counts = useMemo(() => stats.by_status || deriveStatsFromColumns(columns).by_status, [stats, columns])

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Tracker</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Application Tracker</h2>
          <p className="mt-2 text-sm text-slate-300">
            Monitor every step of your application journey in one view.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-full bg-accent-blue px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:bg-accent-blue/90"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsPill icon={Layers} label="Total" value={stats.total || 0} tone={getStatusColor('not_applied')} />
        <StatsPill icon={CheckCircle2} label="Applied" value={counts.applied || 0} tone={getStatusColor('applied')} />
        <StatsPill icon={MessageCircle} label="Interviews" value={counts.interview || 0} tone={getStatusColor('interview')} />
        <StatsPill icon={Award} label="Selected" value={counts.selected || 0} tone={getStatusColor('selected')} />
      </div>

      {error ? (
        <div className="rounded-2xl border border-white/10 border-l-4 border-l-red-500 bg-white/5 p-6 text-red-200 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={loadApplications}
            className="mt-4 rounded-full bg-red-500/15 border border-red-400/30 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/25"
          >
            Try Again
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:overflow-x-auto">
          {STATUS_ORDER.map((status) => (
            <div
              key={`skeleton-${status}`}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 lg:w-[280px]"
            >
              <div className="mb-4 h-4 w-24 rounded bg-white/10" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 rounded-xl bg-white/10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !error && stats.total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-xl">
          <KanbanSquare className="h-12 w-12 text-accent-cyan/60" />
          <div>
            <p className="text-lg font-bold text-white">No applications tracked yet</p>
            <p className="mt-1 max-w-sm text-sm text-white/50">Start tracking your career progress by adding your first application.</p>
          </div>
          <Link
            to="/explore"
            className="mt-2 rounded-full bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:bg-accent-blue/90"
          >
            Start Tracking
          </Link>
        </div>
      ) : null}

      {!loading && !error && stats.total > 0 ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:overflow-x-auto lg:pb-4">
          {STATUS_ORDER.map((status, index) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={columns[status] || []}
              onUpdate={handleInlineUpdate}
              onDelete={handleDelete}
              onEdit={openEditModal}
              index={index}
            />
          ))}
        </div>
      ) : null}

      {isModalOpen ? (
        <ApplicationModal
          mode={modalMode}
          application={editingApplication}
          prefillOpportunityId={prefillOpportunityId}
          onClose={closeModal}
          onSave={handleModalSave}
        />
      ) : null}

      <Toast message={toast?.message} variant={toast?.variant} onClose={() => setToast(null)} />
    </section>
  )
}
