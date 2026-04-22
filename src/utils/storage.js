/**
 * Cross-platform storage abstraction for uni-app (H5 + WeChat Mini Program)
 * Uses uni.getStorageSync / uni.setStorageSync which work on both platforms
 */

const PREFIX = 'zrr_'

export function getStorage(key, defaultValue = null) {
  try {
    const fullKey = PREFIX + key
    const value = uni.getStorageSync(fullKey)
    if (value === '' || value === null || value === undefined) {
      return defaultValue
    }
    return JSON.parse(value)
  } catch {
    return defaultValue
  }
}

export function setStorage(key, value) {
  try {
    const fullKey = PREFIX + key
    uni.setStorageSync(fullKey, JSON.stringify(value))
  } catch (e) {
    console.error('Storage set failed:', e)
  }
}

export function removeStorage(key) {
  try {
    const fullKey = PREFIX + key
    uni.removeStorageSync(fullKey)
  } catch (e) {
    console.error('Storage remove failed:', e)
  }
}
