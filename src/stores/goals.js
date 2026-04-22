import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage } from '../utils/storage'

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref(getStorage('goals') || [])
  const unlockedIds = ref(getStorage('unlocked_goals') || {})

  function addGoal(goal) {
    goals.value.push({
      id: Date.now().toString(),
      name: goal.name,
      price: goal.price,
      icon: goal.icon || '🎯',
    })
    save()
  }

  function removeGoal(id) {
    goals.value = goals.value.filter((g) => g.id !== id)
    delete unlockedIds.value[id]
    save()
  }

  function checkUnlock(id, currentEarnings) {
    const goal = goals.value.find((g) => g.id === id)
    if (!goal) return false
    if (currentEarnings >= goal.price && !unlockedIds.value[id]) {
      unlockedIds.value[id] = { unlockedAt: new Date().toISOString() }
      save()
      return true
    }
    return false
  }

  function isUnlocked(id) {
    return !!unlockedIds.value[id]
  }

  function getProgress(id, currentEarnings) {
    const goal = goals.value.find((g) => g.id === id)
    if (!goal) return 0
    return Math.min(100, (currentEarnings / goal.price) * 100)
  }

  function getRemainingTime(id, perSecondRate) {
    const goal = goals.value.find((g) => g.id === id)
    if (!goal || perSecondRate <= 0) return null
    const remaining = goal.price - (goal.price * getProgress(id, 0) || 0)
    if (remaining <= 0) return { text: '已解锁', done: true }
    return { text: '还需忍耐', done: false, remaining }
  }

  function clearSessionUnlocks() {
    unlockedIds.value = {}
    save()
  }

  function save() {
    setStorage('goals', goals.value)
    setStorage('unlocked_goals', unlockedIds.value)
  }

  return {
    goals,
    unlockedIds,
    addGoal,
    removeGoal,
    checkUnlock,
    isUnlocked,
    getProgress,
    getRemainingTime,
    clearSessionUnlocks,
  }
})
