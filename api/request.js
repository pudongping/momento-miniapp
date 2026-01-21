import { mockApis } from '../mock/index.js';

// 生产环境
const baseURL = 'https://api-momento.gqgogogo.cn'
export const useMock = false

// 本地环境
// const baseURL = ''
// export const useMock = true

let _config = {
	baseURL: baseURL,
	timeout: 15000,
	showErrorToast: true,
	getToken: null,
	tokenHeader: 'Authorization',
	tokenPrefix: 'Bearer ',
	useMock: useMock // 使用mock数据，生产环境请设置为false
}

// 生成唯一的请求ID
function generateRequestId() {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 15);
	return `${timestamp}_${random}`;
}

// 获取设备ID
function getDeviceId() {
	let deviceId = uni.getStorageSync('device_id');
	if (!deviceId) {
		const systemInfo = uni.getSystemInfoSync();
		deviceId = `${systemInfo.model}_${systemInfo.platform}_${Date.now()}`;
		uni.setStorageSync('device_id', deviceId);
	}
	return deviceId;
}

// 获取用户ID
function getUserId() {
	const userInfo = uni.getStorageSync('userInfo');
	return userInfo?.user_id || userInfo?.uid || '';
}

export function setRequestConfig(partialConfig = {}) {
	_config = {
		..._config,
		...partialConfig
	}
}

function _isAbsoluteUrl(url) {
	return /^https?:\/\//i.test(url)
}

function _joinUrl(baseURL, url) {
	if (!baseURL) return url
	if (baseURL.endsWith('/') && url.startsWith('/')) return baseURL + url.slice(1)
	if (!baseURL.endsWith('/') && !url.startsWith('/')) return baseURL + '/' + url
	return baseURL + url
}

function _toast(title) {
	if (!_config.showErrorToast) return
	uni.showToast({
		title: title || '请求失败',
		icon: 'none'
	})
}

// 处理token失效的公共函数
function _handleTokenExpired() {
	console.log('Token已失效，自动退出登录')
	// 清除本地存储
	uni.removeStorageSync('token')
	uni.removeStorageSync('userInfo')
	
	// 显示提示信息
	uni.showToast({
		title: '登录已过期，请重新登录',
		icon: 'none',
		duration: 2000
	})
	
	// 延迟跳转到登录页面
	setTimeout(() => {
		uni.reLaunch({
			url: '/pages/login/index'
		})
	}, 2000)
}

export function request(options = {}) {
	return new Promise((resolve, reject) => {
		const url = options.url || ''
		const method = (options.method || 'GET').toUpperCase()
		
		const requestData = {
			...options.data
		};
		
		// 处理mock数据
		if (_config.useMock && mockApis[url]) {
			console.log(`[MOCK] ${method} ${url}`, requestData)
			try {
				const mockResult = mockApis[url]({ ...options, data: requestData, method })
				console.log(`[MOCK] 结果:`, mockResult)
				
				if (mockResult.code === 0) {
					// 模拟网络延迟
					setTimeout(() => {
						resolve(mockResult.data)
					}, 300)
					return
				} else {
					_toast(mockResult.msg)
					setTimeout(() => {
						reject(mockResult)
					}, 300)
					return
				}
			} catch (err) {
				console.error(`[MOCK] Error:`, err)
				_toast(err?.message || 'Mock数据处理异常')
				reject(err)
				return
			}
		}
		
		// 真实请求处理
		const requestUrl = _isAbsoluteUrl(url) ? url : _joinUrl(_config.baseURL, url)

		const header = {
			...(options.header || {})
		}

		// 添加请求头字段
		const requestId = generateRequestId();
		const deviceId = getDeviceId();
		const userId = getUserId();
		
		header['X-Request-ID'] = requestId;
		header['X-Device-ID'] = deviceId;
		if (userId) {
			header['X-User-ID'] = userId;
		}

		const token = typeof _config.getToken === 'function' ? _config.getToken() : uni.getStorageSync('token')
		if (token && !header[_config.tokenHeader]) {
			header[_config.tokenHeader] = _config.tokenPrefix ? _config.tokenPrefix + token : token
		}

		uni.request({
			...options,
			url: requestUrl,
			data: requestData,
			header,
			timeout: options.timeout ?? _config.timeout,
			success: (res) => {
				const statusCode = res?.statusCode
				const body = res?.data

				if (typeof statusCode === 'number' && (statusCode < 200 || statusCode >= 300)) {
					_toast(body?.msg || `请求失败(${statusCode})`)
					reject({ statusCode, data: body, raw: res })
					return
				}

				if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'code')) {
					if (body.code === 0) {
						resolve(body.data)
						return
					}

					// 处理token失效（401状态码）
					if (body.code === 401) {
						_handleTokenExpired()
						reject(body)
						return
					}

					_toast(body.msg)
					reject(body)
					return
				}

				resolve(body)
			},
			fail: (err) => {
				_toast(err?.errMsg || '网络异常')
				reject(err)
			}
		})
	})
}

