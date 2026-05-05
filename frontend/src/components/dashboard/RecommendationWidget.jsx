import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchQuickRecommendations } from '../../api/recommendations'

// Compact match badge for the widget row.
function MatchBadge({ score }) {
  if (score >= 9) return <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-300">Strong</span>
  if (score >= 6) return <span className="rounded-full border border-accent-blue/30 bg-accent-blue/10 px-2 py-0.5 text-[0.6rem] font-semibold text-accent-blue">Good</span>
  return <span className="rounded-full border border-accent-purple/30 bg-accent-purple/10 px-2 py-0.5 text-[0.6rem] font-semibold text-accent-purple">Match</span>
}

// Type dot color matching OpportunityCard type badges.
const TYPE_DOT = {
  internship: 'bg-accent-blue',
  hackathon: 'bg-accent-purple',
  fellowship: 'bg-accent-cyan',
  competition: 'bg-amber-400',
}

export default function RecommendationWidget() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [noSkills, setNoSkills] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchQuickRecommendations()
      setItems(data)
      setNoSkills(false)
    } catch (err) {
      // If user has no skills, the quick endpoint returns an empty list.
      // We detect this via a 200 with [] to show the nudge.
      if (err?.response?.status !== 401) {
        setItems([])
      }
      setNoSkills(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Loading skeleton.
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-white/10" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
            <div className="h-5 w-14 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    )
  }

  // Empty / no skills state.
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-slate-400">
        <p>{noSkills ? 'Add skills to your profile for recommendations' : 'No recommendations yet'}</p>
        <Link
          to={noSkills ? '/profile' : '/explore'}
          className="mt-2 inline-block text-xs text-accent-cyan transition hover:text-accent-cyan/80"
        >
          {noSkills ? 'Go to Profile →' : 'Explore Opportunities →'}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/5"
        >
          {/* Type dot */}
          <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${TYPE_DOT[item.type] || 'bg-white/30'}`} />

          {/* Title + company */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{item.title}</p>
            <p className="truncate text-xs text-slate-400">{item.company_or_organizer}</p>
          </div>

          {/* Score badge */}
          <MatchBadge score={item.score || 0} />
        </motion.div>
      ))}

      {/* Divider + See All link */}
      <div className="border-t border-white/10 pt-3 text-right">
        <Link
          to="/recommendations"
          className="text-xs font-semibold text-accent-cyan transition hover:text-accent-cyan/80"
        >
          See All →
        </Link>
      </div>
    </div>
  )
}
