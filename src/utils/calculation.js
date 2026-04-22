/**
 * Core income calculation utilities
 */

/**
 * Calculate per-second earning rate
 * @param {number} monthlySalary - Monthly salary in CNY
 * @param {number} monthlyDays - Working days per month
 * @param {number} dailyHours - Working hours per day
 * @returns {number} Earnings per second
 */
export function calcPerSecondRate(monthlySalary, monthlyDays, dailyHours) {
  if (!monthlySalary || !monthlyDays || !dailyHours) return 0
  const totalSeconds = monthlyDays * dailyHours * 3600
  return totalSeconds > 0 ? monthlySalary / totalSeconds : 0
}

/**
 * Calculate all rate breakdowns
 */
export function calcRates(monthlySalary, monthlyDays, dailyHours, taxRate = 0) {
  const grossPerSecond = calcPerSecondRate(monthlySalary, monthlyDays, dailyHours)
  const netPerSecond = grossPerSecond * (1 - taxRate / 100)

  return {
    perSecond: netPerSecond,
    perMinute: netPerSecond * 60,
    perHour: netPerSecond * 3600,
    perDay: netPerSecond * dailyHours * 3600,
    perMonth: netPerSecond * monthlyDays * dailyHours * 3600,
  }
}

/**
 * Calculate current session earnings
 * @param {number} perSecondRate
 * @param {number} elapsedSeconds
 * @returns {number}
 */
export function calcEarnings(perSecondRate, elapsedSeconds) {
  return perSecondRate * elapsedSeconds
}

/**
 * Check if currently in overtime
 */
export function isOvertime(elapsedSeconds, dailyHours) {
  return elapsedSeconds > dailyHours * 3600
}

/**
 * Get overtime seconds
 */
export function getOvertimeSeconds(elapsedSeconds, dailyHours) {
  return Math.max(0, elapsedSeconds - dailyHours * 3600)
}

/**
 * Milestone thresholds in CNY
 */
export const MILESTONES = [1, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000]

/**
 * Find the next milestone
 */
export function getNextMilestone(currentEarnings) {
  for (const m of MILESTONES) {
    if (currentEarnings < m) return m
  }
  return Math.ceil(currentEarnings / 10000) * 10000
}

/**
 * Check which milestone was just crossed
 */
export function getCrossedMilestone(previousEarnings, currentEarnings) {
  for (const m of MILESTONES) {
    if (previousEarnings < m && currentEarnings >= m) return m
  }
  return null
}
