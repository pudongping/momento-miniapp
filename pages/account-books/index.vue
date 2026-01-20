<template>
  <view class="page-container">
    <!-- 邀请通知 -->
    <view v-if="pendingInvitations.length > 0" class="invitations-section">
      <view class="section-header">
        <uni-icons type="notification-filled" size="20" color="#FF9A5A"></uni-icons>
        <text class="section-title">邀请通知</text>
      </view>
      <view v-for="invitation in pendingInvitations" :key="invitation.invitation_id" class="invitation-card">
        <view class="invitation-content">
          <view class="invitation-header">
            <text class="inviter-name">{{ invitation.inviter_nickname }}</text>
            <text class="invitation-time">{{ formatDateTime(invitation.created_at) }}</text>
          </view>
          <view class="invitation-message">
            <text class="message-intro">邀请您加入</text>
            <text class="book-name">"{{ invitation.book_name }}"</text>
            <text class="message-outro">共同管理账单</text>
          </view>
        </view>
        <view class="invitation-actions">
          <button class="btn-reject" @click="rejectInvitation(invitation.invitation_id)">拒绝</button>
          <button class="btn-accept" @click="acceptInvitation(invitation.invitation_id)">同意</button>
        </view>
      </view>
    </view>

    <!-- 账本列表 -->
    <view class="books-section">
      <view class="section-header">
        <view class="header-left">
          <uni-icons type="bookfill" size="20" color="#FF9A5A"></uni-icons>
          <text class="section-title">我的账本</text>
        </view>
        <button class="btn-add" @click="showCreateModal">
          <uni-icons type="plusempty" size="16" color="#FFFFFF"></uni-icons>
          <text>添加账本</text>
        </button>
      </view>

      <!-- 创建的账本 -->
      <view v-if="createdBooks.length > 0" class="books-group">
        <text class="group-label">创建的账本</text>
        <view v-for="book in createdBooks" :key="book.book_id" class="book-card created-book" @click="selectBook(book)">
          <view class="book-card-left">
            <view class="book-header">
              <text class="book-name">{{ book.name }}</text>
              <view v-if="book.is_default === 1" class="default-badge">默认</view>
            </view>
            <view class="book-info">
              <text class="info-item">{{ book.member_count }}人</text>
              <text class="info-separator">•</text>
              <text class="info-item">{{ formatDate(book.created_at) }}</text>
            </view>
          </view>
          <view class="book-card-right">
            <view class="status-badge">创建者</view>
          </view>
        </view>
      </view>

      <!-- 加入的账本 -->
      <view v-if="joinedBooks.length > 0" class="books-group">
        <text class="group-label">加入的账本</text>
        <view v-for="book in joinedBooks" :key="book.book_id" class="book-card joined-book" @click="selectBook(book)">
          <view class="book-card-left">
            <view class="book-header">
              <text class="book-name">{{ book.name }}</text>
              <view v-if="book.is_default === 1" class="default-badge">默认</view>
            </view>
            <view class="book-info">
              <text class="info-item">{{ book.member_count }}人</text>
              <text class="info-separator">•</text>
              <text class="info-item">{{ formatDate(book.created_at) }}</text>
            </view>
          </view>
          <view class="book-card-right">
            <view class="status-badge">已加入</view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="createdBooks.length === 0 && joinedBooks.length === 0" class="empty-state">
        <view class="empty-illustration">
          <view class="empty-illustration-bg"></view>
          <uni-icons type="folder-add-filled" size="44" color="#FF9A5A"></uni-icons>
        </view>
        <text class="empty-title">还没有账本</text>
        <text class="empty-desc">创建或加入账本，开始记录账单</text>
        <button class="empty-action" @click="showCreateModal">
          <uni-icons type="plusempty" size="16" color="#FFFFFF"></uni-icons>
          <text>创建第一个账本</text>
        </button>
      </view>
    </view>

    <!-- 创建账本弹窗 -->
    <view v-if="showCreateBookModal" class="modal-mask" @click="closeCreateModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">创建账本</text>
          <view class="close-btn" @click="closeCreateModal">✕</view>
        </view>
        <view class="modal-body">
          <input 
            type="text" 
            v-model="newBookName" 
            class="book-name-input"
            placeholder="请输入账本名称（如：家庭账本）"
            maxlength="20"
          />
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeCreateModal">取消</button>
          <button class="btn-confirm" @click="createAccountBook">创建</button>
        </view>
      </view>
    </view>

    <!-- 账本详情弹窗 -->
    <view v-if="showBookDetailModal && selectedBook" class="modal-mask" @click="closeBookDetailModal">
      <view class="modal-content modal-large" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedBook.name }}</text>
          <view class="close-btn" @click="closeBookDetailModal">✕</view>
        </view>
        <view class="modal-body">
          <!-- 成员列表 -->
          <view class="members-section">
            <text class="subsection-title">成员（{{ selectedBook.member_count }}人）</text>
            <view v-for="member in bookMembers" :key="member.user_id || member.uid" class="member-item">
              <image :src="member.avatar || '/static/images/default-avatar.png'" class="member-avatar"></image>
              <view class="member-info">
                <text class="member-name">{{ member.nickname }}</text>
                <text class="member-status">{{ getMemberStatusText(member.status) }}</text>
              </view>
              <view v-if="isBookCreator && member.status !== 'waiting'" class="member-action">
                <text
                  class="remove-btn"
                  :class="{ disabled: String(member.user_id || member.uid) === currentUserId }"
                  @click="String(member.user_id || member.uid) !== currentUserId && removeMember(member.user_id || member.uid)"
                >移除</text>
              </view>
            </view>
          </view>

          <!-- 邀请新成员 -->
          <view v-if="isBookCreator" class="invite-section">
            <text class="subsection-title">邀请成员</text>
            <view class="invite-input-group">
              <input 
                type="text" 
                v-model="inviteUid" 
                class="invite-input"
                placeholder="输入对方UID"
              />
              <button class="btn-invite" @click="inviteUser">邀请</button>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="actions-section">
            <button
              :class="['btn-action', 'btn-default', selectedBook.is_default === 1 ? 'active' : '']"
              @click="toggleDefault"
            >
              {{ selectedBook.is_default === 1 ? '✓ 默认账本' : '设为默认' }}
            </button>          
            <button 
              v-if="!isBookCreator"
              class="btn-action btn-exit" 
              @click="exitBook"
            >
              退出账本
            </button>
            <button 
              v-if="isBookCreator"
              class="btn-action btn-delete" 
              @click="deleteBook"
            >
              删除账本
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getAccountBooksApi, 
  createAccountBookApi, 
  deleteAccountBookApi,
  inviteUserApi,
  getInvitationsApi,
  acceptInvitationApi,
  rejectInvitationApi,
  exitAccountBookApi,
  setDefaultAccountBookApi,
  getAccountBookMembersApi,
  removeAccountBookMemberApi
} from '@/api/index.js';
import { checkLoginStatus } from '@/utils/auth.js';

