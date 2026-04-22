import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getStorage, setStorage } from '../utils/storage'
import { calcRates } from '../utils/calculation'

export const useSalaryStore = defineStore('salary', () => {
  const monthlySalary = ref(getStorage('settings')?.monthlySalary ?? 10000)
  const dailyHours = ref(getStorage('settings')?.dailyHours ?? 8)
  const monthlyDays = ref(getStorage('settings')?.monthlyDays ?? 22)
  const taxEnabled = ref(getStorage('settings')?.taxEnabled ?? false)
  const taxRate = ref(getStorage('settings')?.taxRate ?? 10)

  const effectiveTaxRate = computed(() => (taxEnabled.value ? taxRate.value : 0))

  const rates = computed(() =>
    calcRates(monthlySalary.value, monthlyDays.value, dailyHours.value, effectiveTaxRate.value)
  )

  const perSecondRate = computed(() => rates.value.perSecond)
  const perMinuteRate = computed(() => rates.value.perMinute)
  const perHourRate = computed(() => rates.value.perHour)
  const perDayRate = computed(() => rates.value.perDay)

  function saveSettings() {
    setStorage('settings', {
      monthlySalary: monthlySalary.value,
      dailyHours: dailyHours.value,
      monthlyDays: monthlyDays.value,
      taxEnabled: taxEnabled.value,
      taxRate: taxRate.value,
    })
  }

  watch([monthlySalary, dailyHours, monthlyDays, taxEnabled, taxRate], () => saveSettings(), {
    deep: true,
  })

  return {
    monthlySalary,
    dailyHours,
    monthlyDays,
    taxEnabled,
    taxRate,
    rates,
    perSecondRate,
    perMinuteRate,
    perHourRate,
    perDayRate,
  }
})
