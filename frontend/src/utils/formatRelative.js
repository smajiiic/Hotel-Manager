// Shared relative-time formatter for createdAt / completedAt fields.
// Returns: 'just now' | 'Xm ago' (<1h) | 'Xh ago' (<24h) | 'yesterday' | 'May 14'

export function formatRelative(iso) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH < 24) return `${diffH}h ago`

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfToday.getDate() - 1)
  if (date >= startOfYesterday && date < startOfToday) return 'yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
