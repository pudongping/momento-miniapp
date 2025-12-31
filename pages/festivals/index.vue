<template>
  <view class="page-container">
    <view class="header">
      <text class="title">节日设置</text>
      <text class="subtitle">设置首页倒计时显示的节日</text>
    </view>
    
    <!-- 节日列表 -->
    <view class="empty-tip" v-if="festivals.length === 0">
      <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
      <text class="empty-text">暂无节日，点击下方按钮添加</text>
    </view>
    
    <view class="festival-list" v-else>
      <view class="festival-item" v-for="(item, index) in festivals" :key="item.festival_id">
        <view class="festival-info">
          <view class="festival-name-row">
            <text class="festival-name">{{ item.festival_name }}</text>
            <view 
              class="visibility-tag" 
              :class="{ 'visible': item.is_show_home === 1 }"
            >
              {{ item.is_show_home === 1 ? '显示' : '隐藏' }}
            </view>
          </view>
          <text class="festival-date">{{ formatDate(item.festival_date) }}</text>
          <text class="countdown">{{ getCountdown(item.festival_date) }}</text>
        </view>
        <view class="action-buttons">
          <view class="action-btn" @click="toggleVisibility(item)">
            <uni-icons :type="item.is_show_home === 1 ? 'eye' : 'eye-slash'" size="20" color="#999"></uni-icons>
          </view>
          <view class="action-btn" @click="editFestival(item)">
            <uni-icons type="compose" size="20" color="#999"></uni-icons>
          </view>
          <view class="action-btn" @click="confirmDelete(item)">
            <uni-icons type="trash" size="20" color="#999"></uni-icons>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加按钮 -->
    <view class="add-btn" @click="showAddModal">
      <uni-icons type="plusempty" size="24" color="#FFFFFF"></uni-icons>
      <text class="add-text">添加节日</text>
    </view>
    
    <!-- 删除确认弹窗 -->
    <view v-if="showDeleteModal" class="modal-mask" @click="hideDeleteModal">
      <view class="modal-content delete-modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认删除</text>
        </view>
        <view class="modal-body">
          <text class="delete-message">确定要删除"{{ festivalToDelete?.festival_name }}"吗？</text>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="hideDeleteModal">取消</button>
          <button class="confirm-btn delete-confirm-btn" @click="deleteFestival">确认删除</button>
        </view>
      </view>
    </view>
    
    <!-- 添加/编辑节日弹窗 -->
    <view v-if="showModal" class="modal-mask" @click="hideModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEdit ? '编辑节日' : '添加节日' }}</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">节日名称</text>
            <input 
              type="text" 
              v-model="festivalForm.festival_name" 
              class="form-input"
              placeholder="请输入节日名称"
              maxlength="20"
            />
          </view>
          <view class="form-item">
            <text class="form-label">节日日期</text>
            <picker 
              mode="date" 
              :value="festivalFormDateStr" 
              @change="onDateChange"
              class="date-picker"
            >
              <view class="picker-value">
                {{ festivalFormDateStr || '请选择日期' }}
                <uni-icons type="calendar" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>
          <view class="form-item switch-item">
            <text class="form-label">首页显示</text>
            <switch 
              :checked="festivalForm.is_show_home === 1" 
              @change="onVisibilityChange"
              color="#FF9A5A"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="hideModal">取消</button>
          <button class="confirm-btn" @click="saveFestival">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getFestivalsApi, 
  addFestivalApi, 
  updateFestivalApi, 
  deleteFestivalApi,
  toggleFestivalVisibilityApi 
} from '@/api/index.js';