export default {
  data() {
    return {
      createdBooks: [],
      joinedBooks: [],
      pendingInvitations: [],
      bookMembers: [],
      selectedBook: null,
      showCreateBookModal: false,
      showBookDetailModal: false,
      newBookName: '',
      inviteUid: '',
      isBookCreator: false
    };
  },

  computed: {
    currentUserId() {
      const userInfo = uni.getStorageSync('userInfo') || {};
      const uid = userInfo.user_id || userInfo.uid;
      return uid ? String(uid) : '';
    }
  },

  onShow() {
    // 检查登录状态
    if (!checkLoginStatus('/pages/account-books/index')) {
      return;
    }
    
    this.loadAccountBooks();
    this.loadInvitations();
  },

  methods: {
    async loadAccountBooks() {
      try {
        const data = await getAccountBooksApi();
        if (data && Array.isArray(data)) {
          this.createdBooks = data.filter(book => book.is_creator === 1);
          this.joinedBooks = data.filter(book => book.is_creator === 2);
        }
      } catch (error) {
        console.error('加载账本失败', error);
      }
    },

    async loadInvitations() {
      try {
        const data = await getInvitationsApi();
        if (data && Array.isArray(data)) {
          this.pendingInvitations = data.filter(inv => inv.status === 'pending');
        }
      } catch (error) {
        console.error('加载邀请失败', error);
      }
    },

    showCreateModal() {
      this.newBookName = '';
      this.showCreateBookModal = true;
    },

    closeCreateModal() {
      this.showCreateBookModal = false;
      this.newBookName = '';
    },

    async createAccountBook() {
      if (!this.newBookName.trim()) {
        uni.showToast({
          title: '请输入账本名称',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({ title: '创建中...' });
        await createAccountBookApi({ name: this.newBookName });
        uni.hideLoading();
        
        uni.showToast({
          title: '账本创建成功',
          icon: 'success'
        });

        this.closeCreateModal();
        this.loadAccountBooks();
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error?.msg || error?.data?.msg || '创建失败，请重试',
          icon: 'none'
        });
        console.error('创建账本失败', error);
      }
    },

    async selectBook(book) {
      this.selectedBook = book;
      this.isBookCreator = book.is_creator === 1;
      this.inviteUid = '';
      this.showBookDetailModal = true;
      
      try {
        const members = await getAccountBookMembersApi(book.book_id);
        this.bookMembers = members || [];
      } catch (error) {
        console.error('加载成员失败', error);
      }
    },

    closeBookDetailModal() {
      this.showBookDetailModal = false;
      this.selectedBook = null;
      this.bookMembers = [];
    },

    async inviteUser() {
      if (!this.inviteUid.trim()) {
        uni.showToast({
          title: '请输入UID',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({ title: '邀请中...' });
        await inviteUserApi({
          book_id: this.selectedBook.book_id,
          target_uid: this.inviteUid
        });
        uni.hideLoading();

        uni.showToast({
          title: '邀请已发送',
          icon: 'success'
        });

        this.inviteUid = '';
        const members = await getAccountBookMembersApi(this.selectedBook.book_id);
        this.bookMembers = members || [];
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error?.msg || '邀请失败，请检查UID是否正确',
          icon: 'none'
        });
        console.error('邀请失败', error);
      }
    },

    async acceptInvitation(invitationId) {
      try {
        uni.showLoading({ title: '处理中...' });
        await acceptInvitationApi(invitationId);
        uni.hideLoading();

        uni.showToast({
          title: '已加入账本',
          icon: 'success'
        });

        this.loadInvitations();
        this.loadAccountBooks();
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error?.msg || error?.data?.msg || '操作失败，请重试',
          icon: 'none'
        });
        console.error('接受邀请失败', error);
      }
    },

    async rejectInvitation(invitationId) {
      try {
        uni.showLoading({ title: '处理中...' });
        await rejectInvitationApi(invitationId);
        uni.hideLoading();

        uni.showToast({
          title: '已拒绝邀请',
          icon: 'success'
        });

        this.loadInvitations();
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error?.msg || error?.data?.msg || '操作失败，请重试',
          icon: 'none'
        });
        console.error('拒绝邀请失败', error);
      }
    },

    async toggleDefault() {
      try {
        uni.showLoading({ title: '设置中...' });
        await setDefaultAccountBookApi(this.selectedBook.book_id);
        uni.hideLoading();

        uni.showToast({
          title: '设置成功',
          icon: 'success'
        });

        this.selectedBook.is_default = this.selectedBook.is_default === 1 ? 2 : 1;
        this.loadAccountBooks();
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error?.msg || error?.data?.msg || '设置失败，请重试',
          icon: 'none'
        });
        console.error('设置默认账本失败', error);
      }
    },

    exitBook() {
      uni.showModal({
        title: '退出账本',
        content: '确定要退出该账本吗？',
        cancelText: '取消',
        confirmText: '退出',
        success: async (res) => {
          if (!res.confirm) return;

          try {
            uni.showLoading({ title: '退出中...' });
            await exitAccountBookApi(this.selectedBook.book_id);
            uni.hideLoading();

            uni.showToast({
              title: '已退出账本',
              icon: 'success'
            });

            this.closeBookDetailModal();
            this.loadAccountBooks();
          } catch (error) {
            uni.hideLoading();
            uni.showToast({
              title: error?.msg || error?.data?.msg || '退出失败，请重试',
              icon: 'none'
            });
            console.error('退出账本失败', error);
          }
        }
      });
    },

    deleteBook() {
      uni.showModal({
        title: '删除账本',
        content: '确定要删除该账本吗？删除后将无法恢复。',
        cancelText: '取消',
        confirmText: '删除',
        success: async (res) => {
          if (!res.confirm) return;

          try {
            uni.showLoading({ title: '删除中...' });
            await deleteAccountBookApi(this.selectedBook.book_id);
            uni.hideLoading();

            uni.showToast({
              title: '账本已删除',
              icon: 'success'
            });

            this.closeBookDetailModal();
            this.loadAccountBooks();
          } catch (error) {
            uni.hideLoading();
            uni.showToast({
              title: error?.msg || error?.data?.msg || '删除失败，请重试',
              icon: 'none'
            });
            console.error('删除账本失败', error);
          }
        }
      });
    },

    removeMember(userId) {
      if (String(userId) === this.currentUserId) {
        uni.showToast({
          title: '不能移除自己',
          icon: 'none'
        });
        return;
      }

      uni.showModal({
        title: '移除成员',
        content: '确定要移除该成员吗？',
        cancelText: '取消',
        confirmText: '移除',
        success: async (res) => {
          if (!res.confirm) return;

          try {
            uni.showLoading({ title: '移除中...' });
            await removeAccountBookMemberApi({
              book_id: this.selectedBook.book_id,
              user_id: String(userId)
            });
            uni.hideLoading();

            uni.showToast({
              title: '成员已移除',
              icon: 'success'
            });

            const members = await getAccountBookMembersApi(this.selectedBook.book_id);
            this.bookMembers = members || [];
          } catch (error) {
            uni.hideLoading();
            uni.showToast({
              title: error?.msg || error?.message || '移除失败，请重试',
              icon: 'none'
            });
            console.error('移除成员失败', error);
          }
        }
      });
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      let ts = dateStr;
      if (typeof ts === 'string' && /^\d+$/.test(ts)) {
        ts = Number(ts);
      }
      if (typeof ts === 'number' && ts > 0 && ts < 1e12) {
        ts = ts * 1000;
      }
      const date = new Date(ts);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '';
      let ts = dateStr;
      if (typeof ts === 'string' && /^\d+$/.test(ts)) {
        ts = Number(ts);
      }
      if (typeof ts === 'number' && ts > 0 && ts < 1e12) {
        ts = ts * 1000;
      }
      const date = new Date(ts);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    },

    getMemberStatusText(status) {
      const statusMap = {
        'joined': '已加入',
        'waiting': '等待加入',
        'rejected': '已拒绝'
      };
      return statusMap[status] || status;
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: $color-bg-secondary;
  padding-bottom: $spacing-lg;
}

