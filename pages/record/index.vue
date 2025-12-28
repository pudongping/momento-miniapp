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
            <text class="current-book-name">{{ currentBook?.name || '请选择账本' }}</text>
            <view class="arrow-icon">
              <uni-icons type="down" size="16" color="#FF9A5A"></uni-icons>
            </view>
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
          <view class="tag-item custom-tag" @click="showCustomTagModal">
            <uni-icons type="plus" size="18" color="#666666"></uni-icons>
            <text>自定义</text>
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
          <!-- 周期类型选择 -->
          <view class="recurring-type-section">
            <text class="section-title">周期类型</text>
            <view class="type-selector">
              <view 
                v-for="type in recurringTypes" 
                :key="type.value"
                class="type-option"
                :class="{ active: recurringType === type.value }"
                @click="selectRecurringType(type.value)"
              >
                <text>{{ type.label }}</text>
              </view>
            </view>
          </view>

          <!-- 详细配置 -->
          <view class="recurring-config-section">
            <text class="section-title">详细配置</text>
            
            <!-- 每天配置 -->
            <view v-if="recurringType === 'daily'" class="config-container">
              <view class="config-description">
                <text>每天 {{ recurringTime }} 执行</text>
              </view>
              <view class="time-picker-container">
                <view class="picker-labels">
                  <text class="picker-label">小时</text>
                  <text class="picker-label">分钟</text>
                </view>
                <picker-view 
                  :indicator-style="'height: 50px; background-color: rgba(255, 154, 90, 0.1); border-top: 1px solid #FF9A5A; border-bottom: 1px solid #FF9A5A;'"
                  :value="timePickerValue"
                  @change="onTimePickerChange"
                  class="time-picker-view"
                >
                  <picker-view-column>
                    <view class="picker-item" v-for="hour in hours" :key="hour">
                      <text>{{ hour.toString().padStart(2, '0') }}</text>
                    </view>
                  </picker-view-column>
                  <picker-view-column>
                    <view class="picker-item" v-for="minute in minutes" :key="minute">
                      <text>{{ minute.toString().padStart(2, '0') }}</text>
                    </view>
                  </picker-view-column>
                </picker-view>
              </view>
            </view>

            <!-- 每周配置 -->
            <view v-if="recurringType === 'weekly'" class="config-container">
              <view class="config-description">
                <text>每{{ weekdayNames[recurringWeekday] }} {{ recurringTime }} 执行</text>
              </view>
              <view class="weekly-picker-container">
                <view class="picker-labels">
                  <text class="picker-label">星期</text>
                  <text class="picker-label">小时</text>
                  <text class="picker-label">分钟</text>
                </view>
                <picker-view 
                  :indicator-style="'height: 50px; background-color: rgba(255, 154, 90, 0.1); border-top: 1px solid #FF9A5A; border-bottom: 1px solid #FF9A5A;'"
                  :value="weeklyPickerValue"
                  @change="onWeeklyPickerChange"
                  class="weekly-picker-view"
                >
                  <picker-view-column>
                    <view class="picker-item" v-for="(dayName, index) in weekdayNames" :key="index">
                      <text>{{ dayName }}</text>
                    </view>
                  </picker-view-column>
                  <picker-view-column>
                    <view class="picker-item" v-for="hour in hours" :key="hour">
                      <text>{{ hour.toString().padStart(2, '0') }}</text>
                    </view>
                  </picker-view-column>
                  <picker-view-column>
                    <view class="picker-item" v-for="minute in minutes" :key="minute">
                      <text>{{ minute.toString().padStart(2, '0') }}</text>
                    </view>
                  </picker-view-column>
                </picker-view>
              </view>
            </view>

            <!-- 每月配置 -->
            <view v-if="recurringType === 'monthly'" class="config-container">
              <view class="config-description">
                <text>每年{{ recurringMonth }}月{{ recurringDay }}日 {{ recurringTime }} 执行</text>
              </view>
              <view class="monthly-picker-container">
                <view class="picker-labels">
                  <text class="picker-label">月份</text>
                  <text class="picker-label">日期</text>
                  <text class="picker-label">小时</text>
                  <text class="picker-label">分钟</text>
                </view>
                <picker-view 
                  :indicator-style="'height: 50px; background-color: rgba(255, 154, 90, 0.1); border-top: 1px solid #FF9A5A; border-bottom: 1px solid #FF9A5A;'"
                  :value="monthlyPickerValue"
                  @change="onMonthlyPickerChange"
                  class="monthly-picker-view"
                >
                  <picker-view-column>
                    <view class="picker-item" v-for="(monthName, index) in monthNames" :key="index + 1">
                      <text>{{ monthName }}</text>
                    </view>
                  </picker-view-column>
                  <picker-view-column>
                    <view class="picker-item" v-for="day in availableDays" :key="day">
                      <text>{{ day }}日</text>
                    </view>
                  </picker-view-column>
                  <picker-view-column>
                    <view class="picker-item" v-for="hour in hours" :key="hour">
                      <text>{{ hour.toString().padStart(2, '0') }}</text>
                    </view>
                  </picker-view-column>
                  <picker-view-column>
                    <view class="picker-item" v-for="minute in minutes" :key="minute">
                      <text>{{ minute.toString().padStart(2, '0') }}</text>
                    </view>
                  </picker-view-column>
                </picker-view>
              </view>
            </view>
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
    
    <!-- 自定义标签弹窗 -->
    <view v-if="showCustomTagModal" class="modal-mask" @click="closeCustomTagModal">
      <view class="modal-content custom-tag-modal" @click.stop>
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
  addTransactionApi
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
      hours: [],
      minutes: [],
      datePickerValue: [0, 0, 0, 0, 0],
      tempDatePickerValue: [0, 0, 0, 0, 0],
      
      // 周期记账
      isRecurring: false,
      recurringType: 'daily', // daily, weekly, monthly
      recurringTime: '23:59',
      recurringWeekday: 0, // 0=周日, 1=周一, ..., 6=周六
      recurringMonth: 1, // 1-12月
      recurringDay: 1, // 1-31日
      
      // 周期类型选项
      recurringTypes: [
        { value: 'daily', label: '每天' },
        { value: 'weekly', label: '每周' },
        { value: 'monthly', label: '每月' }
      ],
      
      // 时间选择器数据
      timePickerValue: [23, 59], // [小时, 分钟]
      weeklyPickerValue: [0, 23, 59], // [星期, 小时, 分钟]
      monthlyPickerValue: [0, 0, 23, 59], // [月份, 日期, 小时, 分钟]
      
      // 选项数据
      hours: [],
      minutes: [],
      weekdayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      availableDays: []
    };
  },

  computed: {
    filteredTags() {
      return this.tags.filter(tag => tag.type === this.transactionType);
    }
  },

  async onShow() {
    this.initBooks();
    await this.initTags();
    this.initDatePicker();
    this.initRecurringOptions();
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
    
    // 周期记账相关方法
    initRecurringOptions() {
      // 初始化小时选项（0-23）
      this.hours = [];
      for (let i = 0; i <= 23; i++) {
        this.hours.push(i);
      }
      
      // 初始化分钟选项（0-59）
      this.minutes = [];
      for (let i = 0; i <= 59; i++) {
        this.minutes.push(i);
      }
      
      // 初始化可用日期（根据当前选择的月份）
      this.updateAvailableDays();
    },

    toggleRecurring(e) {
      this.isRecurring = e.detail.value;
    },

    // 选择周期类型
    selectRecurringType(type) {
      this.recurringType = type;
      // 重置选择器值
      if (type === 'daily') {
        this.timePickerValue = [23, 59];
      } else if (type === 'weekly') {
        this.weeklyPickerValue = [0, 23, 59];
      } else if (type === 'monthly') {
        this.monthlyPickerValue = [0, 0, 23, 59];
        this.updateAvailableDays();
      }
      this.updateRecurringTime();
    },

    // 每天时间选择器变化
    onTimePickerChange(e) {
      const values = e.detail.value;
      this.timePickerValue = values;
      this.updateRecurringTime();
    },

    // 每周选择器变化
    onWeeklyPickerChange(e) {
      const values = e.detail.value;
      this.weeklyPickerValue = values;
      this.recurringWeekday = values[0];
      this.updateRecurringTime();
    },

    // 每月选择器变化
    onMonthlyPickerChange(e) {
      const values = e.detail.value;
      this.monthlyPickerValue = values;
      this.recurringMonth = values[0] + 1; // 月份从1开始
      this.recurringDay = this.availableDays[values[1]];
      this.updateAvailableDays(); // 月份变化时更新可用日期
      this.updateRecurringTime();
    },

    // 更新周期记账时间
    updateRecurringTime() {
      let hour, minute;
      
      if (this.recurringType === 'daily') {
        hour = this.timePickerValue[0];
        minute = this.timePickerValue[1];
      } else if (this.recurringType === 'weekly') {
        hour = this.weeklyPickerValue[1];
        minute = this.weeklyPickerValue[2];
      } else if (this.recurringType === 'monthly') {
        hour = this.monthlyPickerValue[2];
        minute = this.monthlyPickerValue[3];
      }
      
      this.recurringTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    },

    // 更新可用日期（处理闰年和不同月份的天数）
    updateAvailableDays() {
      const year = new Date().getFullYear();
      const month = this.recurringMonth;
      
      // 获取该月的天数
      const daysInMonth = new Date(year, month, 0).getDate();
      
      this.availableDays = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.availableDays.push(i);
      }
      
      // 如果当前选择的日期超过了该月的最大天数，重置为1号
      if (this.recurringDay > daysInMonth) {
        this.recurringDay = 1;
        this.monthlyPickerValue[1] = 0;
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
      
      // 验证周期记账参数（新的简化验证）
      if (this.isRecurring) {
        if (!this.recurringTime) {
          uni.showToast({
            title: '请设置执行时间',
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
          created_at: Math.floor(this.selectedDate.getTime() / 1000)
        };
        
        // 如果是周期记账
        if (this.isRecurring) {
          // 解析时间为小时和分钟
          const [hour, minute] = this.recurringTime.split(':').map(Number);
          
          const recurringData = {
            book_id: this.currentBook.book_id,
            type: this.transactionType,
            amount: parseFloat(this.amount),
            tag_id: this.selectedTagId,
            name: this.remark.trim() || `周期${this.transactionType === 'expense' ? '支出' : '收入'}`,
            remark: this.remark.trim(),
            recurring_type: this.recurringType, // daily, weekly, monthly
            recurring_hour: hour, // 小时数字，如 23
            recurring_minute: minute, // 分钟数字，如 5
            is_recurring_enabled: true, // 更明确的字段名
            created_at: Math.floor(this.selectedDate.getTime() / 1000)
          };

          // 根据类型添加特定字段
          if (this.recurringType === 'weekly') {
            recurringData.recurring_weekday = this.recurringWeekday; // 0-6 (0=周日)
          } else if (this.recurringType === 'monthly') {
            recurringData.recurring_month = this.recurringMonth; // 1-12
            recurringData.recurring_day = this.recurringDay; // 1-31
          }
          
          await addTransactionApi(recurringData);
          
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
  padding: 8rpx 20rpx;
  display: flex;
  align-items: center;
  position: relative;
  background-color: rgba(255, 154, 90, 0.1);
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 154, 90, 0.2);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.book-switcher:active {
  background-color: rgba(255, 154, 90, 0.2);
  transform: translateY(1rpx);
}

.switcher-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10rpx;
  padding: 6rpx 0;
  transition: all 0.3s ease;
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

.arrow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5rpx);
  }
  60% {
    transform: translateY(-3rpx);
  }
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

/* 周期记账样式 */
.recurring-section {
  margin: 32rpx 0;
  padding: 32rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
}

.recurring-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.recurring-options {
  margin-top: 24rpx;
}

.recurring-type-selector {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}

.recurring-type-option {
  padding: 16rpx 24rpx;
  background: #F5F5F5;
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.recurring-type-option.active {
  background: #FFF3E0;
  border-color: #FF9A5A;
  color: #FF9A5A;
}

/* 周期类型选择 */
.recurring-type-section {
  margin-bottom: 32rpx;
}

.type-selector {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.type-option {
  flex: 1;
  padding: 16rpx 24rpx;
  background: #F8F9FA;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
  text-align: center;
  transition: all 0.3s ease;
}

.type-option.active {
  background: #FF9A5A;
  border-color: #FF9A5A;
  color: #FFFFFF;
}

/* 周期配置 */
.recurring-config-section {
  margin-bottom: 32rpx;
}

.config-container {
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  border: 1rpx solid #F0F0F0;
}

.config-description {
  margin-bottom: 20rpx;
  padding: 16rpx;
  background: #F8F9FA;
  border-radius: 8rpx;
  text-align: center;
}

.config-description text {
  font-size: 30rpx;
  color: #FF9A5A;
  font-weight: bold;
}

/* 时间选择器容器 */
.time-picker-container,
.weekly-picker-container,
.monthly-picker-container {
  margin-top: 20rpx;
}

.picker-labels {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16rpx;
  padding: 0 20rpx;
}

.picker-label {
  font-size: 26rpx;
  color: #666666;
  font-weight: bold;
  text-align: center;
  flex: 1;
}

/* 选择器视图 */
.time-picker-view,
.weekly-picker-view,
.monthly-picker-view {
  height: 250rpx;
  margin: 16rpx 0;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  font-size: 28rpx;
  color: #333333;
}

/* 执行预览 */
.execution-preview {
  padding: 24rpx;
  background: #F8F9FA;
  border-radius: 12rpx;
  border: 2rpx solid #E8F4FD;
}

.preview-content {
  margin-top: 16rpx;
}

.cron-expression {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 12rpx 16rpx;
  background: #FFFFFF;
  border-radius: 8rpx;
  border: 1rpx solid #E0E0E0;
}

.expression-label {
  font-size: 26rpx;
  color: #666666;
  margin-right: 12rpx;
  min-width: 120rpx;
}

.expression-value {
  font-size: 28rpx;
  color: #2196F3;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.execution-description {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 12rpx 16rpx;
  background: #FFFFFF;
  border-radius: 8rpx;
  border: 1rpx solid #E0E0E0;
}

.description-label {
  font-size: 26rpx;
  color: #666666;
  margin-right: 12rpx;
  min-width: 120rpx;
}

.description-value {
  font-size: 28rpx;
  color: #FF9A5A;
  font-weight: bold;
}

.next-executions {
  padding: 12rpx 16rpx;
  background: #FFFFFF;
  border-radius: 8rpx;
  border: 1rpx solid #E0E0E0;
}

.next-label {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 12rpx;
}

.next-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.next-time {
  font-size: 24rpx;
  color: #333333;
  padding: 8rpx 12rpx;
  background: #F8F9FA;
  border-radius: 6rpx;
  font-family: 'Courier New', monospace;
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
