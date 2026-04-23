<template>
  <view class="page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="header-title">再忍忍 💰</text>
      <text class="header-sub">钱在涨，别撒手</text>
      <view class="header-author" @click="openXHS">
        <text class="header-author-text">by Marcus · 小红书主页</text>
      </view>
    </view>

    <!-- 主区域：左存钱罐 + 右目标 -->
    <view class="main-grid">
      <!-- 左侧：存钱罐 -->
      <view class="left-col">
        <!-- 罐子 -->
        <view class="jar-wrap">
          <view class="jar-lid">
            <view class="jar-slot"></view>
          </view>
          <view class="jar-body">
            <!-- 金币堆叠层 -->
            <view class="coin-stack" :style="{ height: liquidPercent + '%' }">
              <view v-for="row in coinRows" :key="row" class="coin-row">
                <view class="gold-coin sm"></view>
                <view v-if="row % 2 === 0" class="gold-coin sm"></view>
              </view>
            </view>
            <!-- 掉落金币 -->
            <view class="coin-layer">
              <view v-for="c in coins" :key="c.id" class="coin-drop" :style="{ left: c.x + '%' }">
                <view class="gold-coin drop-size"></view>
              </view>
            </view>
          </view>
        </view>

        <!-- 金额 -->
        <view class="money-area">
          <text class="money-label">本次已强行收米</text>
          <text class="money-value">¥ {{ formattedEarnings }}</text>
        </view>

        <!-- 开始/停止按钮 -->
        <view class="work-btn" :class="{ working: timer.isWorking }" @click="toggleTimer">
          <text class="work-btn-text">{{
            timer.isRunning ? '下班啦，今天就到这' : '开始上班收米'
          }}</text>
        </view>
      </view>

      <!-- 右侧：梦想提货清单 -->
      <view class="right-col">
        <view class="goals-card">
          <view class="goals-head">
            <text class="goals-head-title">梦想提货清单</text>
            <text class="goals-head-hint">基于当前时薪计算</text>
          </view>

          <view class="goals-list">
            <view
              v-for="(goal, idx) in goalsStore.goals"
              :key="goal.id"
              class="goal-item"
              :class="{ unlocked: goalUnlocked[idx] }"
            >
              <view class="goal-icon-box">
                <text class="goal-icon">{{ goal.icon }}</text>
              </view>
              <view class="goal-body">
                <view class="goal-row">
                  <text class="goal-name">{{ goal.name }}</text>
                  <text class="goal-price">¥ {{ goal.price.toFixed(2) }}</text>
                </view>
                <view class="goal-bar-bg">
                  <view class="goal-bar-fill" :style="{ width: goalProgress[idx] + '%' }"></view>
                </view>
                <text class="goal-remain">{{ goalRemainText[idx] }}</text>
              </view>
            </view>
          </view>

          <!-- 无目标提示 -->
          <view v-if="goalsStore.goals.length === 0" class="no-goals">
            <text class="no-goals-text">去「我的」页面添加梦想清单 ✨</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 解锁弹窗 -->
    <view v-if="unlockPopup" class="unlock-mask" @click="unlockPopup = null">
      <view class="unlock-box">
        <text class="unlock-icon">{{ unlockPopup.icon }}</text>
        <text class="unlock-name">{{ unlockPopup.name }}</text>
        <text class="unlock-msg">已解锁！快去买！</text>
      </view>
    </view>

    <!-- 励志语录 -->
    <view class="quote-card" @click="refreshQuote">
      <text class="quote-text">「{{ currentQuote.text }}」</text>
      <text class="quote-hint">点击换一句</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSalaryStore } from '../../stores/salary'
import { useTimerStore } from '../../stores/timer'
import { useGoalsStore } from '../../stores/goals'
import { formatMoney } from '../../utils/format'
import { getRandomQuote } from '../../config/quotes'

const salary = useSalaryStore()
const timer = useTimerStore()
const goalsStore = useGoalsStore()

const coins = ref([])
let coinId = 0
let coinInterval = null
const unlockPopup = ref(null)
const currentQuote = ref(getRandomQuote())

function refreshQuote() {
  currentQuote.value = getRandomQuote()
}

function openXHS() {
  // #ifdef H5
  window.open('https://xhslink.com/m/Ah9gwxzdnP3', '_blank')
  // #endif
  // #ifndef H5
  uni.setClipboardData({ data: 'https://xhslink.com/m/Ah9gwxzdnP3' })
  // #endif
}