.invitations-section {
  padding: 20rpx;
  background: $color-primary-bg;
  border-bottom: 1px solid $color-warning;
  margin-bottom: $spacing-sm;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.invitation-card {
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  border-left: 4rpx solid $color-warning;
  box-shadow: $shadow-light;
}

.invitation-content {
  margin-bottom: 20rpx;
}

.invitation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.inviter-name {
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-primary;
}

.invitation-time {
  font-size: $font-size-xs;
  color: $color-text-tertiary;
}

.invitation-message {
  font-size: $font-size-small;
  color: $color-text-primary;
  line-height: $line-height-relaxed;
}

.message-intro, .message-outro {
  color: $color-text-secondary;
}

.book-name {
  font-weight: $font-weight-semibold;
  color: $color-primary;
  margin: 0 4rpx;
}

.invitation-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.btn-reject {
  @extend .btn-small-secondary;
  min-width: 120rpx;
}

.btn-accept {
  @extend .btn-small;
  min-width: 120rpx;
}

.books-section {
  padding: 20rpx;
}

.section-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.btn-add {
  @extend .btn-small;
  margin-left: auto;
}

.books-group {
  margin-bottom: 32rpx;
}

.group-label {
  font-size: $font-size-small;
  color: $color-text-secondary;
  margin-bottom: 12rpx;
  display: block;
}

.book-card {
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  margin: 0 0 $spacing-sm;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: $shadow-normal;
  border-left: 6rpx solid;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.book-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.created-book {
  border-left-color: $color-primary;
}

.created-book::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, transparent 70%, rgba(255, 154, 90, 0.1) 100%);
  border-radius: 0 0 0 120rpx;
}

