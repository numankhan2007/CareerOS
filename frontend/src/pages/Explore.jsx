import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Search, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

import { createApplication } from '../api/applications'
import { fetchOpportunities, toggleBookmark } from '../api/opportunities'
import ApplicationModal from '../components/ApplicationModal'
import FilterBar from '../components/FilterBar'
import OpportunityCard from '../components/OpportunityCard'
import Toast from '../components/Toast'
import { parseError } from '../utils/errorHandler'
import { fadeInUp, defaultTransition } from '../utils/animations'

const DEFAULT_FILTERS = {
  search: '',
  type: 'all',
  tags: [],
}

export default function Explore() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [opportunities, setOpportunities] = useState([])
  const [bookmarkedIds, setBookmarkedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prefillOpportunityId, setPrefillOpportunityId] = useState(null)

  const loadOpportunities = useCallback(async (activeFilters) => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchOpportunities(activeFilters)
      setOpportunities(data)
      setBookmarkedIds(data.filter((item) => item.is_bookmarked).map((item) => item.id))
    } catch (err) {
      setError(parseError(err).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOpportunities(filters)
    }, 400)

    return () => clearTimeout(timer)
  }, [filters, loadOpportunities])

  const handleBookmarkToggle = async (opportunity) => {
    const wasBookmarked = opportunity.is_bookmarked

    setOpportunities((prev) =>
      prev.map((item) =>
        item.id === opportunity.id ? { ...item, is_bookmarked: !wasBookmarked } : item,
      ),
    )
    setBookmarkedIds((prev) =>
      wasBookmarked ? prev.filter((id) => id !== opportunity.id) : [...prev, opportunity.id],
    )

    try {
      const result = await toggleBookmark(opportunity.id)
      setOpportunities((prev) =>
        prev.map((item) =>
          item.id === opportunity.id ? { ...item, is_bookmarked: result.bookmarked } : item,
        ),
      )
      setBookmarkedIds((prev) =>
        result.bookmarked ? [...new Set([...prev, opportunity.id])] : prev.filter((id) => id !== opportunity.id),
      )
    } catch {
      // Revert optimistic update on failure.
      setOpportunities((prev) =>
        prev.map((item) =>
          item.id === opportunity.id ? { ...item, is_bookmarked: wasBookmarked } : item,
        ),
      )
      setBookmarkedIds((prev) =>
        wasBookmarked ? [...new Set([...prev, opportunity.id])] : prev.filter((id) => id !== opportunity.id),
      )
      setToast({ message: 'Unable to update bookmark. Please try again.', variant: 'error' })
    }
  }

  const handleTrack = (opportunity) => {
    setPrefillOpportunityId(opportunity.id)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setPrefillOpportunityId(null)
  }

  const handleModalSave = async (payload) => {
    try {
      await createApplication(payload)
      setToast({ message: 'Application added to tracker.', variant: 'success' })
      return true
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail
      setToast({ message: detail || 'Unable to add application.', variant: 'error' })
      return false
    }
  }

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={defaultTransition}
      className="space-y-8"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Opportunity Feed</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Explore Opportunities</h2>
        <p className="mt-2 text-sm text-slate-300">
          Discover internships, hackathons, fellowships, and competitions built for your goals.
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <p className="text-sm text-slate-300">
        Showing {opportunities.length} opportunities | {bookmarkedIds.length} bookmarked
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="mt-3 h-5 w-3/4 rounded bg-white/10" />
              <div className="mt-4 h-10 rounded bg-white/10" />
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-16 rounded-full bg-white/10" />
                <div className="h-6 w-20 rounded-full bg-white/10" />
              </div>
              <div className="mt-5 h-9 w-full rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-white/10 border-l-4 border-l-red-500 bg-white/5 p-6 text-red-200 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadOpportunities(filters)}
            className="mt-4 rounded-full bg-red-500/15 border border-red-400/30 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/25"
          >
            Try Again
          </button>
        </div>
      ) : null}

      {!loading && !error && opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-xl">
          <Search className="h-12 w-12 text-accent-blue/60" />
          <div>
            <p className="text-lg font-bold text-white">No opportunities match your filters</p>
            <p className="mt-1 max-w-sm text-sm text-white/50">Try broadening your search or removing some filters to see more results.</p>
          </div>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-2 rounded-full bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:bg-accent-blue/90"
          >
            Clear Filters
          </button>
        </div>
      ) : null}

      {!loading && !error && opportunities.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              index={index}
              onBookmarkToggle={handleBookmarkToggle}
              onTrack={handleTrack}
            />
          ))}
        </div>
      ) : null}

      <Toast
        message={toast?.message}
        variant={toast?.variant}
        onClose={() => setToast(null)}
      />

      {isModalOpen ? (
        <ApplicationModal
          mode="add"
          application={null}
          prefillOpportunityId={prefillOpportunityId}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      ) : null}
    </motion.section>
  )
}
