import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Search, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchRecommendations } from '../api/recommendations'
import RecommendationCard from '../components/recommendations/RecommendationCard'
import { parseError } from '../utils/errorHandler'

// ── Skeleton card for loading state ─────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-white/10" />
          <div className="h-5 w-44 rounded bg-white/10" />
        </div>
        <div className="h-6 w-24 rounded-full bg-white/10" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-3/4 rounded bg-white/10" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-14 rounded-full bg-white/10" />
        <div className="h-5 w-16 rounded-full bg-white/10" />
        <div className="h-5 w-12 rounded-full bg-white/10" />
      </div>
    </div>
  )
}

// ── Empty state components ──────────────────────────────────────────────────

function NoSkillsEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent-cyan/15 text-accent-cyan">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">
        Your recommendations are waiting
      </h3>
      <p className="mt-3 text-sm text-slate-300">
        Add your skills on your Profile page and we&apos;ll match you with the most
        relevant internships and hackathons.
      </p>
      <Link
        to="/profile"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent-blue/35 transition hover:bg-accent-blue/90"
      >
        Go to Profile
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  )
}

function NoMatchesEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent-purple/15 text-accent-purple">
        <Search className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">No matches found yet</h3>
      <p className="mt-3 text-sm text-slate-300">
        Try adding more skills or check back as new opportunities are added.
      </p>
      <Link
        to="/explore"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent-blue/35 transition hover:bg-accent-blue/90"
      >
        Explore All Opportunities
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [matchedSkills, setMatchedSkills] = useState([])
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchRecommendations()
      setRecommendations(data.recommendations || [])
      setMatchedSkills(data.matched_skills || [])
      setReason(data.reason || 'no_matches')
    } catch (err) {
      setError(parseError(err).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Dynamic subtitle text.
  const subtitle =
    reason === 'skills_match'
      ? 'Based on your skills:'
      : reason === 'no_skills'
        ? 'Add skills to your profile to get personalized recommendations.'
        : 'No matches found yet. Try adding more skills to your profile.'

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* ROW 1 — Page header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">
          Recommendations
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Recommended for You</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
          <span>{subtitle}</span>
          {reason === 'skills_match'
            ? matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-400"
                >
                  {skill}
                </span>
              ))
            : null}
        </div>
      </div>

      {/* ROW 2 — Matched Skills Summary Bar */}
      {!loading && reason === 'skills_match' ? (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/15 text-accent-cyan">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="flex-1 text-sm text-slate-300">
            Your profile matched{' '}
            <span className="font-semibold text-white">{matchedSkills.length} skill{matchedSkills.length !== 1 ? 's' : ''}</span>
            {' '}across{' '}
            <span className="font-semibold text-white">{recommendations.length} opportunit{recommendations.length !== 1 ? 'ies' : 'y'}</span>
          </p>
          <Link
            to="/profile"
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/20"
          >
            Update Skills
          </Link>
        </motion.div>
      ) : null}

      {/* Error state */}
      {error ? (
        <div className="rounded-2xl border border-white/10 border-l-4 border-l-red-500 bg-white/5 p-5 text-sm text-red-200 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="mt-3 rounded-full bg-red-500/15 border border-red-400/30 px-4 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/25"
          >
            Try Again
          </button>
        </div>
      ) : null}

      {/* Loading skeleton grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : null}

      {/* Empty states */}
      {!loading && !error && reason === 'no_skills' ? <NoSkillsEmpty /> : null}
      {!loading && !error && reason === 'no_matches' ? <NoMatchesEmpty /> : null}

      {/* ROW 3 — Recommendation grid */}
      {!loading && !error && recommendations.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, i) => (
            <RecommendationCard
              key={rec.id}
              opportunity={rec}
              matchedSkills={matchedSkills}
              onBookmarkToggle={() => {}}
              onTrack={() => {}}
              index={i}
            />
          ))}
        </div>
      ) : null}
    </motion.section>
  )
}
