// API 接口统一管理
// 所有网络请求方法都以 Api 为后缀命名
import { get, post, put, del, upload } from './request.js'

// 用户相关接口
export const getUserInfoApi = () => get('/user/info');
export const loginApi = (code) => post('/user/login', { code });
export const logoutApi = (data) => post('/user/logout', data);
export const updateUserInfoApi = (data) => put('/user/update', data);

// 用户设置相关接口（包含预算和背景图片）
export const getUserSettingsApi = () => get('/user/settings');
export const updateUserSettingsApi = (data) => put('/user/settings', data);

// 节日相关接口
export const getFestivalsApi = () => get('/festivals/list');
export const addFestivalApi = (data) => post('/festivals/add', data);
export const updateFestivalApi = (data) => put('/festivals/update', data);
export const deleteFestivalApi = (festival_id) => del('/festivals/delete', { festival_id });
export const toggleFestivalVisibilityApi = (data) => put('/festivals/toggle', data);

// 交易记录相关接口
export const getTransactionsApi = (params) => get('/transactions/list', params);
export const addTransactionApi = (data) => post('/transactions/add', data);
export const updateTransactionApi = (data) => put('/transactions/update', data);
export const deleteTransactionApi = (transaction_id) => del('/transactions/delete', { transaction_id });
export const getTransactionStats = (params) => get('/transactions/stats', params);

// 标签相关接口
export const getTagsApi = () => get('/tags/list');
export const addTagApi = (data) => post('/tags/add', data);
export const updateTagApi = (data) => put('/tags/update', data);
export const deleteTagApi = (tag_id) => del('/tags/delete', { tag_id });

// 周期性记账相关接口
export const getRecurringTransactionsApi = (params) => get('/recurring/list', params);
export const deleteRecurringTransactionApi = (recurring_id) => del('/recurring/delete', { recurring_id });
// 注意：周期记账的添加使用普通记账的 addTransactionApi 接口

// 账本相关接口
export const getAccountBooksApi = () => get('/accountBooks/list');
export const createAccountBookApi = (data) => post('/accountBooks/create', data);
export const deleteAccountBookApi = (book_id) => del('/accountBooks/delete', { book_id });
export const inviteUserApi = (data) => post('/accountBooks/invite', data);
export const getInvitationsApi = () => get('/accountBooks/invitations');
export const acceptInvitationApi = (invitation_id) => post('/accountBooks/accept', { invitation_id });
export const rejectInvitationApi = (invitation_id) => post('/accountBooks/reject', { invitation_id });
export const exitAccountBookApi = (book_id) => post('/accountBooks/exit', { book_id });
export const setDefaultAccountBookApi = (book_id) => put('/accountBooks/setDefault', { book_id });
export const getAccountBookMembersApi = (book_id) => get('/accountBooks/members', { book_id });
export const removeAccountBookMemberApi = (data) => post('/accountBooks/removeMember', data);

// 文件上传相关接口
export const uploadFileApi = (filePath, fileType, businessType) => {
  return upload('/upload/file', filePath, {
    file_type: fileType,
    business_type: businessType
  });
};