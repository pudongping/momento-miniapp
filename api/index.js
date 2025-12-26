// API 接口统一管理
// 所有网络请求方法都以 Api 为后缀命名
import { get, post, put, del } from './request.js'

// 用户相关接口
export const getUserInfoApi = () => get('/user/info')
export const loginApi = (code) => post('/user/login', { code })