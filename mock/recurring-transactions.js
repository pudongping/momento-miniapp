// 周期性交易记录数据
import { getTags } from './tags.js';
import { addTransaction } from './transactions.js';

// 周期类型
export const RECURRING_TYPES = {
  DAILY: 'daily',      // 每天
  WEEKLY: 'weekly',    // 每周
  MONTHLY: 'monthly',  // 每月
  QUARTERLY: 'quarterly', // 每季度
  YEARLY: 'yearly'     // 每年
};

// 初始周期性交易记录
let RECURRING_TRANSACTIONS = [
  {
    recurring_id: 1,
    book_id: 1,
    name: '房贷',
    type: 'expense',
    amount: 3500,
    tag_id: 2, // 房贷标签
    remark: '每月房贷还款',
    recurring_type: RECURRING_TYPES.MONTHLY,
    recurring_day: 10, // 每月10号
    recurring_time: '09:00',
    is_active: true,
    created_at: Math.floor(Date.now() / 1000) - 86400 * 30,
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 30
  },
  {
    recurring_id: 2,
    book_id: 1,
    name: '物业费',
    type: 'expense',
    amount: 200,
    tag_id: 6, // 其他标签
    remark: '季度物业费',
    recurring_type: RECURRING_TYPES.QUARTERLY,
    recurring_day: 15, // 每季度第15天
    recurring_time: '10:00',
    is_active: true,
    created_at: Math.floor(Date.now() / 1000) - 86400 * 20,
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 20
  },
  {
    recurring_id: 3,
    book_id: 1,
    name: '工资',
    type: 'income',
    amount: 10000,
    tag_id: 7, // 工资标签
    remark: '月薪',
    recurring_type: RECURRING_TYPES.MONTHLY,
    recurring_day: 15, // 每月15号
    recurring_time: '12:00',
    is_active: true,
    created_at: Math.floor(Date.now() / 1000) - 86400 * 15,
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 15
  }
];

// 获取周期性交易记录列表
export function getRecurringTransactions(params = {}) {
  let result = [...RECURRING_TRANSACTIONS];
  
  // 按账本筛选
  if (params.book_id) {
    result = result.filter(t => t.book_id === params.book_id);
  }
  
  // 按类型筛选
  if (params.type) {
    result = result.filter(t => t.type === params.type);
  }
  
  // 按状态筛选
  if (params.is_active !== undefined) {
    result = result.filter(t => t.is_active === params.is_active);
  }
  
  return result;
}

// 添加周期性交易记录
export function addRecurringTransaction(data) {
  const tags = getTags();
  const tag = tags.find(t => t.tag_id === data.tag_id);
  
  if (!tag) {
    throw new Error('标签不存在');
  }
  
  const newRecurringTransaction = {
    recurring_id: Math.max(...RECURRING_TRANSACTIONS.map(t => t.recurring_id), 0) + 1,
    book_id: data.book_id,
    name: data.name,
    type: data.type || 'expense',
    amount: parseFloat(data.amount),
    tag_id: data.tag_id,
    remark: data.remark || '',
    recurring_type: data.recurring_type,
    recurring_day: data.recurring_day,
    recurring_time: data.recurring_time || '09:00',
    is_active: data.is_active !== undefined ? data.is_active : true,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000)
  };
  
  RECURRING_TRANSACTIONS.push(newRecurringTransaction);
  return newRecurringTransaction;
}

// 更新周期性交易记录
export function updateRecurringTransaction(data) {
  const index = RECURRING_TRANSACTIONS.findIndex(t => t.recurring_id === data.recurring_id);
  
  if (index === -1) {
    throw new Error('周期性交易记录不存在');
  }
  
  let updatedRecurringTransaction = { ...RECURRING_TRANSACTIONS[index] };
  
  updatedRecurringTransaction = {
    ...updatedRecurringTransaction,
    name: data.name || updatedRecurringTransaction.name,
    type: data.type || updatedRecurringTransaction.type,
    amount: data.amount !== undefined ? parseFloat(data.amount) : updatedRecurringTransaction.amount,
    tag_id: data.tag_id || updatedRecurringTransaction.tag_id,
    remark: data.remark !== undefined ? data.remark : updatedRecurringTransaction.remark,
    recurring_type: data.recurring_type || updatedRecurringTransaction.recurring_type,
    recurring_day: data.recurring_day !== undefined ? data.recurring_day : updatedRecurringTransaction.recurring_day,
    recurring_time: data.recurring_time || updatedRecurringTransaction.recurring_time,
    is_active: data.is_active !== undefined ? data.is_active : updatedRecurringTransaction.is_active,
    updated_at: Math.floor(Date.now() / 1000)
  };
  
  RECURRING_TRANSACTIONS[index] = updatedRecurringTransaction;
  return updatedRecurringTransaction;
}

// 删除周期性交易记录
export function deleteRecurringTransaction(recurringId) {
  const index = RECURRING_TRANSACTIONS.findIndex(t => t.recurring_id === recurringId);
  
  if (index === -1) {
    throw new Error('周期性交易记录不存在');
  }
  
  RECURRING_TRANSACTIONS.splice(index, 1);
  return { success: true };
}

// 切换周期性交易记录状态
export function toggleRecurringTransaction(recurringId, status) {
  const index = RECURRING_TRANSACTIONS.findIndex(t => t.recurring_id === recurringId);
  
  if (index === -1) {
    throw new Error('周期性交易记录不存在');
  }
  
  RECURRING_TRANSACTIONS[index].is_active = status;
  RECURRING_TRANSACTIONS[index].updated_at = Math.floor(Date.now() / 1000);
  
  return RECURRING_TRANSACTIONS[index];
}

// 检查并执行周期性交易
export function processRecurringTransactions() {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentWeekday = now.getDay(); // 0-6, 0 is Sunday
  const currentTimestamp = Math.floor(now.getTime() / 1000);
  
  // 获取所有激活的周期性交易
  const activeRecurring = RECURRING_TRANSACTIONS.filter(t => t.is_active);
  const processedTransactions = [];
  
  activeRecurring.forEach(recurring => {
    let shouldProcess = false;
    
    switch (recurring.recurring_type) {
      case RECURRING_TYPES.DAILY:
        shouldProcess = true;
        break;
        
      case RECURRING_TYPES.WEEKLY:
        // recurring_day 在这里表示星期几 (0-6)
        shouldProcess = currentWeekday === recurring.recurring_day;
        break;
        
      case RECURRING_TYPES.MONTHLY:
        shouldProcess = currentDay === recurring.recurring_day;
        break;
        
      case RECURRING_TYPES.QUARTERLY:
        // 每季度的第一个月 (1, 4, 7, 10)
        const isQuarterStartMonth = currentMonth === 1 || currentMonth === 4 || 
                                   currentMonth === 7 || currentMonth === 10;
        shouldProcess = isQuarterStartMonth && currentDay === recurring.recurring_day;
        break;
        
      case RECURRING_TYPES.YEARLY:
        // recurring_day 在这里表示一年中的第几天 (1-366)
        const startOfYear = new Date(currentYear, 0, 0);
        const diff = now - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        shouldProcess = dayOfYear === recurring.recurring_day;
        break;
    }
    
    if (shouldProcess) {
      // 创建交易记录
      const transaction = addTransaction({
        book_id: recurring.book_id,
        type: recurring.type,
        amount: recurring.amount,
        tag_id: recurring.tag_id,
        remark: `${recurring.name}（自动记入）`,
        timestamp: currentTimestamp,
        is_auto_generated: true
      });
      
      processedTransactions.push(transaction);
    }
  });
  
  return processedTransactions;
}
