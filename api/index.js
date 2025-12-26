// API 接口统一管理
// 所有网络请求方法都以 Api 为后缀命名
import { get, post, put, del } from './request.js'

// 用户相关接口
export const getUserInfoApi = () => get('/user/info');
export const loginApi = (code) => post('/user/login', { code });
export const updateUserInfoApi = (data) => put('/user/update', data);

// 预算相关接口
export const getBudgetApi = () => get('/budget');
export const updateBudgetApi = (data) => put('/budget', data);

// 节日相关接口
export const getFestivalsApi = () => get('/festivals/list');
export const addFestivalApi = (data) => post('/festivals/add', data);
export const updateFestivalApi = (data) => put('/festivals/update', data);
export const deleteFestivalApi = (festival_id) => del('/festivals/delete', { festival_id });
export const toggleFestivalVisibilityApi = (data) => put('/festivals/toggle', data);

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