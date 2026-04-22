import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage } from '../utils/storage'
import { formatDate } from '../utils/format'

export const useHistoryStore = defineStore('history', () => {
  const sessions = ref(getStorage('sessions') || [])

  function addSession(session) {
    sessions.value.unshift({
      id: Date.now(),
      date: formatDate(session.startTime),
      startTime: session.startTime,
      endTime: session.endTime,
      durationSeconds: session.durationSeconds,
      earnings: session.earnings,
    })
    save()
  }

  function save() {
    setStorage('sessions', sessions.value.slice(0, 365))
  }

  const todayStr = computed(() => formatDate(new Date()))

  const todaySessions = computed(() => sessions.value.filter((s) => s.date === todayStr.value))

  const todayTotal = computed(() => todaySessions.value.reduce((sum, s) => sum + s.earnings, 0))

  const todayDuration = computed(() =>
    todaySessions.value.reduce((sum, s) => sum + s.durationSeconds, 0)
  )

  function getWeekSessions() {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
    return sessions.value.filter((s) => new Date(s.startTime) >= weekAgo)
  }

  const weekTotal = computed(() => getWeekSessions().reduce((sum, s) => sum + s.earnings, 0))

  function getMonthSessions() {
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000)
    return sessions.value.filter((s) => new Date(s.startTime) >= monthAgo)
  }

  const monthTotal = computed(() => getMonthSessions().reduce((sum, s) => sum + s.earnings, 0))

  function getDailyStats(days = 7) {
    const result = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000)
      const dateStr = formatDate(d)
      const daySessions = sessions.value.filter((s) => s.date === dateStr)
      result.push({
        date: dateStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        earnings: daySessions.reduce((sum, s) => sum + s.earnings, 0),
        duration: daySessions.reduce((sum, s) => sum + s.durationSeconds, 0),
      })
    }
    return result
  }

  return {
    sessions,
    todaySessions,
    todayTotal,
    todayDuration,
    weekTotal,
    monthTotal,
    addSession,
    getDailyStats,
  }
})