const formattedEarnings = computed(() => formatMoney(timer.currentEarnings))

const liquidPercent = computed(() => {
  if (goalsStore.goals.length > 0) {
    const maxPrice = Math.max(...goalsStore.goals.map((g) => g.price))
    if (maxPrice > 0) return Math.min(100, (timer.currentEarnings / maxPrice) * 100)
  }
  // 无目标时用100元作为满格值，金币能快速显现
  if (timer.currentEarnings <= 0) return 0
  return Math.min(100, (timer.currentEarnings / 100) * 100)
})

const coinRows = computed(() => {
  const pct = liquidPercent.value
  const rows = Math.floor(pct / 8)
  return Math.max(0, rows)
})

const goalProgress = computed(() =>
  goalsStore.goals.map((g) => Math.min(100, (timer.currentEarnings / g.price) * 100))
)

const goalUnlocked = computed(() => goalsStore.goals.map((g) => timer.currentEarnings >= g.price))

const goalRemainText = computed(() =>
  goalsStore.goals.map((g) => {
    const earnings = timer.currentEarnings
    if (earnings >= g.price) return '已解锁：快去买！'
    const remaining = g.price - earnings
    const rate = salary.perSecondRate
    if (rate <= 0) return '还需忍耐 --:--'
    const secs = Math.ceil(remaining / rate)
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `还需忍耐 ${h}时${m}分${s}秒`
  })
)

watch(goalUnlocked, (newVal, oldVal) => {
  if (!oldVal) return
  newVal.forEach((unlocked, idx) => {
    if (unlocked && !oldVal[idx]) {
      const goal = goalsStore.goals[idx]
      if (goal) {
        unlockPopup.value = { icon: goal.icon, name: goal.name }
        setTimeout(() => {
          if (unlockPopup.value?.name === goal.name) unlockPopup.value = null
        }, 3000)
      }
    }
  })
})

function spawnCoin() {
  const id = coinId++
  coins.value.push({ id, x: 15 + Math.random() * 70 })
  setTimeout(() => {
    coins.value = coins.value.filter((c) => c.id !== id)
  }, 1000)
}

function toggleTimer() {
  if (timer.isRunning) {
    timer.stop()
    if (coinInterval) {
      clearInterval(coinInterval)
      coinInterval = null
    }
  } else {
    timer.start()
    coinInterval = setInterval(spawnCoin, 2500)
  }
}

onMounted(() => {
  timer.restoreSession()
  if (timer.isRunning) {
    coinInterval = setInterval(spawnCoin, 2500)
  }
})

onUnmounted(() => {
  if (coinInterval) clearInterval(coinInterval)
})
</script>

<style scoped>
/* ===== 页面 ===== */
.page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 32rpx;
}

/* ===== 顶部 ===== */
.header {
  text-align: center;
  margin-bottom: 32rpx;
  padding-top: 24rpx;
}
.header-title {
  font-size: 48rpx;
  font-weight: 900;
  color: #1e293b;
  display: block;
}
.header-sub {
  font-size: 26rpx;
  color: #94a3b8;
  font-weight: 700;
  display: block;
  margin-top: 4rpx;
}
.header-author {
  display: inline-block;
  margin-top: 10rpx;
  padding: 6rpx 20rpx;
  background: rgba(255, 157, 0, 0.06);
  border: 1rpx solid rgba(255, 157, 0, 0.15);
  border-radius: 20rpx;
}
.header-author-text {
  font-size: 20rpx;
  color: #ff9d00;
  font-weight: 500;
}

/* ===== 语录卡片 ===== */
.quote-card {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  text-align: center;
  border: 2rpx solid #f1f5f9;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.quote-text {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.8;
  display: block;
}
.quote-hint {
  font-size: 18rpx;
  color: #cbd5e1;
  margin-top: 16rpx;
  display: block;
}

