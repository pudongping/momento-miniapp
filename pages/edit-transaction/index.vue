<template>
  <view class="edit-transaction-page">
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

    <view class="content">
      <!-- 交易类型切换 -->
      <view class="type-section">
        <view class="type-tabs">
          <view 
            class="type-tab"
            :class="{ active: transactionType === 'expense' }"
            @click="transactionType = 'expense'"
          >
            <text>支出</text>
          </view>
          <view 
            class="type-tab"
            :class="{ active: transactionType === 'income' }"
            @click="transactionType = 'income'"
          >
            <text>收入</text>
          </view>
        </view>
      </view>
      
      <!-- 金额输入 -->
      <view class="amount-section">
        <text class="section-title">金额</text>
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
            <uni-icons :type="tag.icon" size="18" :color="selectedTagId === tag.tag_id ? '#FFFFFF' : tag.color"></uni-icons>
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
          maxlength="100"
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
            :value="datePickerValue" 
            @change="onDatePickerChange"
            class="date-picker-view"
          >
            <picker-view-column>
              <view v-for="year in years" :key="year" class="picker-item">{{ year }}年</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="month in months" :key="month" class="picker-item">{{ month }}月</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="day in days" :key="day" class="picker-item">{{ day }}日</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="hour in hours" :key="hour" class="picker-item">{{ hour }}时</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="minute in minutes" :key="minute" class="picker-item">{{ minute }}分</view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeDatePicker">取消</button>
          <button class="btn-confirm" @click="confirmDatePicker">确定</button>
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

    // 初始化标签
    async initTags() {
      try {
        const tags = await getTagsApi();
        if (tags && Array.isArray(tags)) {
          this.tags = tags;
        }
      } catch (error) {
        console.error('加载标签失败', error);
      }
    },

    // 选择标签
    selectTag(tag) {
      this.selectedTagId = tag.tag_id;
    },

    // 初始化日期选择器
    initDatePicker() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      
      // 生成年份选项（当前年份前后5年）
      this.years = [];
      for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        this.years.push(i);
      }
      
      // 生成月份选项
      this.months = [];
      for (let i = 1; i <= 12; i++) {
        this.months.push(i);
      }
      
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
      
      // 设置当前日期对应的索引
      const yearIndex = this.years.indexOf(this.selectedDate.getFullYear());
      const monthIndex = this.months.indexOf(this.selectedDate.getMonth() + 1);
      
      this.updateDays(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1);
      const dayIndex = this.days.indexOf(this.selectedDate.getDate());
      const hourIndex = this.selectedDate.getHours();
      const minuteIndex = this.selectedDate.getMinutes();
      
      this.datePickerValue = [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex];
      this.tempDatePickerValue = [...this.datePickerValue];
    },

    // 更新天数选项
    updateDays(year, month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      this.days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.days.push(i);
      }
    },

    // 显示日期选择器
    showDatePicker() {
      this.showDatePickerModal = true;
    },

    // 关闭日期选择器
    closeDatePicker() {
      this.showDatePickerModal = false;
    },

    // 日期选择器变化
    onDatePickerChange(e) {
      const values = e.detail.value;
      this.tempDatePickerValue = [...values];
      const year = this.years[values[0]];
      const month = this.months[values[1]];
      const currentDayIndex = values[2];
      this.updateDays(year, month);
      if (currentDayIndex >= this.days.length) {
        this.tempDatePickerValue[2] = this.days.length - 1;
      }
      this.$forceUpdate();
    },

    // 确认日期选择
    confirmDatePicker() {
      const year = this.years[this.tempDatePickerValue[0]];
      const month = this.months[this.tempDatePickerValue[1]];
      const day = this.days[this.tempDatePickerValue[2]];
      const hour = parseInt(this.hours[this.tempDatePickerValue[3]]);
      const minute = parseInt(this.minutes[this.tempDatePickerValue[4]]);
      
      this.selectedDate = new Date(year, month - 1, day, hour, minute);
      this.datePickerValue = [...this.tempDatePickerValue];
      this.closeDatePicker();
    },

    // 格式化日期显示
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}`;
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
          title: '更新失败，请重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.edit-transaction-page {
  min-height: 100vh;
  background: #F8F9FA;
}

/* 导航栏容器 */
.navbar-container {
  background: #FFFFFF;
  border-bottom: 1px solid #F0F0F0;
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
  padding: 0 32rpx;
  background: #FFFFFF;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx;
}

.back-text {
  font-size: 28rpx;
  color: #333333;
}

.navbar-center {
  flex: 1;
  text-align: center;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.navbar-right {
  width: 80rpx;
}

/* 内容区域 */
.content {
  padding: 32rpx;
}

/* 交易类型切换 */
.type-section {
  margin-bottom: 40rpx;
}

.type-tabs {
  display: flex;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 6rpx;
}

.type-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 8rpx;
  transition: all 0.3s ease;
}

.type-tab.active {
  background: #FF9A5A;
  color: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(255, 154, 90, 0.3);
}

.type-tab text {
  font-size: 28rpx;
  font-weight: 500;
}

/* 金额输入 */
.amount-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
  display: block;
}

.amount-input {
  width: 100%;
  height: 100rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.amount-input:focus {
  border-color: #FF9A5A;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

/* 标签选择 */
.tags-section {
  margin-bottom: 40rpx;
}

.tags-header {
  margin-bottom: 20rpx;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 12rpx 16rpx;
  border-radius: 24rpx;
  background: #F5F5F5;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  min-width: 80rpx;
  flex: 0 0 auto;
}

.tag-item.active {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.tag-item text {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
}

/* 备注输入 */
.remark-section {
  margin-bottom: 40rpx;
}

.remark-input {
  width: 100%;
  height: 80rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.remark-input:focus {
  border-color: #FF9A5A;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

/* 日期选择 */
.date-section {
  margin-bottom: 40rpx;
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.date-picker text {
  font-size: 28rpx;
  color: #333333;
}

/* 保存按钮 */
.save-section {
  padding: 20rpx 0;
}

.btn-save {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF9A5A 0%, #FF7B3A 100%);
  border-radius: 12rpx;
  border: none;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(255, 154, 90, 0.4);
  transition: all 0.3s ease;
}

.btn-save:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 154, 90, 0.4);
}

/* 模态框样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #F0F0F0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #999999;
}

.modal-body {
  padding: 32rpx;
}

.date-picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  font-size: 28rpx;
  color: #333333;
}

.modal-footer {
  display: flex;
  border-top: 1px solid #F0F0F0;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 88rpx;
  border: none;
  background: #FFFFFF;
  font-size: 28rpx;
}

.btn-cancel {
  color: #999999;
  border-right: 1px solid #F0F0F0;
}

.btn-confirm {
  color: #FF9A5A;
  font-weight: 600;
}
</style>
