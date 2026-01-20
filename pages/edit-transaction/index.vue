<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="navbar-container">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="custom-navbar">
        <view class="navbar-left" @click="goBack">
          <uni-icons type="left" size="20" color="#333333"></uni-icons>
          <text class="back-text">返回</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">编辑账单</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 记账内容 -->
    <view class="record-content">
      <!-- 类型切换 -->
      <view class="type-toggle">
        <view 
          class="type-option" 
          :class="{ active: transactionType === 'expense' }" 
          @click="transactionType = 'expense'"
        >
          <text>支出</text>
        </view>
        <view 
          class="type-option" 
          :class="{ active: transactionType === 'income' }" 
          @click="transactionType = 'income'"
        >
          <text>收入</text>
        </view>
      </view>
      
      <!-- 金额输入 -->
      <view class="amount-input-container">
        <text class="currency-symbol">¥</text>
        <input 
          type="digit" 
          v-model="amount" 
          class="amount-input"
          placeholder="0.00"
          maxlength="10"
          focus
        />
      </view>
      
      <!-- 标签选择 -->
      <view class="tags-section">
        <view class="tags-header">
          <text class="section-title">选择标签</text>
        </view>
        <view class="tags-grid">
          <view 
            v-for="tag in filteredTags" 
            :key="tag.tag_id"
            class="tag-item"
            :class="{ active: selectedTagId === tag.tag_id }"
            :style="{ backgroundColor: selectedTagId === tag.tag_id ? tag.color : '#F5F5F5' }"
            @click="selectTag(tag)"
          >
            <!-- FA图标或uni-icons -->
            <view v-if="tag.fa_icon" class="fa-icon" :style="{ color: selectedTagId === tag.tag_id ? '#FFFFFF' : tag.color }">
              <text class="fa" :class="tag.fa_icon"></text>
            </view>
            <uni-icons 
              v-else-if="tag.icon" 
              :type="tag.icon" 
              size="18" 
              :color="selectedTagId === tag.tag_id ? '#FFFFFF' : tag.color"
            ></uni-icons>
            
            <text :style="{ color: selectedTagId === tag.tag_id ? '#FFFFFF' : '#333333' }">
              {{ tag.name }}
            </text>
          </view>
        </view>
      </view>
      
      <!-- 备注输入 -->
      <view class="remark-section">
        <text class="section-title">备注</text>
        <input 
          type="text" 
          v-model="remark" 
          class="remark-input"
          placeholder="添加备注信息（选填）"
          maxlength="50"
        />
      </view>
      
      <!-- 创建时间选择 -->
      <view class="date-section">
        <text class="section-title">创建时间</text>
        <view class="date-picker" @click="showDatePicker">
          <text>{{ formatDate(selectedDate) }}</text>
          <uni-icons type="calendar" size="18" color="#666666"></uni-icons>
        </view>
      </view>
      
      <!-- 更新按钮 -->
      <view class="save-section">
        <button class="btn-save" @click="updateTransaction">更新</button>
      </view>
    </view>
    
    <!-- 日期选择器弹窗 -->
    <view v-if="showDatePickerModal" class="modal-mask" @click="closeDatePicker">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择创建时间</text>
          <view class="close-btn" @click="closeDatePicker">✕</view>
        </view>
        <view class="modal-body">
          <picker-view
            :indicator-style="'height: 50px;'"
            :value="datePickerValue"
            @change="onDatePickerChange"
            class="date-picker-view"
          >
            <picker-view-column>
              <view class="picker-item" v-for="(year, index) in years" :key="'year-'+index">
                {{ year }}年
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(month, index) in months" :key="'month-'+index">
                {{ month }}月
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(day, index) in days" :key="'day-'+index">
                {{ day }}日
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(hour, index) in hours" :key="'hour-'+index">
                {{ hour }}时
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(minute, index) in minutes" :key="'minute-'+index">
                {{ minute }}分
              </view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeDatePicker">取消</button>
          <button class="btn-confirm" @click="confirmDatePicker">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getTagsApi, 
  updateTransactionApi
} from '@/api/index.js';

