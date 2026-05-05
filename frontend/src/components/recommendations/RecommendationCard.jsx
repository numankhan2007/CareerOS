import OpportunityCard from '../OpportunityCard'

// Match score → badge label + color classes.
function getMatchBadge(score) {
  if (score >= 9) return { label: 'Strong Match', style: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' }
  if (score >= 6) return { label: 'Good Match', style: 'border-accent-blue/40 bg-accent-blue/15 text-accent-blue' }
  return { label: 'Possible Match', style: 'border-accent-purple/40 bg-accent-purple/15 text-accent-purple' }
}

export default function RecommendationCard({
  opportunity,
  matchedSkills = [],
  onBookmarkToggle,
  onTrack,
  index = 0,
}) {
  const badge = getMatchBadge(opportunity.score || 0)

  // Compute overlapping skills between user skills and opportunity tags.
  const oppTags = (opportunity.tags || []).map((t) => t.toLowerCase())
  const overlap = matchedSkills.filter((skill) =>
    oppTags.includes(skill.toLowerCase()),
  )

  return (
    <div className="relative">
      {/* Match score badge — top right */}
      <div className="absolute right-4 top-4 z-10">
        <span
          className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold ${badge.style}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Full OpportunityCard underneath */}
      <OpportunityCard
        opportunity={opportunity}
        onBookmarkToggle={onBookmarkToggle}
        onTrack={onTrack}
        index={index}
      />

      {/* Matched skills section — only render if there are overlapping tags */}
      {overlap.length > 0 ? (
        <div className="-mt-3 rounded-b-2xl border border-t-0 border-white/10 bg-white/[0.03] px-5 pb-4 pt-3 backdrop-blur-xl">
          <p className="mb-2 text-[0.65rem] uppercase tracking-widest text-slate-500">
            Why recommended:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {overlap.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[0.6rem] font-medium text-cyan-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
