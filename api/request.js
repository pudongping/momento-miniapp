let _config = {
	baseURL: '',
	timeout: 15000,
	showErrorToast: true,
	getToken: null,
	tokenHeader: 'Authorization',
	tokenPrefix: 'Bearer '
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

export function request(options = {}) {
	return new Promise((resolve, reject) => {
		const url = options.url || ''
		const requestUrl = _isAbsoluteUrl(url) ? url : _joinUrl(_config.baseURL, url)

		const header = {
			...(options.header || {})
		}

		const token = typeof _config.getToken === 'function' ? _config.getToken() : uni.getStorageSync('token')
		if (token && !header[_config.tokenHeader]) {
			header[_config.tokenHeader] = _config.tokenPrefix ? _config.tokenPrefix + token : token
		}

		uni.request({
			...options,
			url: requestUrl,
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
