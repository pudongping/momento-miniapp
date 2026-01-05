/**
 * 节日相关的mock数据
 * 注意：所有时间戳均为秒级时间戳
 * 约定：除 uid 外，其他业务主键均为 int 自增 ID（返回给前端为 int）
 * 节日表主键字段为 festival_id
 * 节日日期字段为 YYYYMMDD 数字（例如 20240210）
 */

let _festivalAutoIncId = 3;

// 存储节日数据
let festivalsData = [
  {
    festival_id: 1,
    user_id: '123456789012345678', // 字符串类型
    festival_name: '春节',
    festival_date: 20240210,
    is_show_home: 1,
    created_at: Math.floor(Date.now() / 1000) - 86400 * 60, // 60天前创建，秒级时间戳
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 60 // 60天前更新，秒级时间戳
  },
  {
    festival_id: 2,
    user_id: '123456789012345678', // 字符串类型
    festival_name: '结婚纪念日',
    festival_date: 20240615,
    is_show_home: 1,
    created_at: Math.floor(Date.now() / 1000) - 86400 * 30, // 30天前创建，秒级时间戳
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 30 // 30天前更新，秒级时间戳
  },
  {
    festival_id: 3,
    user_id: '123456789012345678', // 字符串类型
    festival_name: '生日',
    festival_date: 20240812,
    is_show_home: 1,
    created_at: Math.floor(Date.now() / 1000) - 86400 * 15, // 15天前创建，秒级时间戳
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 15 // 15天前更新，秒级时间戳
  }
];

/**
 * 获取所有节日
 * @returns {Array} 节日列表
 */
export function getFestivals() {
  return [...festivalsData];
}

/**
 * 添加节日
 * @param {Object} festival 节日信息
 * @returns {Object} 添加后的节日信息
 */
export function addFestival(festival) {
  const now = Math.floor(Date.now() / 1000); // 秒级时间戳
  const festival_id = ++_festivalAutoIncId;
  
  // 创建新节日
  const newFestival = {
    festival_id,
    user_id: '123456789012345678', // 字符串类型
    festival_name: festival.festival_name,
    festival_date: festival.festival_date,
    is_show_home: festival.is_show_home !== undefined ? festival.is_show_home : 1,
    created_at: now,
    updated_at: now
  };
  
  // 添加到数据中
  festivalsData.push(newFestival);
  
  return { ...newFestival };
}

/**
 * 更新节日
 * @param {Object} festival 节日信息
 * @returns {Object} 更新后的节日信息
 */
export function updateFestival(festival) {
  // 查找要更新的节日
  const index = festivalsData.findIndex(item => item.festival_id === festival.festival_id);
  if (index === -1) {
    throw new Error('节日不存在');
  }
  
  // 更新节日信息
  const now = Math.floor(Date.now() / 1000); // 秒级时间戳
  festivalsData[index] = {
    ...festivalsData[index],
    festival_name: festival.festival_name,
    festival_date: festival.festival_date,
    is_show_home: festival.is_show_home !== undefined ? festival.is_show_home : festivalsData[index].is_show_home,
    updated_at: now
  };
  
  return { ...festivalsData[index] };
}

/**
 * 删除节日
 * @param {String} id 节日ID
 * @returns {Boolean} 删除结果
 */
export function deleteFestival(festival_id) {
  // 查找要删除的节日
  const index = festivalsData.findIndex(item => item.festival_id === festival_id);
  if (index === -1) {
    throw new Error('节日不存在');
  }
  
  // 删除节日
  festivalsData.splice(index, 1);
  
  return true;
}

/**
 * 切换节日显示状态
 * @param {Object} params 包含ID和显示状态
 * @returns {Object} 更新后的节日信息
 */
export function toggleFestivalVisibility({ festival_id, is_show_home }) {
  // 查找要更新的节日
  const index = festivalsData.findIndex(item => item.festival_id === festival_id);
  if (index === -1) {
    throw new Error('节日不存在');
  }
  
  // 更新显示状态
  const now = Math.floor(Date.now() / 1000); // 秒级时间戳
  festivalsData[index] = {
    ...festivalsData[index],
    is_show_home,
    updated_at: now
  };
  
  return { ...festivalsData[index] };
}