.joined-book {
  border-left-color: $color-info;
}

.joined-book::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, transparent 70%, rgba(108, 99, 255, 0.1) 100%);
  border-radius: 0 0 0 120rpx;
}

.book-card-left {
  flex: 1;
}

.book-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.book-name {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.default-badge {
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  font-size: 20rpx;
  padding: 4rpx $spacing-sm;
  border-radius: 20rpx;
  font-weight: $font-weight-semibold;
  box-shadow: 0 2rpx 6rpx rgba(255, 154, 90, 0.3);
}

.book-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: $font-size-small;
  color: $color-text-secondary;
}

.info-item {
  font-size: $font-size-small;
}

.info-separator {
  color: $color-text-placeholder;
}

.book-card-right {
  margin-left: 16rpx;
}

.status-badge {
  background: $color-bg-tertiary;
  color: $color-text-secondary;
  font-size: $font-size-xs;
  padding: 6rpx $spacing-sm;
  border-radius: 20rpx;
  font-weight: $font-weight-medium;
  box-shadow: $shadow-light;
}

.empty-state {
  margin: 60rpx 20rpx 0;
  padding: 64rpx 36rpx;
  background: $color-bg-primary;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-normal;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-illustration {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.empty-illustration-bg {
  position: absolute;
  inset: 0;
  border-radius: 70rpx;
  background: linear-gradient(135deg, rgba(255, 154, 90, 0.18), rgba(255, 209, 102, 0.18));
  border: 1px solid rgba(255, 154, 90, 0.22);
}

.empty-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin-bottom: 12rpx;
  display: block;
}

.empty-desc {
  font-size: $font-size-small;
  color: $color-text-secondary;
  display: block;
  margin-bottom: 28rpx;
}

.empty-action {
  height: 84rpx;
  border-radius: $border-radius-full;
  padding: 0 28rpx;
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  border: none;
  font-size: $font-size-small;
  font-weight: $font-weight-semibold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

.empty-action:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(255, 154, 90, 0.1);
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
  background: $color-bg-primary;
  border-radius: $border-radius-lg $border-radius-lg 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.modal-large {
  max-height: 80vh;
  overflow-y: auto;
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
  max-height: calc(80vh - 120rpx);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 12rpx;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom) + 40rpx);
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

.book-name-input {
  width: 100%;
  height: 88rpx;
  border: 1px solid $color-border-normal;
  border-radius: $border-radius-md;
  padding: 0 20rpx;
  font-size: $font-size-body;
  box-sizing: border-box;
}

.members-section {
  margin-bottom: 32rpx;
}

.subsection-title {
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
  display: block;
}

.member-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm;
  background: $color-bg-secondary;
  border-radius: $border-radius-md;
  margin-bottom: 12rpx;
}

