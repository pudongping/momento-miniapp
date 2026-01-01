<template>
  <view class="page-container">
    <view class="header">
      <text class="title">预算设置</text>
      <text class="subtitle">设置每月预算总金额</text>
    </view>
    
    <view class="budget-card">
      <view class="input-section">
        <text class="label">每月预算总金额</text>
        <view class="input-wrapper">
          <text class="currency">￥</text>
          <input 
            type="digit" 
            v-model="budget"
            class="budget-input"
            placeholder="请输入金额" 
            @input="validateInput"
          />
          <text class="unit">元</text>
        </view>
      </view>
      
      <view class="description">
        <uni-icons type="info" size="16" color="#999"></uni-icons>
        <text class="desc-text">设置后，首页将根据当月支出计算剩余可用预算，并以进度条形式直观展示您的预算使用情况</text>
      </view>
    </view>
    
    <button class="save-button" @click="saveBudget">保存设置</button>
  </view>
</template>

<script>
import { getBudgetApi, updateBudgetApi } from '@/api/index.js';

export default {
  data() {
    return {
      budget: '',
      // 预算设置之前的旧值，用于检测是否有变化
      originalBudget: ''
    };
  },
  
  onLoad() {
    this.getBudget();
  },
  
  methods: {
    // 获取预算设置
    async getBudget() {
      try {
        const data = await getBudgetApi();
        if (data && data.budget !== undefined) {
          this.budget = data.budget.toString();
          this.originalBudget = this.budget;
        }
      } catch (error) {
        console.error('获取预算设置失败', error);
        uni.showToast({
          title: '获取预算设置失败',
          icon: 'none'
        });
      }
    },
    
    // 验证输入
    validateInput(e) {
      const value = e.detail.value;
      // 只允许输入数字和小数点
      const regex = /^\d*\.?\d{0,2}$/;
      if (!regex.test(value)) {
        this.budget = value.substring(0, value.length - 1);
      }
      
      // 限制金额上限
      const num = parseFloat(value);
      if (num > 1000000) {
        this.budget = '1000000';
        uni.showToast({
          title: '预算金额不能超过100万',
          icon: 'none'
        });
      }
    },
    
    // 格式化数字，保留两位小数
    formatNumber(num) {
      return parseFloat(num).toFixed(2);
    },
    
    // 保存预算设置
    async saveBudget() {
      // 验证输入
      if (!this.budget.trim()) {
        uni.showToast({
          title: '请输入预算金额',
          icon: 'none'
        });
        return;
      }
      
      // 如果金额没变，不需要更新
      if (this.budget === this.originalBudget) {
        uni.navigateBack();
        return;
      }
      
      try {
        await updateBudgetApi({
          budget: parseFloat(this.budget)
        });
        
        uni.showToast({
          title: '预算设置成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        console.error('预算设置失败', error);
        uni.showToast({
          title: '预算设置失败',
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
  padding: 20rpx;
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

.budget-card {
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: $shadow-light;
}

.input-section {
  margin-bottom: 20rpx;
}

.label {
  display: block;
  font-size: $font-size-body;
  color: $color-text-primary;
  margin-bottom: 20rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid $color-border-normal;
  padding-bottom: 10rpx;
  margin-bottom: 10rpx;
}

.currency {
  font-size: $font-size-h2;
  color: $color-text-primary;
  margin-right: 10rpx;
  font-weight: $font-weight-medium;
}

.budget-input {
  flex: 1;
  font-size: $font-size-h2;
  height: 80rpx;
}

.unit {
  font-size: $font-size-body;
  color: $color-text-secondary;
}

.description {
  display: flex;
  align-items: flex-start;
  background: $color-bg-secondary;
  padding: 20rpx;
  border-radius: $border-radius-sm;
  margin: 20rpx 0;
}

.desc-text {
  font-size: $font-size-small;
  color: $color-text-secondary;
  line-height: $line-height-normal;
  margin-left: 10rpx;
}

.save-button {
  background: linear-gradient(to right, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: $border-radius-full;
  font-size: $font-size-h3;
  font-weight: $font-weight-medium;
  margin-top: $spacing-lg;
}
</style>
