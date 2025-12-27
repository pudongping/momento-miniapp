<template>
  <view class="page-container">
    <!-- 账本选择器 -->
    <view class="book-selector">
      <view class="book-selector-header">
        <view class="selector-left">
          <uni-icons type="wallet" size="20" color="#FF9A5A"></uni-icons>
          <text class="selector-label">记账到</text>
        </view>
        <view class="book-switcher" @click="showBookPicker">
          <view class="switcher-inner">
            <text class="current-book-name">{{ currentBook?.name || '未选择' }}</text>
            <uni-icons type="arrowdown" size="14" color="#FF9A5A"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 账本选择弹窗 -->
    <view v-if="showBookPickerModal" class="modal-mask" @click="closeBookPicker">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择账本</text>
          <view class="close-btn" @click="closeBookPicker">✕</view>
        </view>
        <view class="modal-body">
          <!-- 创建的账本 -->
          <view v-if="createdBooks.length > 0" class="books-group">
            <text class="group-label">创建的账本</text>
            <view 
              v-for="book in createdBooks" 
              :key="book.book_id" 
              class="book-option"
              :class="{ active: currentBook?.book_id === book.book_id }"
              @click="selectBook(book)"
            >
              <view class="book-option-left">
                <text class="book-name">{{ book.name }}</text>
                <text class="book-members">{{ book.member_count }}人</text>
              </view>
              <view v-if="currentBook?.book_id === book.book_id" class="check-icon">✓</view>
            </view>
          </view>

          <!-- 加入的账本 -->
          <view v-if="joinedBooks.length > 0" class="books-group">
            <text class="group-label">加入的账本</text>
            <view 
              v-for="book in joinedBooks" 
              :key="book.book_id" 
              class="book-option"
              :class="{ active: currentBook?.book_id === book.book_id }"
              @click="selectBook(book)"
            >
              <view class="book-option-left">
                <text class="book-name">{{ book.name }}</text>
                <text class="book-members">{{ book.member_count }}人</text>
              </view>
              <view v-if="currentBook?.book_id === book.book_id" class="check-icon">✓</view>
            </view>
          </view>
        </view>
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
        <text class="section-title">选择标签</text>
        <scroll-view scroll-x class="tags-scroll" show-scrollbar="false">
          <view class="tags-container">
            <view 
              v-for="tag in filteredTags" 
              :key="tag.tag_id"
              class="tag-item"
              :class="{ active: selectedTagId === tag.tag_id }"
              :style="{ backgroundColor: selectedTagId === tag.tag_id ? tag.color : '#F5F5F5' }"
              @click="selectTag(tag)"
            >
              <uni-icons :type="tag.icon" size="20" :color="selectedTagId === tag.tag_id ? '#FFFFFF' : tag.color"></uni-icons>
              <text :style="{ color: selectedTagId === tag.tag_id ? '#FFFFFF' : '#333333' }">
                {{ tag.name }}
              </text>
            </view>
            <view class="tag-item custom-tag" @click="showCustomTagModal">
              <uni-icons type="plus" size="20" color="#666666"></uni-icons>
              <text>自定义</text>
            </view>
          </view>
        </scroll-view>
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
      
      <!-- 日期选择 -->
      <view class="date-section">
        <text class="section-title">日期</text>
        <view class="date-picker" @click="showDatePicker">
          <text>{{ formatDate(selectedDate) }}</text>
          <uni-icons type="calendar" size="18" color="#666666"></uni-icons>
        </view>
      </view>
      
      <!-- 周期记账开关 -->
      <view class="recurring-section">
        <view class="recurring-header">
          <text class="section-title">周期记账</text>
          <switch 
            :checked="isRecurring" 
            @change="toggleRecurring" 
            color="#FF9A5A"
            style="transform: scale(0.8);"
          />
        </view>
        <view v-if="isRecurring" class="recurring-options">
          <view class="recurring-type-selector">
            <view 
              v-for="(label, type) in recurringTypes" 
              :key="type"
              class="recurring-type-option"
              :class="{ active: recurringType === type }"
              @click="recurringType = type"
            >
              <text>{{ label }}</text>
            </view>
          </view>
          
          <view class="recurring-day-selector">
            <text class="recurring-label">每{{ getRecurringTypeText() }}</text>
            <input 
              v-if="recurringType !== 'daily'"
              type="number" 
              v-model="recurringDay" 
              class="recurring-day-input"
              :placeholder="getRecurringDayPlaceholder()"
              maxlength="2"
            />
            <text v-if="recurringType !== 'daily'" class="recurring-day-unit">
              {{ getRecurringDayUnit() }}
            </text>
          </view>
        </view>
      </view>
      
      <!-- 保存按钮 -->
      <view class="save-section">
        <button class="btn-save" @click="saveTransaction">保存</button>
      </view>
    </view>
    
    <!-- 日期选择器弹窗 -->
    <view v-if="showDatePickerModal" class="modal-mask" @click="closeDatePicker">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择日期</text>
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
          </picker-view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeDatePicker">取消</button>
          <button class="btn-confirm" @click="confirmDatePicker">确认</button>
        </view>
      </view>
    </view>
    
    <!-- 自定义标签弹窗 -->
    <view v-if="showCustomTagModal" class="modal-mask" @click="closeCustomTagModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">自定义标签</text>
          <view class="close-btn" @click="closeCustomTagModal">✕</view>
        </view>
        <view class="modal-body">
          <view class="custom-tag-form">
            <view class="form-item">
              <text class="form-label">标签名称</text>
              <input 
                type="text" 
                v-model="customTagName" 
                class="form-input"
                placeholder="请输入标签名称"
                maxlength="6"
              />
            </view>
            
            <view class="form-item">
              <text class="form-label">选择颜色</text>
              <view class="color-options">
                <view 
                  v-for="(color, index) in tagColors" 
                  :key="index"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ active: customTagColor === color }"
                  @click="customTagColor = color"
                ></view>
              </view>
            </view>
            
            <view class="form-item">
              <text class="form-label">选择图标</text>
              <view class="icon-options">
                <view 
                  v-for="(icon, index) in tagIcons" 
                  :key="index"
                  class="icon-option"
                  :class="{ active: customTagIcon === icon }"
                  @click="customTagIcon = icon"
                >
                  <uni-icons :type="icon" size="24" color="#666666"></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeCustomTagModal">取消</button>
          <button class="btn-confirm" @click="saveCustomTag">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { setCurrentBook, restoreAccountBookState } from '@/utils/account-book.js';
