/**
 * 账本相关的mock数据
 */

// Mock账本数据
const MOCK_ACCOUNT_BOOKS = [
  {
    book_id: 1,
    name: '家庭账本',
    creator_user_id: '123456789012345678', // 字符串类型
    is_creator: 1, // 1-是创建者 2-不是
    is_default: 1, // 1-是默认 2-不是
    member_count: 2,
    created_at: Math.floor(Date.now() / 1000) - 86400 * 30,
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 2
  },
  {
    book_id: 2,
    name: '旅游账本',
    creator_user_id: '223456789012345678', // 字符串类型
    is_creator: 2, // 1-是创建者 2-不是
    is_default: 2, // 1-是默认 2-不是
    member_count: 3,
    created_at: Math.floor(Date.now() / 1000) - 86400 * 15,
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 1
  }
];

// Mock邀请数据
const MOCK_INVITATIONS = [
  {
    invitation_id: 1,
    book_id: 3,
    book_name: '公司聚餐账本',
    inviter_uid: '223456789012345678', // 字符串类型
    inviter_nickname: '账本达人',
    target_uid: '123456789012345678', // 字符串类型
    status: 'pending',
    created_at: Math.floor(Date.now() / 1000) - 3600
  }
];

// Mock成员数据
const MOCK_MEMBERS = {
  1: [
    {
      user_id: '123456789012345678', // 字符串类型
      nickname: '小时光',
      avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJfN8DhRLHyHoUQL6Vicic2gzmyj3xZjcwqcxgNrhAD6wfhOgHWTiaKYI69B9BSZDCRibnDMurZpdbLyQ/132',
      status: 'joined'
    },
    {
      user_id: '223456789012345678', // 字符串类型
      nickname: '账本达人',
      avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/kAqKtjL7YrDzQmvDpticCINGvfxgkMFXAGJMJFUYNhX6y1n74NJpKAeJB5gyzytbq6EmV4tCZ6Kibwe5puMD0HnQ/132',
      status: 'waiting'
    }
  ],
  2: [
    {
      user_id: '223456789012345678', // 字符串类型
      nickname: '账本达人',
      avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/kAqKtjL7YrDzQmvDpticCINGvfxgkMFXAGJMJFUYNhX6y1n74NJpKAeJB5gyzytbq6EmV4tCZ6Kibwe5puMD0HnQ/132',
      status: 'joined'
    },
    {
      user_id: '123456789012345678', // 字符串类型
      nickname: '小时光',
      avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJfN8DhRLHyHoUQL6Vicic2gzmyj3xZjcwqcxgNrhAD6wfhOgHWTiaKYI69B9BSZDCRibnDMurZpdbLyQ/132',
      status: 'joined'
    },
    {
      user_id: '323456789012345678', // 字符串类型
      nickname: '旅游小能手',
      avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAOo6OH5seFZkzsTEaVw8N0nxrsKcjMFXo9NjxjgqKYL5V8ibZGWA8m0saP8OQcaYOQVVVVVVVVVVVVVVVVVVV/132',
      status: 'joined'
    }
  ]
};

/**
 * 获取账本列表
 */
export function getAccountBooks() {
  return MOCK_ACCOUNT_BOOKS;
}

/**
 * 创建账本
 */
export function createAccountBook(data) {
  const newBook = {
    book_id: Math.max(...MOCK_ACCOUNT_BOOKS.map(b => b.book_id), 0) + 1,
    name: data.name,
    creator_user_id: '123456789012345678', // 字符串类型
    is_creator: 1, // 1-是创建者 2-不是
    is_default: 2, // 1-是默认 2-不是
    member_count: 1,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000)
  };
  MOCK_ACCOUNT_BOOKS.push(newBook);
  MOCK_MEMBERS[newBook.book_id] = [
    {
      user_id: '123456789012345678', // 字符串类型
      nickname: '小时光',
      avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJfN8DhRLHyHoUQL6Vicic2gzmyj3xZjcwqcxgNrhAD6wfhOgHWTiaKYI69B9BSZDCRibnDMurZpdbLyQ/132',
      status: 'joined'
    }
  ];
  return newBook;
}

