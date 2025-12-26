/**
 * 预算相关的mock数据
 * 注意：所有时间戳均为秒级时间戳
 */

// 存储预算数据
let budgetData = {
  budget: 5000, // 默认预算5000元
  spent: 2500,  // 已消费2500元
  updated_at: Math.floor(Date.now() / 1000) - 86400 * 7 // 7天前更新，秒级时间戳
};

/**
 * 获取预算信息
 * @returns {Object} 预算信息
 */
export function getBudget() {
  return { ...budgetData };
}

/**
 * 更新预算
 * @param {Number} budget 新的预算金额
 * @returns {Object} 更新后的预算信息
 */
export function updateBudget(budget) {
  // 更新预算金额
  budgetData = {
    ...budgetData,
    budget: Number(budget),
    updated_at: Math.floor(Date.now() / 1000) // 当前时间，秒级时间戳
  };
  
  return { ...budgetData };
}
