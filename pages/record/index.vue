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
            :class="{ active: selectedTagId === tag.tag_id, 'custom-tag-item': !tag.is_system }"
            :style="{ backgroundColor: selectedTagId === tag.tag_id ? tag.color : '#F5F5F5' }"
            @click="selectTag(tag)"
            @longpress="!tag.is_system && showTagActions(tag)"
          >
            <!-- 自定义标签标识 -->
            <view v-if="!tag.is_system" class="custom-tag-badge"></view>
            
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
          <view class="tag-item custom-tag" @click="openCustomTagModal">
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
			<!-- 这里可以将 class type-option 设置成 recurring-type-btn 就更换成了另外一种样式 -->
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
        <button v-if="!isEdit" class="btn-clear" @click="clearInput">一键清空</button>
        <button class="btn-save" :loading="isSaving" :disabled="isSaving" @click="saveTransaction">保存</button>
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
    
    <!-- 修改标签弹窗 -->
    <view v-if="showEditTagModal" class="modal-mask" @click="closeEditTagModal">
      <view class="modal-content custom-tag-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">修改标签</text>
          <view class="close-btn" @click="closeEditTagModal">✕</view>
        </view>
        <view class="modal-body">
          <view class="custom-tag-form">
            <view class="form-item">
              <text class="form-label">标签名称</text>
              <input 
                type="text" 
                v-model="editTagName" 
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
                  :class="{ active: editTagColor === color }"
                  @click="editTagColor = color"
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
                  :class="{ active: editTagIcon === icon }"
                  @click="editTagIcon = icon"
                >
                  <uni-icons :type="icon" size="24" color="#666666"></uni-icons>
                </view>
              </view>
            </view>
            
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeEditTagModal">取消</button>
          <button class="btn-confirm" :loading="isSavingTag" :disabled="isSavingTag" @click="saveEditTag">保存</button>
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
          <button class="btn-confirm" :loading="isSavingTag" :disabled="isSavingTag" @click="saveCustomTag">保存</button>
        </view>
      </view>
    </view>
    
    <!-- 删除标签确认弹窗 -->
    <view v-if="showDeleteTagModal" class="delete-tag-modal-mask" @click="closeDeleteTagModal">
      <view class="delete-tag-confirm-content" @click.stop>
        <view class="delete-tag-confirm-header">
          <view class="delete-tag-confirm-icon">
            <text style="font-size: 60rpx; color: #FF6B6B;">?</text>
          </view>
          <text class="delete-tag-confirm-title">确认删除</text>
          <text class="delete-tag-confirm-message">确定要删除标签"{{ tagToDelete?.name }}"吗？</text>
          <text class="delete-tag-confirm-warning">删除后无法恢复，使用该标签的记录不会受到影响。</text>
        </view>
        <view class="delete-tag-confirm-footer">
          <button class="delete-tag-btn-cancel" @click="closeDeleteTagModal">取消</button>
          <button class="delete-tag-btn-delete" @click="deleteTag">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { checkLoginStatus } from '@/utils/auth.js';