export default {
  data() {
    return {
      festivals: [],
      showModal: false,
      showDeleteModal: false,
      festivalToDelete: null,
      isEdit: false,
      festivalForm: {
        festival_id: 0,
        festival_name: '',
        festival_date: 0,
        is_show_home: 1
      },
      festivalFormDateStr: '',
      currentDate: new Date().toISOString().split('T')[0]
    };
  },
  
  onShow() {
    this.getFestivals();
  },
  
  methods: {
    // 获取节日列表
    async getFestivals() {
      try {
        const data = await getFestivalsApi();
        if (data) {
          this.festivals = data;
        }
      } catch (error) {
        console.error('获取节日列表失败', error);
        uni.showToast({
          title: '获取节日列表失败',
          icon: 'none'
        });
      }
    },
    
    // 格式化日期
    formatDate(ymdInt) {
      if (!ymdInt) return '';
      const s = String(ymdInt);
      if (s.length !== 8) return '';
      const year = s.slice(0, 4);
      const month = s.slice(4, 6);
      const day = s.slice(6, 8);
      return `${year}年${month}月${day}日`;
    },
    
    // 计算倒计时
    getCountdown(ymdInt) {
      if (!ymdInt) return '';
      const targetDate = this.ymdIntToDate(ymdInt);
      const currentDate = new Date();
      
      // 清除时间部分，只比较日期
      currentDate.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);
      
      // 计算剩余天数
      const diffTime = targetDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        // 如果日期已过，计算明年的同一天
        const nextYear = this.ymdIntToDate(ymdInt);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const nextDiffTime = nextYear.getTime() - currentDate.getTime();
        const nextDiffDays = Math.ceil(nextDiffTime / (1000 * 60 * 60 * 24));
        return `还有 ${nextDiffDays} 天`;
      } else if (diffDays === 0) {
        return '就是今天';
      } else {
        return `还有 ${diffDays} 天`;
      }
    },
    
    // 显示添加弹窗
    showAddModal() {
      this.isEdit = false;
      this.festivalForm = {
        festival_id: 0,
        festival_name: '',
        festival_date: this.ymdStrToInt(this.currentDate),
        is_show_home: 1
      };
      this.festivalFormDateStr = this.currentDate;
      this.showModal = true;
    },
    
    // 显示编辑弹窗
    editFestival(festival) {
      this.isEdit = true;
      this.festivalForm = { ...festival };
      this.festivalFormDateStr = this.ymdIntToStr(festival.festival_date);
      this.showModal = true;
    },
    
    // 隐藏弹窗
    hideModal() {
      this.showModal = false;
    },
    
    // 日期选择器变化
    onDateChange(e) {
      this.festivalFormDateStr = e.detail.value;
      this.festivalForm.festival_date = this.ymdStrToInt(e.detail.value);
    },
    
    // 可见性开关变化
    onVisibilityChange(e) {
      this.festivalForm.is_show_home = e.detail.value ? 1 : 0;
    },
    
    // 切换节日可见性
    async toggleVisibility(festival) {
      try {
        await toggleFestivalVisibilityApi({
          festival_id: festival.festival_id,
          is_show_home: festival.is_show_home === 1 ? 0 : 1
        });
        
        // 更新本地数据
        const index = this.festivals.findIndex(item => item.festival_id === festival.festival_id);
        if (index !== -1) {
          this.festivals[index].is_show_home = festival.is_show_home === 1 ? 0 : 1;
        }
        
        uni.showToast({
          title: festival.is_show_home === 1 ? '已隐藏' : '已显示',
          icon: 'success'
        });
      } catch (error) {
        console.error('切换节日可见性失败', error);
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    },
    
    // 确认删除
    confirmDelete(festival) {
      this.festivalToDelete = festival;
      this.showDeleteModal = true;
    },
    
    // 隐藏删除弹窗
    hideDeleteModal() {
      this.showDeleteModal = false;
      this.festivalToDelete = null;
    },
    
    // 删除节日
    async deleteFestival() {
      if (!this.festivalToDelete) return;
      
      try {
        await deleteFestivalApi(this.festivalToDelete.festival_id);
        
        // 更新本地数据
        this.festivals = this.festivals.filter(item => item.festival_id !== this.festivalToDelete.festival_id);
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        // 隐藏删除弹窗
        this.hideDeleteModal();
      } catch (error) {
        console.error('删除节日失败', error);
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    },
    
    // 保存节日
    async saveFestival() {
      // 验证表单
      if (!this.festivalForm.festival_name.trim()) {
        uni.showToast({
          title: '请输入节日名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.festivalForm.festival_date) {
        uni.showToast({
          title: '请选择节日日期',
          icon: 'none'
        });
        return;
      }
      
      try {
        if (this.isEdit) {
          // 编辑节日
          await updateFestivalApi(this.festivalForm);
          
          // 更新本地数据
          const index = this.festivals.findIndex(item => item.festival_id === this.festivalForm.festival_id);
          if (index !== -1) {
            this.festivals[index] = { ...this.festivalForm };
          }
          
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });
        } else {
          // 添加节日
          const result = await addFestivalApi(this.festivalForm);
          
          // 添加到本地数据
          this.festivals.push({
            ...this.festivalForm,
            festival_id: result.festival_id
          });
          
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });
        }
        
        this.hideModal();
      } catch (error) {
        console.error('保存节日失败', error);
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    },

    ymdIntToStr(ymdInt) {
      if (!ymdInt) return '';
      const s = String(ymdInt);
      if (s.length !== 8) return '';
      return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    },
    ymdStrToInt(ymdStr) {
      if (!ymdStr) return 0;
      const s = String(ymdStr).replace(/-/g, '');
      if (s.length !== 8) return 0;
      return Number(s);
    },
    ymdIntToDate(ymdInt) {
      const s = String(ymdInt);
      const year = Number(s.slice(0, 4));
      const month = Number(s.slice(4, 6));
      const day = Number(s.slice(6, 8));
      return new Date(year, month - 1, day);
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: $color-bg-secondary;
  padding: 20rpx;
  padding-bottom: 140rpx;
}

.header {
  padding: 30rpx 10rpx;
}

.title {
  font-size: $font-size-h2;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: $font-size-body;
  color: $color-text-secondary;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100rpx;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: $font-size-body;
  color: $color-text-secondary;
}

.festival-list {
  margin-top: 20rpx;
}

.festival-item {
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  padding: 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: $shadow-light;
}

.festival-info {
  flex: 1;
}

.festival-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.festival-name {
  font-size: $font-size-h3;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin-right: 10rpx;
}

.visibility-tag {
  font-size: $font-size-xs;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  background: $color-bg-tertiary;
  color: $color-text-tertiary;
  
  &.visible {
    background: $color-primary-bg;
    color: $color-primary;
  }
}

.festival-date {
  font-size: $font-size-small;
  color: $color-text-secondary;
  margin-bottom: 6rpx;
}

.countdown {
  font-size: $font-size-small;
  color: $color-primary;
  font-weight: $font-weight-medium;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.action-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn {
  position: fixed;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to right, $color-primary, $color-primary-light);
  width: 90%;
  height: 90rpx;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(255, 154, 90, 0.3);
}

.add-text {
  font-size: 30rpx;
  color: $color-text-inverse;
  margin-left: 10rpx;
}

/* 弹窗样式 */
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

.form-item {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: $font-size-body;
  color: $color-text-primary;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  border: 1px solid $color-border-normal;
  height: 80rpx;
  border-radius: $border-radius-sm;
  padding: 0 20rpx;
  font-size: $font-size-body;
}

.date-picker {
  width: 100%;
}

.picker-value {
  border: 1px solid $color-border-normal;
  height: 80rpx;
  border-radius: $border-radius-sm;
  padding: 0 20rpx;
  font-size: $font-size-body;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* 删除弹窗特定样式 */
.delete-modal-content {
  width: 100%;
}

.delete-message {
  font-size: $font-size-body;
  color: $color-text-primary;
  text-align: center;
  line-height: $line-height-relaxed;
}

.delete-confirm-btn {
  background: linear-gradient(135deg, $color-error, #FF8A80);
  box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.2);
}

.delete-confirm-btn:active {
  box-shadow: 0 2rpx 6rpx rgba(255, 77, 79, 0.1);
}
</style>

