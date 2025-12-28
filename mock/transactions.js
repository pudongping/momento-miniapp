// 交易记录数据
import { getTags } from './tags.js';

// 生成过去30天的随机交易记录
const generateTransactions = () => {
  const transactions = [];
  const tags = getTags();
  const expenseTags = tags.filter(tag => tag.type === 'expense');
  const incomeTags = tags.filter(tag => tag.type === 'income');
  
  // 当前时间戳（秒）
  const now = Math.floor(Date.now() / 1000);
  // 30天前的时间戳（秒）
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
  
  // 生成50条随机交易记录
  for (let i = 1; i <= 50; i++) {
    // 随机决定是收入还是支出
    const isExpense = Math.random() > 0.3; // 70%概率是支出
    const type = isExpense ? 'expense' : 'income';
    
    // 根据类型选择标签
    const availableTags = isExpense ? expenseTags : incomeTags;
    const tag = availableTags[Math.floor(Math.random() * availableTags.length)];
    
    // 随机金额（支出：10-1000元，收入：1000-10000元）
    const amount = isExpense 
      ? Math.round((Math.random() * 990 + 10) * 100) / 100
      : Math.round((Math.random() * 9000 + 1000) * 100) / 100;
    
    // 随机日期（过去30天内）
    const timestamp = Math.floor(Math.random() * (now - thirtyDaysAgo)) + thirtyDaysAgo;
    
    // 随机备注
    const remarks = [
      '超市购物',
      '午餐',
      '晚餐',
      '地铁',
      '打车',
      '电影',
      '购物',
      '工资',
      '奖金',
      '投资收益',
      '房贷还款',
      '水电费',
      '物业费',
      '孩子学费',
      '医疗费用'
    ];
    
    const remark = isExpense 
      ? remarks[Math.floor(Math.random() * 10)]
      : remarks[Math.floor(Math.random() * 5) + 10];
    
    transactions.push({
      transaction_id: i,
      book_id: Math.floor(Math.random() * 2) + 1, // 随机分配到账本1或2
      type,
      amount,
      tag_id: tag.tag_id,
      tag_name: tag.name,
      tag_color: tag.color,
      tag_icon: tag.icon,
      remark: Math.random() > 0.3 ? remark : '', // 70%概率有备注
      created_at: timestamp,
      updated_at: timestamp,
      is_auto_generated: false
    });
  }
  
  // 按时间戳降序排序（最新的在前）
  return transactions.sort((a, b) => b.created_at - a.created_at);
};

// 初始交易记录
let TRANSACTIONS = generateTransactions();

// 获取交易记录列表
export function getTransactions(params = {}) {
  let result = [...TRANSACTIONS];
  
  // 按账本筛选
  if (params.book_id) {
    result = result.filter(t => t.book_id === params.book_id);
  }
  
  // 按类型筛选
  if (params.type) {
    result = result.filter(t => t.type === params.type);
  }
  
  // 按标签筛选
  if (params.tag_id) {
    result = result.filter(t => t.tag_id === params.tag_id);
  }
  
  // 按日期范围筛选
  if (params.start_date) {
    result = result.filter(t => t.timestamp >= params.start_date);
  }
  
  if (params.end_date) {
    result = result.filter(t => t.timestamp <= params.end_date);
  }
  
  // 分页
  const page = params.page || 1;
  const pageSize = params.page_size || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    list: result.slice(start, end),
    total: result.length,
    page,
    page_size: pageSize
  };
}

// 添加交易记录
export function addTransaction(data) {
  const tags = getTags();
  const tag = tags.find(t => t.tag_id === data.tag_id);
  
  if (!tag) {
    throw new Error('标签不存在');
  }
  
  const newTransaction = {
    transaction_id: Math.max(...TRANSACTIONS.map(t => t.transaction_id), 0) + 1,
    book_id: data.book_id,
    type: data.type || 'expense',
    amount: parseFloat(data.amount),
    tag_id: data.tag_id,
    tag_name: tag.name,
    tag_color: tag.color,
    tag_icon: tag.icon,
    remark: data.remark || '',
    timestamp: data.timestamp || Math.floor(Date.now() / 1000),
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    is_auto_generated: data.is_auto_generated || false
  };
  
  TRANSACTIONS.unshift(newTransaction);
  return newTransaction;
}

// 更新交易记录
export function updateTransaction(data) {
  const index = TRANSACTIONS.findIndex(t => t.transaction_id === data.transaction_id);
  
  if (index === -1) {
    throw new Error('交易记录不存在');
  }
  
  let updatedTransaction = { ...TRANSACTIONS[index] };
  
  if (data.tag_id && data.tag_id !== updatedTransaction.tag_id) {
    const tags = getTags();
    const tag = tags.find(t => t.tag_id === data.tag_id);
    
    if (!tag) {
      throw new Error('标签不存在');
    }
    
    updatedTransaction.tag_id = data.tag_id;
    updatedTransaction.tag_name = tag.name;
    updatedTransaction.tag_color = tag.color;
    updatedTransaction.tag_icon = tag.icon;
  }
  
  updatedTransaction = {
    ...updatedTransaction,
    type: data.type || updatedTransaction.type,
    amount: data.amount !== undefined ? parseFloat(data.amount) : updatedTransaction.amount,
    remark: data.remark !== undefined ? data.remark : updatedTransaction.remark,
    timestamp: data.timestamp || updatedTransaction.timestamp,
    updated_at: Math.floor(Date.now() / 1000)
  };
  
  TRANSACTIONS[index] = updatedTransaction;
  return updatedTransaction;
}

// 删除交易记录
export function deleteTransaction(transactionId) {
  const index = TRANSACTIONS.findIndex(t => t.transaction_id === transactionId);
  
  if (index === -1) {
    throw new Error('交易记录不存在');
  }
  
  TRANSACTIONS.splice(index, 1);
  return { success: true };
}

// 获取统计数据
export function getTransactionStats(params = {}) {
  let transactions = [...TRANSACTIONS];
  
  // 按账本筛选
  if (params.book_id) {
    transactions = transactions.filter(t => t.book_id === params.book_id);
  }
  
  // 按日期范围筛选
  if (params.start_date) {
    transactions = transactions.filter(t => t.timestamp >= params.start_date);
  }
  
  if (params.end_date) {
    transactions = transactions.filter(t => t.timestamp <= params.end_date);
  }
  
  // 计算总收入和总支出
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // 按标签分组统计
  const tagStats = {};
  transactions.forEach(t => {
    if (!tagStats[t.tag_id]) {
      tagStats[t.tag_id] = {
        tag_id: t.tag_id,
        tag_name: t.tag_name,
        tag_color: t.tag_color,
        tag_icon: t.tag_icon,
        count: 0,
        amount: 0
      };
    }
    
    tagStats[t.tag_id].count++;
    tagStats[t.tag_id].amount += t.amount;
  });
  
  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    balance: totalIncome - totalExpense,
    tag_stats: Object.values(tagStats)
  };
}
