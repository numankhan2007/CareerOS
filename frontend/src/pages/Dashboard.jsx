import { animate, motion, useMotionValue } from 'framer-motion'
import { AlertCircle, Calendar, Layers, Send, Trophy } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  fetchApplicationStats,
  fetchOpportunityStats,
  fetchTimeline,
} from '../api/dashboard'
import ApplicationStatusChart from '../components/dashboard/ApplicationStatusChart'
import OpportunityTypeChart from '../components/dashboard/OpportunityTypeChart'
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed'
import StatCard from '../components/dashboard/StatCard'
import TimelineChart from '../components/dashboard/TimelineChart'
import { useAuth } from '../context/AuthContext'
import RecommendationWidget from '../components/dashboard/RecommendationWidget'
import { parseError } from '../utils/errorHandler'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTodayFormatted() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
}

function getRateMessage(rate) {
  if (rate <= 0) return 'Start applying to opportunities to track your progress.'
  if (rate <= 20) return 'Keep going — every application is a step forward.'
  if (rate <= 50) return 'Great momentum! You\'re building strong traction.'
  return 'Outstanding! You\'re converting at a high rate.'
}

// ── Section skeleton loaders ────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="h-10 w-10 rounded-xl bg-white/10" />
      <div className="mt-4 h-8 w-16 rounded bg-white/10" />
      <div className="mt-2 h-4 w-24 rounded bg-white/10" />
    </div>
  )
}

function ChartSkeleton({ height = 220 }) {
  return (
    <div
      className="animate-pulse rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
      style={{ height }}
    />
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex animate-pulse gap-4">
          <div className="mt-1 h-3 w-3 rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Per-section error card ──────────────────────────────────────────────────

function SectionError({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-white/10 border-l-4 border-l-red-500 bg-white/5 p-5 text-sm text-red-200 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <p>{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-full bg-red-500/15 border border-red-400/30 px-4 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/25"
      >
        Try Again
      </button>
    </div>
  )
}

// ── Animated progress bar for success rate ──────────────────────────────────

function SuccessRateBar({ rate }) {
  const motionValue = useMotionValue(0)
  const [displayRate, setDisplayRate] = useState(0)
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    const controls = animate(motionValue, rate, { duration: 1, ease: 'easeOut' })
    return () => controls.stop()
  }, [motionValue, rate])

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      setDisplayRate(Math.round(latest * 10) / 10)
      setBarWidth(latest)
    })
    return () => unsubscribe()
  }, [motionValue])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
    >
      <p className="text-4xl font-bold text-white">{displayRate}%</p>
      <p className="mt-1 text-sm text-slate-400">Selection Rate</p>

      {/* Animated progress bar */}
      <div className="mx-auto mt-5 h-2.5 max-w-md overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-400 transition-none"
          style={{ width: `${Math.min(barWidth, 100)}%` }}
        />
      </div>

      <p className="mx-auto mt-4 max-w-sm text-xs text-slate-400">
        {getRateMessage(rate)}
      </p>
    </motion.div>
  )
}

// ── Glassmorphism section wrapper ───────────────────────────────────────────

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()

  // Per-section loading + data + error state.
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  const [timeline, setTimeline] = useState(null)
  const [timelineLoading, setTimelineLoading] = useState(true)
  const [timelineError, setTimelineError] = useState('')

  const [oppStats, setOppStats] = useState(null)
  const [oppLoading, setOppLoading] = useState(true)
  const [oppError, setOppError] = useState('')

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError('')
    try {
      const data = await fetchApplicationStats()
      setStats(data)
    } catch (err) {
      setStatsError(parseError(err).message)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadTimeline = useCallback(async () => {
    setTimelineLoading(true)
    setTimelineError('')
    try {
      const data = await fetchTimeline()
      setTimeline(data)
    } catch (err) {
      setTimelineError(parseError(err).message)
    } finally {
      setTimelineLoading(false)
    }
  }, [])

  const loadOppStats = useCallback(async () => {
    setOppLoading(true)
    setOppError('')
    try {
      const data = await fetchOpportunityStats()
      setOppStats(data)
    } catch (err) {
      setOppError(parseError(err).message)
    } finally {
      setOppLoading(false)
    }
  }, [])

  // Fetch all 3 data sources in parallel on mount.
  useEffect(() => {
    void Promise.all([loadStats(), loadTimeline(), loadOppStats()])
  }, [loadStats, loadTimeline, loadOppStats])

  // Derive delta for stat cards from timeline (current vs previous week).
  const weeklyDelta = useMemo(() => {
    if (!timeline || timeline.length < 2) return null
    const current = timeline[timeline.length - 1]?.count || 0
    const previous = timeline[timeline.length - 2]?.count || 0
    const diff = current - previous
    if (diff > 0) return `+${diff} this week`
    if (diff < 0) return `${diff} this week`
    return null
  }, [timeline])

  const byStatus = stats?.by_status || {}
  const greeting = getGreeting()
  const todayLabel = getTodayFormatted()

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* ROW 1 — Greeting Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Here&apos;s your career progress at a glance.
          </p>
        </div>
        <p className="text-sm text-slate-400">{todayLabel}</p>
      </div>

      {/* ROW 2 — Stat Cards */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : statsError ? (
        <SectionError message={statsError} onRetry={loadStats} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Applications"
            value={stats?.total || 0}
            icon={Layers}
            color="blue"
            delta={weeklyDelta}
          />
          <StatCard
            label="Applied"
            value={byStatus.applied || 0}
            icon={Send}
            color="cyan"
          />
          <StatCard
            label="Interviews"
            value={byStatus.interview || 0}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            label="Selected"
            value={byStatus.selected || 0}
            icon={Trophy}
            color="green"
          />
        </div>
      )}

      {/* ROW 3 — Timeline + Status Donut (60/40) */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionCard title="Application Activity (Last 8 Weeks)">
            {timelineLoading ? (
              <ChartSkeleton height={220} />
            ) : timelineError ? (
              <SectionError message={timelineError} onRetry={loadTimeline} />
            ) : (
              <TimelineChart data={timeline || []} />
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-2">
          <SectionCard title="Applications by Status">
            {statsLoading ? (
              <ChartSkeleton height={280} />
            ) : statsError ? (
              <SectionError message={statsError} onRetry={loadStats} />
            ) : (
              <ApplicationStatusChart byStatus={byStatus} />
            )}
          </SectionCard>
        </div>
      </div>

      {/* ROW 4 — Recent Activity + Opportunity Types (50/50) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Recent Activity">
          {statsLoading ? (
            <FeedSkeleton />
          ) : statsError ? (
            <SectionError message={statsError} onRetry={loadStats} />
          ) : (
            <RecentActivityFeed activities={stats?.recent_activity || []} />
          )}
        </SectionCard>
        <SectionCard title="Opportunities Available by Type">
          {oppLoading ? (
            <ChartSkeleton height={200} />
          ) : oppError ? (
            <SectionError message={oppError} onRetry={loadOppStats} />
          ) : (
            <OpportunityTypeChart byType={oppStats?.by_type || {}} />
          )}
        </SectionCard>
      </div>

      {/* ROW 5 — Success Rate Banner */}
      {statsLoading ? (
        <ChartSkeleton height={160} />
      ) : statsError ? null : (
        <SuccessRateBar rate={stats?.success_rate || 0} />
      )}

      {/* ROW 6 — Recommendations Widget */}
      <SectionCard title="Recommended for You">
        <RecommendationWidget />
      </SectionCard>
    </motion.section>
  )
}
