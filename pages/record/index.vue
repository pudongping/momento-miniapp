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

    <!-- 主内容 -->
    <view class="placeholder-content">
      <text class="page-title">记账</text>
      <text class="page-subtitle">在"{{ currentBook?.name || '未选择' }}"中添加账单</text>
    </view>
  </view>
</template>

<script>
import { setCurrentBook, restoreAccountBookState } from '@/utils/account-book.js';
import { getAccountBooksApi } from '@/api/index.js';

export default {
  data() {
    return {
      currentBook: null,
      allBooks: [],
      createdBooks: [],
      joinedBooks: [],
      showBookPickerModal: false
    };
  },

  onShow() {
    this.initBooks();
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

.placeholder-content {
  text-align: center;
  padding: 80rpx 40rpx;
  
  .page-title {
    font-size: 48rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12rpx;
    display: block;
  }

  .page-subtitle {
    font-size: 26rpx;
    color: $text-secondary;
    display: block;
  }
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
