const BIND_PAGE = '/pages/bind/index'

function normalizePath(url = '') {
	const u = String(url || '')
	const p = u.split('?')[0]
	if (!p) return ''
	return p.startsWith('/') ? p : '/' + p
}

function isBound() {
	return !!uni.getStorageSync('is_bound')
}

function shouldBlock(targetUrl) {
	const path = normalizePath(targetUrl)
	if (!path) return false
	if (path === BIND_PAGE) return false
	return !isBound()
}

export function initRouteGuard() {
	const rawNavigateTo = uni.navigateTo
	const rawRedirectTo = uni.redirectTo
	const rawReLaunch = uni.reLaunch
	const rawSwitchTab = uni.switchTab

	function toBindPage() {
		uni.showToast({ title: '请先完成家庭绑定', icon: 'none' })
		return rawRedirectTo({ url: BIND_PAGE })
	}

	uni.navigateTo = (options) => {
		if (shouldBlock(options?.url)) return toBindPage()
		return rawNavigateTo(options)
	}

	uni.redirectTo = (options) => {
		if (shouldBlock(options?.url)) return toBindPage()
		return rawRedirectTo(options)
	}

	uni.reLaunch = (options) => {
		if (shouldBlock(options?.url)) return rawReLaunch({ url: BIND_PAGE })
		return rawReLaunch(options)
	}

	uni.switchTab = (options) => {
		if (shouldBlock(options?.url)) return toBindPage()
		return rawSwitchTab(options)
	}
}