export function get(url, data, options = {}) {
	return request({ ...options, url, data, method: 'GET' })
}

export function post(url, data, options = {}) {
	return request({ ...options, url, data, method: 'POST' })
}

export function put(url, data, options = {}) {
	return request({ ...options, url, data, method: 'PUT' })
}

export function del(url, data, options = {}) {
	return request({ ...options, url, data, method: 'DELETE' })
}

// 文件上传专用方法
export function upload(url, filePath, formData = {}, options = {}) {
	return new Promise((resolve, reject) => {
		const uploadData = {
			...formData
		};
		
		// 处理mock数据
		if (_config.useMock && mockApis[url]) {
			console.log(`[MOCK] UPLOAD ${url}`, { filePath, ...uploadData })
			try {
				const mockResult = mockApis[url]({ 
					...options, 
					method: 'POST',
					data: { ...uploadData, file: filePath }
				})
				console.log(`[MOCK] 结果:`, mockResult)
				
				if (mockResult.code === 0 || mockResult.code === 200) {
					setTimeout(() => {
						resolve(mockResult.data)
					}, 500)
					return
				} else {
					_toast(mockResult.msg || mockResult.message)
					setTimeout(() => {
						reject(mockResult)
					}, 500)
					return
				}
			} catch (err) {
				console.error(`[MOCK] Error:`, err)
				_toast(err?.message || 'Mock数据处理异常')
				reject(err)
				return
			}
		}
		
		// 真实上传处理
		const requestUrl = _isAbsoluteUrl(url) ? url : _joinUrl(_config.baseURL, url)
		
		const header = {
			...(options.header || {})
		}
		
		// 添加请求头字段
		const requestId = generateRequestId();
		const deviceId = getDeviceId();
		const userId = getUserId();
		
		header['X-Request-ID'] = requestId;
		header['X-Device-ID'] = deviceId;
		if (userId) {
			header['X-User-ID'] = userId;
		}

		const token = typeof _config.getToken === 'function' ? _config.getToken() : uni.getStorageSync('token')
		if (token && !header[_config.tokenHeader]) {
			header[_config.tokenHeader] = _config.tokenPrefix ? _config.tokenPrefix + token : token
		}
		
		uni.uploadFile({
			url: requestUrl,
			filePath: filePath,
			name: 'file',
			formData: uploadData,
			header: header,
			success: (res) => {
				const statusCode = res?.statusCode
				let body = res?.data
				
				// 尝试解析JSON响应
				if (typeof body === 'string') {
					try {
						body = JSON.parse(body)
					} catch (e) {
						console.error('解析上传响应失败', e)
					}
				}
				
				if (typeof statusCode === 'number' && (statusCode < 200 || statusCode >= 300)) {
					_toast(body?.msg || body?.message || `上传失败(${statusCode})`)
					reject({ statusCode, data: body, raw: res })
					return
				}
				
				if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'code')) {
					if (body.code === 0 || body.code === 200) {
						resolve(body.data)
						return
					}
					
					// 处理token失效（401状态码）
					if (body.code === 401) {
						_handleTokenExpired()
						reject(body)
						return
					}
					
					_toast(body.msg || body.message)
					reject(body)
					return
				}
				
				resolve(body)
			},
			fail: (err) => {
				_toast(err?.errMsg || '上传失败')
				reject(err)
			}
		})
	})
}
