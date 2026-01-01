<template>
  <view class="page-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <button class="avatar-section" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image :src="userInfo.avatar || '/static/images/default-avatar.png'" class="avatar" mode="aspectFill"></image>
        <view class="edit-icon">
          <uni-icons type="camera" size="16" color="#FFFFFF"></uni-icons>
        </view>
      </button>
      <view class="user-info">
        <view class="nickname-row">
          <input 
            type="nickname" 
            v-model="userInfo.nickname" 
            class="nickname-input" 
            placeholder="请输入昵称"
            @blur="updateNicknameOnBlur"
          />
          <view class="edit-btn">
            <uni-icons type="compose" size="16" color="#999"></uni-icons>
          </view>
        </view>
        <view class="uid-row">
          <text class="uid-label">UID:</text>
          <text class="uid-value">{{ userInfo.uid || '未登录' }}</text>
          <view class="copy-btn" @click="copyUid">
            <uni-icons type="paperclip" size="16" color="#999"></uni-icons>
            <text class="copy-text">复制</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="navigateTo('/pages/account-books/index')">
        <view class="menu-icon">
          <uni-icons type="list" size="24" color="#FF9A5A"></uni-icons>
        </view>
        <view class="menu-content">
          <text class="menu-title">账本管理</text>
          <text class="menu-desc">创建和管理账本，邀请成员共同记账</text>
        </view>
        <uni-icons type="right" size="16" color="#CCCCCC"></uni-icons>
      </view>

      <view class="menu-item" @click="navigateTo('/pages/budget/index')">
        <view class="menu-icon">
          <uni-icons type="wallet" size="24" color="#FF9A5A"></uni-icons>
        </view>
        <view class="menu-content">
          <text class="menu-title">预算设置</text>
          <text class="menu-desc">设置每月家庭预算总限额</text>
        </view>
        <uni-icons type="right" size="16" color="#CCCCCC"></uni-icons>
      </view>
      
      <view class="menu-item" @click="navigateTo('/pages/festivals/index')">
        <view class="menu-icon">
          <uni-icons type="calendar" size="24" color="#FF9A5A"></uni-icons>
        </view>
        <view class="menu-content">
          <text class="menu-title">节日设置</text>
          <text class="menu-desc">设置首页倒计时显示的节日</text>
        </view>
        <uni-icons type="right" size="16" color="#CCCCCC"></uni-icons>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-button" @click="logout">
        <uni-icons type="logout" size="20" color="#FFFFFF"></uni-icons>
        <text>退出登录</text>
      </button>
    </view>
  </view>
</template>

<script>
import { getUserInfoApi, updateUserInfoApi, uploadFileApi } from '@/api/index.js';
import { checkLoginStatus, logout } from '@/utils/auth.js';

