<template>
  <view class="login-container">
    <view class="background-decoration">
      <view class="decoration-circle decoration-1"></view>
      <view class="decoration-circle decoration-2"></view>
      <view class="decoration-circle decoration-3"></view>
    </view>
    
    <view class="content-wrapper">
      <view class="logo-section">
        <view class="brand-row">
          <view class="logo-wrapper">
            <image src="/static/images/app-logo.png" mode="aspectFit" class="app-logo"></image>
          </view>
          <view class="brand-text-group">
            <text class="app-name">时光账记</text>
            <text class="app-slogan">每一笔账单，都是生活的旁白</text>
          </view>
        </view>
      </view>
      
      <view class="welcome-section">
        <view class="welcome-header">
          <text class="welcome-title">欢迎回来！</text>
          <view class="welcome-line"></view>
        </view>
        <text class="welcome-desc">微信授权登录后，即可使用全部功能</text>
      </view>
      
      <view class="login-action">
        <button 
          class="wx-login-btn" 
          @tap="handleWxLogin"
        >
          <view class="btn-inner">
            <uni-icons type="weixin" size="22" color="#FFFFFF"></uni-icons>
            <text>微信一键登录</text>
          </view>
        </button>
        
        <button 
          class="demo-mode-btn" 
          @tap="handleDemoMode"
        >
          <view class="btn-inner">
            <text>体验模式</text>
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
          <text class="privacy-tip">
            登录即表示同意
            <text class="privacy-link" @tap="goToUserAgreement">《用户协议》</text>
            和
            <text class="privacy-link" @tap="goToPrivacyPolicy">《隐私政策》</text>
          </text>
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
      isLoading: false,
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
      const userInfo = uni.getStorageSync('userInfo');
      if (token && userInfo) {
        // 已登录，跳转到重定向页面或首页
        this.navigateAfterLogin();
      }
    },
    
    // 处理微信登录
    async handleWxLogin() {
      // 直接登录，不在登录时获取用户信息
      // 用户可以在登录后在个人中心页面主动更新头像和昵称
      await this.handleLogin();
    },
    
    // 处理登录
    async handleLogin() {
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
            // 保存token
            uni.setStorageSync('token', result.token);
            
            // 保存用户信息
            uni.setStorageSync('userInfo', {
              uid: result.user_id || result.uid,
              user_id: result.user_id || result.uid,
              nickname: result.nickname || '',
              avatar: result.avatar || '',
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
          title: error?.msg || error?.data?.msg || error?.message || '登录失败，请重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 登录后导航
    navigateAfterLogin() {
      if (this.redirectUrl) {
        // 判断是否为tabbar页面
        const tabbarPages = [
          '/pages/home/index',
          '/pages/record/index',
          '/pages/profile/index'
        ];
        
        const isTabbarPage = tabbarPages.some(page => this.redirectUrl.includes(page));
        
        if (isTabbarPage) {
          // tabbar页面使用switchTab
          uni.switchTab({
            url: this.redirectUrl.split('?')[0] // 移除query参数
          });
        } else {
          // 非tabbar页面使用redirectTo
          uni.redirectTo({
            url: this.redirectUrl
          });
        }
      } else {
        // 跳转到首页
        uni.switchTab({
          url: '/pages/home/index'
        });
      }
    },
    
    // 体验模式
    handleDemoMode() {
      // TODO: 实现体验模式逻辑
      // 1. 设置 localStorage 标记为 demo 模式
      // 2. 加载 mock 数据
      // 3. 跳转到首页
      uni.showToast({
        title: '进入体验模式',
        icon: 'success',
        duration: 1500
      });
      // 延迟跳转
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/home/index'
        });
      }, 1500);
    },
    
    // 跳转到用户协议
    goToUserAgreement() {
      uni.navigateTo({
        url: '/pages/user-agreement/index'
      });
    },
    
    // 跳转到隐私政策
    goToPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/privacy-policy/index'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

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
  height: 100vh;
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
  height: 100%;
  padding: calc(120rpx + env(safe-area-inset-top)) 40rpx calc(20rpx + env(safe-area-inset-bottom));
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 60rpx;
  margin-bottom: 40rpx;
  animation: fadeIn 0.8s ease-out both;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  width: 100%;
}

.brand-text-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.logo-wrapper {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  box-shadow: 0 12rpx 32rpx rgba(255, 154, 90, 0.25);
  animation: float 3s ease-in-out infinite;
  flex-shrink: 0;
}

.app-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  object-fit: cover;
}

.app-name {
  font-size: $font-size-display;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin-top: 0;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
  line-height: 1.2;
}

.app-slogan {
  font-size: $font-size-body;
  color: $color-text-secondary;
  font-weight: $font-weight-normal;
  letter-spacing: 0.5rpx;
  line-height: 1.4;
}

.welcome-section {
  text-align: center;
  flex: 0.8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 100rpx;
  margin: 0;
  animation: slideUp 0.8s ease-out 0.2s both;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16rpx;
}

.welcome-title {
  font-size: $font-size-display;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin-bottom: 12rpx;
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
  font-size: $font-size-body;
  color: $color-text-secondary;
  font-weight: $font-weight-normal;
  line-height: 1.6;
}

.login-action {
  margin-top: 0;
  padding: 80rpx 0 0 0;
  animation: slideUp 0.8s ease-out 0.4s both;
}

.wx-login-btn {
  @extend .btn-primary;
  box-shadow: 0 12rpx 28rpx rgba(255, 154, 90, 0.35);
  letter-spacing: 0.5rpx;
}

.wx-login-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 6rpx 16rpx rgba(255, 154, 90, 0.25);
}

.demo-mode-btn {
  background: transparent;
  color: $color-primary;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $color-primary;
  margin-top: 20rpx;
  transition: all 0.3s ease;
  letter-spacing: 0.5rpx;
}

.demo-mode-btn:active {
  background: $color-primary-bg;
  transform: translateY(2rpx);
}

.btn-inner {
  display: flex;
  align-items: center;
  gap: 12rpx;
}


.features-list {
  display: flex;
  justify-content: space-around;
  margin-top: 32rpx;
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
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text-inverse;
  font-weight: $font-weight-bold;
  font-size: $font-size-h4;
}

.feature-text {
  font-size: $font-size-small;
  color: $color-text-primary;
  font-weight: $font-weight-medium;
}

.privacy-container {
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
}

.privacy-tip {
  font-size: 22rpx;
  color: #BDC3C7;
  text-align: center;
  line-height: 1.5;
  font-weight: 400;
}

.privacy-link {
  color: #FF9A5A;
  font-weight: 600;
  padding: 0 4rpx;
}
</style>
