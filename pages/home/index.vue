<template>
  <view class="page-container">
    <!-- 账本选择器 -->
    <view class="book-selector">
      <view class="book-selector-header">
        <view class="selector-left">
          <uni-icons type="wallet" size="20" color="#FF9A5A"></uni-icons>
          <text class="selector-label">当前账本</text>
        </view>
        <view class="book-switcher" @click="showBookPicker">
          <view class="switcher-inner">
            <text class="current-book-name">{{ currentBook?.name || '未选择' }}</text>
            <uni-icons type="arrowdown" size="16" color="#FF9A5A"></uni-icons>
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
    
    <!-- 交易时间轴 -->
    <view class="transactions-section">
      <view class="section-header">
        <text class="section-title">账单记录</text>
        <view class="header-actions">
          <view class="search-btn" @click="showSearchModal">
            <uni-icons type="search" size="18" color="#666666"></uni-icons>
          </view>
        </view>
      </view>
      
      <!-- 下拉刷新、上拉加载更多 -->
      <scroll-view 
        class="transaction-scroll" 
        scroll-y 
        @scrolltolower="loadMoreTransactions"
        @refresherrefresh="refreshTransactions"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
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
                    <text class="transaction-time">{{ formatTime(transaction.timestamp) }}</text>
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
          <image src="/static/images/empty-state.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">暂无账单记录</text>
          <button class="btn-add-record" @click="navigateToRecord">立即记账</button>
        </view>
      </scroll-view>
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
              <text class="form-label">关键词</text>
              <input 
                type="text" 
                v-model="searchParams.keyword" 
                class="form-input"
                placeholder="标签或备注关键词"
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
                  type="digit" 
                  v-model="searchParams.minAmount" 
                  class="amount-input"
                  placeholder="最小金额"
                />
                <text class="range-separator">-</text>
                <input 
                  type="digit" 
                  v-model="searchParams.maxAmount" 
                  class="amount-input"
                  placeholder="最大金额"
                />
              </view>
            </view>
            
            <!-- 时间范围 -->
            <view class="form-item">
              <text class="form-label">时间范围</text>
              <view class="date-range">
                <view class="date-picker-input" @click="showStartDatePicker">
                  <text>{{ searchParams.startDate ? formatDate(new Date(searchParams.startDate * 1000)) : '开始日期' }}</text>
                  <uni-icons type="calendar" size="16" color="#666666"></uni-icons>
                </view>
                <text class="range-separator">-</text>
                <view class="date-picker-input" @click="showEndDatePicker">
                  <text>{{ searchParams.endDate ? formatDate(new Date(searchParams.endDate * 1000)) : '结束日期' }}</text>
                  <uni-icons type="calendar" size="16" color="#666666"></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-reset" @click="resetSearch">重置</button>
          <button class="btn-search" @click="searchTransactions">搜索</button>
        </view>
      </view>
    </view>
    
    <!-- 日期选择器弹窗 -->
    <view v-if="showDatePickerModal" class="modal-mask" @click="closeDatePicker">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择{{ datePickerType === 'start' ? '开始' : '结束' }}日期</text>
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
    
    <!-- 删除确认弹窗 -->
    <view v-if="showDeleteConfirmModal" class="modal-mask" @click="cancelDeleteTransaction">
      <view class="modal-content delete-confirm-modal" @click.stop>
        <view class="modal-body">
          <view class="confirm-icon">
            <uni-icons type="help" size="32" color="#FF6B6B"></uni-icons>
          </view>
          <text class="confirm-title">确认删除</text>
          <text class="confirm-message">您确定要删除这笔账单吗？删除后无法恢复。</text>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="cancelDeleteTransaction">取消</button>
          <button class="btn-delete" @click="deleteTransaction">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAccountBooks, getCurrentBook, setCurrentBook, restoreAccountBookState } from '@/utils/account-book.js';
