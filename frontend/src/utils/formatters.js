const STATUS_LABELS = {
  not_applied: 'Not Applied',
  applied: 'Applied',
  interview: 'Interview',
  rejected: 'Rejected',
  selected: 'Selected',
}

const STATUS_COLORS = {
  not_applied: 'text-white/60',
  applied: 'text-accent-blue',
  interview: 'text-accent-cyan',
  rejected: 'text-red-400',
  selected: 'text-emerald-400',
}

export function formatDate(dateString) {
  if (!dateString) {
    return 'Not set'
  }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return 'Not set'
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatStatus(status) {
  return STATUS_LABELS[status] || STATUS_LABELS.not_applied
}

export function getStatusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.not_applied
}

export function calculateDaysAgo(dateString) {
  if (!dateString) {
    return 'Not set'
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return 'Not set'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return 'Today'
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months === 1 ? '' : 's'} ago`
  }

  const years = Math.floor(diffDays / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}
