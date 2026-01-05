// 标签数据
const SYSTEM_TAGS = [
  {
    tag_id: 1,
    user_id: 0, // 系统标签，user_id为0
    name: '买菜',
    color: '#4CAF50', // 绿色
    icon: 'shopping-cart',
    is_system: 1, // 1-是 2-否
    type: 'expense',
    sort_num: 1
  },
  {
    tag_id: 2,
    user_id: 0,
    name: '房贷',
    color: '#2196F3', // 蓝色
    icon: 'home',
    is_system: 1,
    type: 'expense',
    sort_num: 2
  },
  {
    tag_id: 3,
    user_id: 0,
    name: '孩子',
    color: '#FF9800', // 橙色
    icon: 'child',
    is_system: 1,
    type: 'expense',
    sort_num: 3
  },
  {
    tag_id: 4,
    user_id: 0,
    name: '餐饮',
    color: '#F44336', // 红色
    icon: 'food',
    is_system: 1,
    type: 'expense',
    sort_num: 4
  },
  {
    tag_id: 5,
    user_id: 0,
    name: '交通',
    color: '#9C27B0', // 紫色
    icon: 'car',
    is_system: 1,
    type: 'expense',
    sort_num: 5
  },
  {
    tag_id: 6,
    user_id: 0,
    name: '其他',
    color: '#607D8B', // 灰蓝色
    icon: 'more',
    is_system: 1,
    type: 'expense',
    sort_num: 6
  },
  {
    tag_id: 7,
    user_id: 0,
    name: '工资',
    color: '#4CAF50', // 绿色
    icon: 'wallet',
    is_system: 1,
    type: 'income',
    sort_num: 7
  },
  {
    tag_id: 8,
    user_id: 0,
    name: '奖金',
    color: '#FF9800', // 橙色
    icon: 'gift',
    is_system: 1,
    type: 'income',
    sort_num: 8
  },
  {
    tag_id: 9,
    user_id: 0,
    name: '投资',
    color: '#2196F3', // 蓝色
    icon: 'chart',
    is_system: 1,
    type: 'income',
    sort_num: 9
  },
  {
    tag_id: 10,
    user_id: 0,
    name: '其他收入',
    color: '#607D8B', // 灰蓝色
    icon: 'more',
    is_system: 1,
    type: 'income',
    sort_num: 10
  }
];

// 用户自定义标签
let USER_TAGS = [
  {
    tag_id: 101,
    name: '健身',
    color: '#E91E63', // 粉色
    icon: 'fitness',
    is_system: false,
    type: 'expense'
  },
  {
    tag_id: 102,
    name: '旅游',
    color: '#00BCD4', // 青色
    icon: 'plane',
    is_system: false,
    type: 'expense'
  },
  {
    tag_id: 103,
    name: '兼职',
    color: '#8BC34A', // 浅绿色
    icon: 'work',
    is_system: false,
    type: 'income'
  }
];

// 获取所有标签
export function getTags() {
  return [...SYSTEM_TAGS, ...USER_TAGS];
}

// 获取系统标签
export function getSystemTags() {
  return SYSTEM_TAGS;
}

// 获取用户自定义标签
export function getUserTags() {
  return USER_TAGS;
}

// 根据类型获取标签
export function getTagsByType(type) {
  return getTags().filter(tag => tag.type === type);
}

// 添加自定义标签
export function addTag(tagData) {
  const newTag = {
    tag_id: Math.max(...USER_TAGS.map(tag => tag.tag_id), 100) + 1,
    name: tagData.name,
    color: tagData.color,
    icon: tagData.icon || 'tag',
    is_system: false,
    type: tagData.type || 'expense'
  };
  
  USER_TAGS.push(newTag);
  return newTag;
}

// 更新自定义标签
export function updateTag(tagData) {
  const index = USER_TAGS.findIndex(tag => tag.tag_id === tagData.tag_id);
  if (index === -1) {
    throw new Error('标签不存在');
  }
  
  if (USER_TAGS[index].is_system) {
    throw new Error('系统标签不可修改');
  }
  
  USER_TAGS[index] = {
    ...USER_TAGS[index],
    name: tagData.name || USER_TAGS[index].name,
    color: tagData.color || USER_TAGS[index].color,
    icon: tagData.icon || USER_TAGS[index].icon
  };
  
  return USER_TAGS[index];
}

// 删除自定义标签
export function deleteTag(tagId) {
  const index = USER_TAGS.findIndex(tag => tag.tag_id === tagId);
  if (index === -1) {
    throw new Error('标签不存在');
  }
  
  if (USER_TAGS[index].is_system) {
    throw new Error('系统标签不可删除');
  }
  
  USER_TAGS.splice(index, 1);
  return { success: true };
}
