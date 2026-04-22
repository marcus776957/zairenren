import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSalaryStore } from './salary'
import { useHistoryStore } from './history'
import { useAchievementStore } from './achievement'
import { useGoalsStore } from './goals'
import { getStorage, setStorage } from '../utils/storage'
import { calcEarnings, getCrossedMilestone, isOvertime } from '../utils/calculation'

export const useTimerStore = defineStore('timer', () => {
  const isRunning = ref(false)
  const sessionStartTime = ref(null)
  const elapsedSeconds = ref(0)
  const currentEarnings = ref(0)
  const lastMilestone = ref(0)

  let intervalId = null

  const salaryStore = useSalaryStore()

  const formattedEarnings = computed(() => currentEarnings.value)

  const overtime = computed(() => isOvertime(elapsedSeconds.value, salaryStore.dailyHours))

  const progressPercent = computed(() => {
    const totalSeconds = salaryStore.dailyHours * 3600
    return Math.min(100, (elapsedSeconds.value / totalSeconds) * 100)
  })

  function start() {
    if (isRunning.value) return

    const saved = getStorage('current_session')
    if (saved && saved.isRunning) {
      sessionStartTime.value = new Date(saved.startTime)
      const now = Date.now()
      elapsedSeconds.value = Math.floor((now - sessionStartTime.value.getTime()) / 1000)
      currentEarnings.value = calcEarnings(salaryStore.perSecondRate, elapsedSeconds.value)
    } else {
      sessionStartTime.value = new Date()
      elapsedSeconds.value = 0
      currentEarnings.value = 0
      lastMilestone.value = 0
    }

    isRunning.value = true
    setStorage('current_session', {
      startTime: sessionStartTime.value.toISOString(),
      isRunning: true,
    })

    // Check time-based achievements on start
    checkTimeAchievements()

    intervalId = setInterval(tick, 1000)
    tick()
  }

  function tick() {
    elapsedSeconds.value++
    const prevEarnings = currentEarnings.value
    currentEarnings.value = calcEarnings(salaryStore.perSecondRate, elapsedSeconds.value)

    const milestone = getCrossedMilestone(prevEarnings, currentEarnings.value)
    if (milestone) {
      lastMilestone.value = milestone
      checkMilestoneAchievements(milestone)
    }

    // Check goal unlocks
    checkGoalUnlocks()

    // Check overtime on every tick
    if (overtime.value) {
      const achievementStore = useAchievementStore()
      achievementStore.unlock('overtime-hero')
    }
  }

  function stop() {
    if (!isRunning.value) return

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    isRunning.value = false

    if (sessionStartTime.value && elapsedSeconds.value > 0 && currentEarnings.value > 0) {
      const historyStore = useHistoryStore()
      historyStore.addSession({
        startTime: sessionStartTime.value.toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: elapsedSeconds.value,
        earnings: currentEarnings.value,
      })

      // Check streak achievements
      checkStreakAchievements()
    }

    setStorage('current_session', null)
  }

  function checkMilestoneAchievements(milestone) {
    const achievementStore = useAchievementStore()

    if (milestone >= 100) achievementStore.unlock('first-100')
    if (milestone >= 500) achievementStore.unlock('first-500')
    if (milestone >= 1000) achievementStore.unlock('first-1000')
  }

  function checkTimeAchievements() {
    const achievementStore = useAchievementStore()

    const startHour = sessionStartTime.value?.getHours()
    if (startHour !== undefined && startHour < 7) {
      achievementStore.unlock('early-bird')
    }

    const day = sessionStartTime.value?.getDay()
    if (day === 0 || day === 6) {
      achievementStore.unlock('weekend-warrior')
    }
  }

  function checkStreakAchievements() {
    const historyStore = useHistoryStore()
    const achievementStore = useAchievementStore()

    const dates = [...new Set(historyStore.sessions.map((s) => s.date))].sort().reverse()
    if (dates.length < 3) return

    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diff = (prev.getTime() - curr.getTime()) / (24 * 3600 * 1000)
      if (Math.abs(diff - 1) < 0.5) {
        streak++
      } else {
        break
      }
    }

    if (streak >= 3) achievementStore.unlock('streak-3')
    if (streak >= 7) achievementStore.unlock('streak-7')
  }

  function checkGoalUnlocks() {
    const goalsStore = useGoalsStore()
    goalsStore.goals.value.forEach((g) => {
      if (currentEarnings.value >= g.price) {
        goalsStore.checkUnlock(g.id, currentEarnings.value)
      }
    })
  }

  function restoreSession() {
    const saved = getStorage('current_session')
    if (saved && saved.isRunning) {
      start()
    }
  }

  return {
    isRunning,
    sessionStartTime,
    elapsedSeconds,
    currentEarnings,
    lastMilestone,
    formattedEarnings,
    overtime,
    progressPercent,
    start,
    stop,
    restoreSession,
  }
})
