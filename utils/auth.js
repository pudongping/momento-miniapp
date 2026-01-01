/**
 * 认证相关工具函数
 */

/**
 * 检查token是否存在
 * @returns {boolean}
 */
export function checkToken() {
  const token = uni.getStorageSync('token');
  return !!token;
}

/**
 * 清除认证信息
 */
export function clearAuth() {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
}

/**
 * 检查登录状态，如果未登录则跳转到登录页
 * @param {string} redirectUrl 登录后要跳转的页面
 * @returns {boolean} 是否已登录
 */
export function checkLoginStatus(redirectUrl = '') {
  const hasToken = checkToken();
  
  if (!hasToken) {
    // 清除所有认证信息
    clearAuth();
    
    // 跳转到登录页
    const url = redirectUrl ? `/pages/login/index?redirect=${encodeURIComponent(redirectUrl)}` : '/pages/login/index';
    uni.reLaunch({
      url: url
    });
    
    return false;
  }
  
  return true;
}

/**
 * 退出登录
 */
export function logout() {
  clearAuth();
  uni.reLaunch({
    url: '/pages/login/index'
  });
}
