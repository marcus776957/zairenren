<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的</text>
    </view>

    <!-- 薪资设置 -->
    <view class="card">
      <view class="card-header">
        <text class="card-icon">💰</text>
        <text class="card-title">薪资设置</text>
      </view>
      <view class="form-item">
        <text class="form-label">月薪（元）</text>
        <view class="input-wrap">
          <text class="input-prefix">¥</text>
          <input
            v-model="salary.monthlySalary"
            class="form-input"
            type="digit"
            placeholder="请输入月薪"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>
      <view class="form-row">
        <view class="form-item half">
          <text class="form-label">每日工时</text>
          <view class="input-wrap small">
            <input
              v-model="salary.dailyHours"
              class="form-input"
              type="digit"
              placeholder="小时"
              placeholder-class="input-placeholder"
            />
            <text class="input-suffix">h</text>
          </view>
        </view>
        <view class="form-item half">
          <text class="form-label">每月天数</text>
          <view class="input-wrap small">
            <input
              v-model="salary.monthlyDays"
              class="form-input"
              type="digit"
              placeholder="天数"
              placeholder-class="input-placeholder"
            />
            <text class="input-suffix">天</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 梦想清单管理 -->
    <view class="card">
      <view class="card-header">
        <text class="card-icon">🎯</text>
        <text class="card-title">梦想清单</text>
        <text class="card-badge">{{ goalsStore.goals.length }}个</text>
      </view>
      <view v-if="goalsStore.goals.length > 0" class="goal-list">
        <view v-for="goal in goalsStore.goals" :key="goal.id" class="goal-manage-item">
          <text class="goal-manage-icon">{{ goal.icon }}</text>
          <view class="goal-manage-info">
            <text class="goal-manage-name">{{ goal.name }}</text>
            <text class="goal-manage-price">¥{{ goal.price }}</text>
          </view>
          <view class="goal-delete" @click="goalsStore.removeGoal(goal.id)">
            <text class="goal-delete-text">✕</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-goals">
        <text class="empty-goals-text">还没有梦想，添加一个吧</text>
      </view>
      <!-- 添加新目标 -->
      <view class="add-goal-form">
        <view class="form-row">
          <view class="form-item half">
            <view class="input-wrap small">
              <input
                v-model="newGoalName"
                class="form-input"
                placeholder="目标名称"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>
          <view class="form-item half">
            <view class="input-wrap small">
              <input
                v-model="newGoalPrice"
                class="form-input"
                type="digit"
                placeholder="金额"
                placeholder-class="input-placeholder"
              />
              <text class="input-suffix">元</text>
            </view>
          </view>
        </view>
        <view class="emoji-row">
          <text
            v-for="e in emojiOptions"
            :key="e"
            class="emoji-pick"
            :class="{ picked: newGoalIcon === e }"
            @click="newGoalIcon = e"
            >{{ e }}</text
          >
        </view>
        <view class="add-btn" @click="addGoal">
          <text class="add-btn-text">+ 添加目标</text>
        </view>
      </view>
    </view>

    <!-- 选项 -->
    <view class="card">
      <view class="card-header">
        <text class="card-icon">⚙️</text>
        <text class="card-title">选项</text>
      </view>
      <view class="switch-row">
        <text class="switch-label">扣税模式</text>
        <switch
          :checked="salary.taxEnabled"
          color="#f59e0b"
          @change="salary.taxEnabled = $event.detail.value"
        />
      </view>
      <view v-if="salary.taxEnabled" class="form-item">
        <text class="form-label">税率</text>
        <view class="input-wrap small">
          <input
            v-model="salary.taxRate"
            class="form-input"
            type="digit"
            placeholder="税率"
            placeholder-class="input-placeholder"
          />
          <text class="input-suffix">%</text>
        </view>
      </view>
    </view>

    <!-- 收入预览 -->
    <view class="card">
      <view class="card-header">
        <text class="card-icon">📊</text>
        <text class="card-title">收入预览</text>
      </view>
      <view class="preview-grid">
        <view class="preview-item">
          <text class="preview-num">¥{{ perSecondDisplay }}</text>
          <text class="preview-unit">每秒</text>
        </view>
        <view class="preview-item">
          <text class="preview-num">¥{{ perMinuteDisplay }}</text>
          <text class="preview-unit">每分钟</text>
        </view>
        <view class="preview-item accent">
          <text class="preview-num">¥{{ perHourDisplay }}</text>
          <text class="preview-unit">每小时</text>
        </view>
        <view class="preview-item">
          <text class="preview-num">¥{{ perDayDisplay }}</text>
          <text class="preview-unit">每天</text>
        </view>
      </view>
    </view>

    <!-- 成就 -->
    <view class="card">
      <view class="card-header">
        <text class="card-icon">🏆</text>
        <text class="card-title">成就</text>
        <text class="card-badge">{{ unlockedCount }}/{{ totalCount }}</text>
      </view>
      <view class="achievement-list">
        <view
          v-for="(def, key) in allAchievements"
          :key="key"
          class="ach-item"
          :class="{ unlocked: achievement.isUnlocked(key) }"
        >
          <text class="ach-icon">{{ def.icon }}</text>
          <view class="ach-info">
            <text class="ach-name">{{ def.name }}</text>
            <text class="ach-desc">{{ def.desc }}</text>
          </view>
          <view v-if="achievement.isUnlocked(key)" class="ach-check">
            <text class="ach-check-text">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="about">
      <text class="about-text">再忍忍 v1.0.0</text>
      <text class="about-sub">再忍忍，钱在赚着呢</text>
      <text class="about-author">Made by Marcus</text>
      <view class="about-link" @click="openXHS">
        <text class="about-link-text">小红书主页</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSalaryStore } from '../../stores/salary'