export default {
  data() {
    return {
      userInfo: {
        uid: '',
        nickname: '',
        avatar: '',
        phone: ''
      },
      isUpdatingNickname: false
    };
  },
  
  onShow() {
    // 检查登录状态
    if (!checkLoginStatus('/pages/profile/index')) {
      return;
    }
    
    this.getUserInfo();
  },
  
  methods: {
    // 获取用户信息
    async getUserInfo() {
      try {
        const data = await getUserInfoApi();
        if (data) {
          this.userInfo = data;
        }
      } catch (error) {
        console.error('获取用户信息失败', error);
      }
    },
    
    // 选择微信头像
    async onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      
      if (!avatarUrl) {
        return;
      }
      
      try {
        uni.showLoading({ title: '更新中...' });
        
        // 直接使用微信返回的头像URL更新用户信息
        await updateUserInfoApi({
          avatar: avatarUrl
        });
        
        this.userInfo.avatar = avatarUrl;
        
        uni.hideLoading();
        uni.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: '头像更新失败',
          icon: 'none'
        });
        console.error('头像更新失败', error);
      }
    },
    
    // 昵称失去焦点时更新
    async updateNicknameOnBlur() {
      const nickname = this.userInfo.nickname ? this.userInfo.nickname.trim() : '';
      
      if (!nickname) {
        uni.showToast({
          title: '昵称不能为空',
          icon: 'none'
        });
        // 恢复原来的昵称
        await this.getUserInfo();
        return;
      }
      
      try {
        uni.showLoading({ title: '更新中...' });
        
        await updateUserInfoApi({
          nickname: nickname
        });
        
        this.userInfo.nickname = nickname;
        
        uni.hideLoading();
        uni.showToast({
          title: '昵称更新成功',
          icon: 'success'
        });
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: '昵称更新失败',
          icon: 'none'
        });
        console.error('昵称更新失败', error);
        // 恢复原来的昵称
        await this.getUserInfo();
      }
    },
    
    // 复制UID
    copyUid() {
      if (!this.userInfo.uid) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      uni.setClipboardData({
        data: this.userInfo.uid,
        success: () => {
          uni.showToast({
            title: 'UID已复制',
            icon: 'success'
          });
        }
      });
    },
    
    // 页面导航
    navigateTo(url) {
      uni.navigateTo({ url });
    },

    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            logout();
          }
        }
      });
    }
  },
  
  // 分享到好友
  onShareAppMessage() {
    return {
      title: '有人拍了拍你：发现一个超好用的记账小程序，一起来用吧！',
      path: '/pages/home/index',
      imageUrl: '/static/images/share-cover.png'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '有人拍了拍你：时光小账本，记录美好生活',
      query: '',
      imageUrl: '/static/images/share-cover.png'
    };
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: $color-bg-secondary;
  padding-bottom: $spacing-lg;
}

.user-card {
  background: linear-gradient(to right, $color-primary, $color-primary-light);
  padding: $spacing-lg 30rpx;
  display: flex;
  align-items: center;
  color: $color-text-inverse;
  position: relative;
  box-shadow: $shadow-normal;
}

.avatar-section {
  position: relative;
  margin-right: 30rpx;
  padding: 0;
  background: transparent;
  border: none;
  
  &::after {
    border: none;
  }
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid $color-text-inverse;
}

.edit-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
}

.nickname-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.nickname {
  font-size: $font-size-h3;
  color: $color-text-inverse;
  font-weight: $font-weight-bold;
  margin-right: $spacing-xs;
}

.nickname-input {
  font-size: $font-size-h3;
  color: $color-text-inverse;
  font-weight: $font-weight-bold;
  margin-right: $spacing-xs;
  background: transparent;
  border: none;
  padding: 0;
  max-width: 400rpx;
  flex: 1;
}

.edit-btn {
  background-color: rgba(255, 255, 255, 0.3);
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uid-row {
  display: flex;
  align-items: center;
  font-size: $font-size-small;
}

.uid-label {
  opacity: 0.8;
  margin-right: 10rpx;
}

.uid-value {
  opacity: 0.8;
  margin-right: 20rpx;
}

.copy-btn {
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.copy-text {
  font-size: $font-size-xs;
  margin-left: 4rpx;
}

.menu-section {
  margin-top: 20rpx;
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  overflow: hidden;
  margin: 20rpx;
}

.menu-item {
  display: flex;
  padding: 30rpx 20rpx;
  align-items: center;
  border-bottom: 1px solid $color-bg-tertiary;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  margin-right: 20rpx;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 30rpx;
  color: $color-text-primary;
  margin-bottom: 4rpx;
}

.menu-desc {
  font-size: $font-size-xs;
  color: $color-text-tertiary;
  padding-left: 16rpx;
}

.logout-section {
  padding: 60rpx 20rpx;
  display: flex;
  justify-content: center;
}

.logout-button {
  background: linear-gradient(135deg, $color-error, $color-primary);
  color: $color-text-inverse;
  border-radius: $border-radius-full;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  font-weight: $font-weight-semibold;
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.25);
  border: none;
  transition: all 0.3s ease;
  letter-spacing: 2rpx;
}

.logout-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.15);
}

</style>
