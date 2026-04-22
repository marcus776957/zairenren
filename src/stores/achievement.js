import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorage, setStorage } from '../utils/storage'

export const ACHIEVEMENTS = {
  'first-100': { name: '初见百元', desc: '单次累计收入达到100元', icon: '💰' },
  'first-500': { name: '五百大关', desc: '单次累计收入达到500元', icon: '💎' },
  'first-1000': { name: '千元户', desc: '单次累计收入达到1000元', icon: '👑' },
  'early-bird': { name: '早起鸟', desc: '早上7点前开始工作', icon: '🐦' },
  'weekend-warrior': { name: '周末战士', desc: '周末也在上班', icon: '⚔️' },
  'overtime-hero': { name: '加班侠', desc: '工作超过每日预期工时', icon: '🦸' },
  'streak-3': { name: '三天连续', desc: '连续3天记录工作', icon: '🔥' },
  'streak-7': { name: '一周满勤', desc: '连续7天记录工作', icon: '🏆' },
}

export const useAchievementStore = defineStore('achievement', () => {
  const unlocked = ref(getStorage('achievements') || {})

  function unlock(id) {
    if (unlocked.value[id]) return false
    unlocked.value[id] = { unlockedAt: new Date().toISOString() }
    save()
    return true
  }

  function isUnlocked(id) {
    return !!unlocked.value[id]
  }

  function save() {
    setStorage('achievements', unlocked.value)
  }

  return { unlocked, unlock, isUnlocked }
})