export default {
  data() {
    return {
      // 交易相关
      transactionId: null,
      transactionType: 'expense',
      amount: '',
      remark: '',
      selectedDate: new Date(),
      selectedTagId: null,
      
      // 标签相关
      tags: [],
      
      // 日期选择器
      showDatePickerModal: false,
      years: [],
      months: [],
      days: [],
      hours: [],
      minutes: [],
      datePickerValue: [0, 0, 0, 0, 0],
      tempDatePickerValue: [0, 0, 0, 0, 0],
      
      // 状态栏高度
      statusBarHeight: 44
    };
  },

  computed: {
    filteredTags() {
      return this.tags.filter(tag => tag.type === this.transactionType);
    }
  },

  onLoad(options) {
    // 设置状态栏高度
    this.setStatusBarHeight();
    
    // 从URL参数中获取交易数据
    if (options.data) {
      try {
        const transactionData = JSON.parse(decodeURIComponent(options.data));
        this.loadTransactionData(transactionData);
      } catch (error) {
        console.error('解析交易数据失败:', error);
        this.goBack();
      }
    } else {
      console.error('未找到交易数据');
      this.goBack();
    }
  },

  async onShow() {
    await this.initTags();
    this.initDatePicker();
  },

  methods: {
    // 设置状态栏高度
    setStatusBarHeight() {
      const systemInfo = uni.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || 44;
      this.statusBarHeight = statusBarHeight;
    },

    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果无法返回，则跳转到首页
          uni.switchTab({
            url: '/pages/home/index'
          });
        }
      });
    },

    // 加载交易数据
    loadTransactionData(transaction) {
      this.transactionId = transaction.transaction_id;
      this.transactionType = transaction.type;
      this.amount = transaction.amount.toString();
      this.remark = transaction.remark || '';
      this.selectedTagId = transaction.tag_id;
      
      if (transaction.created_at) {
        this.selectedDate = new Date(transaction.created_at * 1000);
      }
    },

    // 标签相关方法
    async initTags() {
      try {
        const tags = await getTagsApi();
        if (tags && Array.isArray(tags)) {
          this.tags = tags;
        }
      } catch (error) {
        console.error('获取标签失败', error);
      }
    },
    
    selectTag(tag) {
      this.selectedTagId = tag.tag_id;
    },
    
    // 日期选择器相关方法
    initDatePicker() {
      const currentDate = this.selectedDate;
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      
      // 初始化年份列表（当前年往前5年）
      this.years = [];
      for (let i = currentYear - 5; i <= currentYear; i++) {
        this.years.push(i);
      }
      
      // 初始化月份列表
      this.months = [];
      for (let i = 1; i <= 12; i++) {
        this.months.push(i);
      }
      
      // 初始化天数列表
      this.updateDays(currentYear, currentMonth);
      
      // 初始化小时列表（0-23）
      this.hours = [];
      for (let i = 0; i <= 23; i++) {
        this.hours.push(i.toString().padStart(2, '0'));
      }
      
      // 初始化分钟列表（0-59）
      this.minutes = [];
      for (let i = 0; i <= 59; i++) {
        this.minutes.push(i.toString().padStart(2, '0'));
      }
      
      // 设置默认值
      const yearIndex = this.years.findIndex(year => year === currentYear);
      const monthIndex = currentMonth - 1;
      const dayIndex = currentDay - 1;
      const hourIndex = currentHour;
      const minuteIndex = currentMinute;
      
      this.datePickerValue = [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex];
      this.tempDatePickerValue = [...this.datePickerValue];
    },
    
    updateDays(year, month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      this.days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.days.push(i);
      }
    },
    
    showDatePicker() {
      this.tempDatePickerValue = [...this.datePickerValue];
      this.showDatePickerModal = true;
    },
    
    closeDatePicker() {
      this.showDatePickerModal = false;
    },
    
    onDatePickerChange(e) {
      const values = e.detail.value;
      this.tempDatePickerValue = values;
      
      // 当年月变化时，更新天数
      const year = this.years[values[0]];
      const month = this.months[values[1]];
      this.updateDays(year, month);
      
      // 如果当前选中的天数超过了新月份的最大天数，则重置为最后一天
      if (values[2] >= this.days.length) {
        this.tempDatePickerValue[2] = this.days.length - 1;
      }
    },
    
    confirmDatePicker() {
      this.datePickerValue = [...this.tempDatePickerValue];
      const year = this.years[this.datePickerValue[0]];
      const month = this.months[this.datePickerValue[1]];
      const day = this.days[this.datePickerValue[2]];
      const hour = parseInt(this.hours[this.datePickerValue[3]]);
      const minute = parseInt(this.minutes[this.datePickerValue[4]]);
      
      this.selectedDate = new Date(year, month - 1, day, hour, minute);
      this.closeDatePicker();
    },
    
    formatDate(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    },
    
    // 更新交易
    async updateTransaction() {
      // 验证金额
      if (!this.amount || isNaN(parseFloat(this.amount)) || parseFloat(this.amount) <= 0) {
        uni.showToast({
          title: '请输入有效金额',
          icon: 'none'
        });
        return;
      }
      
      // 验证标签
      if (!this.selectedTagId) {
        uni.showToast({
          title: '请选择标签',
          icon: 'none'
        });
        return;
      }
      
      try {
        uni.showLoading({ title: '更新中...' });
        
        const updateData = {
          transaction_id: this.transactionId,
          type: this.transactionType,
          amount: parseFloat(this.amount),
          tag_id: this.selectedTagId,
          remark: this.remark.trim(),
          created_at: Math.floor(this.selectedDate.getTime() / 1000)
        };
        
        await updateTransactionApi(updateData);
        
        uni.hideLoading();
        uni.showToast({
          title: '更新成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          this.goBack();
        }, 1500);
      } catch (error) {
        uni.hideLoading();
        console.error('更新交易失败', error);
        uni.showToast({
          title: error?.msg || error?.data?.msg || '更新失败，请重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: $color-bg-secondary;
  padding-bottom: 40rpx;
}

/* 导航栏容器 */
.navbar-container {
  background: $color-bg-primary;
  border-bottom: 1px solid $color-border-light;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* 状态栏占位 */
.status-bar {
  background: #FFFFFF;
}

/* 自定义导航栏 */
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 $spacing-lg;
  background: $color-bg-primary;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx;
}

.back-text {
  font-size: $font-size-body;
  color: $color-text-primary;
}

.navbar-center {
  flex: 1;
  text-align: center;
}

.navbar-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.navbar-right {
  width: 80rpx;
}

/* 记账内容样式 */
.record-content {
  padding: 30rpx;
}

/* 类型切换 */
.type-toggle {
  display: flex;
  background: $color-bg-tertiary;
  border-radius: $border-radius-full;
  padding: 6rpx;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-light;
}

.type-option {
  flex: 1;
  text-align: center;
  padding: $spacing-sm 0;
  border-radius: $border-radius-full;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-text-secondary;
  transition: all 0.3s ease;
}

.type-option.active {
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

/* 金额输入 */
.amount-input-container {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: 0 20rpx;
}

.currency-symbol {
  font-size: 60rpx;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin-right: $spacing-sm;
}

.amount-input {
  flex: 1;
  font-size: 60rpx;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  height: 120rpx;
  line-height: 120rpx;
  border: none;
  background: transparent;
}

/* 标签选择 */
.tags-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
  display: block;
}

.tags-header {
  margin-bottom: 20rpx;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 12rpx $spacing-sm;
  border-radius: $border-radius-lg;
  background: $color-bg-tertiary;
  transition: all 0.3s ease;
  box-shadow: $shadow-light;
  min-width: 80rpx;
  flex: 0 0 auto;
  position: relative;
}

.tag-item.active {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.tag-item text {
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
}

/* FA图标样式 */
.fa-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fa {
  font-family: 'FontAwesome';
  font-size: 18rpx;
}

/* 备注输入 */
.remark-section {
  margin-bottom: 30rpx;
}

.remark-input {
  width: 100%;
  height: 80rpx;
  background: $color-bg-tertiary;
  border-radius: $border-radius-md;
  padding: 0 20rpx;
  font-size: $font-size-body;
  color: $color-text-primary;
  box-sizing: border-box;
}

/* 日期选择 */
.date-section {
  margin-bottom: 30rpx;
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  background: $color-bg-tertiary;
  border-radius: $border-radius-md;
  padding: 0 20rpx;
  font-size: $font-size-body;
  color: $color-text-primary;
}

/* 保存按钮 */
.save-section {
  padding: 20rpx 0;
}

.btn-save {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  border-radius: 44rpx;
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  box-shadow: 0 6rpx 16rpx rgba(255, 154, 90, 0.25);
  border: none;
  transition: all 0.3s ease;
}

.btn-save:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 154, 90, 0.15);
}

/* 日期选择器 */
.date-picker-view {
  width: 100%;
  height: 400rpx;
}

.picker-item {
  line-height: 50px;
  text-align: center;
  font-size: $font-size-body;
}

/* 模态框样式 */
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1px solid $color-bg-tertiary;
}

.modal-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.close-btn {
  font-size: $font-size-h3;
  color: $color-text-secondary;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: $spacing-md;
  max-height: 60vh;
  overflow-y: auto;
}

/* 模态框底部按钮 */
.modal-footer {
  display: flex;
  gap: 12rpx;
  padding: $spacing-md;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1px solid $color-bg-tertiary;
}

.btn-cancel, .btn-confirm {
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

.btn-cancel {
  background: $color-bg-tertiary;
  color: $color-text-secondary;
  box-shadow: $shadow-light;
}

.btn-cancel:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.03);
}

.btn-confirm {
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

.btn-confirm:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(255, 154, 90, 0.1);
}
</style>
