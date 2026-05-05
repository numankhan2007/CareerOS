import { motion, useAnimation } from 'framer-motion'
import { Bookmark as BookmarkIcon } from 'lucide-react'
import { useEffect } from 'react'

import { buttonTap, springTransition } from '../utils/animations'

const TYPE_STYLES = {
  internship: 'border-accent-blue/40 bg-accent-blue/15 text-accent-blue',
  hackathon: 'border-accent-purple/40 bg-accent-purple/15 text-accent-purple',
  fellowship: 'border-accent-cyan/40 bg-accent-cyan/15 text-accent-cyan',
  competition: 'border-amber-400/40 bg-amber-400/15 text-amber-300',
}

export default function OpportunityCard({ opportunity, onBookmarkToggle, onTrack, index = 0 }) {
  const bookmarkControls = useAnimation()
  const tags = Array.isArray(opportunity.tags) ? opportunity.tags : []
  const badgeStyle = TYPE_STYLES[opportunity.type] || TYPE_STYLES.internship
  const hasLink = Boolean(opportunity.application_link)

  useEffect(() => {
    // Bounce animation runs whenever bookmark state changes.
    bookmarkControls.start({
      scale: [1, 1.3, 1],
      transition: { ...springTransition, duration: 0.25 },
    })
  }, [opportunity.is_bookmarked, bookmarkControls])

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.04 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition hover:border-white/20 hover:shadow-[0_0_22px_rgba(59,130,246,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {opportunity.company_or_organizer}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{opportunity.title}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
          {opportunity.type}
        </span>
      </div>

      <p
        className="mt-3 text-sm text-slate-300"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {opportunity.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={`${opportunity.id}-${tag}`}
            className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] text-white/60"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href={hasLink ? opportunity.application_link : '#'}
            target="_blank"
            rel="noreferrer"
            className={
              hasLink
                ? 'rounded-full border border-accent-blue/60 px-4 py-2 text-xs font-semibold text-accent-blue transition hover:bg-accent-blue hover:text-white'
                : 'pointer-events-none rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/30'
            }
          >
            Apply Now
          </a>
          {onTrack ? (
            <button
              type="button"
              onClick={() => onTrack(opportunity)}
              className="rounded-full border border-white/10 px-3 py-2 text-[0.7rem] font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
            >
              Track This
            </button>
          ) : null}
        </div>

        <motion.button
          type="button"
          onClick={() => onBookmarkToggle(opportunity)}
          animate={bookmarkControls}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:border-white/20"
          aria-pressed={opportunity.is_bookmarked}
          aria-label="Toggle bookmark"
        >
          <BookmarkIcon
            className={
              opportunity.is_bookmarked
                ? 'h-5 w-5 text-accent-purple fill-accent-purple'
                : 'h-5 w-5 text-white/40'
            }
          />
        </motion.button>
      </div>
    </motion.article>
  )
}
