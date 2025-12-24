import { get, post } from '@/api/request.js'

export const apiUserInit = () => get('/user/init')
export const apiFamilyStatus = () => get('/family/status')
export const apiFamilyBind = (partnerUid) => post('/family/bind', { partnerUid })
export const apiFamilyUnbind = () => post('/family/unbind')
export const apiFamilyInfo = () => get('/family/info')

export const apiBudgetGet = () => get('/budget/get')
export const apiBudgetSet = (total) => post('/budget/set', { total })

export const apiAnniversaryList = () => get('/anniversary/list')
export const apiAnniversaryHome = () => get('/anniversary/home')
export const apiAnniversaryCreate = (payload) => post('/anniversary/create', payload)
export const apiAnniversaryUpdate = (payload) => post('/anniversary/update', payload)
export const apiAnniversaryDelete = (id) => post('/anniversary/delete', { id })
export const apiAnniversarySetHome = (id, showOnHome) => post('/anniversary/setHome', { id, showOnHome })

export const apiBillTimeline = (month) => get('/bill/timeline', { month })
export const apiBillLikeToggle = (billId) => post('/bill/like/toggle', { billId })
export const apiBillComments = (billId) => get('/bill/comments', { billId })
export const apiBillCommentAdd = (billId, content) => post('/bill/comment/add', { billId, content })

export const apiTagsList = () => get('/tags/list')
export const apiCustomTagAdd = (name) => post('/tags/custom/add', { name })
export const apiCustomTagRename = (id, name) => post('/tags/custom/rename', { id, name })

export const apiBillCreate = (payload) => post('/bill/create', payload)

export const apiRecurringList = () => get('/recurring/list')
export const apiRecurringCreate = (payload) => post('/recurring/create', payload)
export const apiRecurringUpdate = (payload) => post('/recurring/update', payload)
export const apiRecurringDelete = (id) => post('/recurring/delete', { id })

export const apiStatsTrend = (range, month) => get('/stats/trend', { range, month })
export const apiStatsLarge = (threshold, month) => get('/stats/large', { threshold, month })
export const apiStatsReport = (month) => get('/stats/report', { month })

export const apiGiftsList = (direction, keyword) => get('/gifts/list', { direction, keyword })
