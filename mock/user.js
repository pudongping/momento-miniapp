/**
 * 用户相关的mock数据
 * 注意：所有时间戳均为秒级时间戳，UID均为字符串格式的雪花算法ID
 */

import { generateSnowflakeId } from '../utils/snowflake.js';

// 生成固定的user_id，模拟数据库中已存在的用户
const MOCK_USERS = [
  {
    user_id: 123456789012345678, // BIGINT类型的雪花算法ID
    openid: 'oXXXXXXXXXXXXXXXXXXX',
    unionid: 'oXXXXXXXXXXXXXXXXXXX',
    nickname: '小时光',
    avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
    phone: '13812345678',
    is_disable: 1, // 1-启用 2-禁用
    created_at: Math.floor(Date.now() / 1000) - 86400 * 30, // 30天前注册，秒级时间戳
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 2 // 2天前更新，秒级时间戳
  },
  {
    user_id: 223456789012345678, // BIGINT类型的雪花算法ID
    openid: 'oYYYYYYYYYYYYYYYYYYY',
    unionid: 'oYYYYYYYYYYYYYYYYYYY',
    nickname: '账本达人',
    avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
    phone: '13912345678',
    is_disable: 1, // 1-启用 2-禁用
    created_at: Math.floor(Date.now() / 1000) - 86400 * 60, // 60天前注册，秒级时间戳
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 5 // 5天前更新，秒级时间戳
  }
];

/**
 * 根据微信登录code获取用户信息
 * @param {String} code 微信登录返回的code
 * @returns {Object} 用户信息和token（注意：user_id是整数类型，前端需要保存为uid字段）
 */
export function wxLogin(code) {
  // 模拟登录逻辑，实际项目中会发送code到服务器换取openid和session_key
  // 这里直接返回mock数据
  
  // 检查code是否为测试码
  if (code === 'test_existing_user') {
    // 返回已存在的用户
    return {
      ...MOCK_USERS[0],
      token: `mock_token_${Math.random().toString(36).substr(2)}`
    };
  }
  
  // 生成一个新用户 - 使用雪花算法生成user_id
  const userId = generateSnowflakeId();
  const now = Math.floor(Date.now() / 1000); // 秒级时间戳
  
  // 生成随机头像网址
  const randomAvatar = `https://thirdwx.qlogo.cn/mmopen/vi_32/${Math.random().toString(36).substr(2)}/${Math.floor(Math.random() * 999)}`;
  
  // 新用户信息
  return {
    user_id: userId, // BIGINT类型的雪花算法ID
    openid: `openid_${userId}`,
    unionid: `unionid_${userId}`,
    nickname: `用户${String(userId).substr(-4)}`, // 使用user_id后4位作为默认昵称
    avatar: randomAvatar,
    phone: '',
    is_disable: 1, // 1-启用 2-禁用
    created_at: now,
    updated_at: now,
    token: `mock_token_${Math.random().toString(36).substr(2)}`
  };
}

/**
 * 获取用户信息
 * @returns {Object} 用户信息（注意：user_id是整数类型，前端需要保存为uid字段）
 */
export function getUserInfo() {
  // 随机返回一个已存在的用户或创建一个新用户
  const useExistingUser = Math.random() > 0.3;
  
  if (useExistingUser) {
    const user = { ...MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)] };
    return user;
  } else {
    // 生成一个新用户 - 使用雪花算法生成user_id
    const userId = generateSnowflakeId();
    const now = Math.floor(Date.now() / 1000); // 秒级时间戳
    
    // 生成随机头像网址
    const randomAvatar = `https://thirdwx.qlogo.cn/mmopen/vi_32/${Math.random().toString(36).substr(2)}/${Math.floor(Math.random() * 999)}`;
    
    // 新用户信息
    return {
      user_id: userId, // BIGINT类型的雪花算法ID
      openid: `openid_${userId}`,
      unionid: `unionid_${userId}`,
      nickname: `用户${String(userId).substr(-4)}`, // 使用user_id后4位作为默认昵称
      avatar: randomAvatar,
      phone: '',
      is_disable: 1, // 1-启用 2-禁用
      created_at: now,
      updated_at: now
    };
  }
}

/**
 * 更新用户信息
 * @param {Object} data 要更新的用户信息
 * @returns {Object} 更新后的用户信息（注意：user_id是整数类型，前端需要保存为uid字段）
 */
export function updateUserInfo(data) {
  // 模拟更新用户信息
  // 实际项目中会发送请求到服务器更新数据库
  
  // 获取随机一个现有用户作为基础
  const user = { ...MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)] };
  
  // 更新用户信息
  Object.assign(user, data);
  
  // 更新时间戳
  user.updated_at = Math.floor(Date.now() / 1000);
  
  return user;
}

/**
 * 绑定手机号
 * @param {Object} data 包含手机号和验证码的数据
 * @returns {Object} 更新后的用户信息
 */
export function bindPhone(data) {
  // 模拟绑定手机号
  // 实际项目中会发送请求到服务器验证验证码并绑定手机号
  
  // 获取随机一个现有用户作为基础
  const user = { ...MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)] };
  
  // 更新手机号
  user.phone = data.phone;
  
  // 更新时间戳
  user.updated_at = Math.floor(Date.now() / 1000);
  
  return user;
}

/**
 * 获取用户设置（包含背景图片和预算）
 * @returns {Object} 用户设置信息
 */
export function getUserSettings() {
  // 模拟获取用户设置
  const hasCustomBackground = Math.random() > 0.7;
  
  return {
    background_url: hasCustomBackground ? 'https://cdn.example.com/uploads/background/sample_bg.jpg' : null,
    budget: 10000,
    updated_at: Math.floor(Date.now() / 1000)
  };
}

/**
 * 更新用户设置（可以更新背景图片、预算或两者）
 * @param {Object} data 包含要更新的设置
 * @returns {Object} 更新结果
 */
export function updateUserSettings(data) {
  // 模拟更新用户设置
  return {
    background_url: data.background_url !== undefined ? data.background_url : null,
    budget: data.budget !== undefined ? data.budget : 10000,
    updated_at: Math.floor(Date.now() / 1000)
  };
}
