<template>
  <view class="login-container">
    <view class="logo-section">
      <image src="/static/images/app-logo.png" mode="aspectFit" class="app-logo"></image>
      <text class="app-name">时光小账本</text>
      <text class="app-slogan">记录每一笔，温暖每一天</text>
    </view>
    
    <view class="welcome-section">
      <text class="welcome-title">欢迎使用</text>
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
      
      <text class="privacy-tip">登录即表示同意《用户协议》和《隐私政策》</text>
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
.login-container {
  min-height: 100vh;
  background: $background-color;
  display: flex;
  flex-direction: column;
  padding: 60rpx 40rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100rpx;
}

.app-logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: $text-secondary;
}

.welcome-section {
  text-align: center;
  margin: 120rpx 0 60rpx;
}

.welcome-title {
  font-size: 48rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.welcome-desc {
  font-size: 30rpx;
  color: $text-secondary;
}

.login-action {
  margin-top: auto;
  padding: 40rpx 0;
}

.wx-login-btn {
  background: linear-gradient(to right, #FF9A5A, #FFD166);
  color: #FFFFFF;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 8rpx 16rpx rgba(255, 154, 90, 0.3);
}

.btn-inner {
  display: flex;
  align-items: center;
}

.wechat-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
}

.privacy-tip {
  font-size: 24rpx;
  color: $text-tertiary;
  text-align: center;
  margin-top: 30rpx;
}
</style>