/* ===== 主布局 ===== */
.main-grid {
  display: flex;
  gap: 32rpx;
  align-items: flex-start;
}
.left-col {
  flex: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.right-col {
  flex: 7;
}

/* ===== 存钱罐 ===== */
.jar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28rpx;
}
.jar-lid {
  width: 256rpx;
  height: 28rpx;
  background: rgba(255, 255, 255, 0.6);
  border: 4rpx solid #333;
  border-bottom: none;
  border-radius: 16rpx 16rpx 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.jar-slot {
  width: 72rpx;
  height: 12rpx;
  background: #f0f2f5;
  border-radius: 0 0 8rpx 8rpx;
}
.jar-body {
  width: 256rpx;
  height: 320rpx;
  background: rgba(255, 255, 255, 0.6);
  border: 4rpx solid #333;
  border-top: none;
  border-radius: 0 0 80rpx 80rpx;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 -10rpx 20rpx rgba(0, 0, 0, 0.1);
}

/* ===== 金币堆叠 ===== */
.coin-stack {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.5s ease-out;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 0;
  padding: 0 20rpx;
}
.coin-row {
  display: flex;
  justify-content: center;
  gap: 4rpx;
  margin-top: -12rpx;
}
/* ===== CSS 金币 ===== */
.gold-coin {
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffe066, #fbbf24 40%, #d97706 80%, #92400e);
  box-shadow:
    0 2rpx 6rpx rgba(0, 0, 0, 0.25),
    inset 0 -2rpx 4rpx rgba(0, 0, 0, 0.2),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.4);
  position: relative;
}
.gold-coin::after {
  content: '¥';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: inherit;
  font-weight: 900;
  color: #92400e;
  text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.3);
}
.gold-coin.sm {
  width: 40rpx;
  height: 40rpx;
  font-size: 22rpx;
}
.gold-coin.drop-size {
  width: 48rpx;
  height: 48rpx;
  font-size: 26rpx;
}

/* ===== 掉落金币 ===== */
.coin-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.coin-drop {
  position: absolute;
  top: -56rpx;
  animation: coin-fall 1s ease-in forwards;
}
@keyframes coin-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translateY(320rpx) rotate(540deg);
    opacity: 0;
  }
}

/* ===== 金额 ===== */
.money-area {
  text-align: center;
  margin-bottom: 24rpx;
}
.money-label {
  font-size: 20rpx;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 4rpx;
  display: block;
  margin-bottom: 8rpx;
}
.money-value {
  font-size: 52rpx;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -1rpx;
  display: block;
}

/* ===== 按钮 ===== */
.work-btn {
  width: 100%;
  padding: 28rpx;
  background: #1e293b;
  border-radius: 24rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}
.work-btn.working {
  background: #ef4444;
  box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
  animation: working-pulse 2s ease-in-out infinite;
}
@keyframes working-pulse {
  0%,
  100% {
    box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 12rpx 36rpx rgba(239, 68, 68, 0.5);
  }
}
.work-btn:active {
  transform: scale(0.97);
}
.work-btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

/* ===== 右侧：目标卡片 ===== */
.goals-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 36rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 2rpx solid #f1f5f9;
}
.goals-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}
.goals-head-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1e293b;
}
.goals-head-hint {
  font-size: 20rpx;
  color: #94a3b8;
}

/* ===== 目标列表 ===== */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.goal-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  border: 4rpx solid #f1f5f9;
  border-radius: 24rpx;
  transition: all 0.3s ease;
}
.goal-item.unlocked {
  border-color: #ff9d00;
  background: #fffdf0;
}
.goal-icon-box {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
}
.goal-icon {
  font-size: 48rpx;
  filter: grayscale(100%);
  opacity: 0.3;
  transition: all 0.5s ease;
}
.goal-item.unlocked .goal-icon {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.2);
}
.goal-body {
  flex: 1;
}
.goal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}
.goal-name {
  font-size: 26rpx;
  font-weight: 700;
  color: #475569;
}
.goal-price {
  font-size: 24rpx;
  color: #94a3b8;
}
.goal-bar-bg {
  width: 100%;
  height: 12rpx;
  background: #f1f5f9;
  border-radius: 6rpx;
  overflow: hidden;
}
.goal-bar-fill {
  height: 100%;
  background: #facc15;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}
.goal-item.unlocked .goal-bar-fill {
  background: #34d399;
}
.goal-remain {
  font-size: 18rpx;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  display: block;
  margin-top: 10rpx;
}
.goal-item.unlocked .goal-remain {
  color: #22c55e;
}

/* ===== 无目标 ===== */
.no-goals {
  text-align: center;
  padding: 32rpx 0;
}
.no-goals-text {
  font-size: 26rpx;
  color: #94a3b8;
}

/* ===== 解锁弹窗 ===== */
.unlock-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.unlock-box {
  text-align: center;
  animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes pop {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.unlock-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 16rpx;
}
.unlock-name {
  font-size: 48rpx;
  font-weight: 900;
  color: #1e293b;
  display: block;
}
.unlock-msg {
  font-size: 28rpx;
  color: #22c55e;
  font-weight: 700;
  margin-top: 12rpx;
  display: block;
}
</style>