import { 
  getAccountBooksApi, 
  getTagsApi, 
  addTagApi, 
  updateTagApi,
  deleteTagApi,
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
      hasShownNoBookModal: false,
      showBookPickerModal: false,
      
      // 交易类型
      isEdit: false,
      transactionType: 'expense', // expense, income
      amount: '',
      remark: '',
      selectedDate: new Date(),
      selectedTagId: null,
      
      // 标签相关
      tags: [],
      showCustomTagModal: false,
      customTagName: '',
      customTagColor: '#FF9A5A',
      customTagIcon: 'home',
      showDeleteTagModal: false,
      tagToDelete: null,
      showEditTagModal: false,
      editTagId: null,
      editTagName: '',
      editTagColor: '#FF9A5A',
      editTagIcon: 'home',
      isSaving: false,
      isSavingTag: false,
      tagColors: [
        '#FF9A5A', '#F44336', '#E91E63', '#9C27B0', '#673AB7',
        '#3F51B5', '#03A9F4', '#00BCD4', '#009688',
        '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800',
        '#FF5722', '#795548', '#607D8B', '#FF6B9D', '#BA68C8',
        '#7E57C2', '#5C6BC0', '#42A5F5'
      ],
      tagIcons: [
        'home', 'shop', 'cart', 'calendar', 'camera', 'chat',
        'gift', 'wallet', 'heart', 'star', 'phone', 'paperclip',
        'email', 'sound', 'videocam', 'fire', 'medal', 'navigate',
        'flag', 'chatboxes', 'chatbubble', 'circle', 'spinner-cycle', 
		'color', 'email', 'eye', 'folder-add', 'headphones', 'mic',
        'medal', 'staff', 'gear', 'hand-up', 'paperplane', 'vip', 'more'
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
    // 检查登录状态
    if (!checkLoginStatus('/pages/record/index')) {
      return;
    }

    // 每次进入页面都允许再次提示（但同一次 onShow 周期内只弹一次）
    this.hasShownNoBookModal = false;
    
    // 每次显示页面时重新加载账本和标签
    this.initBooks();
    await this.initTags();
    this.initDatePicker();
    this.initRecurringOptions();
  },

  onLoad() {
    // 检查登录状态
    if (!checkLoginStatus('/pages/record/index')) {
      return;
    }

    this.initDatePicker();
  },

  methods: {
    // 账本相关方法
    async initBooks() {
      try {
        // 获取最新的账本列表
        const books = await getAccountBooksApi();
        if (books && Array.isArray(books)) {
          this.allBooks = books;
          this.createdBooks = books.filter(b => b.is_creator === 1);
          this.joinedBooks = books.filter(b => b.is_creator === 2);

          if (books.length === 0) {
            this.currentBook = null;
            if (!this.hasShownNoBookModal) {
              this.hasShownNoBookModal = true;
              uni.showModal({
                title: '提示',
                content: '当前没有账本，无法记账。是否前往“账本管理”添加账本？',
                confirmText: '确定',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    uni.navigateTo({
                      url: '/pages/account-books/index'
                    });
                  }
                }
              });
            }
            return;
          }
          
          // 选择默认账本：is_default === 1，否则取第一个
          this.currentBook = books.find(b => b.is_default === 1) || books[0] || null;
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
    
    // 长按标签显示操作菜单
    showTagActions(tag) {
      uni.showActionSheet({
        itemList: ['编辑标签', '删除标签'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.openEditTagModal(tag);
          } else if (res.tapIndex === 1) {
            this.confirmDeleteTag(tag);
          }
        }
      });
    },
    
    openCustomTagModal() {
      this.resetCustomTagForm();
      this.showCustomTagModal = true;
    },
    
    closeCustomTagModal() {
      this.showCustomTagModal = false;
    },
    
    async saveCustomTag() {
      if (this.isSavingTag) return;
      
      if (!this.customTagName.trim()) {
        uni.showToast({
          title: '请输入标签名称',
          icon: 'none'
        });
        return;
      }
      
      if (this.customTagName.trim().length > 6) {
        uni.showToast({
          title: '标签名称不能超过6个字符',
          icon: 'none'
        });
        return;
      }
      
      try {
        this.isSavingTag = true;
        const newTag = await addTagApi({
          name: this.customTagName.trim(),
          color: this.customTagColor,
          icon: this.customTagIcon,
          type: this.transactionType
        });
        
        if (newTag) {
          this.tags.push(newTag);
          this.selectedTagId = newTag.tag_id;
          this.resetCustomTagForm();
          this.closeCustomTagModal();
          
          uni.showToast({
            title: '标签添加成功',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('添加标签失败', error);
        uni.showToast({
          title: error?.msg || error?.data?.msg || error?.message || '添加标签失败',
          icon: 'none'
        });
      } finally {
        this.isSavingTag = false;
      }
    },

    // 重置自定义标签表单
    resetCustomTagForm() {
      this.customTagName = '';
      this.customTagColor = '#FF9A5A';
      this.customTagIcon = 'home';
    },

    // 确认删除标签
    confirmDeleteTag(tag) {
      this.tagToDelete = tag;
      this.showDeleteTagModal = true;
    },

    // 关闭删除标签弹窗
    closeDeleteTagModal() {
      this.showDeleteTagModal = false;
      this.tagToDelete = null;
    },

    // 删除标签
    async deleteTag() {
      if (!this.tagToDelete) return;
      
      try {
        this.isSavingTag = true;
        await deleteTagApi(this.tagToDelete.tag_id);
        
        // 从本地列表中移除
        const index = this.tags.findIndex(t => t.tag_id === this.tagToDelete.tag_id);
        if (index !== -1) {
          this.tags.splice(index, 1);
        }
        
        // 如果删除的是当前选中的标签，重新选择第一个标签
        if (this.selectedTagId === this.tagToDelete.tag_id) {
          const defaultTags = this.tags.filter(tag => tag.type === this.transactionType);
          this.selectedTagId = defaultTags.length > 0 ? defaultTags[0].tag_id : null;
        }
        
        this.closeDeleteTagModal();
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('删除标签失败', error);
        uni.showToast({
          title: error?.msg || error?.data?.msg || error?.message || '删除失败',
          icon: 'none'
        });
      } finally {
        this.isSavingTag = false;
      }
    },

    // 打开修改标签弹窗
    openEditTagModal(tag) {
      this.editTagId = tag.tag_id;
      this.editTagName = tag.name;
      this.editTagColor = tag.color;
      this.editTagIcon = tag.icon || 'home';
      this.showEditTagModal = true;
    },

    // 关闭修改标签弹窗
    closeEditTagModal() {
      this.showEditTagModal = false;
      this.editTagId = null;
      this.editTagName = '';
      this.editTagColor = '#FF9A5A';
      this.editTagIcon = 'home';
    },

    // 保存修改的标签
    async saveEditTag() {
      if (this.isSavingTag) return;
      
      if (!this.editTagName.trim()) {
        uni.showToast({
          title: '请输入标签名称',
          icon: 'none'
        });
        return;
      }
      
      if (this.editTagName.trim().length > 6) {
        uni.showToast({
          title: '标签名称不能超过6个字符',
          icon: 'none'
        });
        return;
      }
      
      try {
        this.isSavingTag = true;
        const updatedTag = await updateTagApi({
          tag_id: this.editTagId,
          name: this.editTagName.trim(),
          color: this.editTagColor,
          icon: this.editTagIcon,
          type: this.transactionType
        });
        
        if (updatedTag) {
          // 更新本地列表
          const index = this.tags.findIndex(t => t.tag_id === this.editTagId);
          if (index !== -1) {
            this.tags[index] = updatedTag;
          }
          
          this.closeEditTagModal();
          
          uni.showToast({
            title: '标签修改成功',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('修改标签失败', error);
        uni.showToast({
          title: error?.msg || error?.data?.msg || error?.message || '修改标签失败',
          icon: 'none'
        });
      } finally {
        this.isSavingTag = false;
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
    
    // 一键清空
    clearInput() {
      // 清空金额
      this.amount = '';
      
      // 清空备注
      this.remark = '';
      
      // 重置标签为默认（当前类型的第一个）
      const defaultTags = this.tags.filter(tag => tag.type === this.transactionType);
      if (defaultTags.length > 0) {
        this.selectedTagId = defaultTags[0].tag_id;
      } else {
        this.selectedTagId = null;
      }
      
      uni.showToast({
        title: '已清空',
        icon: 'none'
      });
    },

    // 保存交易
    async saveTransaction() {
      if (this.isSaving) return;
      
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
          title: error?.msg || error?.data?.msg || '保存失败，请重试',
          icon: 'none'
        });
      } finally {
        this.isSaving = false;
      }
    }
  },
  
  // 分享到好友
  onShareAppMessage() {
    return {
      title: '有人拍了拍你：一起来记账吧，轻松管理每一笔收支！',
      path: '/pages/record/index',
      imageUrl: '/static/images/share-cover.png'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '有人拍了拍你：时光账记，让记账变得简单有趣',
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

.book-selector {
  background: linear-gradient(135deg, $color-bg-primary, $color-bg-secondary);
  padding: $spacing-md 30rpx;
  border-bottom: 1px solid $color-border-light;
  box-shadow: $shadow-light;
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
  font-size: $font-size-small;
  color: $color-text-secondary;
  font-weight: $font-weight-medium;
}

.book-switcher {
  padding: $spacing-xs 20rpx;
  display: flex;
  align-items: center;
  position: relative;
  background-color: rgba(255, 154, 90, 0.1);
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 154, 90, 0.2);
  box-shadow: $shadow-light;
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
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
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

.custom-tag {
  background: $color-bg-primary;
  border: 1px dashed $color-text-placeholder;
}

/* 自定义标签标识 */
.custom-tag-badge {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  box-shadow: 0 2rpx 4rpx rgba(255, 154, 90, 0.3);
  z-index: 1;
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
  background: $color-bg-tertiary;
  border-radius: $border-radius-md;
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
  font-size: $font-size-small;
  background: $color-bg-primary;
  color: $color-text-secondary;
  border: 1px solid $color-border-normal;
}

.recurring-type-option.active {
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  border: none;
}

.recurring-day-selector {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.recurring-label {
  font-size: $font-size-small;
  color: $color-text-primary;
}

.recurring-day-input {
  width: 100rpx;
  height: 60rpx;
  background: $color-bg-primary;
  border-radius: $border-radius-sm;
  text-align: center;
  font-size: $font-size-small;
  color: $color-text-primary;
}

.recurring-day-unit {
  font-size: $font-size-small;
  color: $color-text-primary;
}

/* 周期记账样式 */
.recurring-section {
  margin: $spacing-lg 0;
  padding: $spacing-lg;
  background: $color-bg-primary;
  border-radius: $border-radius-md;
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
  padding: $spacing-sm $spacing-md;
  background: $color-bg-tertiary;
  border-radius: $border-radius-lg;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.recurring-type-option.active {
  background: $color-primary-bg;
  border-color: $color-primary;
  color: $color-primary;
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

.recurring-type-btn {
  flex: 1;
  padding: $spacing-sm $spacing-md;
  background: $color-bg-secondary;
  border: 2rpx solid $color-border-normal;
  border-radius: $border-radius-md;
  font-size: $font-size-body;
  color: $color-text-primary;
  text-align: center;
  transition: all 0.3s ease;
}

.recurring-type-btn.active {
  background: $color-primary;
  border-color: $color-primary;
  color: $color-text-inverse;
}

/* 周期配置 */
.recurring-config-section {
  margin-bottom: 32rpx;
}

.config-container {
  padding: $spacing-md;
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  border: 1rpx solid $color-border-light;
}

.config-description {
  margin-bottom: 20rpx;
  padding: $spacing-sm;
  background: $color-bg-secondary;
  border-radius: $border-radius-sm;
  text-align: center;
}

.config-description text {
  font-size: 30rpx;
  color: $color-primary;
  font-weight: $font-weight-bold;
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
  font-size: $font-size-small;
  color: $color-text-secondary;
  font-weight: $font-weight-bold;
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
  font-size: $font-size-body;
  color: $color-text-primary;
}

/* 执行预览 */
.execution-preview {
  padding: $spacing-md;
  background: $color-bg-secondary;
  border-radius: $border-radius-md;
  border: 2rpx solid $color-info-light;
}

.preview-content {
  margin-top: 16rpx;
}

.cron-expression {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-sm;
  padding: 12rpx $spacing-sm;
  background: $color-bg-primary;
  border-radius: $border-radius-sm;
  border: 1rpx solid $color-border-normal;
}

.expression-label {
  font-size: $font-size-small;
  color: $color-text-secondary;
  margin-right: 12rpx;
  min-width: 120rpx;
}

.expression-value {
  font-size: $font-size-body;
  color: $color-info;
  font-family: $font-family-mono;
  font-weight: $font-weight-bold;
}

.execution-description {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-sm;
  padding: 12rpx $spacing-sm;
  background: $color-bg-primary;
  border-radius: $border-radius-sm;
  border: 1rpx solid $color-border-normal;
}

.description-label {
  font-size: $font-size-small;
  color: $color-text-secondary;
  margin-right: 12rpx;
  min-width: 120rpx;
}

.description-value {
  font-size: $font-size-body;
  color: $color-primary;
  font-weight: $font-weight-bold;
}

.next-executions {
  padding: 12rpx $spacing-sm;
  background: $color-bg-primary;
  border-radius: $border-radius-sm;
  border: 1rpx solid $color-border-normal;
}

.next-label {
  font-size: $font-size-small;
  color: $color-text-secondary;
  display: block;
  margin-bottom: 12rpx;
}

.next-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.next-time {
  font-size: $font-size-small;
  color: $color-text-primary;
  padding: $spacing-xs 12rpx;
  background: $color-bg-secondary;
  border-radius: 6rpx;
  font-family: $font-family-mono;
}

/* 保存按钮 */
.save-section {
  padding: 20rpx 0;
  display: flex;
  gap: 20rpx;
}

.btn-save {
  flex: 1;
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

.btn-clear {
  flex: 1;
  height: 88rpx;
  background: $color-bg-tertiary;
  color: $color-text-secondary;
  border-radius: 44rpx;
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  box-shadow: $shadow-light;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear:active {
  transform: translateY(2rpx);
  background: darken($color-bg-tertiary, 5%);
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

/* 模态框底部按钮 */
.modal-footer {
  display: flex;
  gap: 12rpx;
  padding: $spacing-md;
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

/* 自定义标签表单 */
.custom-tag-form {
  padding: 10rpx 0;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: $font-size-small;
  color: $color-text-primary;
  font-weight: $font-weight-semibold;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: $color-bg-tertiary;
  border-radius: $border-radius-md;
  padding: 0 20rpx;
  font-size: $font-size-body;
  color: $color-text-primary;
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
  border-radius: $border-radius-md;
  transition: all 0.3s ease;
  position: relative;
}

.color-option.active {
  transform: scale(1.1);
  border: 2rpx solid $color-text-inverse;
  box-shadow: 0 0 0 4rpx rgba(0, 0, 0, 0.1);
}

.icon-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}

.icon-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: $border-radius-md;
  background: $color-bg-tertiary;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.icon-option.active {
  background: $color-primary;
  border-color: $color-primary;
  transform: scale(1.1);
}

.icon-option uni-icons {
  transition: all 0.3s ease;
}

.icon-option.active uni-icons {
  color: $color-text-inverse !important;
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

.books-group {
  margin-bottom: $spacing-lg;
}

.group-label {
  font-size: $font-size-small;
  color: $color-text-secondary;
  margin-bottom: 12rpx;
  display: block;
  font-weight: $font-weight-medium;
}

.book-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: $color-bg-secondary;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-sm;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  box-shadow: $shadow-light;
  position: relative;
  overflow: hidden;
}

.book-option.active {
  background: $color-primary-bg;
  border-color: $color-warning;
  box-shadow: 0 2rpx 12rpx rgba(255, 184, 0, 0.15);
}

.book-option:active {
  transform: scale(0.98);
}

.book-option-left {
  flex: 1;
}

.book-name {
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  display: block;
  margin-bottom: 4rpx;
}

.book-members {
  font-size: $font-size-xs;
  color: $color-text-secondary;
  display: block;
}

.check-icon {
  font-size: $font-size-body;
  color: $color-warning;
  font-weight: $font-weight-bold;
  margin-left: 12rpx;
}

/* 删除标签弹窗样式 - 与删除账单弹窗风格一致 */
.delete-tag-modal-mask {
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

.delete-tag-confirm-content {
  width: 100%;
  background: $color-bg-primary;
  border-radius: $border-radius-lg $border-radius-lg 0 0;
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

.delete-tag-confirm-header {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  background: $color-bg-primary;
}

.delete-tag-confirm-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, $color-error-light, $color-error-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.2);
}

.delete-tag-confirm-title {
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  text-align: center;
  margin-bottom: $spacing-md;
  display: block;
}

.delete-tag-confirm-message {
  font-size: $font-size-body;
  color: $color-text-secondary;
  text-align: center;
  margin-bottom: $spacing-sm;
  display: block;
  line-height: $line-height-relaxed;
  padding: 0 20rpx;
}

.delete-tag-confirm-warning {
  font-size: $font-size-small;
  color: $color-text-tertiary;
  text-align: center;
  display: block;
  line-height: $line-height-relaxed;
  padding: 0 20rpx;
}

.delete-tag-confirm-footer {
  padding: 30rpx 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  background: $color-bg-secondary;
  border-top: 1rpx solid $color-border-light;
  display: flex;
  gap: 20rpx;
}

.delete-tag-btn-cancel {
  flex: 1;
  height: 88rpx;
  border-radius: $border-radius-full;
  font-size: 30rpx;
  font-weight: $font-weight-semibold;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-tertiary;
  color: $color-text-secondary;
  border: 2rpx solid $color-border-normal;
  transition: all 0.3s ease;
}

.delete-tag-btn-cancel:active {
  background: $color-border-light;
  transform: scale(0.98);
}

.delete-tag-btn-delete {
  flex: 1;
  height: 88rpx;
  border-radius: $border-radius-full;
  font-size: 30rpx;
  font-weight: $font-weight-semibold;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $color-error, #FF5252);
  color: $color-text-inverse;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.delete-tag-btn-delete:active {
  background: linear-gradient(135deg, #FF5252, #FF4444);
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.4);
}
</style>
