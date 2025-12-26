<template>
  <view class="page-container">
    <view class="header">
      <text class="title">预算设置</text>
      <text class="subtitle">设置"红绿灯"的总金额</text>
    </view>
    
    <view class="budget-card">
      <view class="input-section">
        <text class="label">每月家庭预算总限额</text>
        <view class="input-wrapper">
          <text class="currency">¥</text>
          <input 
            type="digit" 
            v-model="budget"
            class="budget-input"
            placeholder="请输入金额" 
            @input="validateInput"
          />
        </view>
        <text class="unit">元</text>
      </view>
      
      <view class="description">
        <uni-icons type="info" size="16" color="#999"></uni-icons>
        <text class="desc-text">设置预算后，系统将根据当月支出计算剩余预算，并以红绿灯形式直观展示</text>
      </view>
      
      <view class="preview-section">
        <text class="preview-title">预览效果</text>
        <view class="preview-content">
          <view class="progress-bar">
            <view 
              class="progress-filled" 
              :style="{ width: progressWidth + '%', backgroundColor: progressColor }"
            ></view>
          </view>
          <view class="status-text">
            <text :style="{ color: progressColor }">{{ statusText }}</text>
          </view>
          <view class="budget-info">
            <text class="spent">已支出: ¥{{ formatNumber(spentAmount) }}</text>
            <text class="remain">剩余: ¥{{ formatNumber(remainAmount) }}</text>
          </view>
        </view>
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
      // 模拟数据 - 实际应该从API获取
      spentAmount: 2500,
      
      // 预算设置之前的旧值，用于检测是否有变化
      originalBudget: ''
    };
  },
  
  computed: {
    // 预算剩余金额
    remainAmount() {
      const budgetNum = parseFloat(this.budget) || 0;
      return Math.max(0, budgetNum - this.spentAmount);
    },
    
    // 进度条宽度百分比
    progressWidth() {
      const budgetNum = parseFloat(this.budget) || 1; // 避免除以0
      return Math.min(100, (this.spentAmount / budgetNum) * 100);
    },
    
    // 进度条颜色
    progressColor() {
      const percentage = this.progressWidth;
      if (percentage >= 90) {
        return '#FF4D4F'; // 红色
      } else if (percentage >= 70) {
        return '#FAAD14'; // 黄色
      } else {
        return '#52C41A'; // 绿色
      }
    },
    
    // 状态文本
    statusText() {
      const percentage = this.progressWidth;
      if (percentage >= 90) {
        return '预算告急';
      } else if (percentage >= 70) {
        return '预算注意';
      } else {
        return '预算充足';
      }
    }
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
          
          // 如果API返回了已支出金额，更新本地变量
          if (data.spent !== undefined) {
            this.spentAmount = data.spent;
          }
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
  background: $background-color;
  padding: 20rpx;
}

.header {
  padding: 30rpx 10rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: $text-secondary;
}

.budget-card {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.input-section {
  margin-bottom: 20rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #EEEEEE;
  padding-bottom: 10rpx;
  margin-bottom: 10rpx;
}

.currency {
  font-size: 36rpx;
  color: $text-primary;
  margin-right: 10rpx;
  font-weight: 500;
}

.budget-input {
  flex: 1;
  font-size: 36rpx;
  height: 80rpx;
}

.unit {
  font-size: 28rpx;
  color: $text-secondary;
}

.description {
  display: flex;
  align-items: flex-start;
  background: #F8F8F8;
  padding: 20rpx;
  border-radius: 8rpx;
  margin: 20rpx 0;
}

.desc-text {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-left: 10rpx;
}

.preview-section {
  margin-top: 40rpx;
}

.preview-title {
  font-size: 28rpx;
  color: $text-primary;
  margin-bottom: 20rpx;
  display: block;
}

.preview-content {
  background: #F8F8F8;
  padding: 20rpx;
  border-radius: 8rpx;
}

.progress-bar {
  height: 20rpx;
  background: #EEEEEE;
  border-radius: 10rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-filled {
  height: 100%;
  border-radius: 10rpx;
  transition: width 0.3s, background-color 0.3s;
}

.status-text {
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
  margin: 10rpx 0;
}

.budget-info {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: $text-secondary;
  margin-top: 10rpx;
}

.save-button {
  background: linear-gradient(to right, #FF9A5A, #FFD166);
  color: #FFFFFF;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 40rpx;
}
</style>