import { 
  getAccountBooksApi, 
  getTransactionsApi, 
  getTransactionStats,
  deleteTransactionApi,
  getFestivalsApi,
  getBudgetApi
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
      showSwitcherTooltip: true,
      
      // 背景墙相关
      customBackground: null,
      defaultBackground: '/static/images/default-background.jpg',
      
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
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      hasMoreTransactions: true,
      lastTransactionId: null,
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
        startDate: null,
        endDate: null
      },
      
      // 日期选择器
      showDatePickerModal: false,
      datePickerType: 'start', // 'start' or 'end'
      years: [],
      months: [],
      days: [],
      datePickerValue: [0, 0, 0],
      tempDatePickerValue: [0, 0, 0]
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
        const date = this.formatDate(new Date(transaction.timestamp * 1000));
        
        if (!groups[date]) {
          groups[date] = [];
        }
        
        groups[date].push(transaction);
      });
      
      // 按日期降序排序
      const sortedGroups = {};
      Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
        sortedGroups[date] = groups[date];
      });
      
      return sortedGroups;
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
      if (this.budgetPercentage < 50) {
        return 'linear-gradient(90deg, #4CAF50, #8BC34A)'; // 绿色
      } else if (this.budgetPercentage < 80) {
        return 'linear-gradient(90deg, #FFC107, #FFD54F)'; // 黄色
      } else {
        return 'linear-gradient(90deg, #FF5252, #FF8A80)'; // 红色
      }
    }
  },

  onShow() {
    this.initBooks();
  },

  onLoad() {
    // 初始化日期选择器
    this.initDatePicker();
    
    // 加载自定义背景
    this.loadCustomBackground();
    
    // 加载节日和纪念日
    this.loadEvents();
    
    // 加载预算
    this.loadBudget();
    
    // 检查是否需要显示提示
    this.checkSwitcherTooltip();
  },
  
  methods: {
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
          
          // 加载交易数据
          if (this.currentBook) {
            this.loadTransactions();
            this.loadMonthStats();
          }
        }
      } catch (error) {
        console.error('初始化账本失败', error);
      }
    },
    
    // 背景墙相关方法
    loadCustomBackground() {
      // 从本地存储加载自定义背景
      try {
        const savedBackground = uni.getStorageSync('customBackground');
        if (savedBackground) {
          this.customBackground = savedBackground;
        }
      } catch (error) {
        console.error('加载自定义背景失败', error);
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
              success: (res) => {
                const tempFilePath = res.tempFilePaths[0];
                this.customBackground = tempFilePath;
                
                // 保存到本地存储
                uni.setStorageSync('customBackground', tempFilePath);
              }
            });
          } else if (res.tapIndex === 1) {
            // 恢复默认背景
            this.customBackground = null;
            uni.removeStorageSync('customBackground');
          }
        }
      });
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
        if (budgetData && budgetData.amount) {
          this.budget = budgetData.amount;
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
        this.lastTransactionId = null;
        
        const result = await getTransactionsApi({
          book_id: this.currentBook.book_id,
          limit: 20,
          cursor: null
        });
        
        if (result && result.list) {
          this.transactions = result.list;
          
          // 设置最后一条交易的ID作为游标
          if (result.list.length > 0) {
            this.lastTransactionId = result.list[result.list.length - 1].transaction_id;
          }
          
          // 判断是否还有更多数据
          this.hasMoreTransactions = result.has_more;
          
          // 默认展开最近一天的交易
          if (this.transactions.length > 0) {
            const latestDate = this.formatDate(new Date(this.transactions[0].timestamp * 1000));
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
        
        const result = await getTransactionsApi({
          book_id: this.currentBook.book_id,
          limit: 20,
          cursor: this.lastTransactionId
        });
        
        if (result && result.list && result.list.length > 0) {
          // 将新数据添加到列表中
          this.transactions = [...this.transactions, ...result.list];
          
          // 更新游标
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
          limit: 20,
          cursor: null
        });
        
        if (result && result.list) {
          this.transactions = result.list;
          
          // 重置游标和加载状态
          if (result.list.length > 0) {
            this.lastTransactionId = result.list[result.list.length - 1].transaction_id;
          } else {
            this.lastTransactionId = null;
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
          icon: 'none'
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
      uni.navigateTo({
        url: `/pages/record/index?transaction_id=${transaction.transaction_id}&edit=true`
      });
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
    },
    
    // 删除交易
    async deleteTransaction() {
      if (!this.transactionToDelete) return;
      
      try {
        await deleteTransactionApi(this.transactionToDelete.transaction_id);
        
        // 从列表中移除该交易
        this.transactions = this.transactions.filter(
          t => t.transaction_id !== this.transactionToDelete.transaction_id
        );
        
        // 关闭弹窗
        this.showDeleteConfirmModal = false;
        this.transactionToDelete = null;
        
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
          icon: 'none'
        });
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
      this.resetSearch();
      this.showSearchModalFlag = true;
    },
    
    closeSearchModal() {
      this.showSearchModalFlag = false;
    },
    
    resetSearch() {
      this.searchParams = {
        keyword: '',
        type: 'all',
        minAmount: '',
        maxAmount: '',
        startDate: null,
        endDate: null
      };
    },
    
    async searchTransactions() {
      if (!this.currentBook) return;
      
      try {
        this.isLoading = true;
        
        // 构建搜索参数
        const params = {
          book_id: this.currentBook.book_id,
          keyword: this.searchParams.keyword || undefined,
          limit: 50
        };
        
        // 添加类型过滤
        if (this.searchParams.type !== 'all') {
          params.type = this.searchParams.type;
        }
        
        // 添加金额范围过滤
        if (this.searchParams.minAmount) {
          params.min_amount = parseFloat(this.searchParams.minAmount);
        }
        
        if (this.searchParams.maxAmount) {
          params.max_amount = parseFloat(this.searchParams.maxAmount);
        }
        
        // 添加时间范围过滤
        if (this.searchParams.startDate) {
          params.start_date = this.searchParams.startDate;
        }
        
        if (this.searchParams.endDate) {
          params.end_date = this.searchParams.endDate;
        }
        
        const result = await getTransactionsApi(params);
        
        if (result && result.list) {
          this.transactions = result.list;
          this.hasMoreTransactions = false; // 搜索结果不支持加载更多
          
          // 关闭搜索弹窗
          this.closeSearchModal();
          
          // 显示搜索结果提示
          uni.showToast({
            title: `找到 ${result.list.length} 条记录`,
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('搜索交易失败', error);
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
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
    
    showStartDatePicker() {
      this.datePickerType = 'start';
      this.showDatePickerModal = true;
    },
    
    showEndDatePicker() {
      this.datePickerType = 'end';
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
      
      const selectedDate = new Date(year, month - 1, day);
      const timestamp = Math.floor(selectedDate.getTime() / 1000);
      
      if (this.datePickerType === 'start') {
        this.searchParams.startDate = timestamp;
      } else {
        this.searchParams.endDate = timestamp;
      }
      
      this.closeDatePicker();
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
    
    // 格式化时间（HH:MM）
    formatTime(timestamp) {
      const date = new Date(timestamp * 1000);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    
    // 格式化金额（保留两位小数）
    formatAmount(amount) {
      return parseFloat(amount).toFixed(2);
    },
    
    // 格式化昵称（超过4个字符用...代替）
    formatNickname(nickname) {
      if (nickname.length > 4) {
        return nickname.substring(0, 4) + '...';
      }
      return nickname;
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

.book-switcher {
  background: #F5F5F5;
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
  display: flex;
  align-items: center;
  position: relative;
  border: 1rpx solid #EEEEEE;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.switcher-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10rpx;
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

.switcher-hint {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.tap-hint {
  font-size: 22rpx;
  color: #FF9A5A;
  font-weight: 500;
}

.switcher-tooltip {
  position: absolute;
  top: 100rpx;
  right: 30rpx;
  background: rgba(0, 0, 0, 0.7);
  color: #FFFFFF;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  z-index: 10;
  max-width: 400rpx;
  animation: fadeIn 0.3s;
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
  border-bottom: 16rpx solid rgba(0, 0, 0, 0.7);
}

.tooltip-close {
  position: absolute;
  top: 6rpx;
  right: 10rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: bold;
}

/* 背景墙 */
.background-wall {
  position: relative;
  height: 400rpx;
  width: 100%;
  overflow: hidden;
  background-image: url('/static/images/default-background.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 30rpx;
  box-sizing: border-box;
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
  position: relative;
  z-index: 2;
  height: 80rpx;
  overflow: hidden;
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
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 500;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
}

.nearest-event {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 60rpx;
}

.event-text {
  color: #FFFFFF;
  font-size: 40rpx;
  font-weight: 700;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
  letter-spacing: 2rpx;
}

.background-tip {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 30rpx;
  padding: 8rpx 16rpx;
}

.background-tip text {
  color: #FFFFFF;
  font-size: 22rpx;
}

/* 预算进度条 */
.budget-section {
  padding: 30rpx 20rpx;
  background: #FFFFFF;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.budget-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.budget-amount {
  font-size: 28rpx;
  color: $text-secondary;
  background: #F5F5F5;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.budget-progress-container {
  position: relative;
}

.budget-progress-bg {
  height: 30rpx;
  background: #F5F5F5;
  border-radius: 15rpx;
  overflow: hidden;
  position: relative;
}

.budget-progress-bar {
  height: 100%;
  border-radius: 15rpx;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.5s ease, background-color 0.5s ease;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
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
  font-size: 24rpx;
  font-weight: 600;
  color: $text-primary;
}

.budget-remaining {
  font-size: 24rpx;
  color: $text-secondary;
}

/* 概览部分 */
.summary-section {
  padding: 30rpx 20rpx;
  background: #FFFFFF;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.summary-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.summary-date {
  font-size: 24rpx;
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
  font-size: 24rpx;
  color: $text-secondary;
  margin-bottom: 8rpx;
}

.card-amount {
  font-size: 32rpx;
  font-weight: 600;
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
  font-size: 32rpx;
  font-weight: 600;
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
  font-size: 26rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

.transaction-scroll {
  height: calc(100vh - 800rpx);
  width: 100%;
  position: relative;
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
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.date-weekday {
  font-size: 22rpx;
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
  font-size: 24rpx;
  color: #FF6B6B;
}

.income-text {
  font-size: 24rpx;
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
  position: relative;
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
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.transaction-remark {
  font-size: 24rpx;
  color: $text-secondary;
}

.transaction-amount {
  font-size: 32rpx;
  font-weight: 600;
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
  font-size: 22rpx;
  color: $text-secondary;
}

.transaction-time {
  font-size: 22rpx;
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

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
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
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  padding: 16rpx 40rpx;
  display: inline-block;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
  border: none;
}

/* 搜索弹窗 */
.search-modal {
  max-height: 80vh;
}

.search-form {
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

.amount-range, .date-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
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

.date-picker-input {
  flex: 1;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-reset, .btn-search {
  flex: 1;
  height: 88rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-reset {
  background: #F5F5F5;
  color: #666666;
}

.btn-search {
  background: linear-gradient(135deg, #FF9A5A, #FFD166);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

/* 删除确认弹窗 */
.delete-confirm-modal {
  width: 80%;
  border-radius: 16rpx;
}

.confirm-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #FFE8E8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30rpx;
}

.confirm-title {
  font-size: 36rpx;
  font-weight: 600;
  color: $text-primary;
  text-align: center;
  margin-bottom: 20rpx;
  display: block;
}

.confirm-message {
  font-size: 28rpx;
  color: $text-secondary;
  text-align: center;
  margin-bottom: 30rpx;
  display: block;
  line-height: 1.5;
}

.btn-delete {
  flex: 1;
  height: 88rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FF6B6B;
  color: #FFFFFF;
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