import { 
  getAccountBooksApi, 
  getTagsApi, 
  addTagApi, 
  addTransactionApi,
  addRecurringTransactionApi
} from '@/api/index.js';

export default {
  data() {
    return {
      // 账本相关
      currentBook: null,
      allBooks: [],
      createdBooks: [],
      joinedBooks: [],
      showBookPickerModal: false,
      
      // 交易相关
      transactionType: 'expense', // 默认支出
      amount: '',
      remark: '',
      selectedDate: new Date(),
      selectedTagId: null,
      
      // 标签相关
      tags: [],
      showCustomTagModal: false,
      customTagName: '',
      customTagColor: '#FF9A5A',
      customTagIcon: 'tag',
      tagColors: [
        '#FF9A5A', '#F44336', '#E91E63', '#9C27B0', '#673AB7',
        '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
        '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800'
      ],
      tagIcons: [
        'tag', 'home', 'cart', 'car', 'food', 'gift', 'wallet',
        'shop', 'medal', 'heart', 'star', 'phone', 'fire', 'flag',
        'cloud', 'email', 'staff', 'sound', 'videocam', 'trash'
      ],
      
      // 日期选择器
      showDatePickerModal: false,
      years: [],
      months: [],
      days: [],
      datePickerValue: [0, 0, 0],
      tempDatePickerValue: [0, 0, 0],
      
      // 周期记账
      isRecurring: false,
      recurringType: 'monthly',
      recurringDay: '',
      recurringTypes: {
        daily: '每天',
        weekly: '每周',
        monthly: '每月',
        quarterly: '每季度',
        yearly: '每年'
      }
    };
  },

  computed: {
    filteredTags() {
      return this.tags.filter(tag => tag.type === this.transactionType);
    }
  },

  onShow() {
    this.initBooks();
    this.initTags();
    this.initDatePicker();
  },

  methods: {
    // 账本相关方法
    async initBooks() {
      try {
        // 尝试从本地存储恢复
        const savedBook = restoreAccountBookState();
        
        // 获取最新的账本列表
        const books = await getAccountBooksApi();
        if (books && Array.isArray(books)) {
          this.allBooks = books;
          this.createdBooks = books.filter(b => b.is_creator);
          this.joinedBooks = books.filter(b => !b.is_creator);
          
          // 如果有保存的账本且仍在列表中，使用它；否则使用默认账本
          if (savedBook && books.some(b => b.book_id === savedBook.book_id)) {
            this.currentBook = savedBook;
          } else {
            const defaultBook = books.find(b => b.is_default) || books[0];
            this.currentBook = defaultBook;
            if (defaultBook) {
              setCurrentBook(defaultBook);
            }
          }
        }
      } catch (error) {
        console.error('初始化账本失败', error);
      }
    },

    showBookPicker() {
      this.showBookPickerModal = true;
    },

    closeBookPicker() {
      this.showBookPickerModal = false;
    },

    selectBook(book) {
      this.currentBook = book;
      setCurrentBook(book);
      this.closeBookPicker();
    },
    
    // 标签相关方法
    async initTags() {
      try {
        const tags = await getTagsApi();
        if (tags && Array.isArray(tags)) {
          this.tags = tags;
          
          // 默认选择第一个标签
          const defaultTags = tags.filter(tag => tag.type === this.transactionType);
          if (defaultTags.length > 0) {
            this.selectedTagId = defaultTags[0].tag_id;
          }
        }
      } catch (error) {
        console.error('获取标签失败', error);
      }
    },
    
    selectTag(tag) {
      this.selectedTagId = tag.tag_id;
    },
    
    showCustomTagModal() {
      this.customTagName = '';
      this.customTagColor = '#FF9A5A';
      this.customTagIcon = 'tag';
      this.showCustomTagModal = true;
    },
    
    closeCustomTagModal() {
      this.showCustomTagModal = false;
    },
    
    async saveCustomTag() {
      if (!this.customTagName.trim()) {
        uni.showToast({
          title: '请输入标签名称',
          icon: 'none'
        });
        return;
      }
      
      try {
        const newTag = await addTagApi({
          name: this.customTagName.trim(),
          color: this.customTagColor,
          icon: this.customTagIcon,
          type: this.transactionType
        });
        
        if (newTag) {
          this.tags.push(newTag);
          this.selectedTagId = newTag.tag_id;
          this.closeCustomTagModal();
          
          uni.showToast({
            title: '标签添加成功',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('添加标签失败', error);
        uni.showToast({
          title: '添加标签失败',
          icon: 'none'
        });
      }
    },
    
    // 日期选择器相关方法
    initDatePicker() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      
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
      
      // 设置默认值
      const yearIndex = this.years.findIndex(year => year === currentYear);
      const monthIndex = currentMonth - 1;
      const dayIndex = currentDay - 1;
      
      this.datePickerValue = [yearIndex, monthIndex, dayIndex];
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
      
      this.selectedDate = new Date(year, month - 1, day);
      this.closeDatePicker();
    },
    
    formatDate(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    },
    
    // 周期记账相关方法
    toggleRecurring(e) {
      this.isRecurring = e.detail.value;
      
      // 如果开启周期记账，默认设置当前日期对应的周期日
      if (this.isRecurring && !this.recurringDay) {
        const currentDate = new Date();
        this.recurringDay = currentDate.getDate().toString();
      }
    },
    
    getRecurringTypeText() {
      return this.recurringTypes[this.recurringType];
    },
    
    getRecurringDayPlaceholder() {
      switch (this.recurringType) {
        case 'weekly':
          return '1-7';
        case 'monthly':
          return '1-31';
        case 'quarterly':
          return '1-31';
        case 'yearly':
          return '1-366';
        default:
          return '';
      }
    },
    
    getRecurringDayUnit() {
      switch (this.recurringType) {
        case 'weekly':
          return '周';
        case 'monthly':
        case 'quarterly':
          return '日';
        case 'yearly':
          return '天';
        default:
          return '';
      }
    },
    
    // 保存交易
    async saveTransaction() {
      // 验证账本
      if (!this.currentBook) {
        uni.showToast({
          title: '请选择账本',
          icon: 'none'
        });
        return;
      }
      
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
      
      // 验证周期记账参数
      if (this.isRecurring && this.recurringType !== 'daily') {
        if (!this.recurringDay) {
          uni.showToast({
            title: '请输入周期日期',
            icon: 'none'
          });
          return;
        }
        
        const recurringDayNum = parseInt(this.recurringDay);
        let isValid = false;
        
        switch (this.recurringType) {
          case 'weekly':
            isValid = recurringDayNum >= 1 && recurringDayNum <= 7;
            break;
          case 'monthly':
          case 'quarterly':
            isValid = recurringDayNum >= 1 && recurringDayNum <= 31;
            break;
          case 'yearly':
            isValid = recurringDayNum >= 1 && recurringDayNum <= 366;
            break;
        }
        
        if (!isValid) {
          uni.showToast({
            title: '请输入有效的周期日期',
            icon: 'none'
          });
          return;
        }
      }
      
      try {
        uni.showLoading({ title: '保存中...' });
        
        // 准备交易数据
        const transactionData = {
          book_id: this.currentBook.book_id,
          type: this.transactionType,
          amount: parseFloat(this.amount),
          tag_id: this.selectedTagId,
          remark: this.remark.trim(),
          timestamp: Math.floor(this.selectedDate.getTime() / 1000)
        };
        
        // 如果是周期记账
        if (this.isRecurring) {
          const recurringData = {
            ...transactionData,
            name: this.remark.trim() || `周期${this.transactionType === 'expense' ? '支出' : '收入'}`,
            recurring_type: this.recurringType,
            recurring_day: this.recurringType === 'daily' ? 0 : parseInt(this.recurringDay),
            recurring_time: '09:00',
            is_active: true
          };
          
          await addRecurringTransactionApi(recurringData);
          
          uni.hideLoading();
          uni.showToast({
            title: '周期记账设置成功',
            icon: 'success'
          });
        } else {
          // 普通交易
          await addTransactionApi(transactionData);
          
          uni.hideLoading();
          uni.showToast({
            title: '记账成功',
            icon: 'success'
          });
        }
        
        // 返回首页
        setTimeout(() => {
          uni.switchTab({ url: '/pages/home/index' });
        }, 1500);
      } catch (error) {
        uni.hideLoading();
        console.error('保存交易失败', error);
        uni.showToast({
          title: '保存失败，请重试',
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
  padding-bottom: 40rpx;
}

.book-selector {
  background: linear-gradient(135deg, #FFFFFF, #F9FAFB);
  padding: 24rpx 30rpx;
  border-bottom: 1px solid #F0F0F0;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.book-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selector-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.selector-label {
  font-size: 26rpx;
  color: #666666;
  font-weight: 500;
}

.book-switcher {
  position: relative;
}

.switcher-inner {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #FFFFFF;
  border-radius: 30rpx;
  border: 1px solid #F0F0F0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.book-switcher:active .switcher-inner {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.02);
}

.current-book-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  max-width: 300rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 记账内容样式 */
.record-content {
  padding: 30rpx;
}

/* 类型切换 */
.type-toggle {
  display: flex;
  background: #F5F5F5;
  border-radius: 40rpx;
  padding: 6rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.type-option {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #666666;
  transition: all 0.3s ease;
}

.type-option.active {
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

/* 金额输入 */
.amount-input-container {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.currency-symbol {
  font-size: 60rpx;
  font-weight: 600;
  color: #333333;
  margin-right: 16rpx;
}

.amount-input {
  flex: 1;
  font-size: 60rpx;
  font-weight: 600;
  color: #333333;
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
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
  display: block;
}

.tags-scroll {
  width: 100%;
  white-space: nowrap;
}

.tags-container {
  display: flex;
  flex-wrap: nowrap;
  padding: 10rpx 0;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  border-radius: 40rpx;
  margin-right: 16rpx;
  background: #F5F5F5;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tag-item.active {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.tag-item text {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
}

.custom-tag {
  background: #FFFFFF;
  border: 1px dashed #CCCCCC;
}

/* 备注输入 */
.remark-section {
  margin-bottom: 30rpx;
}

.remark-input {
  width: 100%;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
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
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
}

/* 周期记账 */
.recurring-section {
  margin-bottom: 40rpx;
}

.recurring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.recurring-options {
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 20rpx;
}

.recurring-type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.recurring-type-option {
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  background: #FFFFFF;
  color: #666666;
  border: 1px solid #EEEEEE;
}

.recurring-type-option.active {
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  border: none;
}

.recurring-day-selector {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.recurring-label {
  font-size: 26rpx;
  color: #333333;
}

.recurring-day-input {
  width: 100rpx;
  height: 60rpx;
  background: #FFFFFF;
  border-radius: 8rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333333;
}

.recurring-day-unit {
  font-size: 26rpx;
  color: #333333;
}

/* 保存按钮 */
.save-section {
  padding: 20rpx 0;
}

.btn-save {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
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
  font-size: 28rpx;
}

/* 模态框底部按钮 */
.modal-footer {
  display: flex;
  gap: 12rpx;
  padding: 24rpx;
  border-top: 1px solid #F5F5F5;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 88rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #F5F5F5;
  color: #666666;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.btn-cancel:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.03);
}

.btn-confirm {
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

.btn-confirm:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(255, 154, 90, 0.1);
}

/* 自定义标签表单 */
.custom-tag-form {
  padding: 10rpx 0;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  color: #333333;
  font-weight: 600;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}

.color-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.color-option.active {
  transform: scale(1.1);
  border: 2rpx solid #FFFFFF;
  box-shadow: 0 0 0 4rpx rgba(0, 0, 0, 0.1);
}

.icon-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}

.icon-option {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.icon-option.active {
  background: #FFE8D9;
  box-shadow: 0 0 0 2rpx #FF9A5A;
}

/* 账本相关样式 */
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
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
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
  padding: 24rpx;
  border-bottom: 1px solid #F5F5F5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.close-btn {
  font-size: 32rpx;
  color: $text-secondary;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.books-group {
  margin-bottom: 32rpx;
}

.group-label {
  font-size: 24rpx;
  color: $text-secondary;
  margin-bottom: 12rpx;
  display: block;
  font-weight: 500;
}

.book-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.book-option.active {
  background: #FFF9E6;
  border-color: #FFB800;
  box-shadow: 0 2rpx 12rpx rgba(255, 184, 0, 0.15);
}

.book-option:active {
  transform: scale(0.98);
}

.book-option-left {
  flex: 1;
}

.book-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 4rpx;
}

.book-members {
  font-size: 22rpx;
  color: $text-secondary;
  display: block;
}

.check-icon {
  font-size: 28rpx;
  color: #FFB800;
  font-weight: 700;
  margin-left: 12rpx;
}
</style>