/**
 * 删除账本
 */
export function deleteAccountBook(bookId) {
  const index = MOCK_ACCOUNT_BOOKS.findIndex(b => b.book_id === bookId);
  if (index > -1) {
    MOCK_ACCOUNT_BOOKS.splice(index, 1);
    delete MOCK_MEMBERS[bookId];
  }
  return { success: true };
}

/**
 * 邀请用户
 */
export function inviteUser(data) {
  const { book_id, target_uid } = data;
  const book = MOCK_ACCOUNT_BOOKS.find(b => b.book_id === book_id);
  
  if (!book) {
    throw new Error('账本不存在');
  }

  // 检查用户是否已在账本中
  const members = MOCK_MEMBERS[book_id] || [];
  if (members.some(m => m.uid === target_uid)) {
    throw new Error('用户已在该账本中');
  }

  // 添加待加入成员
  members.push({
    user_id: target_uid,
    nickname: `用户${String(target_uid).substr(-4)}`,
    avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/default/132',
    status: 'waiting'
  });

  book.member_count = members.length;
  MOCK_MEMBERS[book_id] = members;

  return { success: true };
}

/**
 * 获取邀请列表
 */
export function getInvitations() {
  return MOCK_INVITATIONS;
}

/**
 * 接受邀请
 */
export function acceptInvitation(invitationId) {
  const invitation = MOCK_INVITATIONS.find(i => i.invitation_id === invitationId);
  if (!invitation) {
    throw new Error('邀请不存在');
  }

  invitation.status = 'accepted';

  // 更新成员状态
  const members = MOCK_MEMBERS[invitation.book_id] || [];
  const member = members.find(m => m.user_id === invitation.target_uid);
  if (member) {
    member.status = 'joined';
  }

  return { success: true };
}

/**
 * 拒绝邀请
 */
export function rejectInvitation(invitationId) {
  const invitation = MOCK_INVITATIONS.find(i => i.invitation_id === invitationId);
  if (!invitation) {
    throw new Error('邀请不存在');
  }

  invitation.status = 'rejected';

  // 移除成员
  const members = MOCK_MEMBERS[invitation.book_id] || [];
  const index = members.findIndex(m => m.user_id === invitation.target_uid);
  if (index > -1) {
    members.splice(index, 1);
  }

  const book = MOCK_ACCOUNT_BOOKS.find(b => b.id === invitation.book_id);
  if (book) {
    book.member_count = members.length;
  }

  return { success: true };
}

/**
 * 退出账本
 */
export function exitAccountBook(bookId) {
  const members = MOCK_MEMBERS[bookId] || [];
  const index = members.findIndex(m => m.user_id === 123456789012345678);
  if (index > -1) {
    members.splice(index, 1);
  }

  const book = MOCK_ACCOUNT_BOOKS.find(b => b.id === bookId);
  if (book) {
    book.member_count = members.length;
  }

  return { success: true };
}

/**
 * 设置默认账本
 */
export function setDefaultAccountBook(bookId) {
  MOCK_ACCOUNT_BOOKS.forEach(book => {
    book.is_default = book.id === bookId;
  });
  return { success: true };
}

/**
 * 获取账本成员
 */
export function getAccountBookMembers(bookId) {
  return MOCK_MEMBERS[bookId] || [];
}

/**
 * 移除成员
 */
export function removeAccountBookMember(data) {
  const { book_id, target_uid } = data;
  const members = MOCK_MEMBERS[book_id] || [];
  const index = members.findIndex(m => m.user_id === target_uid);
  if (index > -1) {
    members.splice(index, 1);
  }

  const book = MOCK_ACCOUNT_BOOKS.find(b => b.id === book_id);
  if (book) {
    book.member_count = members.length;
  }

  return { success: true };
}