.member-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  margin-right: 16rpx;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  display: block;
  margin-bottom: 4rpx;
}

.member-status {
  font-size: $font-size-xs;
  color: $color-text-secondary;
  display: block;
}

.member-action {
  margin-left: 12rpx;
}

.remove-btn {
  color: $color-error;
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  background: $color-error-light;
  padding: 6rpx $spacing-sm;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(255, 107, 107, 0.1);
}

 .remove-btn.disabled {
  color: $color-text-tertiary;
  background: $color-bg-tertiary;
  box-shadow: none;
  opacity: 0.8;
  pointer-events: none;
 }

.invite-section {
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-lg;
  border-bottom: 1px solid $color-bg-tertiary;
}

.invite-input-group {
  display: flex;
  gap: 12rpx;
}

.invite-input {
  flex: 1;
  height: 80rpx;
  border: 1px solid $color-border-normal;
  border-radius: $border-radius-md;
  padding: 0 $spacing-sm;
  font-size: $font-size-small;
  box-sizing: border-box;
}

.btn-invite {
  width: 140rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  border: none;
  border-radius: $border-radius-full;
  font-size: $font-size-small;
  font-weight: $font-weight-semibold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
  transition: all 0.3s ease;
}

.btn-invite:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(255, 154, 90, 0.1);
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
}

.btn-action {
  height: 88rpx;
  border-radius: $border-radius-full;
  font-size: $font-size-body;
  border: none;
  font-weight: $font-weight-semibold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20rpx;
}

.btn-action:active {
  transform: translateY(2rpx);
}

.btn-exit {
  background: linear-gradient(135deg, #FF6B6B, #FF9A5A);
  color: $color-text-inverse;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);
}

.btn-exit:active {
  box-shadow: 0 2rpx 6rpx rgba(255, 107, 107, 0.1);
}

.btn-delete {
  background: $color-error-light;
  color: $color-error;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.15);
}

.btn-delete:active {
  box-shadow: 0 2rpx 6rpx rgba(255, 107, 107, 0.1);
}

.btn-default {
  background: linear-gradient(135deg, $color-primary, $color-primary-light);
  color: $color-text-inverse;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(255, 154, 90, 0.2);
}

.btn-default:active {
  box-shadow: 0 2rpx 6rpx rgba(255, 154, 90, 0.1);
}

.btn-default.active {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: $color-text-inverse;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.btn-default.active:active {
  box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.2);
}
</style>