import { useGoalsStore } from '../../stores/goals'
import { useAchievementStore, ACHIEVEMENTS } from '../../stores/achievement'
import { formatMoney } from '../../utils/format'

const salary = useSalaryStore()
const goalsStore = useGoalsStore()
const achievement = useAchievementStore()
const allAchievements = ACHIEVEMENTS

const newGoalName = ref('')
const newGoalPrice = ref('')
const newGoalIcon = ref('🎯')
const emojiOptions = ['☕', '🍱', '🎮', '👟', '📱', '🎬', '✈️', '👗', '🎹', '🏠', '🚗', '🎯']

function openXHS() {
  // #ifdef H5
  window.open('https://xhslink.com/m/Ah9gwxzdnP3', '_blank')
  // #endif
  // #ifndef H5
  uni.setClipboardData({ data: 'https://xhslink.com/m/Ah9gwxzdnP3' })
  // #endif
}

function addGoal() {
  const name = newGoalName.value.trim()
  const price = parseFloat(newGoalPrice.value)
  if (!name || !price || price <= 0) return
  goalsStore.addGoal({ name, price, icon: newGoalIcon.value })
  newGoalName.value = ''
  newGoalPrice.value = ''
}

const unlockedCount = computed(
  () => Object.keys(achievement.unlocked).filter((k) => achievement.isUnlocked(k)).length
)
const totalCount = computed(() => Object.keys(ACHIEVEMENTS).length)

const perSecondDisplay = computed(() => formatMoney(salary.perSecondRate))
const perMinuteDisplay = computed(() => formatMoney(salary.perMinuteRate))
const perHourDisplay = computed(() => formatMoney(salary.perHourRate))
const perDayDisplay = computed(() => formatMoney(salary.perDayRate))
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 32rpx 40rpx;
}

/* ===== 页面头部 ===== */
.page-header {
  padding: 48rpx 0 32rpx;
}
.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
}

/* ===== 卡片 ===== */
.card {
  background: #fff;
  border: 1rpx solid #f1f5f9;
  border-radius: 24rpx;
  padding: 28rpx 28rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.card-icon {
  font-size: 32rpx;
}
.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}
.card-badge {
  font-size: 22rpx;
  color: #ff9d00;
  background: rgba(255, 157, 0, 0.08);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}

/* ===== 表单 ===== */
.form-item {
  margin-bottom: 20rpx;
}
.form-item.half {
  flex: 1;
}
.form-row {
  display: flex;
  gap: 16rpx;
}
.form-label {
  font-size: 22rpx;
  color: #94a3b8;
  display: block;
  margin-bottom: 10rpx;
}
.input-wrap {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 0 20rpx;
  height: 88rpx;
  transition: border-color 0.2s ease;
}
.input-wrap:focus-within {
  border-color: rgba(255, 157, 0, 0.4);
}
.input-wrap.small {
  height: 80rpx;
}
.input-prefix {
  font-size: 28rpx;
  color: #ff9d00;
  font-weight: 600;
  margin-right: 8rpx;
}
.input-suffix {
  font-size: 24rpx;
  color: #94a3b8;
  margin-left: 8rpx;
}
.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #1e293b;
  height: 100%;
  background: transparent;
}
.input-placeholder {
  color: #cbd5e1;
  font-size: 28rpx;
}

