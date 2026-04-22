<template>
  <view class="page">
    <!-- 顶部汇总 -->
    <view class="hero">
      <text class="hero-title">收入统计</text>
      <view class="hero-amounts">
        <view class="hero-item main">
          <text class="hero-label">今日收入</text>
          <text class="hero-val">¥{{ todayDisplay }}</text>
          <text class="hero-sub">{{ todayDurationDisplay }}</text>
        </view>
        <view class="hero-side">
          <view class="hero-item small">
            <text class="hero-label">本周</text>
            <text class="hero-val sm">¥{{ weekDisplay }}</text>
          </view>
          <view class="hero-item small">
            <text class="hero-label">本月</text>
            <text class="hero-val sm">¥{{ monthDisplay }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 趋势图 -->
    <view v-if="dailyStats.length > 0" class="card">
      <text class="card-title">近 7 天趋势</text>
      <view class="chart">
        <view class="chart-y">
          <text class="chart-y-label">¥{{ maxEarningDisplay }}</text>
        </view>
        <view class="chart-bars">
          <view v-for="day in dailyStats" :key="day.date" class="chart-col">
            <view class="chart-bar-bg">
              <view
                class="chart-bar-fill"
                :style="{ height: getBarHeight(day.earnings) + '%' }"
              ></view>
            </view>
            <text class="chart-day">{{ day.label }}</text>
            <text v-if="day.earnings > 0" class="chart-earnings"
              >¥{{ shortMoney(day.earnings) }}</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="card">
      <text class="card-title">工作记录</text>
      <view v-if="history.sessions.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无记录</text>
        <text class="empty-hint">开始上班后记录会出现在这里</text>
      </view>
      <view v-for="session in paginatedSessions" :key="session.id" class="record-item">
        <view class="record-left">
          <text class="record-date">{{ session.date }}</text>
          <text class="record-time">
            {{ formatTimeDisplay(session.startTime) }} - {{ formatTimeDisplay(session.endTime) }}
          </text>
        </view>
        <view class="record-right">
          <text class="record-earnings">+¥{{ formatEarnings(session.earnings) }}</text>
          <text class="record-duration">{{ formatDurationDisplay(session.durationSeconds) }}</text>
        </view>
      </view>
      <view v-if="hasMore" class="load-more" @click="loadMore">
        <text class="load-more-text">查看更多</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHistoryStore } from '../../stores/history'
import { formatMoney, formatDurationShort, formatTime } from '../../utils/format'

const history = useHistoryStore()
const pageSize = 10
const currentPage = ref(1)

const todayDisplay = computed(() => formatMoney(history.todayTotal))
const weekDisplay = computed(() => formatMoney(history.weekTotal))
const monthDisplay = computed(() => formatMoney(history.monthTotal))
const todayDurationDisplay = computed(() => formatDurationShort(history.todayDuration))
const dailyStats = computed(() => history.getDailyStats(7))

const maxEarning = computed(() => {
  const max = Math.max(...dailyStats.value.map((d) => d.earnings))
  return max || 1
})
const maxEarningDisplay = computed(() => {
  const v = maxEarning.value
  return v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0)
})

function getBarHeight(earnings) {
  if (maxEarning.value === 0) return 0
  return Math.max(3, (earnings / maxEarning.value) * 100)
}

function shortMoney(v) {
  if (v >= 1000) return (v / 1000).toFixed(1) + 'k'
  return v.toFixed(0)
}

function formatEarnings(val) {
  return formatMoney(val)
}
function formatTimeDisplay(isoStr) {
  return formatTime(new Date(isoStr))
}
function formatDurationDisplay(seconds) {
  return formatDurationShort(seconds)
}
const paginatedSessions = computed(() => history.sessions.slice(0, currentPage.value * pageSize))
const hasMore = computed(() => paginatedSessions.value.length < history.sessions.length)
function loadMore() {
  currentPage.value++
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 32rpx 40rpx;
}

/* ===== 顶部英雄区 ===== */
.hero {
  padding: 48rpx 0 36rpx;
}
.hero-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1e293b;
  display: block;
  margin-bottom: 28rpx;
}
.hero-amounts {
  display: flex;
  gap: 16rpx;
}
.hero-item.main {
  flex: 1.2;
  background: linear-gradient(135deg, rgba(255, 157, 0, 0.08), rgba(251, 191, 36, 0.04));
  border: 1rpx solid rgba(255, 157, 0, 0.2);
  border-radius: 24rpx;
  padding: 28rpx;
}
.hero-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.hero-item.small {
  background: #fff;
  border: 1rpx solid #f1f5f9;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  flex: 1;
}
.hero-label {
  font-size: 22rpx;
  color: #94a3b8;
  display: block;
  margin-bottom: 6rpx;
}
.hero-val {
  font-size: 44rpx;
  font-weight: 800;
  color: #ff9d00;
  display: block;
  font-variant-numeric: tabular-nums;
}
.hero-val.sm {
  font-size: 30rpx;
  color: #1e293b;
}
.hero-sub {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 6rpx;
  display: block;
}

/* ===== 卡片通用 ===== */
.card {
  background: #fff;
  border: 1rpx solid #f1f5f9;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  display: block;
  margin-bottom: 24rpx;
}

/* ===== 图表 ===== */
.chart {
  display: flex;
  gap: 8rpx;
}
.chart-y {
  width: 60rpx;
  display: flex;
  align-items: flex-start;
}
.chart-y-label {
  font-size: 18rpx;
  color: #475569;
}
.chart-bars {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 240rpx;
  padding-bottom: 48rpx;
}
.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
}
.chart-bar-bg {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.chart-bar-fill {
  width: 32rpx;
  background: linear-gradient(180deg, #ff9d00, rgba(255, 157, 0, 0.3));
  border-radius: 8rpx 8rpx 0 0;
  min-height: 4rpx;
  transition: height 0.6s ease;
}
.chart-day {
  position: absolute;
  bottom: 0;
  font-size: 18rpx;
  color: #94a3b8;
}
.chart-earnings {
  position: absolute;
  bottom: 28rpx;
  font-size: 16rpx;
  color: #94a3b8;
  white-space: nowrap;
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 60rpx 0;
}
.empty-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
}
.empty-text {
  font-size: 30rpx;
  color: #64748b;
  display: block;
}
.empty-hint {
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 8rpx;
  display: block;
}

/* ===== 记录列表 ===== */
.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}
.record-item:last-child {
  border-bottom: none;
}
.record-left {
  flex: 1;
}
.record-date {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 600;
  display: block;
}
.record-time {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 4rpx;
  display: block;
}
.record-right {
  text-align: right;
}
.record-earnings {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff9d00;
  display: block;
}
.record-duration {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 4rpx;
  display: block;
}

.load-more {
  text-align: center;
  padding: 20rpx 0 0;
}
.load-more-text {
  font-size: 26rpx;
  color: #ff9d00;
}
</style>
