const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatHour = (date: Date): string => {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  const mm = minutes.toString().padStart(2, '0')
  return `${h}:${mm} ${ampm}`
}

export const formatFullDate = (date: Date): string =>
  `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${formatHour(date)}`

export const formatRelativeTime = (
  date: Date,
  hideTime: boolean,
  now: Date = new Date(),
): string => {
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffHours < 1) {
    return `${diffMinutes}m ago`
  }

  if (diffDays < 1) {
    return `${diffHours}h ago`
  }

  if (diffDays < 2) {
    return `Yesterday${!hideTime ? ` at ${formatHour(date)}` : ''}`
  }

  const isWithinYear = Math.floor(diffMs / (365.25 * 86_400_000)) < 1

  if (isWithinYear) {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}${!hideTime ? ` at ${formatHour(date)}` : ''}`
  }

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}
