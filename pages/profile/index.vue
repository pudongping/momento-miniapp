<template>
  <view class="page-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-section" @click="chooseAvatar">
        <image :src="userInfo.avatar || '/static/images/default-avatar.png'" class="avatar" mode="aspectFill"></image>
        <view class="edit-icon">
          <uni-icons type="camera" size="16" color="#FFFFFF"></uni-icons>
        </view>
      </view>
      <view class="user-info">
        <view class="nickname-row">
          <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
          <view class="edit-btn" @click="showEditNickname">
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

    <!-- 修改昵称弹窗 -->
    <view v-if="showNicknameModal" class="modal-mask" @click="hideEditNickname">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">修改昵称</text>
        </view>
        <view class="modal-body">
          <input 
            type="text" 
            v-model="newNickname" 
            class="nickname-input"
            placeholder="请输入新昵称"
            maxlength="10"
          />
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="hideEditNickname">取消</button>
          <button class="confirm-btn" :loading="isUpdatingNickname" :disabled="isUpdatingNickname" @click="updateNickname">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfoApi, updateUserInfoApi, uploadFileApi } from '@/api/index.js';

export default {
  data() {
    return {
      userInfo: {
        uid: '',
        nickname: '',
        avatar: '',
        phone: ''
      },
      showNicknameModal: false,
      newNickname: '',
      isUpdatingNickname: false
    };
  },
  
  onShow() {
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
    
    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          // 显示上传中
          uni.showLoading({
            title: '上传中...'
          });
          
          try {
            // 先调用上传文件API
            const uploadResult = await uploadFileApi(tempFilePath, 'image', 'user_avatar');
            
            if (uploadResult && uploadResult.absolute_url) {
              // 再调用更新用户信息API
              await this.updateUserAvatar(uploadResult.absolute_url);
              
              uni.hideLoading();
              uni.showToast({
                title: '头像更新成功',
                icon: 'success'
              });
            }
          } catch (error) {
            uni.hideLoading();
            uni.showToast({
              title: '头像上传失败',
              icon: 'none'
            });
            console.error('头像上传失败', error);
          }
        }
      });
    },
    
    // 更新用户头像
    async updateUserAvatar(avatarUrl) {
      try {
        await updateUserInfoApi({
          avatar: avatarUrl
        });
        
        this.userInfo.avatar = avatarUrl;
      } catch (error) {
        throw error;
      }
    },
    
    // 显示修改昵称弹窗
    showEditNickname() {
      this.newNickname = this.userInfo.nickname;
      this.showNicknameModal = true;
    },
    
    // 隐藏修改昵称弹窗
    hideEditNickname() {
      this.showNicknameModal = false;
      this.newNickname = '';
    },
    
    // 更新昵称
    async updateNickname() {
      if (this.isUpdatingNickname) return;
      
      if (!this.newNickname.trim()) {
        uni.showToast({
          title: '昵称不能为空',
          icon: 'none'
        });
        return;
      }
      
      try {
        this.isUpdatingNickname = true;
        await updateUserInfoApi({
          nickname: this.newNickname.trim()
        });
        
        this.userInfo.nickname = this.newNickname.trim();
        this.hideEditNickname();
        
        uni.showToast({
          title: '昵称更新成功',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: '昵称更新失败',
          icon: 'none'
        });
        console.error('昵称更新失败', error);
      } finally {
        this.isUpdatingNickname = false;
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
        title: '退出登录',
        content: '确定要退出登录吗？\n\n退出后需要重新登录才能使用应用',
        cancelText: '取消',
        confirmText: '退出',
        success: (res) => {
          if (!res.confirm) return;

          uni.showLoading({
            title: '退出中...',
            mask: true
          });

          setTimeout(() => {
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');

            uni.hideLoading();
            uni.showToast({
              title: '已退出登录',
              icon: 'success',
              duration: 1500
            });

            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/index'
              });
            }, 1500);
          }, 500);
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
  font-size: $font-size-h2;
  font-weight: $font-weight-semibold;
  margin-right: 10rpx;
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

/* 修改昵称弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  width: 100%;
  background: $color-bg-primary;
  border-radius: $border-radius-lg $border-radius-lg 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  padding: 30rpx;
  text-align: center;
  border-bottom: 1px solid $color-bg-tertiary;
}

.modal-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.modal-body {
  padding: 30rpx;
}

.nickname-input {
  border: 1px solid $color-border-normal;
  height: 80rpx;
  border-radius: $border-radius-sm;
  padding: 0 20rpx;
  font-size: $font-size-body;
}

.modal-footer {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: $border-radius-full;
  font-size: $font-size-body;
  border: none;
  font-weight: $font-weight-semibold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: $color-bg-tertiary;
  color: $color-text-secondary;
  box-shadow: $shadow-light;
}

.cancel-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.03);
}

.confirm-btn {
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

.confirm-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(255, 154, 90, 0.1);
}
</style>
