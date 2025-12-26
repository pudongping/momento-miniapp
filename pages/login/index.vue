<template>
  <view class="login-container">
    <view class="background-decoration">
      <view class="decoration-circle decoration-1"></view>
      <view class="decoration-circle decoration-2"></view>
      <view class="decoration-circle decoration-3"></view>
    </view>
    
    <view class="content-wrapper">
      <view class="logo-section">
        <view class="logo-wrapper">
          <image src="/static/images/app-logo.png" mode="aspectFit" class="app-logo"></image>
        </view>
        <text class="app-name">时光小账本</text>
        <text class="app-slogan">每一笔账单，都是生活的旁白</text>
      </view>
      
      <view class="welcome-section">
        <view class="welcome-header">
          <text class="welcome-title">欢迎回来</text>
          <view class="welcome-line"></view>
        </view>
        <text class="welcome-desc">微信授权登录后，即可使用全部功能</text>
      </view>
      
      <view class="login-action">
        <button 
          class="wx-login-btn" 
          open-type="getUserInfo" 
          @getuserinfo="handleUserInfo"
        >
          <view class="btn-inner">
            <image src="/static/images/wechat-icon.png" mode="aspectFit" class="wechat-icon"></image>
            <text>微信一键登录</text>
          </view>
        </button>
        
        <view class="features-list">
          <view class="feature-item">
            <view class="feature-icon">✓</view>
            <text class="feature-text">快速登录</text>
          </view>
          <view class="feature-item">
            <view class="feature-icon">✓</view>
            <text class="feature-text">数据同步</text>
          </view>
          <view class="feature-item">
            <view class="feature-icon">✓</view>
            <text class="feature-text">隐私保护</text>
          </view>
        </view>
        
        <view class="privacy-container">
          <text class="privacy-tip">登录即表示同意《用户协议》和《隐私政策》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { loginApi } from '@/api/index.js';

export default {
  data() {
    return {
      loginStatus: 'pending', // pending, success, fail
      redirectUrl: '' // 登录成功后的重定向URL
    };
  },
  
  onLoad(options) {
    // 获取重定向URL，用于登录成功后跳转
    if (options.redirect) {
      this.redirectUrl = decodeURIComponent(options.redirect);
    }
    
    // 检查是否已登录
    this.checkLoginStatus();
  },
  
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('token');
      if (token) {
        // 已登录，跳转到重定向页面或首页
        this.navigateAfterLogin();
      }
    },
    
    // 处理用户信息授权
    async handleUserInfo(e) {
      console.log('用户信息授权结果:', e);
      
      if (e.detail.errMsg === 'getUserInfo:ok') {
        // 用户同意授权
        this.wxLogin(e.detail);
      } else {
        // 用户拒绝授权
        uni.showToast({
          title: '授权失败，无法使用完整功能',
          icon: 'none'
        });
      }
    },
    
    // 微信登录
    async wxLogin(userInfo) {
      try {
        uni.showLoading({
          title: '登录中...',
          mask: true
        });
        
        // 调用微信登录接口获取code
        const loginResult = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject
          });
        });
        
        if (loginResult.code) {
          // 发送code到后端换取token
          const result = await loginApi(loginResult.code);
          
          if (result && result.token) {
            // 存储登录信息
            uni.setStorageSync('token', result.token);
            uni.setStorageSync('userInfo', {
              uid: result.uid,
              nickname: userInfo.userInfo.nickName || result.nickname,
              avatar: userInfo.userInfo.avatarUrl || result.avatar,
              phone: result.phone || ''
            });
            
            this.loginStatus = 'success';
            
            // 提示登录成功
            uni.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500
            });
            
            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
              this.navigateAfterLogin();
            }, 1500);
          } else {
            throw new Error('登录失败，服务器返回数据异常');
          }
        } else {
          throw new Error('获取微信登录凭证失败');
        }
      } catch (error) {
        console.error('登录失败', error);
        this.loginStatus = 'fail';
        
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 登录后导航
    navigateAfterLogin() {
      if (this.redirectUrl) {
        // 跳转到指定页面
        uni.redirectTo({
          url: this.redirectUrl
        });
      } else {
        // 跳转到首页
        uni.switchTab({
          url: '/pages/home/index'
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0rpx);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5F7FA 0%, #E9F0F8 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: pulse 4s ease-in-out infinite;
}

.decoration-1 {
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  top: -100rpx;
  right: -100rpx;
  animation-delay: 0s;
}

.decoration-2 {
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  bottom: 100rpx;
  left: -80rpx;
  animation-delay: 1s;
}

.decoration-3 {
  width: 250rpx;
  height: 250rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  bottom: 300rpx;
  right: 50rpx;
  animation-delay: 2s;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 60rpx 40rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120rpx;
  animation: fadeIn 0.8s ease-out both;
}

.logo-wrapper {
  width: 180rpx;
  height: 180rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  border-radius: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  box-shadow: 0 12rpx 32rpx rgba(255, 154, 90, 0.25);
  animation: float 3s ease-in-out infinite;
}

.app-logo {
  width: 140rpx;
  height: 140rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #2C3E50;
  margin-top: 32rpx;
  margin-bottom: 16rpx;
  letter-spacing: 1rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: #7F8C8D;
  font-weight: 400;
  letter-spacing: 0.5rpx;
}

.welcome-section {
  text-align: center;
  margin: 100rpx 0 60rpx;
  animation: slideUp 0.8s ease-out 0.2s both;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}

.welcome-title {
  font-size: 52rpx;
  font-weight: 700;
  color: #2C3E50;
  margin-bottom: 16rpx;
  letter-spacing: 1rpx;
}

.welcome-line {
  width: 80rpx;
  height: 6rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  border-radius: 3rpx;
  margin-top: 16rpx;
}

.welcome-desc {
  font-size: 28rpx;
  color: #95A5A6;
  font-weight: 400;
  line-height: 1.6;
}

.login-action {
  margin-top: auto;
  padding: 40rpx 0 60rpx;
  animation: slideUp 0.8s ease-out 0.4s both;
}

.wx-login-btn {
  background: linear-gradient(135deg, #FF9A5A 0%, #FFD166 100%);
  color: #FFFFFF;
  height: 100rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 12rpx 28rpx rgba(255, 154, 90, 0.35);
  transition: all 0.3s ease;
  letter-spacing: 0.5rpx;
}

.wx-login-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 6rpx 16rpx rgba(255, 154, 90, 0.25);
}

.btn-inner {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.wechat-icon {
  width: 40rpx;
  height: 40rpx;
}

.features-list {
  display: flex;
  justify-content: space-around;
  margin-top: 40rpx;
  padding: 30rpx 20rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.feature-icon {
  width: 44rpx;
  height: 44rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 28rpx;
}

.feature-text {
  font-size: 24rpx;
  color: #2C3E50;
  font-weight: 500;
}

.privacy-container {
  display: flex;
  justify-content: center;
  margin-top: 32rpx;
}

.privacy-tip {
  font-size: 22rpx;
  color: #BDC3C7;
  text-align: center;
  line-height: 1.5;
  font-weight: 400;
}
</style>
