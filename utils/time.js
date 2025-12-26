// 时间处理工具函数
// 所有接口返回的时间都是秒级时间戳，需要前端格式化处理

/**
 * 格式化时间戳为日期字符串
 * @param {number} timestamp 秒级时间戳
 * @param {string} format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTimestamp(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp) return ''
  
  // 转换为毫秒级时间戳
  const date = new Date(timestamp * 1000)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化时间戳为相对时间
 * @param {number} timestamp 秒级时间戳
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`
  } else if (diff < 2592000) {
    return `${Math.floor(diff / 86400)}天前`
  } else {
    return formatTimestamp(timestamp, 'YYYY-MM-DD')
  }
}

/**
 * 获取当前秒级时间戳
 * @returns {number} 当前秒级时间戳
 */
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000)
}

/**
 * 格式化时间戳为日期（不含时间）
 * @param {number} timestamp 秒级时间戳
 * @returns {string} 日期字符串 YYYY-MM-DD
 */
export function formatDate(timestamp) {
  return formatTimestamp(timestamp, 'YYYY-MM-DD')
}

/**
 * 格式化时间戳为时间（不含日期）
 * @param {number} timestamp 秒级时间戳
 * @returns {string} 时间字符串 HH:mm:ss
 */
export function formatTime(timestamp) {
  return formatTimestamp(timestamp, 'HH:mm:ss')
}