/* ===== 开关行 ===== */
.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}
.switch-label {
  font-size: 28rpx;
  color: #1e293b;
}

/* ===== 收入预览 ===== */
.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}
.preview-item {
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
}
.preview-item.accent {
  background: rgba(255, 157, 0, 0.06);
  border-color: rgba(255, 157, 0, 0.15);
}
.preview-num {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff9d00;
  display: block;
  font-variant-numeric: tabular-nums;
}
.preview-unit {
  font-size: 20rpx;
  color: #64748b;
  margin-top: 4rpx;
  display: block;
}

/* ===== 成就列表 ===== */
.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.ach-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 20rpx;
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;
  border-radius: 16rpx;
  opacity: 0.45;
  transition: all 0.3s ease;
}
.ach-item.unlocked {
  opacity: 1;
  background: rgba(255, 157, 0, 0.04);
  border-color: rgba(255, 157, 0, 0.15);
}
.ach-icon {
  font-size: 36rpx;
  width: 48rpx;
  text-align: center;
}
.ach-info {
  flex: 1;
}
.ach-name {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 600;
  display: block;
}
.ach-desc {
  font-size: 20rpx;
  color: #64748b;
  display: block;
  margin-top: 2rpx;
}
.ach-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ach-check-text {
  font-size: 24rpx;
  color: #34d399;
  font-weight: 700;
}

/* ===== 关于 ===== */
.about {
  text-align: center;
  padding: 48rpx 0 24rpx;
}
.about-text {
  font-size: 24rpx;
  color: #94a3b8;
  display: block;
}
.about-sub {
  font-size: 22rpx;
  color: #cbd5e1;
  margin-top: 6rpx;
  display: block;
}
.about-author {
  font-size: 24rpx;
  color: #64748b;
  margin-top: 16rpx;
  display: block;
}
.about-link {
  margin-top: 12rpx;
  display: inline-block;
  padding: 8rpx 24rpx;
  background: rgba(255, 157, 0, 0.08);
  border: 2rpx solid rgba(255, 157, 0, 0.2);
  border-radius: 20rpx;
}
.about-link-text {
  font-size: 24rpx;
  color: #ff9d00;
}

/* ===== 梦想清单管理 ===== */
.goal-list {
  margin-bottom: 20rpx;
}
.goal-manage-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 16rpx;
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;
  border-radius: 14rpx;
  margin-bottom: 10rpx;
}
.goal-manage-icon {
  font-size: 32rpx;
  width: 40rpx;
  text-align: center;
}
.goal-manage-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.goal-manage-name {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 500;
}
.goal-manage-price {
  font-size: 26rpx;
  color: #ff9d00;
  font-weight: 600;
}
.goal-delete {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(248, 113, 113, 0.1);
}
.goal-delete-text {
  font-size: 22rpx;
  color: #f87171;
}
.empty-goals {
  text-align: center;
  padding: 24rpx 0;
  margin-bottom: 16rpx;
}
.empty-goals-text {
  font-size: 24rpx;
  color: #94a3b8;
}
.add-goal-form {
  border-top: 1rpx solid #f1f5f9;
  padding-top: 20rpx;
}
.emoji-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 16rpx 0;
}
.emoji-pick {
  font-size: 32rpx;
  padding: 6rpx 12rpx;
  border-radius: 10rpx;
  border: 2rpx solid transparent;
  opacity: 0.5;
  transition: all 0.2s ease;
}
.emoji-pick.picked {
  opacity: 1;
  border-color: rgba(255, 157, 0, 0.4);
  background: rgba(255, 157, 0, 0.08);
}
.add-btn {
  background: rgba(52, 211, 153, 0.08);
  border: 1rpx solid rgba(52, 211, 153, 0.15);
  border-radius: 14rpx;
  padding: 16rpx;
  text-align: center;
}
.add-btn-text {
  font-size: 26rpx;
  color: #34d399;
  font-weight: 600;
}
</style>
