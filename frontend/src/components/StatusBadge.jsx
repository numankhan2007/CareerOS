import { formatStatus } from '../utils/formatters'

const BADGE_STYLES = {
  not_applied: 'border-white/20 bg-white/5 text-white/70',
  applied: 'border-accent-blue/40 bg-accent-blue/15 text-accent-blue',
  interview: 'border-accent-cyan/40 bg-accent-cyan/15 text-accent-cyan',
  rejected: 'border-red-400/40 bg-red-500/15 text-red-300',
  selected: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300',
}

const DOT_STYLES = {
  not_applied: 'bg-white/40',
  applied: 'bg-accent-blue',
  interview: 'bg-accent-cyan',
  rejected: 'bg-red-400',
  selected: 'bg-emerald-400',
}

export default function StatusBadge({ status }) {
  const badgeStyle = BADGE_STYLES[status] || BADGE_STYLES.not_applied
  const dotStyle = DOT_STYLES[status] || DOT_STYLES.not_applied

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
      <span className={`h-2 w-2 rounded-full ${dotStyle}`} />
      <span>{formatStatus(status)}</span>
    </span>
  )
}
