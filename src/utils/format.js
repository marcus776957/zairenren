/**
 * Format money value to CNY display string
 * @param {number} value
 * @returns {string} e.g. "1,234.56"
 */
export function formatMoney(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0.00'
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format with yuan symbol
 */
export function formatYuan(value) {
  return `¥${formatMoney(value)}`
}

/**
 * Format elapsed seconds to HH:MM:SS
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '00:00:00'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Format elapsed seconds to human readable
 * e.g. "2h 15m" or "45m 30s"
 */
export function formatDurationShort(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '0m 0s'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const parts = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0 || h > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format time to HH:mm
 */
export function formatTime(date) {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
