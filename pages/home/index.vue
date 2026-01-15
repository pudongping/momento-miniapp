<template>
  <view class="page-container">
    <!-- 自定义导航栏（合并导航栏和账本选择器） -->
    <view class="custom-navbar" :style="navBarStyle">
      <view class="navbar-header">
        <text class="navbar-title">时光账记</text>
      </view>
      <view class="book-selector">
        <view class="book-selector-header">
          <view class="selector-left">
            <uni-icons type="wallet" size="20" color="#FFFFFF"></uni-icons>
            <text class="selector-label">当前账本</text>
          </view>
          <view class="book-switcher" @click="showBookPicker">
            <view class="switcher-inner">
              <text class="current-book-name">{{ currentBook?.name || '请选择账本' }}</text>
              <view class="arrow-icon">
                <uni-icons type="down" size="16" color="#FFFFFF"></uni-icons>
              </view>
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

    <!-- 背景墙 -->
    <view class="background-wall" :style="backgroundStyle" @click="changeBackground">
      <!-- 倒计时区域 -->
      <view class="countdown-container">
        <swiper 
          class="countdown-swiper" 
          vertical 
          :autoplay="true" 
          :interval="3000" 
          :duration="500"
          :circular="true"
        >
          <swiper-item v-for="(event, index) in upcomingEvents" :key="index" class="countdown-item">
            <view class="countdown-content">
              <text class="countdown-text">距离 {{ event.name }} 还有 {{ event.daysLeft }} 天</text>
            </view>
          </swiper-item>
        </swiper>
      </view>
      
      <!-- 最近节日倒计时 -->
      <view v-if="nearestEvent" class="nearest-event">
        <text class="event-text">距离 {{ nearestEvent.name }} 还有 {{ nearestEvent.daysLeft }} 天</text>
      </view>
      
      <!-- 自定义背景提示 -->
      <view v-if="!customBackground" class="background-tip">
        <uni-icons type="camera" size="20" color="#FFFFFF"></uni-icons>
        <text>点击更换背景</text>
      </view>
    </view>
    
    <!-- 预算进度条 -->
    <view class="budget-section">
      <view class="budget-header">
        <text class="budget-title">本月预算</text>
        <text class="budget-amount">¥{{ formatAmount(budget) }}</text>
      </view>
      
      <view class="budget-progress-container">
        <view class="budget-progress-bg">
          <view 
            class="budget-progress-bar" 
            :style="{ width: budgetPercentage + '%', backgroundColor: budgetStatusColor }"
          ></view>
        </view>
        <view class="budget-info">
          <text class="budget-percentage">{{ budgetPercentage }}%</text>
          <text class="budget-remaining">本月剩余可用：¥{{ formatAmount(budgetRemaining) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 概览信息 -->
    <view class="summary-section">
      <view class="summary-header">
        <text class="summary-title">本月概览</text>
        <view class="summary-date">{{ currentMonthText }}</view>
      </view>
      
      <view class="summary-cards">
        <view class="summary-card expense-card">
          <view class="card-title">支出</view>
          <view class="card-amount">¥{{ formatAmount(monthStats.total_expense) }}</view>
        </view>
        <view class="summary-card income-card">
          <view class="card-title">收入</view>
          <view class="card-amount">¥{{ formatAmount(monthStats.total_income) }}</view>
        </view>
        <view class="summary-card balance-card">
          <view class="card-title">结余</view>
          <view class="card-amount">¥{{ formatAmount(monthStats.balance) }}</view>
        </view>
      </view>
    </view>
    
    <!-- Tab切换区域 -->
    <view class="tab-section">
      <view class="tab-header">
        <view class="tab-nav">
          <view 
            class="tab-item" 
            :class="{ 'active': currentTab === 'transactions' }"
            @click="switchTab('transactions')"
          >
            <text class="tab-text">账单记录</text>
            <view v-if="currentTab === 'transactions'" class="tab-indicator"></view>
          </view>
          <view 
            class="tab-item" 
            :class="{ 'active': currentTab === 'recurring' }"
            @click="switchTab('recurring')"
          >
            <text class="tab-text">周期记账</text>
            <text v-if="recurringTransactions.length > 0" class="tab-badge">{{ recurringTransactions.length }}</text>
            <view v-if="currentTab === 'recurring'" class="tab-indicator"></view>
          </view>
        </view>
        
        <view class="header-actions" v-if="currentTab === 'transactions'">
          <view class="search-btn" @click="showSearchModal">
            <uni-icons type="search" size="18" color="#666666"></uni-icons>
          </view>
        </view>
      </view>
      
      <!-- 账单记录内容 -->
      <view v-if="currentTab === 'transactions'" class="tab-content transactions-content">
      
      <!-- 下拉刷新、上拉加载更多 -->
      <scroll-view 
        class="transaction-scroll" 
        scroll-y 
        @scrolltolower="loadMoreTransactions"
        @refresherrefresh="refreshTransactions"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        :lower-threshold="50"
      >
        <view v-if="transactions.length > 0" class="transaction-list">
          <view v-for="(group, date) in groupedTransactions" :key="date" class="transaction-group">
            <!-- 日期头部 -->
            <view class="date-header" @click="toggleDayExpand(date)">
              <view class="date-header-left">
                <text class="date-text">{{ formatDateHeader(date) }}</text>
                <text class="date-weekday">{{ getWeekday(date) }}</text>
              </view>
              <view class="date-header-right">
                <view class="date-summary">
                  <text class="expense-text" v-if="getDailySummary(group).expense > 0">支出: ¥{{ formatAmount(getDailySummary(group).expense) }}</text>
                  <text class="income-text" v-if="getDailySummary(group).income > 0">收入: ¥{{ formatAmount(getDailySummary(group).income) }}</text>
                </view>
                <uni-icons :type="expandedDays[date] ? 'up' : 'down'" size="16" color="#999999"></uni-icons>
              </view>
            </view>
            
            <!-- 交易列表 -->
            <view v-if="expandedDays[date]" class="day-transactions">
              <view 
                v-for="transaction in group" 
                :key="transaction.transaction_id" 
                class="transaction-item" 
                :class="{ 'income-item': transaction.type === 'income' }" 
                @click="navigateToTransactionDetail(transaction)"
              >
                <view class="transaction-tag" :style="{ backgroundColor: transaction.tag_color || '#FF9A5A' }">
                  <uni-icons :type="transaction.tag_icon || 'shop'" size="24" color="#FFFFFF"></uni-icons>
                </view>
                
                <view class="transaction-content">
                  <view class="transaction-main">
                    <view class="transaction-info">
                      <text class="transaction-name">{{ transaction.tag_name }}</text>
                      <text class="transaction-remark" v-if="transaction.remark">
                        {{ transaction.remark }}
                      </text>
                    </view>
                    <text :class="['transaction-amount', transaction.type === 'income' ? 'income-amount' : '']">
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
                    </text>
                  </view>
                  
                  <view class="transaction-details">
                    <view class="transaction-user">
                      <image :src="transaction.user_avatar || '/static/images/default-avatar.png'" class="user-avatar"></image>
                      <text class="user-nickname">{{ formatNickname(transaction.user_nickname || '匿名') }}</text>
                    </view>
                    <text class="transaction-time">{{ formatTime(transaction.created_at) }}</text>
                  </view>
                </view>
                
                <view class="transaction-actions">
                  <view class="action-buttons">
                    <view class="edit-btn" @click.stop="editTransaction(transaction)">
                      <uni-icons type="compose" size="18" color="#4CAF50"></uni-icons>
                    </view>
                    <view class="delete-btn" @click.stop="confirmDeleteTransaction(transaction)">
                      <uni-icons type="trash" size="18" color="#FF6B6B"></uni-icons>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 加载更多提示 -->
          <view v-if="hasMoreTransactions" class="load-more">
            <text v-if="isLoadingMore" class="loading-text">加载中...</text>
            <text v-else class="loading-text">上拉加载更多</text>
          </view>
          <view v-else class="no-more">
            <view class="bottom-line">
              <view class="line"></view>
              <text>我也是有底线的</text>
              <view class="line"></view>
            </view>
          </view>
        </view>
        
        <view v-else class="empty-transactions">
          <text class="empty-text">暂无账单记录</text>
          <button class="btn-add-record" @click="navigateToRecord">立即记账</button>
        </view>
      </scroll-view>
      </view>
      
      <!-- 周期记账内容 -->
      <view v-if="currentTab === 'recurring'" class="tab-content recurring-content">
        <view v-if="recurringTransactions.length > 0" class="recurring-list">
          <view 
            v-for="recurring in recurringTransactions" 
            :key="recurring.recurring_id" 
            class="recurring-item"
            :class="{ 'income-item': recurring.type === 'income' }"
          >
            <view class="recurring-tag" :style="{ backgroundColor: recurring.tag_color || '#FF9A5A' }">
              <uni-icons :type="recurring.tag_icon || 'shop'" size="24" color="#FFFFFF"></uni-icons>
            </view>
            
            <view class="recurring-content">
              <view class="recurring-main">
                <view class="recurring-info">
                  <text class="recurring-name">{{ recurring.name }}</text>
                  <text class="recurring-remark" v-if="recurring.remark">{{ recurring.remark }}</text>
                </view>
                <text :class="['recurring-amount', recurring.type === 'income' ? 'income-amount' : '']">
                  {{ recurring.type === 'income' ? '+' : '-' }}{{ formatAmount(recurring.amount) }}
                </text>
              </view>
              
              <view class="recurring-details">
                <view class="recurring-schedule-info">
                  <text class="schedule-label">周期：</text>
                  <text class="schedule-text">{{ formatRecurringSchedule(recurring) }}</text>
                </view>
              </view>
            </view>
            
            <view class="recurring-actions">
              <view class="action-buttons">
                <view class="delete-btn" @click.stop="confirmDeleteRecurring(recurring)">
                  <uni-icons type="trash" size="18" color="#FF6B6B"></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view v-else class="empty-recurring">
          <text class="empty-text">暂无周期记账规则</text>
          <button class="btn-add-recurring" @click="navigateToRecord">添加周期记账</button>
        </view>
      </view>
    </view>
    
    <!-- 搜索弹窗 -->
    <view v-if="showSearchModalFlag" class="modal-mask" @click="closeSearchModal">
      <view class="modal-content search-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">搜索账单</text>
          <view class="close-btn" @click="closeSearchModal">✕</view>
        </view>
        <view class="modal-body">
          <view class="search-form">
            <!-- 关键词搜索 -->
            <view class="form-item">
              <view class="form-label-row">
                <text class="form-label">关键词</text>
                <text class="char-count">{{ searchParams.keyword.length }}/80</text>
              </view>
              <input 
                type="text" 
                v-model="searchParams.keyword" 
                class="form-input"
                placeholder="标签名、备注"
                @input="validateKeywordInput"
                maxlength="80"
              />
            </view>
            
            <!-- 类型选择 -->
            <view class="form-item">
              <text class="form-label">类型</text>
              <view class="type-selector">
                <view 
                  class="type-option" 
                  :class="{ active: searchParams.type === 'all' }" 
                  @click="searchParams.type = 'all'"
                >
                  <text>全部</text>
                </view>
                <view 
                  class="type-option" 
                  :class="{ active: searchParams.type === 'expense' }" 
                  @click="searchParams.type = 'expense'"
                >
                  <text>支出</text>
                </view>
                <view 
                  class="type-option" 
                  :class="{ active: searchParams.type === 'income' }" 
                  @click="searchParams.type = 'income'"
                >
                  <text>收入</text>
                </view>
              </view>
            </view>
            
            <!-- 金额范围 -->
            <view class="form-item">
              <text class="form-label">金额范围</text>
              <view class="amount-range">
                <input
                  type="text"
                  v-model="searchParams.minAmount"
                  class="amount-input"
                  placeholder="最小金额"
                  @input="validateAmountInput($event, 'minAmount')"
                  @blur="validateAmountOnBlur('minAmount')"
                  @keypress="preventNonNumericInput"
                />
                <text class="range-separator">-</text>
                <input
                  type="text"
                  v-model="searchParams.maxAmount"
                  class="amount-input"
                  placeholder="最大金额"
                  @input="validateAmountInput($event, 'maxAmount')"
                  @blur="validateAmountOnBlur('maxAmount')"
                  @keypress="preventNonNumericInput"
                />
              </view>
            </view>
            
            <!-- 时间范围 -->
            <view class="form-item">
              <text class="form-label">时间范围</text>
              <view class="datetime-range">
                <view class="datetime-picker-item">
                  <text class="datetime-label">开始时间</text>
                  <view class="custom-datetime-input" @click="showCustomDateTimePicker('start')">
                    <text class="datetime-display">{{ formatDisplayDateTime(searchParams.startDateTime) || '请选择开始时间' }}</text>
                    <uni-icons type="calendar" size="16" color="#999999"></uni-icons>
                  </view>
                </view>
                <view class="datetime-picker-item">
                  <text class="datetime-label">结束时间</text>
                  <view class="custom-datetime-input" @click="showCustomDateTimePicker('end')">
                    <text class="datetime-display">{{ formatDisplayDateTime(searchParams.endDateTime) || '请选择结束时间' }}</text>
                    <uni-icons type="calendar" size="16" color="#999999"></uni-icons>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="search-modal-footer">
          <button class="btn-reset" @click="resetSearch">重置</button>
          <button class="btn-search" @click="searchTransactions">搜索</button>
        </view>
      </view>
    </view>
    

    <!-- 自定义日历时间选择器 -->
    <view v-if="showCustomDateTimeModal" class="modal-mask" @click="closeCustomDateTimePicker">
      <view class="modal-content custom-datetime-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择{{ currentDateTimeType === 'start' ? '开始' : '结束' }}时间</text>
          <view class="close-btn" @click="closeCustomDateTimePicker">✕</view>
        </view>
        <view class="custom-datetime-body">
          <!-- 日期选择 -->
          <view class="date-section">
            <view class="section-title">选择日期</view>
            <picker-view
              :indicator-style="'height: 50px;'"
              :value="tempDatePickerValue"
              @change="onCustomDateChange"
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
          
          <!-- 时间选择 -->
          <view class="time-section">
            <view class="section-title">选择时间</view>
            <picker-view
              :indicator-style="'height: 50px;'"
              :value="tempTimePickerValue"
              @change="onCustomTimeChange"
              class="time-picker-view"
            >
              <picker-view-column>
                <view class="picker-item" v-for="(hour, index) in hours" :key="'hour-'+index">
                  {{ hour.toString().padStart(2, '0') }}时
                </view>
              </picker-view-column>
              <picker-view-column>
                <view class="picker-item" v-for="(minute, index) in minutes" :key="'minute-'+index">
                  {{ minute.toString().padStart(2, '0') }}分
                </view>
              </picker-view-column>
            </picker-view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeCustomDateTimePicker">取消</button>
          <button class="btn-confirm" @click="confirmCustomDateTime">确认</button>
        </view>
      </view>
    </view>
    
    <!-- 删除确认弹窗 -->
    <view v-if="showDeleteConfirmModal" class="delete-modal-mask" @click="cancelDeleteTransaction">
      <view class="delete-confirm-content" @click.stop>
        <view class="delete-confirm-header">
          <view class="confirm-icon">
            <text style="font-size: 60rpx; color: #FF6B6B;">?</text>
          </view>
          <text class="confirm-title">确认删除</text>
          <text class="confirm-message">{{ getDeleteMessage() }}</text>
        </view>
        <view class="delete-confirm-footer">
          <button class="btn-cancel" @click="cancelDeleteTransaction">取消</button>
          <button class="btn-delete" @click="deleteTransaction">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAccountBooks, getCurrentBook, setCurrentBook, restoreAccountBookState } from '@/utils/account-book.js';
import { checkLoginStatus } from '@/utils/auth.js';
import { 
  getAccountBooksApi, 
  getTransactionsApi, 
  getTransactionStats,
  deleteTransactionApi,
  getFestivalsApi,
  getRecurringTransactionsApi,
  deleteRecurringTransactionApi,
  uploadFileApi,
  getUserSettingsApi,
  updateUserSettingsApi
} from '@/api/index.js';

export default {
  data() {
    return {
      // 导航栏相关
      navBarHeight: 0,
      statusBarHeight: 0,
      menuButtonInfo: null,
      
      // 账本相关
      currentBook: null,
      allBooks: [],
      createdBooks: [],
      joinedBooks: [],
      showBookPickerModal: false,
      showSwitcherTooltip: true,
      
      // 背景墙相关
      customBackground: null,
      defaultBackground: '/static/images/default-background.png',
      
      // 节日和纪念日相关
      festivals: [],
      upcomingEvents: [],
      nearestEvent: null,
      
      // 预算相关
      budget: 10000, // 默认预算
      budgetPercentage: 0,
      budgetRemaining: 0,
      
      // 交易相关
      transactions: [],
      monthStats: {
        total_expense: 0,
        total_income: 0,
        balance: 0
      },
      
      // 周期记账相关
      recurringTransactions: [],
      recurringToDelete: null,
      
      // Tab切换相关
      currentTab: 'transactions', // 默认显示账单记录
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      hasMoreTransactions: true,
      lastTransactionId: 0,
      currentPage: 1,
      expandedDays: {},
      
      // 删除确认
      showDeleteConfirmModal: false,
      transactionToDelete: null,
      
      // 搜索相关
      showSearchModalFlag: false,
      searchParams: {
        keyword: '',
        type: 'all',
        minAmount: '',
        maxAmount: '',
        startDateTime: '',
        endDateTime: ''
      },
      
      // 自定义日历时间选择器
      showCustomDateTimeModal: false,
      currentDateTimeType: 'start', // 'start' or 'end'
      years: [],
      months: [],
      days: [],
      hours: [],
      minutes: [],
      tempDatePickerValue: [0, 0, 0],
      tempTimePickerValue: [0, 0],
      
    };
  },
  
  computed: {
    // 当前月份文本
    currentMonthText() {
      const now = new Date();
      return `${now.getFullYear()}年${now.getMonth() + 1}月`;
    },
    
    // 按日期分组的交易
    groupedTransactions() {
      const groups = {};
      
      this.transactions.forEach(transaction => {
        // 使用日期作为分组键
        const date = this.formatDate(new Date(transaction.created_at * 1000));
        
        if (!groups[date]) {
          groups[date] = [];
        }
        
        groups[date].push(transaction);
      });
      
      return groups;
    },
    
    // 背景样式
    backgroundStyle() {
      if (this.customBackground) {
        return {
          backgroundImage: `url(${this.customBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      } else {
        return {
          backgroundImage: `url(${this.defaultBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
    },
    
    // 预算状态颜色
    budgetStatusColor() {
      if (this.budgetPercentage < 70) {
        return '#52C41A'; // 绿色 - 预算充足
      } else if (this.budgetPercentage < 90) {
        return '#FAAD14'; // 黄色 - 预算注意
      } else {
        return '#FF4D4F'; // 红色 - 预算告急
      }
    },
    
    // 导航栏动态样式
    navBarStyle() {
      const paddingTop = this.statusBarHeight + 'px';
      const paddingBottom = '12px';
      return {
        paddingTop: paddingTop,
        paddingBottom: paddingBottom
      };
    }
  },

  onShow() {
    // 检查登录状态
    if (!checkLoginStatus('/pages/home/index')) {
      return;
    }
    
    this.initBooks();
    this.loadCustomBackground();
    this.getBudget();
    this.loadEvents();
  },

  onLoad() {
    // 检查登录状态
    if (!checkLoginStatus('/pages/home/index')) {
      return;
    }
    
    // 获取系统信息，计算导航栏高度
    this.initNavBarHeight();
    
    // 初始化自定义日历选择器
    this.initCustomDateTimePicker();
    
    // 加载自定义背景
    this.loadCustomBackground();
    
    // 加载节日和纪念日
    this.loadEvents();
    
    // 检查是否需要显示账本切换提示
    this.checkSwitcherTooltip();
  },
  
  methods: {
    // 初始化导航栏高度
    initNavBarHeight() {
      try {
        // 获取系统信息
        const systemInfo = uni.getSystemInfoSync();
        this.statusBarHeight = systemInfo.statusBarHeight || 0;
        
        // 获取胶囊按钮信息
        // #ifdef MP-WEIXIN
        const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
        this.menuButtonInfo = menuButtonInfo;
        
        // 计算导航栏高度
        // 导航栏高度 = 胶囊按钮bottom + 胶囊按钮top - 状态栏高度
        // 这样可以确保导航栏内容在胶囊按钮下方
        const navBarHeight = (menuButtonInfo.bottom - this.statusBarHeight) + 8;
        this.navBarHeight = navBarHeight;
        
        console.log('导航栏信息:', {
          statusBarHeight: this.statusBarHeight,
          menuButtonInfo: menuButtonInfo,
          navBarHeight: this.navBarHeight
        });
        // #endif
        
        // #ifndef MP-WEIXIN
        // 非微信小程序环境，使用默认值
        this.navBarHeight = 44;
        // #endif
      } catch (error) {
        console.error('获取导航栏高度失败', error);
        // 使用默认值
        this.navBarHeight = 44;
        this.statusBarHeight = 20;
      }
    },
    
    async initBooks() {
      try {
        // 获取最新的账本列表
        const books = await getAccountBooksApi();
        if (books && Array.isArray(books)) {
          this.allBooks = books;
          this.createdBooks = books.filter(b => b.is_creator === 1);
          this.joinedBooks = books.filter(b => b.is_creator === 2);
          
          // 尝试从本地存储恢复
          const savedBook = restoreAccountBookState();
          
          // 选择账本的优先级：
          // 1. 如果有保存的账本且仍在列表中，使用它
          // 2. 如果有标记为默认的账本，使用它
          // 3. 否则使用列表中的第一个账本
          
          if (savedBook && books.some(b => b.book_id === savedBook.book_id)) {
            this.currentBook = books.find(b => b.book_id === savedBook.book_id);
          } else {
            // 优先选择标记为默认的账本
            const defaultBook = books.find(b => b.is_default === 1);
            if (defaultBook) {
              this.currentBook = defaultBook;
            } else if (books.length > 0) {
              // 如果没有默认账本，使用第一个账本
              this.currentBook = books[0];
            }
          }
          
          // 将选中的账本保存到本地存储
          if (this.currentBook) {
            setCurrentBook(this.currentBook);
            
            // 加载交易数据
            this.loadTransactions();
            this.loadMonthStats();
            this.loadRecurringTransactions();
          }
        }
      } catch (error) {
        console.error('初始化账本失败', error);
        uni.showToast({
          title: '加载账本失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 背景墙相关方法
    async loadCustomBackground() {
      // 从服务器加载自定义背景
      try {
        const result = await getUserSettingsApi();
        if (result && result.background_url) {
          this.customBackground = result.background_url;
        }
      } catch (error) {
        console.error('加载自定义背景失败', error);
      }
    },
    
    async getBudget() {
      try {
        const data = await getUserSettingsApi();
        if (data && data.budget !== undefined) {
          this.budget = data.budget;
        }
      } catch (error) {
        console.error('获取预算失败', error);
      }
    },
    
    changeBackground() {
      uni.showActionSheet({
        itemList: ['从相册选择', '恢复默认背景'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 从相册选择
            uni.chooseImage({
              count: 1,
              sizeType: ['compressed'],
              sourceType: ['album'],
              success: async (res) => {
                const tempFilePath = res.tempFilePaths[0];
                
                // 显示上传中
                uni.showLoading({
                  title: '上传中...'
                });
                
                try {
                  // 调用上传文件API
                  const uploadResult = await uploadFileApi(tempFilePath, 'image', 'home_background');
                  
                  if (uploadResult && uploadResult.absolute_url) {
                    // 调用更新用户设置API
                    await updateUserSettingsApi({
                      background_url: uploadResult.absolute_url
                    });
                    
                    // 更新本地显示
                    this.customBackground = uploadResult.absolute_url;
                    
                    uni.hideLoading();
                    uni.showToast({
                      title: '背景更换成功',
                      icon: 'success'
                    });
                  }
                } catch (error) {
                  uni.hideLoading();
                  console.error('上传背景图片失败', error);
                  uni.showToast({
                    title: '上传失败，请重试',
                    icon: 'none'
                  });
                }
              }
            });
          } else if (res.tapIndex === 1) {
            // 恢复默认背景
            this.restoreDefaultBackground();
          }
        }
      });
    },
    
    async restoreDefaultBackground() {
      try {
        uni.showLoading({
          title: '恢复中...'
        });
        
        // 调用API清除背景
        await updateUserSettingsApi({
          background_url: ''
        });
        
        // 清除本地显示
        this.customBackground = null;
        
        uni.hideLoading();
        uni.showToast({
          title: '已恢复默认背景',
          icon: 'success'
        });
      } catch (error) {
        uni.hideLoading();
        console.error('恢复默认背景失败', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 节日和纪念日相关方法
    async loadEvents() {
      try {
        // 获取节日数据
        const festivals = await getFestivalsApi();
        if (festivals && Array.isArray(festivals)) {
          this.festivals = festivals;
          
          // 计算倒计时
          this.calculateEventCountdowns();
        }
      } catch (error) {
        console.error('加载节日数据失败', error);
      }
    },
    
    calculateEventCountdowns() {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      // 处理所有节日
      const events = this.festivals.map(festival => {
        // 解析节日日期
        const festivalDate = new Date(festival.festival_date * 1000);
        
        // 如果节日已过，使用明年的日期
        let eventDate = new Date(now.getFullYear(), festivalDate.getMonth(), festivalDate.getDate());
        if (eventDate.getTime() < today) {
          eventDate = new Date(now.getFullYear() + 1, festivalDate.getMonth(), festivalDate.getDate());
        }
        
        // 计算倒计时天数
        const daysLeft = Math.ceil((eventDate.getTime() - today) / (1000 * 60 * 60 * 24));
        
        return {
          name: festival.festival_name,
          date: eventDate,
          daysLeft,
          isShowHome: festival.is_show_home
        };
      });
      
      // 按倒计时天数排序
      events.sort((a, b) => a.daysLeft - b.daysLeft);
      
      // 设置即将到来的节日
      this.upcomingEvents = events.slice(0, 5);
      
      // 设置最近的节日（首页显示）
      this.nearestEvent = events.find(event => event.isShowHome);
    },
    
    // 预算相关方法
    async loadBudget() {
      try {
        // 获取预算数据
        const budgetData = await getBudgetApi();
        if (budgetData && budgetData.budget !== undefined) {
          // 使用预算设置中的“每月家庭预算总限额”
          this.budget = budgetData.budget;
        }
        
        // 计算预算使用情况
        this.calculateBudgetUsage();
      } catch (error) {
        console.error('加载预算数据失败', error);
      }
    },
    
    calculateBudgetUsage() {
      if (this.budget <= 0) return;
      
      const spent = this.monthStats.total_expense || 0;
      const percentage = Math.min(Math.round((spent / this.budget) * 100), 100);
      const remaining = Math.max(this.budget - spent, 0);
      
      this.budgetPercentage = percentage;
      this.budgetRemaining = remaining;
    },
    
    // 加载交易数据
    async loadTransactions() {
      if (!this.currentBook) return;
      
      try {
        this.isLoading = true;
        this.hasMoreTransactions = true;
        this.lastTransactionId = 0;
        this.currentPage = 1;
        
        const result = await getTransactionsApi({
          book_id: this.currentBook.book_id,
          page: 1,
          per_page: 20,
          last_transaction_id: 0
        });
        
        if (result && result.list) {
          this.transactions = result.list;
          
          // 设置最后一条交易的ID
          if (result.list.length > 0) {
            this.lastTransactionId = result.list[result.list.length - 1].transaction_id;
          }
          
          // 判断是否还有更多数据
          this.hasMoreTransactions = result.has_more;
          
          // 默认展开最近一天的交易
          if (this.transactions.length > 0) {
            const latestDate = this.formatDate(new Date(this.transactions[0].created_at * 1000));
            this.$set(this.expandedDays, latestDate, true);
          }
        }
      } catch (error) {
        console.error('加载交易数据失败', error);
        uni.showToast({
          title: '加载交易数据失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    // 加载更多交易数据
    async loadMoreTransactions() {
      if (!this.currentBook || !this.hasMoreTransactions || this.isLoadingMore) return;
      
      try {
        this.isLoadingMore = true;
        this.currentPage += 1;
        
        const result = await getTransactionsApi({
          book_id: this.currentBook.book_id,
          page: this.currentPage,
          per_page: 20,
          last_transaction_id: this.lastTransactionId
        });
        
        if (result && result.list && result.list.length > 0) {
          // 将新数据添加到列表中
          this.transactions = [...this.transactions, ...result.list];
          
          // 更新最后一条交易ID
          this.lastTransactionId = result.list[result.list.length - 1].transaction_id;
          
          // 更新是否还有更多数据
          this.hasMoreTransactions = result.has_more;
        } else {
          this.hasMoreTransactions = false;
        }
      } catch (error) {
        console.error('加载更多交易数据失败', error);
        uni.showToast({
          title: '加载更多数据失败',
          icon: 'none'
        });
      } finally {
        this.isLoadingMore = false;
      }
    },
    
    // 下拉刷新
    async refreshTransactions() {
      if (!this.currentBook) {
        this.isRefreshing = false;
        return;
      }
      
      try {
        const result = await getTransactionsApi({
          book_id: this.currentBook.book_id,
          page: 1,
          per_page: 20,
          last_transaction_id: 0
        });
        
        if (result && result.list) {
          this.transactions = result.list;
          
          // 重置分页状态
          this.currentPage = 1;
          if (result.list.length > 0) {
            this.lastTransactionId = result.list[result.list.length - 1].transaction_id;
          } else {
            this.lastTransactionId = 0;
          }
          
          this.hasMoreTransactions = result.has_more;
          
          // 同时刷新统计数据
          this.loadMonthStats();
          
          uni.showToast({
            title: '刷新成功',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('刷新交易数据失败', error);
        uni.showToast({
          title: '刷新失败',
          icon: 'error'
        });
      } finally {
        this.isRefreshing = false;
      }
    },
    
    // 切换日期展开/收起状态
    toggleDayExpand(date) {
      if (this.expandedDays[date]) {
        this.$set(this.expandedDays, date, false);
      } else {
        this.$set(this.expandedDays, date, true);
      }
    },
    
    // 加载本月统计数据
    async loadMonthStats() {
      if (!this.currentBook) return;
      
      try {
        // 获取当前月的开始和结束时间戳
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000) + 86399; // 当天的最后一秒
        
        const stats = await getTransactionStats({
          book_id: this.currentBook.book_id,
          start_date: startTimestamp,
          end_date: endTimestamp
        });
        
        if (stats) {
          this.monthStats = stats;
          
          // 更新预算使用情况
          this.calculateBudgetUsage();
        }
      } catch (error) {
        console.error('加载统计数据失败', error);
      }
    },
    
    // 编辑交易
    editTransaction(transaction) {
      // 跳转到专门的编辑页面
      try {
        const transactionData = encodeURIComponent(JSON.stringify(transaction));
        uni.navigateTo({
          url: `/pages/edit-transaction/index?data=${transactionData}`,
          success: () => {
            console.log('跳转到编辑页面成功');
          },
          fail: (error) => {
            console.error('跳转到编辑页面失败', error);
            uni.showToast({
              title: '打开编辑页面失败',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('编辑功能异常', error);
        uni.showToast({
          title: '编辑功能暂时不可用',
          icon: 'none'
        });
      }
    },
    
    // 确认删除交易
    confirmDeleteTransaction(transaction) {
      this.transactionToDelete = transaction;
      this.showDeleteConfirmModal = true;
    },
    
    // 取消删除交易
    cancelDeleteTransaction() {
      this.showDeleteConfirmModal = false;
      this.transactionToDelete = null;
      this.recurringToDelete = null;
    },
    
    // 删除交易
    async deleteTransaction() {
      // 判断是删除账单记录还是周期记账
      if (this.transactionToDelete) {
        // 删除账单记录
        try {
          await deleteTransactionApi(this.transactionToDelete.transaction_id);
          
          // 从列表中移除该交易
          this.transactions = this.transactions.filter(
            t => t.transaction_id !== this.transactionToDelete.transaction_id
          );
          
          // 重新加载统计数据
          this.loadMonthStats();
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
        } catch (error) {
          console.error('删除交易失败', error);
          uni.showToast({
            title: '删除失败',
            icon: 'error'
          });
        }
      } else if (this.recurringToDelete) {
        // 删除周期记账
        try {
          await deleteRecurringTransactionApi(this.recurringToDelete.recurring_id);
          
          // 从本地列表中移除
          const index = this.recurringTransactions.findIndex(r => r.recurring_id === this.recurringToDelete.recurring_id);
          if (index !== -1) {
            this.recurringTransactions.splice(index, 1);
          }
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
        } catch (error) {
          console.error('删除周期记账失败', error);
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          });
        }
      }
      
      // 关闭弹窗
      this.cancelDeleteTransaction();
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
      
      // 切换账本后重新加载数据
      this.loadTransactions();
      this.loadMonthStats();
    },
    
    // 检查是否需要显示账本切换提示
    checkSwitcherTooltip() {
      try {
        const hasShownTooltip = uni.getStorageSync('hasShownBookSwitcherTooltip');
        if (hasShownTooltip) {
          this.showSwitcherTooltip = false;
        } else {
          // 首次显示提示，3秒后自动关闭
          setTimeout(() => {
            this.showSwitcherTooltip = false;
          }, 3000);
        }
      } catch (error) {
        console.error('检查提示状态失败', error);
      }
    },
    
    // 关闭账本切换提示
    closeSwitcherTooltip() {
      this.showSwitcherTooltip = false;
      try {
        uni.setStorageSync('hasShownBookSwitcherTooltip', true);
      } catch (error) {
        console.error('保存提示状态失败', error);
      }
    },
    
    // 搜索相关方法
    showSearchModal() {
      // 静默重置搜索参数，不显示提示
      this.searchParams = {
        keyword: '',
        type: 'all',
        minAmount: '',
        maxAmount: '',
        startDateTime: '',
        endDateTime: ''
      };
      this.showSearchModalFlag = true;
    },
    
    closeSearchModal() {
      this.showSearchModalFlag = false;
    },
    
    // 重置搜索
    resetSearch() {
      // 完全重新创建searchParams对象，确保所有字段都被重置
      this.$set(this, 'searchParams', {
        keyword: '',
        type: 'all',
        minAmount: '',
        maxAmount: '',
        startDateTime: '',
        endDateTime: ''
      });
      
      // 强制更新视图
      this.$forceUpdate();
      
      // 显示重置成功提示
      uni.showToast({
        title: '已重置',
        icon: 'success',
        duration: 1500
      });
    },
    
    // 验证关键词输入
    validateKeywordInput(e) {
      const value = e.detail.value;
      if (value.length > 80) {
        // 如果超过80个字符，截取前80个字符
        this.searchParams.keyword = value.substring(0, 80);
        uni.showToast({
          title: '关键词最多80个字符',
          icon: 'none'
        });
      }
    },
    
    // 阻止非数字字符输入（按键事件）
    preventNonNumericInput(e) {
      const char = String.fromCharCode(e.which);
      const currentValue = e.target.value;
      
      // 允许数字
      if (/[0-9]/.test(char)) {
        return true;
      }
      
      // 允许小数点，但只能有一个
      if (char === '.' && currentValue.indexOf('.') === -1) {
        return true;
      }
      
      // 阻止其他所有字符
      e.preventDefault();
      return false;
    },
    
    // 验证金额输入
    validateAmountInput(e, field) {
      let value = e.detail.value;
      
      // 检查是否包含非数字和小数点的字符
      const hasInvalidChars = /[^\d.]/.test(value);
      
      // 如果包含非法字符，显示错误提示并阻止输入
      if (hasInvalidChars) {
        uni.showToast({
          title: '金额格式不正确，只能输入数字和小数点',
          icon: 'none',
          duration: 2000
        });
        // 不更新值，保持原有内容让用户看到错误
        return;
      }
      
      // 移除所有非数字和小数点的字符（这里应该不会有了）
      const cleanValue = value.replace(/[^\d.]/g, '');
      
      // 确保只有一个小数点
      const dotCount = (value.match(/\./g) || []).length;
      if (dotCount > 1) {
        const firstDotIndex = value.indexOf('.');
        value = value.substring(0, firstDotIndex + 1) + value.substring(firstDotIndex + 1).replace(/\./g, '');
      }
      
      // 限制小数点后最多两位
      if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[1] && parts[1].length > 2) {
          value = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
      
      // 确保不以小数点开头
      if (value.startsWith('.')) {
        value = '0' + value;
      }
      
      // 限制整数部分不超过10位
      const parts = value.split('.');
      if (parts[0].length > 10) {
        value = parts[0].substring(0, 10) + (parts[1] ? '.' + parts[1] : '');
        uni.showToast({
          title: '金额过大',
          icon: 'none'
        });
      }
      
      // 更新值
      this.searchParams[field] = value;
    },
    
    // 失焦时验证金额
    validateAmountOnBlur(field) {
      const value = this.searchParams[field];
      if (value === '' || value === null || value === undefined) {
        return;
      }
      
      const numValue = parseFloat(value);
      
      // 确保最小金额不小于0
      if (field === 'minAmount' && numValue < 0) {
        this.searchParams.minAmount = '0';
        uni.showToast({
          title: '最小金额不能小于0',
          icon: 'none'
        });
        return;
      }
      
      // 验证是否为有效数字
      if (isNaN(numValue)) {
        this.searchParams[field] = '';
        uni.showToast({
          title: '请输入有效的金额',
          icon: 'none'
        });
        return;
      }
      
      // 格式化为两位小数
      this.searchParams[field] = numValue.toFixed(2);
    },
    
    // 初始化自定义日历时间选择器
    initCustomDateTimePicker() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      
      // 初始化年份列表（当前年往前5年，往后5年）
      this.years = [];
      for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        this.years.push(i);
      }
      
      // 初始化月份列表
      this.months = [];
      for (let i = 1; i <= 12; i++) {
        this.months.push(i);
      }
      
      // 初始化小时列表
      this.hours = [];
      for (let i = 0; i < 24; i++) {
        this.hours.push(i);
      }
      
      // 初始化分钟列表（每1分钟一个选项）
      this.minutes = [];
      for (let i = 0; i < 60; i++) {
        this.minutes.push(i);
      }
      
      // 初始化天数列表
      this.updateCustomDays(currentYear, currentMonth);
      
      // 设置默认值
      const yearIndex = this.years.findIndex(year => year === currentYear);
      const monthIndex = currentMonth - 1;
      const dayIndex = currentDay - 1;
      const hourIndex = this.hours.findIndex(hour => hour === currentHour);
      const minuteIndex = this.minutes.findIndex(minute => minute === currentMinute);
      
      this.tempDatePickerValue = [yearIndex, monthIndex, dayIndex];
      this.tempTimePickerValue = [hourIndex >= 0 ? hourIndex : 0, minuteIndex >= 0 ? minuteIndex : 0];
    },
    
    // 更新天数列表
    updateCustomDays(year, month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      this.days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.days.push(i);
      }
    },
    
    // 显示自定义日历时间选择器
    showCustomDateTimePicker(type) {
      this.currentDateTimeType = type;
      
      // 获取要设置的时间（已选择的时间或当前时间）
      const existingDateTime = type === 'start' ? this.searchParams.startDateTime : this.searchParams.endDateTime;
      let targetDate;
      
      if (existingDateTime) {
        // 如果已有选择的时间，使用选择的时间
        targetDate = new Date(existingDateTime.replace(/-/g, '/'));
      } else {
        // 如果没有选择时间，使用当前时间
        targetDate = new Date();
      }
      
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();
      const hour = targetDate.getHours();
      const minute = targetDate.getMinutes();
      
      // 确保年份在可选范围内
      const yearIndex = this.years.findIndex(y => y === year);
      const monthIndex = month - 1;
      const dayIndex = day - 1;
      const hourIndex = this.hours.findIndex(h => h === hour);
      const minuteIndex = this.minutes.findIndex(m => m === minute);
      
      // 更新天数列表
      this.updateCustomDays(year, month);
      
      // 设置选择器的值
      this.tempDatePickerValue = [
        yearIndex >= 0 ? yearIndex : Math.floor(this.years.length / 2), // 如果年份不在范围内，选择中间的年份
        monthIndex >= 0 ? monthIndex : 0,
        dayIndex >= 0 && dayIndex < this.days.length ? dayIndex : 0
      ];
      this.tempTimePickerValue = [
        hourIndex >= 0 ? hourIndex : hour,
        minuteIndex >= 0 ? minuteIndex : minute
      ];
      
      this.showCustomDateTimeModal = true;
    },
    
    // 关闭自定义日历时间选择器
    closeCustomDateTimePicker() {
      this.showCustomDateTimeModal = false;
    },
    
    // 日期变化处理
    onCustomDateChange(e) {
      const values = e.detail.value;
      this.tempDatePickerValue = [...values];
      
      // 当年月变化时，更新天数
      const year = this.years[values[0]];
      const month = this.months[values[1]];
      const currentDayIndex = values[2];
      
      // 更新天数列表
      this.updateCustomDays(year, month);
      
      // 如果当前选中的天数超过了新月份的最大天数，则重置为最后一天
      if (currentDayIndex >= this.days.length) {
        this.tempDatePickerValue[2] = this.days.length - 1;
      }
      
      // 强制更新视图
      this.$forceUpdate();
    },
    
    // 时间变化处理
    onCustomTimeChange(e) {
      const values = e.detail.value;
      this.tempTimePickerValue = [...values];
    },
    
    // 确认自定义日期时间选择
    confirmCustomDateTime() {
      const year = this.years[this.tempDatePickerValue[0]];
      const month = this.months[this.tempDatePickerValue[1]];
      const day = this.days[this.tempDatePickerValue[2]];
      const hour = this.hours[this.tempTimePickerValue[0]];
      const minute = this.minutes[this.tempTimePickerValue[1]];
      
      const selectedDate = new Date(year, month - 1, day, hour, minute);
      const dateTimeString = this.formatDateTimeString(selectedDate);
      
      // 时间范围验证
      if (this.currentDateTimeType === 'start') {
        if (this.searchParams.endDateTime && selectedDate >= new Date(this.searchParams.endDateTime)) {
          uni.showToast({
            title: '开始时间不能晚于结束时间',
            icon: 'none'
          });
          return;
        }
        this.searchParams.startDateTime = dateTimeString;
      } else {
        if (this.searchParams.startDateTime && selectedDate <= new Date(this.searchParams.startDateTime)) {
          uni.showToast({
            title: '结束时间不能早于开始时间',
            icon: 'none'
          });
          return;
        }
        this.searchParams.endDateTime = dateTimeString;
      }
      
      this.closeCustomDateTimePicker();
    },
    
    // 格式化日期时间字符串
    formatDateTimeString(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}:00`;
    },
    
    // 格式化显示的日期时间
    formatDisplayDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      try {
        // 修复iOS兼容性问题：将 "YYYY-MM-DD HH:MM:SS" 格式转换为 "YYYY/MM/DD HH:MM:SS"
        let formattedDateString = dateTimeString;
        if (dateTimeString.includes('-') && dateTimeString.includes(' ')) {
          // 将日期部分的 "-" 替换为 "/"
          const parts = dateTimeString.split(' ');
          if (parts.length >= 2) {
            const datePart = parts[0].replace(/-/g, '/');
            const timePart = parts[1];
            formattedDateString = `${datePart} ${timePart}`;
          }
        }
        
        const date = new Date(formattedDateString);
        if (isNaN(date.getTime())) {
          console.warn('日期格式无效:', dateTimeString);
          return '';
        }
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
      } catch (error) {
        console.error('格式化显示日期时间出错:', error, '原始值:', dateTimeString);
        return '';
      }
    },
    
    // 验证搜索表单
    validateSearchForm() {
      // 验证关键词长度
      if (this.searchParams.keyword && this.searchParams.keyword.length > 80) {
        uni.showToast({
          title: '关键词不能超过80个字符',
          icon: 'none',
          duration: 2000
        });
        return false;
      }
      
      // 验证金额范围
      if (this.searchParams.minAmount && this.searchParams.minAmount !== '') {
        const minAmount = parseFloat(this.searchParams.minAmount);
        if (isNaN(minAmount) || minAmount < 0) {
          uni.showToast({
            title: '最小金额格式不正确，请输入有效数字',
            icon: 'none',
            duration: 2000
          });
          return false;
        }
      }
      
      if (this.searchParams.maxAmount && this.searchParams.maxAmount !== '') {
        const maxAmount = parseFloat(this.searchParams.maxAmount);
        if (isNaN(maxAmount) || maxAmount < 0) {
          uni.showToast({
            title: '最大金额格式不正确，请输入有效数字',
            icon: 'none',
            duration: 2000
          });
          return false;
        }
      }
      
      // 验证金额范围逻辑
      if (this.searchParams.minAmount && this.searchParams.maxAmount) {
        const minAmount = parseFloat(this.searchParams.minAmount);
        const maxAmount = parseFloat(this.searchParams.maxAmount);
        if (minAmount > maxAmount) {
          uni.showToast({
            title: '最小金额不能大于最大金额',
            icon: 'none',
            duration: 2000
          });
          return false;
        }
      }
      
      // 验证时间范围
      if (this.searchParams.startDateTime && this.searchParams.endDateTime) {
        const startTime = new Date(this.searchParams.startDateTime.replace(/-/g, '/'));
        const endTime = new Date(this.searchParams.endDateTime.replace(/-/g, '/'));
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          uni.showToast({
            title: '时间格式不正确',
            icon: 'none',
            duration: 2000
          });
          return false;
        }
        if (startTime >= endTime) {
          uni.showToast({
            title: '开始时间不能晚于结束时间',
            icon: 'none',
            duration: 2000
          });
          return false;
        }
      }
      
      // 验证单独的开始时间或结束时间格式
      if (this.searchParams.startDateTime) {
        const startTime = new Date(this.searchParams.startDateTime.replace(/-/g, '/'));
        if (isNaN(startTime.getTime())) {
          uni.showToast({
            title: '开始时间格式不正确',
            icon: 'none',
            duration: 2000
          });
          return false;
        }
      }
      
      if (this.searchParams.endDateTime) {
        const endTime = new Date(this.searchParams.endDateTime.replace(/-/g, '/'));
        if (isNaN(endTime.getTime())) {
          uni.showToast({
            title: '结束时间格式不正确',
            icon: 'none',
            duration: 2000
          });
          return false;
        }
      }
      
      return true;
    },

    async searchTransactions() {
      if (!this.currentBook) return;
      
      // 验证表单
      if (!this.validateSearchForm()) {
        return;
      }
      
      try {
        this.isLoading = true;
        
        // 构建搜索参数
        const params = {
          book_id: this.currentBook.book_id,
          keyword: this.searchParams.keyword || '',  // 确保关键词为空字符串而不是undefined
          limit: 50
        };
        
        // 添加类型过滤
        if (this.searchParams.type !== 'all') {
          params.type = this.searchParams.type;
        }
        
        // 添加金额范围过滤
        if (this.searchParams.minAmount) {
          const minAmount = parseFloat(this.searchParams.minAmount);
          if (!isNaN(minAmount) && minAmount >= 0) {
            params.min_amount = minAmount;
          }
        }
        
        if (this.searchParams.maxAmount) {
          const maxAmount = parseFloat(this.searchParams.maxAmount);
          if (!isNaN(maxAmount)) {
            params.max_amount = maxAmount;
          }
        }
        
        // 添加时间范围过滤
        if (this.searchParams.startDateTime) {
          // 将datetime字符串转换为时间戳
          const startTimestamp = Math.floor(new Date(this.searchParams.startDateTime).getTime() / 1000);
          params.start_date = startTimestamp;
        }
        
        if (this.searchParams.endDateTime) {
          // 将datetime字符串转换为时间戳
          const endTimestamp = Math.floor(new Date(this.searchParams.endDateTime).getTime() / 1000);
          params.end_date = endTimestamp;
        }
        
        const result = await getTransactionsApi(params);
        
        if (result && result.list) {
          this.transactions = result.list;
          this.hasMoreTransactions = false; // 搜索结果不支持加载更多
          
          // 关闭搜索弹窗
          this.closeSearchModal();
        }
      } catch (error) {
        console.error('搜索交易失败', error);
        uni.showToast({
          title: '搜索失败',
          icon: 'error'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    
    // 跳转到记账页面
    navigateToRecord() {
      uni.switchTab({
        url: '/pages/record/index'
      });
    },
    
    // 格式化日期（YYYY-MM-DD）
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    // 格式化日期头部显示
    formatDateHeader(dateStr) {
      const today = this.formatDate(new Date());
      const yesterday = this.formatDate(new Date(Date.now() - 86400000));
      
      if (dateStr === today) {
        return '今天';
      } else if (dateStr === yesterday) {
        return '昨天';
      } else {
        const [year, month, day] = dateStr.split('-');
        return `${month}月${day}日`;
      }
    },
    
    // 获取星期
    getWeekday(dateStr) {
      const date = new Date(dateStr);
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return weekdays[date.getDay()];
    },
    
    // 格式化时间（YYYY-MM-DD HH:MM:SS）
    formatTime(timestamp) {
      if (!timestamp) return '';
      try {
        const date = new Date(timestamp * 1000);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch (error) {
        console.error('格式化时间出错:', error);
        return '';
      }
    },
    
    // 格式化金额（保留两位小数）
    formatAmount(amount) {
      if (amount === null || amount === undefined || amount === '') return '0.00';
      try {
        const num = parseFloat(amount);
        return isNaN(num) ? '0.00' : num.toFixed(2);
      } catch (error) {
        console.error('格式化金额出错:', error);
        return '0.00';
      }
    },
    
    // 格式化昵称（超过4个字符用...代替）
    formatNickname(nickname) {
      if (!nickname || typeof nickname !== 'string') return '匿名';
      try {
        if (nickname.length > 4) {
          return nickname.substring(0, 4) + '...';
        }
        return nickname;
      } catch (error) {
        console.error('格式化昵称出错:', error);
        return '匿名';
      }
    },
    
    // 获取日汇总
    getDailySummary(transactions) {
      let expense = 0;
      let income = 0;
      
      transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          expense += transaction.amount;
        } else {
          income += transaction.amount;
        }
      });
      
      return { expense, income };
    },

    // 周期记账相关方法
    async loadRecurringTransactions() {
      if (!this.currentBook) return;
      
      try {
        const result = await getRecurringTransactionsApi({
          book_id: this.currentBook.book_id
        });
        
        if (result && Array.isArray(result)) {
          this.recurringTransactions = result;
        }
      } catch (error) {
        console.error('加载周期记账数据失败', error);
      }
    },

    // 格式化周期记账执行计划
    formatRecurringSchedule(recurring) {
      const { recurring_type, recurring_hour, recurring_minute, recurring_weekday, recurring_month, recurring_day } = recurring;
      const timeStr = `${String(recurring_hour).padStart(2, '0')}:${String(recurring_minute).padStart(2, '0')}`;
      
      switch (recurring_type) {
        case 'daily':
          return `每天 ${timeStr}`;
        case 'weekly':
          const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
          return `每${weekdays[recurring_weekday]} ${timeStr}`;
        case 'monthly':
          if (recurring_month) {
            return `每年${recurring_month}月${recurring_day}日 ${timeStr}`;
          } else {
            return `每月${recurring_day}日 ${timeStr}`;
          }
        default:
          return '未知计划';
      }
    },

    // 确认删除周期记账
    confirmDeleteRecurring(recurring) {
      this.recurringToDelete = recurring;
      this.showDeleteConfirmModal = true;
    },


    // Tab切换方法
    switchTab(tab) {
      this.currentTab = tab;
    },

    // 获取删除确认消息
    getDeleteMessage() {
      if (this.recurringToDelete) {
        return `您确定要删除周期记账"${this.recurringToDelete.name}"吗？删除后无法恢复，该规则将不再自动执行。`;
      } else if (this.transactionToDelete) {
        return '您确定要删除这笔账单吗？删除后无法恢复。';
      }
      return '您确定要删除吗？删除后无法恢复。';
    }
  },
  
  // 分享到好友
  onShareAppMessage() {
    return {
      title: '有人拍了拍你：快来一起记账，管理你的每一笔支出！',
      path: '/pages/home/index',
      imageUrl: '/static/images/share-cover.png'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '有人拍了拍你：时光账记，记录生活每一笔',
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

.custom-navbar {
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-light 100%);
  padding-left: 30rpx;
  padding-right: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.navbar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.navbar-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-bold;
  color: $color-text-inverse;
  letter-spacing: 2rpx;
}

.book-selector {
  position: relative;
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
  
  .uni-icons {
    opacity: 0.9;
  }
}

.selector-label {
  font-size: $font-size-small;
  color: $color-text-inverse;
  font-weight: $font-weight-medium;
}

.book-switcher {
  padding: $spacing-xs 20rpx;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 154, 90, 0.2);
  box-shadow: $shadow-light;
  transition: all 0.3s ease;
}

.book-switcher:active {
  background-color: rgba(255, 255, 255, 0.3);
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
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-text-inverse;
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

.switcher-hint {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.tap-hint {
  font-size: $font-size-xs;
  color: $color-text-secondary;
  font-weight: $font-weight-semibold;
}

.switcher-tooltip {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12rpx;
  background: rgba(255, 154, 90, 0.9);
  color: $color-text-inverse;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  z-index: 10;
  max-width: 400rpx;
  animation: fadeIn 0.3s;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.tooltip-arrow {
  position: absolute;
  top: -16rpx;
  right: 40rpx;
  width: 0;
  height: 0;
  border-left: 16rpx solid transparent;
  border-right: 16rpx solid transparent;
  border-bottom: 16rpx solid rgba(255, 154, 90, 0.9);
}

.tooltip-close {
  position: absolute;
  top: 6rpx;
  right: 10rpx;
  font-size: $font-size-xs;
  color: $color-text-inverse;
  font-weight: $font-weight-semibold;
}

/* 背景墙 */
.background-wall {
  height: 400rpx;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: $color-text-inverse;
  box-sizing: border-box;
  margin-bottom: $spacing-md;
  position: relative;
}

.background-wall::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4));
  z-index: 1;
}

.countdown-container {
  width: 100%;
  height: 80rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
  position: relative;
  z-index: 2;
}

.countdown-swiper {
  height: 100%;
  width: 100%;
}

.countdown-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-content {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border-radius: 40rpx;
  padding: 10rpx 30rpx;
}

.countdown-text {
  font-size: $font-size-h4;
  font-weight: $font-weight-semibold;
  color: $color-text-inverse;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
}

.nearest-event {
  z-index: 2;
  text-align: center;
  margin-top: 40rpx;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-text {
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: $color-text-inverse;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
  letter-spacing: 2rpx;
}

.background-tip {
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 30rpx;
  padding: 8rpx 16rpx;
  margin-top: auto;
  margin-left: auto;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
}

.background-tip text {
  font-size: $font-size-xs;
  color: $color-text-inverse;
}

/* 预算进度条 */
.budget-section {
  padding: 30rpx 20rpx;
  background: $color-bg-primary;
  margin: 0 20rpx $spacing-md 20rpx;
  border-radius: $border-radius-md;
  box-shadow: $shadow-normal;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.budget-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.budget-amount {
  font-size: $font-size-body;
  color: $color-text-secondary;
  background: $color-bg-tertiary;
  padding: 6rpx $spacing-sm;
  border-radius: 20rpx;
}

.budget-progress-container {
  position: relative;
}

.budget-progress-bg {
  height: 18rpx;
  background: $color-bg-tertiary;
  border-radius: $border-radius-md;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.budget-progress-bar {
  height: 100%;
  border-radius: 12rpx;
  position: absolute;
  left: 0;
  top: 0;
  min-width: 4rpx;
  transition: width 0.5s ease, background-color 0.5s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  animation: pulse 2s infinite;
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent);
  background-size: 40rpx 40rpx;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.budget-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10rpx;
}

.budget-percentage {
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.budget-remaining {
  font-size: $font-size-small;
  color: $color-text-secondary;
}

/* 概览信息 */
.summary-section {
  padding: 30rpx 20rpx;
  background: $color-bg-primary;
  margin: 0 20rpx $spacing-md 20rpx;
  border-radius: $border-radius-md;
  box-shadow: $shadow-normal;
}

/* Tab切换样式 */
.tab-section {
  background: $color-bg-primary;
  margin: 0 20rpx $spacing-md 20rpx;
  border-radius: $border-radius-md;
  box-shadow: $shadow-normal;
  overflow: hidden;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20rpx;
  border-bottom: 1rpx solid $color-border-light;
}

.tab-nav {
  display: flex;
  align-items: center;
}

.tab-item {
  position: relative;
  padding: 24rpx 0;
  margin-right: 40rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.tab-text {
  font-size: $font-size-h3;
  color: $color-text-secondary;
  font-weight: $font-weight-semibold;
  transition: color 0.3s ease;
}

.tab-item.active .tab-text {
  color: $color-text-primary;
  font-weight: $font-weight-bold;
}

.tab-badge {
  background: $color-error;
  color: $color-text-inverse;
  font-size: $font-size-xs;
  padding: 2rpx $spacing-xs;
  border-radius: 10rpx;
  min-width: 32rpx;
  text-align: center;
  line-height: 1.2;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: $color-success;
  border-radius: 2rpx;
}

.tab-content {
  min-height: 400rpx;
}

.transactions-content {
  padding: 0;
}

.recurring-content {
  padding: 20rpx;
}

/* 周期记账样式 */

.recurring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.recurring-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.recurring-count {
  font-size: $font-size-body;
  color: $color-text-secondary;
  background: $color-border-light;
  padding: 4rpx 12rpx;
  border-radius: $border-radius-md;
}

.recurring-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.recurring-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-sm;
  box-shadow: $shadow-light;
  transition: all 0.3s ease;
}

.recurring-item:active {
  background: $color-bg-secondary;
  transform: scale(0.98);
}

.recurring-item.income-item {
  border-left: 4rpx solid $color-success;
}

.recurring-tag {
  width: 80rpx;
  height: 80rpx;
  border-radius: $border-radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-sm;
  flex-shrink: 0;
  box-shadow: $shadow-light;
}

.recurring-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.recurring-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.recurring-info {
  flex: 1;
}

.recurring-name {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin-bottom: 4rpx;
}

.recurring-remark {
  font-size: $font-size-small;
  color: $color-text-secondary;
  margin-top: 4rpx;
  display: block;
}

.recurring-amount {
  font-size: $font-size-h3;
  font-weight: $font-weight-bold;
  color: $color-error;
  margin-left: $spacing-sm;
  white-space: nowrap;
}

.recurring-amount.income-amount {
  color: $color-success;
}

.recurring-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.recurring-schedule-info {
  display: flex;
  align-items: center;
  font-size: $font-size-small;
}

.schedule-label {
  color: $color-text-tertiary;
  margin-right: 4rpx;
}

.schedule-text {
  color: $color-primary;
  font-weight: $font-weight-medium;
}

.recurring-actions {
  margin-left: 16rpx;
  flex-shrink: 0;
}

.recurring-actions .delete-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-tertiary;
  transition: all 0.3s ease;
}

.delete-btn:active {
  background: #FFE6E6;
  transform: scale(0.95);
}

/* 删除确认弹窗样式 */
.delete-modal {
  max-width: 600rpx;
}

.delete-message {
  font-size: $font-size-body;
  color: $text-primary;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.delete-warning {
  font-size: $font-size-xs;
  color: #FF6B6B;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  border-top: 1rpx solid #F0F0F0;
}

.btn-cancel {
  @extend .btn-small-secondary;
  flex: 1;
}

.btn-cancel:active {
  background: #E8E8E8;
}

.btn-delete {
  @extend .btn-small-danger;
  flex: 1;
}

.btn-delete:active {
  background: #FF5252;
}

/* 空状态样式 */
.empty-recurring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
  min-height: 360rpx;
}

.empty-recurring .empty-text {
  font-size: $font-size-body;
  color: $text-secondary;
  margin-bottom: 40rpx;
  display: block;
}

.btn-add-recurring {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: #FFFFFF;
  border: none;
  border-radius: 50rpx;
  font-size: $font-size-h4;
  font-weight: $font-weight-bold;
  padding: 20rpx 48rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  min-width: 200rpx;
  height: 80rpx;
}

.btn-add-recurring:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.2);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.summary-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.summary-date {
  font-size: $font-size-body;
  color: $text-secondary;
  background: #F5F5F5;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.summary-cards {
  display: flex;
  gap: 16rpx;
}

.summary-card {
  flex: 1;
  background: #F9F9F9;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.expense-card {
  border-left: 4rpx solid #FF6B6B;
}

.income-card {
  border-left: 4rpx solid #4CAF50;
}

.balance-card {
  border-left: 4rpx solid #2196F3;
}

.card-title {
  font-size: $font-size-body;
  color: $text-secondary;
  margin-bottom: 8rpx;
}

.card-amount {
  font-size: $font-size-h3;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

/* 交易列表部分 */
.transactions-section {
  padding: 20rpx;
  background: #FFFFFF;
  border-radius: 16rpx 16rpx 0 0;
  margin-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

.transaction-scroll {
  height: calc(100vh - 800rpx);
  width: 100%;
  overflow: hidden;
  border-radius: 16rpx;
  /* Add a subtle indicator to show it's scrollable */
  border-bottom: 4rpx solid #F5F5F5;
}

.transaction-list {
  padding: 10rpx 0;
}

.transaction-group {
  margin-bottom: 30rpx;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  margin-bottom: 10rpx;
  border-radius: 12rpx;
  background: #F9F9F9;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.date-header-left {
  display: flex;
  flex-direction: column;
}

.date-text {
  font-size: $font-size-h4;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.date-weekday {
  font-size: $font-size-xs;
  color: $text-secondary;
  margin-top: 4rpx;
}

.date-header-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.date-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.expense-text {
  font-size: $font-size-body;
  color: #FF6B6B;
}

.income-text {
  font-size: $font-size-body;
  color: #4CAF50;
}

.day-transactions {
  padding: 10rpx 0;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 20rpx 16rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  background: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  flex-wrap: nowrap;
}

.transaction-item:active {
  background: #F9F9F9;
}

.income-item {
  border-left: 4rpx solid #4CAF50;
}

.transaction-tag {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.transaction-content {
  flex: 1;
  margin-right: 16rpx;
  min-width: 0; /* Prevent flex item from overflowing */
}

.transaction-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.transaction-info {
  display: flex;
  flex-direction: column;
}

.transaction-name {
  font-size: $font-size-h4;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.transaction-remark {
  font-size: $font-size-body;
  color: $text-secondary;
}

.transaction-amount {
  font-size: $font-size-h3;
  font-weight: $font-weight-bold;
  color: #FF6B6B;
  margin-right: 10rpx;
  white-space: nowrap;
}

.income-amount {
  color: #4CAF50;
}

.transaction-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-user {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.user-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
}

.user-nickname {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.transaction-time {
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.transaction-actions {
  display: flex;
  margin-left: 10rpx;
  z-index: 5;
}

.action-buttons {
  display: flex;
  gap: 10rpx;
}

.edit-btn, .delete-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:active {
  background: #E8F5E9;
}

.delete-btn:active {
  background: #FFE8E8;
}

/* 加载更多 */
.load-more, .no-more {
  text-align: center;
  padding: 30rpx 0;
}

.bottom-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 10rpx 30rpx;
}

.bottom-line .line {
  height: 1px;
  background: #DDDDDD;
  flex: 1;
}

.bottom-line text {
  font-size: 24rpx;
  color: #999999;
  white-space: nowrap;
}

.loading-text {
  font-size: 26rpx;
  color: $text-secondary;
}

/* 空状态 */
.empty-transactions {
  padding: 60rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 30rpx;
  display: block;
}

.btn-add-record {
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  border-radius: 50rpx;
  font-size: 30rpx;
  font-weight: 600;
  padding: 20rpx 48rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(255, 154, 90, 0.3);
  border: none;
  transition: all 0.3s ease;
  min-width: 200rpx;
  height: 80rpx;
}

.btn-add-record:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

/* 搜索弹窗 */
.search-modal {
  max-height: 85vh;
  overflow-y: auto;
}

.search-form {
  padding: 20rpx 0;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.form-label {
  font-size: 26rpx;
  color: #333333;
  font-weight: 600;
  display: block;
}

.char-count {
  font-size: 24rpx;
  color: #999999;
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

.type-selector {
  display: flex;
  gap: 16rpx;
}

.type-option {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666666;
}

.type-option.active {
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

.amount-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.datetime-range {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.datetime-picker-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.datetime-label {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.custom-datetime-input {
  width: 100%;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  border: 1rpx solid #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.custom-datetime-input:active {
  background: rgba(255, 154, 90, 0.1);
  border-color: #FF9A5A;
}

.datetime-display {
  font-size: 28rpx;
  color: #333333;
  flex: 1;
}

.datetime-display:empty::before {
  content: attr(placeholder);
  color: #999999;
}

/* 自定义日历时间选择器弹窗样式 */
.custom-datetime-modal {
  max-height: 85vh;
  border-radius: 24rpx 24rpx 0 0;
}

.custom-datetime-body {
  padding: 0;
  max-height: 65vh;
  overflow-y: auto;
}

.date-section, .time-section {
  padding: 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.time-section {
  border-bottom: none;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
  text-align: center;
}

.date-picker-view, .time-picker-view {
  height: 300rpx;
  background: #FFFFFF;
  border-radius: 12rpx;
  overflow: hidden;
}

.picker-item {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  transition: all 0.2s ease;
}

/* picker-view 指示器样式 */
.date-picker-view ::v-deep .uni-picker-view-indicator,
.time-picker-view ::v-deep .uni-picker-view-indicator {
  background: linear-gradient(135deg, rgba(255, 154, 90, 0.1), rgba(255, 209, 102, 0.1));
  border-top: 2rpx solid #FF9A5A;
  border-bottom: 2rpx solid #FF9A5A;
  border-radius: 8rpx;
}

/* picker-view 遮罩样式 */
.date-picker-view ::v-deep .uni-picker-view-mask,
.time-picker-view ::v-deep .uni-picker-view-mask {
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(255, 255, 255, 0.6) 40%, 
    rgba(255, 255, 255, 0) 50%, 
    rgba(255, 255, 255, 0.6) 60%, 
    rgba(255, 255, 255, 0.9) 100%);
}

/* 确认和取消按钮样式 */
.custom-datetime-modal .btn-cancel {
  flex: 1;
  height: 88rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  color: #666666;
  border: none;
  margin-right: 20rpx;
}

.custom-datetime-modal .btn-confirm {
  flex: 1;
  height: 88rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.3);
}

.amount-input {
  flex: 1;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
  text-align: center;
}

.range-separator {
  font-size: 28rpx;
  color: #999999;
}

.btn-reset, .btn-search {
  flex: 1;
  height: 88rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 15rpx;
}

.btn-reset {
  background: #FFFFFF;
  color: #666666;
  border: 1rpx solid #DDDDDD;
}

.btn-search {
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

/* 删除确认弹窗 - 从底部弹出样式 */
.delete-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.delete-confirm-content {
  width: 100%;
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.delete-confirm-header {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  background: #FFFFFF;
}

.confirm-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #FFE8E8, #FFEBEB);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.2);
}

.confirm-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
  text-align: center;
  margin-bottom: 24rpx;
  display: block;
}

.confirm-message {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
  margin-bottom: 0;
  display: block;
  line-height: 1.6;
  padding: 0 20rpx;
}

.delete-confirm-footer {
  padding: 30rpx 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  background: #F8F9FA;
  border-top: 1rpx solid #F0F0F0;
  display: flex;
  gap: 20rpx;
}

.delete-confirm-footer .btn-cancel {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  color: #666666;
  border: 2rpx solid #E5E5E5;
  transition: all 0.3s ease;
}

.delete-confirm-footer .btn-cancel:active {
  background: #EEEEEE;
  transform: scale(0.98);
}

.delete-confirm-footer .btn-delete {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF6B6B, #FF5252);
  color: #FFFFFF;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.delete-confirm-footer .btn-delete:active {
  background: linear-gradient(135deg, #FF5252, #FF4444);
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.4);
}

/* 模态框 */
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

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-top: 1px solid #F5F5F5;
}

.search-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  padding: 30rpx 24rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.1);
  border-top: 1rpx solid #F0F0F0;
  margin-top: 20rpx;
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
