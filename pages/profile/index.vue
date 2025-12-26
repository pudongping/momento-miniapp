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

    <view class="menu-section">
      <view class="menu-item" @click="logout">
        <view class="menu-icon">
          <uni-icons type="logout" size="24" color="#FF9A5A"></uni-icons>
        </view>
        <view class="menu-content">
          <text class="menu-title">退出登录</text>
          <text class="menu-desc">清除本地登录状态并返回登录页</text>
        </view>
        <uni-icons type="right" size="16" color="#CCCCCC"></uni-icons>
      </view>
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
          <button class="confirm-btn" @click="updateNickname">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfoApi, updateUserInfoApi } from '@/api/index.js';

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
      newNickname: ''
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
          
          // 上传头像
          try {
            // 实际项目中这里应该调用上传API
            // 模拟上传成功
            setTimeout(async () => {
              // 假设这是服务器返回的头像URL
              const avatarUrl = tempFilePath;
              
              // 更新用户信息
              await this.updateUserAvatar(avatarUrl);
              
              uni.hideLoading();
            }, 1000);
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
        uni.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: '头像更新失败',
          icon: 'none'
        });
        console.error('头像更新失败', error);
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
      if (!this.newNickname.trim()) {
        uni.showToast({
          title: '昵称不能为空',
          icon: 'none'
        });
        return;
      }
      
      try {
        await updateUserInfoApi({
          nickname: this.newNickname
        });
        
        this.userInfo.nickname = this.newNickname;
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
        content: '确定要退出登录吗？',
        success: (res) => {
          if (!res.confirm) return;

          uni.removeStorageSync('token');
          uni.removeStorageSync('userInfo');

          uni.reLaunch({
            url: '/pages/login/index'
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 40rpx;
}

.user-card {
  background: linear-gradient(to right, #FF9A5A, #FFD166);
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  color: #FFFFFF;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar-section {
  position: relative;
  margin-right: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid #FFFFFF;
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
  font-size: 36rpx;
  font-weight: 600;
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
  font-size: 24rpx;
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
  font-size: 22rpx;
  margin-left: 4rpx;
}

.menu-section {
  margin-top: 20rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  overflow: hidden;
  margin: 20rpx;
}

.menu-item {
  display: flex;
  padding: 30rpx 20rpx;
  align-items: center;
  border-bottom: 1px solid #F5F5F5;
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
  color: $text-primary;
  margin-bottom: 4rpx;
}

.menu-desc {
  font-size: 24rpx;
  color: $text-secondary;
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
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 80%;
  background: #FFFFFF;
  border-radius: 12rpx;
  overflow: hidden;
}

.modal-header {
  padding: 30rpx;
  text-align: center;
  border-bottom: 1px solid #F5F5F5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.modal-body {
  padding: 30rpx;
}

.nickname-input {
  border: 1px solid #EEEEEE;
  height: 80rpx;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.modal-footer {
  display: flex;
  border-top: 1px solid #F5F5F5;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 30rpx;
  border-radius: 0;
}

.cancel-btn {
  background: #F5F5F5;
  color: $text-secondary;
}

.confirm-btn {
  background: linear-gradient(to right, #FF9A5A, #FFD166);
  color: #FFFFFF;
}
</style>
