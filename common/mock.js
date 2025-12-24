import { generateSnowflakeId } from '@/common/snowflake.js'

function ok(data) {
	return { code: 0, msg: '', data }
}

function fail(msg, code = 1) {
	return { code, msg: msg || '请求失败', data: null }
}

function delay(ms = 200) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function getStorage(key, defaultValue) {
	const v = uni.getStorageSync(key)
	return v === '' || v === null || typeof v === 'undefined' ? defaultValue : v
}

function setStorage(key, value) {
	uni.setStorageSync(key, value)
}

function ensureAnniversarySeed() {
	const list = getStorage('anniversary_list', null)
	if (Array.isArray(list) && list.length > 0) return

	setStorage('anniversary_list', [
		{
			id: generateSnowflakeId(),
			title: '结婚纪念日',
			date: '2026-01-01',
			showOnHome: true
		}
	])
}

function ensureUserProfileSeed() {
	const me = getStorage('profile_me', null)
	if (me && typeof me === 'object') return
	setStorage('profile_me', {
		nickname: '我',
		avatar: ''
	})
}

function getFamilyInfo() {
	const uid = String(getStorage('uid', ''))
	const partnerUid = String(getStorage('partner_uid', ''))
	ensureUserProfileSeed()
	const meProfile = getStorage('profile_me', {})
	const partnerProfile = getStorage('profile_partner', { nickname: 'TA', avatar: '' })
	return {
		me: {
			uid,
			nickname: meProfile?.nickname || '我',
			avatar: meProfile?.avatar || ''
		},
		partner: {
			uid: partnerUid,
			nickname: partnerProfile?.nickname || 'TA',
			avatar: partnerProfile?.avatar || ''
		}
	}
}

function ensureBillsSeed() {
	const list = getStorage('bill_list', null)
	if (Array.isArray(list) && list.length > 0) return

	const uid = String(getStorage('uid', ''))
	const partnerUid = String(getStorage('partner_uid', ''))
	const today = new Date()
	const yyyy = today.getFullYear()
	const mm = String(today.getMonth() + 1).padStart(2, '0')
	const dd = String(today.getDate()).padStart(2, '0')
	const ymd = `${yyyy}-${mm}-${dd}`
	const ymd2 = `${yyyy}-${mm}-${String(Math.max(1, today.getDate() - 1)).padStart(2, '0')}`

	const seededBills = [
		{
			id: generateSnowflakeId(),
			date: ymd,
			tag: '餐饮',
			note: '热汤面',
			amount: 38,
			recorderUid: uid,
			recorderName: '我',
			recorderAvatar: '',
			liked: true,
			likeCount: 2
		},
		{
			id: generateSnowflakeId(),
			date: ymd,
			tag: '买菜',
			note: '水果',
			amount: 56,
			recorderUid: partnerUid,
			recorderName: 'TA',
			recorderAvatar: '',
			liked: false,
			likeCount: 0
		},
		{
			id: generateSnowflakeId(),
			date: ymd2,
			tag: '交通',
			note: '地铁',
			amount: 12,
			recorderUid: uid,
			recorderName: '我',
			recorderAvatar: '',
			liked: false,
			likeCount: 1
		}
	]
	setStorage('bill_list', seededBills)
	setStorage(
		'bill_seeded_ids',
		seededBills.map((x) => String(x.id))
	)
	setStorage('bill_comments', {
		[String(seededBills[0].id)]: [
			{
				id: generateSnowflakeId(),
				uid: String(getStorage('partner_uid', '')),
				nickname: 'TA',
				content: '辛苦啦，抱抱',
				createdAt: Date.now()
			}
		]
	})
}

function ensureGiftsSeed() {
	const list = getStorage('gift_records', null)
	if (Array.isArray(list) && list.length > 0) return

	setStorage('gift_records', [
		{
			id: generateSnowflakeId(),
			direction: 'received',
			name: '小林',
			event: '乔迁',
			amount: 600,
			date: '2025-12-08',
			note: '朋友'
		},
		{
			id: generateSnowflakeId(),
			direction: 'sent',
			name: '王阿姨',
			event: '满月',
			amount: 1000,
			date: '2025-12-12',
			note: '亲戚'
		},
		{
			id: generateSnowflakeId(),
			direction: 'received',
			name: '阿杰',
			event: '婚礼',
			amount: 800,
			date: '2025-12-18',
			note: '同事'
		},
		{
			id: generateSnowflakeId(),
			direction: 'sent',
			name: '小林',
			event: '婚礼',
			amount: 1200,
			date: '2025-12-20',
			note: '朋友'
		}
	])
}

const SYSTEM_TAGS = ['餐饮', '买菜', '房贷', '车贷', '交通', '医疗', '孩子']

function normalizeName(name) {
	return String(name || '').trim()
}

function ensureTagsSeed() {
	const custom = getStorage('custom_tags', null)
	if (!Array.isArray(custom)) setStorage('custom_tags', [])
}

function getAllTagNamesLower() {
	ensureTagsSeed()
	const custom = getStorage('custom_tags', [])
	const customArr = Array.isArray(custom) ? custom : []
	const names = [...SYSTEM_TAGS, ...customArr.map((x) => x?.name).filter(Boolean)]
	return names.map((n) => String(n).trim().toLowerCase())
}

function ensureRecurringSeed() {
	const rules = getStorage('recurring_rules', null)
	if (!Array.isArray(rules)) setStorage('recurring_rules', [])
	const months = getStorage('recurring_generated_months', null)
	if (!Array.isArray(months)) setStorage('recurring_generated_months', [])
}

function daysInMonth(year, monthIndex0) {
	return new Date(year, monthIndex0 + 1, 0).getDate()
}

function ensureRecurringBillsForMonth(monthKey) {
	if (!monthKey) return
	ensureRecurringSeed()
	ensureBillsSeed()

	const months = getStorage('recurring_generated_months', [])
	const monthArr = Array.isArray(months) ? months : []
	if (monthArr.includes(monthKey)) return

	const rules = getStorage('recurring_rules', [])
	const ruleArr = Array.isArray(rules) ? rules : []
	if (ruleArr.length === 0) {
		monthArr.push(monthKey)
		setStorage('recurring_generated_months', monthArr)
		return
	}

	const [yStr, mStr] = String(monthKey).split('-')
	const y = Number(yStr)
	const m = Number(mStr)
	if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return
	const lastDay = daysInMonth(y, m - 1)

	const list = getStorage('bill_list', [])
	const bills = Array.isArray(list) ? list : []

	ruleArr.forEach((r) => {
		const ruleId = String(r?.id || '')
		if (!ruleId) return
		const rawDay = Number(r?.day)
		if (!Number.isFinite(rawDay) || rawDay <= 0) return
		const day = Math.min(lastDay, Math.max(1, Math.floor(rawDay)))
		const date = `${monthKey}-${String(day).padStart(2, '0')}`

		const exists = bills.some((b) => String(b?.recurringRuleId || '') === ruleId && String(b?.date || '').startsWith(monthKey))
		if (exists) return

		bills.unshift({
			id: generateSnowflakeId(),
			date,
			tag: r.tag,
			note: r.note || '周期账单',
			amount: Number(r.amount || 0),
			recorderUid: 'system',
			recorderName: '系统',
			recorderAvatar: '',
			liked: false,
			likeCount: 0,
			recurringRuleId: ruleId
		})
	})

	setStorage('bill_list', bills)
	monthArr.push(monthKey)
	setStorage('recurring_generated_months', monthArr)
}

function ensureBillCommentsSeed(billId) {
	const seeded = getStorage('bill_seeded_ids', [])
	if (!Array.isArray(seeded) || !seeded.includes(String(billId))) return
	const map = getStorage('bill_comments', {})
	if (map && typeof map === 'object' && Array.isArray(map[billId]) && map[billId].length > 0) return
	if (!map || typeof map !== 'object') return

	map[billId] = [
		{
			id: generateSnowflakeId(),
			uid: String(getStorage('partner_uid', '')),
			nickname: 'TA',
			content: '辛苦啦，抱抱',
			createdAt: Date.now()
		}
	]
	setStorage('bill_comments', map)
}

function computeTimeline(list) {
	const groups = {}
	let monthSpent = 0
	list.forEach((b) => {
		const date = String(b?.date || '')
		const dayKey = date.slice(5, 10)
		if (!groups[dayKey]) groups[dayKey] = { day: dayKey, total: 0, bills: [] }
		groups[dayKey].total += Number(b.amount || 0)
		monthSpent += Number(b.amount || 0)
		groups[dayKey].bills.push(b)
	})

	const timeline = Object.values(groups).sort((a, b) => (a.day < b.day ? 1 : -1))
	return { timeline, monthSpent }
}

function getMonthPrefix(month) {
	if (!month) return ''
	const m = String(month)
	return /^\d{4}-\d{2}$/.test(m) ? m : ''
}

function getTodayYmd() {
	const d = new Date()
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const dd = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${dd}`
}

function addDays(date, n) {
	const d = new Date(date.getTime())
	d.setDate(d.getDate() + n)
	return d
}

function formatYmd(d) {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const dd = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${dd}`
}

function sumBillsByDateMap(bills) {
	const map = {}
	bills.forEach((b) => {
		const date = String(b?.date || '')
		if (!date) return
		map[date] = (map[date] || 0) + Number(b?.amount || 0)
	})
	return map
}

function getBillsByMonth(monthKey) {
	ensureBillsSeed()
	if (monthKey) ensureRecurringBillsForMonth(monthKey)
	const list = getStorage('bill_list', [])
	const arr = Array.isArray(list) ? list : []
	return monthKey ? arr.filter((x) => String(x?.date || '').startsWith(monthKey)) : arr
}

function getTrend(range, monthKey) {
	const today = new Date(String(getTodayYmd()).replace(/-/g, '/'))
	if (range === 'week') {
		const start = addDays(today, -6)
		const month = formatYmd(today).slice(0, 7)
		const bills = getBillsByMonth(month)
		const map = sumBillsByDateMap(bills)
		const labels = []
		const values = []
		for (let i = 0; i < 7; i++) {
			const d = addDays(start, i)
			const ymd = formatYmd(d)
			labels.push(ymd.slice(5, 10))
			values.push(Number(map[ymd] || 0))
		}
		return { labels, values }
	}

	if (range === 'year') {
		const now = new Date()
		const year = now.getFullYear()
		const labels = []
		const values = []
		for (let i = 1; i <= 12; i++) {
			const m = String(i).padStart(2, '0')
			const key = `${year}-${m}`
			const bills = getBillsByMonth(key)
			labels.push(m)
			values.push(bills.reduce((s, b) => s + Number(b?.amount || 0), 0))
		}
		return { labels, values }
	}

	const month = getMonthPrefix(monthKey) || formatYmd(today).slice(0, 7)
	const bills = getBillsByMonth(month)
	const map = sumBillsByDateMap(bills)
	const [yStr, mStr] = month.split('-')
	const y = Number(yStr)
	const m = Number(mStr)
	const days = daysInMonth(y, m - 1)
	const labels = []
	const values = []
	for (let d = 1; d <= days; d++) {
		const day = String(d).padStart(2, '0')
		const ymd = `${month}-${day}`
		labels.push(day)
		values.push(Number(map[ymd] || 0))
	}
	return { labels, values }
}

export async function mockRequest({ url, method = 'GET', data = {}, header = {} }) {
	await delay(180)

	if (url === '/user/init' && method === 'GET') {
		let uid = getStorage('uid', '')
		if (!uid) {
			uid = generateSnowflakeId()
			setStorage('uid', uid)
		}

		const isBound = !!getStorage('is_bound', false)
		const partnerUid = getStorage('partner_uid', '')

		return ok({ uid, isBound, partnerUid })
	}

	if (url === '/family/status' && method === 'GET') {
		const uid = String(getStorage('uid', ''))
		const isBound = !!getStorage('is_bound', false)
		const partnerUid = String(getStorage('partner_uid', ''))
		return ok({ uid, isBound, partnerUid })
	}

	if (url === '/family/bind' && method === 'POST') {
		const myUid = getStorage('uid', '')
		if (!myUid) return fail('请先初始化用户')

		const partnerUid = (data && (data.partnerUid || data.partner_uid)) || ''
		if (!partnerUid) return fail('请输入对方 UID')
		if (partnerUid === myUid) return fail('不能绑定自己')

		setStorage('is_bound', true)
		setStorage('partner_uid', String(partnerUid))
		return ok({ isBound: true, partnerUid: String(partnerUid) })
	}

	if (url === '/family/unbind' && method === 'POST') {
		setStorage('is_bound', false)
		setStorage('partner_uid', '')
		return ok({ isBound: false })
	}

	if (url === '/family/info' && method === 'GET') {
		const uid = getStorage('uid', '')
		if (!uid) return fail('请先初始化用户')
		return ok(getFamilyInfo())
	}

	if (url === '/budget/get' && method === 'GET') {
		const total = Number(getStorage('budget_total', 10000))
		return ok({ total })
	}

	if (url === '/budget/set' && method === 'POST') {
		const total = Number(data?.total)
		if (!Number.isFinite(total) || total <= 0) return fail('预算金额不合法')
		setStorage('budget_total', total)
		return ok({ total })
	}

	if (url === '/anniversary/list' && method === 'GET') {
		ensureAnniversarySeed()
		const list = getStorage('anniversary_list', [])
		return ok({ list: Array.isArray(list) ? list : [] })
	}

	if (url === '/anniversary/home' && method === 'GET') {
		ensureAnniversarySeed()
		const list = getStorage('anniversary_list', [])
		const arr = Array.isArray(list) ? list : []
		const home = arr.find((x) => x && x.showOnHome)
		return ok({ item: home || null })
	}

	if (url === '/anniversary/create' && method === 'POST') {
		ensureAnniversarySeed()
		const title = String(data?.title || '').trim()
		const date = String(data?.date || '').trim()
		if (!title) return fail('请输入纪念日名称')
		if (!date) return fail('请输入纪念日日期')

		const list = getStorage('anniversary_list', [])
		const arr = Array.isArray(list) ? list : []
		const item = { id: generateSnowflakeId(), title, date, showOnHome: !!data?.showOnHome }
		arr.unshift(item)
		setStorage('anniversary_list', arr)
		return ok({ item })
	}

	if (url === '/anniversary/update' && method === 'POST') {
		ensureAnniversarySeed()
		const id = String(data?.id || '')
		if (!id) return fail('缺少 id')
		const list = getStorage('anniversary_list', [])
		const arr = Array.isArray(list) ? list : []
		const idx = arr.findIndex((x) => String(x?.id) === id)
		if (idx < 0) return fail('纪念日不存在')

		arr[idx] = {
			...arr[idx],
			title: data?.title ? String(data.title).trim() : arr[idx].title,
			date: data?.date ? String(data.date).trim() : arr[idx].date,
			showOnHome: typeof data?.showOnHome === 'boolean' ? data.showOnHome : arr[idx].showOnHome
		}
		setStorage('anniversary_list', arr)
		return ok({ item: arr[idx] })
	}

	if (url === '/anniversary/delete' && method === 'POST') {
		ensureAnniversarySeed()
		const id = String(data?.id || '')
		if (!id) return fail('缺少 id')
		const list = getStorage('anniversary_list', [])
		const arr = Array.isArray(list) ? list : []
		const next = arr.filter((x) => String(x?.id) !== id)
		setStorage('anniversary_list', next)
		return ok({})
	}

	if (url === '/anniversary/setHome' && method === 'POST') {
		ensureAnniversarySeed()
		const id = String(data?.id || '')
		const showOnHome = !!data?.showOnHome
		if (!id) return fail('缺少 id')
		const list = getStorage('anniversary_list', [])
		const arr = Array.isArray(list) ? list : []
		const idx = arr.findIndex((x) => String(x?.id) === id)
		if (idx < 0) return fail('纪念日不存在')
		arr[idx] = { ...arr[idx], showOnHome }
		setStorage('anniversary_list', arr)
		return ok({ item: arr[idx] })
	}

	if (url === '/tags/list' && method === 'GET') {
		ensureTagsSeed()
		const custom = getStorage('custom_tags', [])
		return ok({ system: SYSTEM_TAGS, custom: Array.isArray(custom) ? custom : [] })
	}

	if (url === '/tags/custom/add' && method === 'POST') {
		ensureTagsSeed()
		const name = normalizeName(data?.name)
		if (!name) return fail('请输入标签名称')
		const allLower = getAllTagNamesLower()
		if (allLower.includes(name.toLowerCase())) return fail('标签已存在')
		const custom = getStorage('custom_tags', [])
		const arr = Array.isArray(custom) ? custom : []
		const item = { id: generateSnowflakeId(), name }
		arr.push(item)
		setStorage('custom_tags', arr)
		return ok({ item })
	}

	if (url === '/tags/custom/rename' && method === 'POST') {
		ensureTagsSeed()
		const id = String(data?.id || '')
		const name = normalizeName(data?.name)
		if (!id) return fail('缺少 id')
		if (!name) return fail('请输入标签名称')
		const custom = getStorage('custom_tags', [])
		const arr = Array.isArray(custom) ? custom : []
		const idx = arr.findIndex((x) => String(x?.id) === id)
		if (idx < 0) return fail('标签不存在')
		const allLower = getAllTagNamesLower().filter((n) => n !== String(arr[idx]?.name || '').trim().toLowerCase())
		if (allLower.includes(name.toLowerCase())) return fail('标签已存在')
		arr[idx] = { ...arr[idx], name }
		setStorage('custom_tags', arr)
		return ok({ item: arr[idx] })
	}

	if (url === '/recurring/list' && method === 'GET') {
		ensureRecurringSeed()
		const rules = getStorage('recurring_rules', [])
		return ok({ list: Array.isArray(rules) ? rules : [] })
	}

	if (url === '/recurring/create' && method === 'POST') {
		ensureRecurringSeed()
		const day = Number(data?.day)
		const amount = Number(data?.amount)
		const tag = normalizeName(data?.tag)
		const note = normalizeName(data?.note)
		if (!Number.isFinite(day) || day < 1 || day > 31) return fail('固定日仅支持 1-31')
		if (!Number.isFinite(amount) || amount <= 0) return fail('金额不合法')
		if (!tag) return fail('请选择标签')
		const rules = getStorage('recurring_rules', [])
		const arr = Array.isArray(rules) ? rules : []
		const item = { id: generateSnowflakeId(), day: Math.floor(day), amount, tag, note }
		arr.unshift(item)
		setStorage('recurring_rules', arr)
		setStorage('recurring_generated_months', [])
		return ok({ item })
	}

	if (url === '/recurring/update' && method === 'POST') {
		ensureRecurringSeed()
		const id = String(data?.id || '')
		if (!id) return fail('缺少 id')
		const rules = getStorage('recurring_rules', [])
		const arr = Array.isArray(rules) ? rules : []
		const idx = arr.findIndex((x) => String(x?.id) === id)
		if (idx < 0) return fail('规则不存在')
		const day = Number(data?.day)
		const amount = Number(data?.amount)
		const tag = normalizeName(data?.tag)
		const note = normalizeName(data?.note)
		if (!Number.isFinite(day) || day < 1 || day > 31) return fail('固定日仅支持 1-31')
		if (!Number.isFinite(amount) || amount <= 0) return fail('金额不合法')
		if (!tag) return fail('请选择标签')
		arr[idx] = { ...arr[idx], day: Math.floor(day), amount, tag, note }
		setStorage('recurring_rules', arr)
		setStorage('recurring_generated_months', [])
		return ok({ item: arr[idx] })
	}

	if (url === '/recurring/delete' && method === 'POST') {
		ensureRecurringSeed()
		const id = String(data?.id || '')
		if (!id) return fail('缺少 id')
		const rules = getStorage('recurring_rules', [])
		const arr = Array.isArray(rules) ? rules : []
		setStorage('recurring_rules', arr.filter((x) => String(x?.id) !== id))
		setStorage('recurring_generated_months', [])
		return ok({})
	}

	if (url === '/bill/create' && method === 'POST') {
		ensureBillsSeed()
		const amount = Number(data?.amount)
		const tag = normalizeName(data?.tag)
		const note = normalizeName(data?.note)
		if (!Number.isFinite(amount) || amount <= 0) return fail('金额不合法')
		if (!tag) return fail('请选择标签')
		const uid = String(getStorage('uid', ''))
		if (!uid) return fail('请先初始化用户')
		const today = new Date()
		const yyyy = today.getFullYear()
		const mm = String(today.getMonth() + 1).padStart(2, '0')
		const dd = String(today.getDate()).padStart(2, '0')
		const date = `${yyyy}-${mm}-${dd}`
		const list = getStorage('bill_list', [])
		const arr = Array.isArray(list) ? list : []
		const item = {
			id: generateSnowflakeId(),
			date,
			tag,
			note,
			amount,
			recorderUid: uid,
			recorderName: '我',
			recorderAvatar: '',
			liked: false,
			likeCount: 0
		}
		arr.unshift(item)
		setStorage('bill_list', arr)
		return ok({ item })
	}

	if (url === '/bill/timeline' && method === 'GET') {
		ensureBillsSeed()
		const month = getMonthPrefix(data?.month)
		if (month) ensureRecurringBillsForMonth(month)
		const list = getStorage('bill_list', [])
		const arr = Array.isArray(list) ? list : []
		const filtered = month ? arr.filter((x) => String(x?.date || '').startsWith(month)) : arr

		const finalList = filtered.map((b) => {
			ensureBillCommentsSeed(b.id)
			const commentMap = getStorage('bill_comments', {})
			const comments = (commentMap && commentMap[b.id]) || []
			return {
				...b,
				commentCount: Array.isArray(comments) ? comments.length : 0,
				commentsPreview: Array.isArray(comments) ? comments.slice(0, 2) : []
			}
		})

		const { timeline, monthSpent } = computeTimeline(finalList)
		return ok({ timeline, monthSpent })
	}

	if (url === '/bill/like/toggle' && method === 'POST') {
		ensureBillsSeed()
		const billId = String(data?.billId || '')
		if (!billId) return fail('缺少 billId')
		const list = getStorage('bill_list', [])
		const arr = Array.isArray(list) ? list : []
		const idx = arr.findIndex((x) => String(x?.id) === billId)
		if (idx < 0) return fail('账单不存在')

		const liked = !arr[idx].liked
		const likeCount = Math.max(0, Number(arr[idx].likeCount || 0) + (liked ? 1 : -1))
		arr[idx] = { ...arr[idx], liked, likeCount }
		setStorage('bill_list', arr)
		return ok({ billId, liked, likeCount })
	}

	if (url === '/bill/comments' && method === 'GET') {
		ensureBillsSeed()
		const billId = String(data?.billId || '')
		if (!billId) return fail('缺少 billId')
		const map = getStorage('bill_comments', {})
		ensureBillCommentsSeed(billId)
		const list = map && map[billId]
		return ok({ list: Array.isArray(list) ? list : [] })
	}

	if (url === '/bill/comment/add' && method === 'POST') {
		ensureBillsSeed()
		const billId = String(data?.billId || '')
		const content = String(data?.content || '').trim()
		if (!billId) return fail('缺少 billId')
		if (!content) return fail('请输入评论内容')

		const uid = String(getStorage('uid', ''))
		const map = getStorage('bill_comments', {})
		if (!map || typeof map !== 'object') return fail('评论系统异常')
		if (!Array.isArray(map[billId])) map[billId] = []
		const comment = { id: generateSnowflakeId(), uid, nickname: '我', content, createdAt: Date.now() }
		map[billId].unshift(comment)
		setStorage('bill_comments', map)
		return ok({ comment })
	}

	if (url === '/gifts/list' && method === 'GET') {
		ensureGiftsSeed()
		const direction = String(data?.direction || 'received')
		const keyword = String(data?.keyword || '').trim().toLowerCase()
		const list = getStorage('gift_records', [])
		const arr = Array.isArray(list) ? list : []
		const filtered = arr
			.filter((x) => String(x?.direction) === direction)
			.filter((x) => {
				if (!keyword) return true
				return String(x?.name || '').toLowerCase().includes(keyword)
			})
			.sort((a, b) => (String(a?.date || '') < String(b?.date || '') ? 1 : -1))
		return ok({ list: filtered })
	}

	if (url === '/stats/trend' && method === 'GET') {
		const range = String(data?.range || 'month')
		const month = getMonthPrefix(data?.month)
		return ok(getTrend(range, month))
	}

	if (url === '/stats/large' && method === 'GET') {
		const threshold = Number(data?.threshold ?? 500)
		const month = getMonthPrefix(data?.month) || getTodayYmd().slice(0, 7)
		const bills = getBillsByMonth(month)
		const list = bills
			.filter((b) => Number(b?.amount || 0) >= threshold)
			.sort((a, b) => Number(b?.amount || 0) - Number(a?.amount || 0))
		return ok({ threshold, month, list })
	}

	if (url === '/stats/report' && method === 'GET') {
		const month = getMonthPrefix(data?.month) || getTodayYmd().slice(0, 7)
		const bills = getBillsByMonth(month)
		let maxBill = null
		let totalSpent = 0
		const daysSet = new Set()
		bills.forEach((b) => {
			const amt = Number(b?.amount || 0)
			totalSpent += amt
			daysSet.add(String(b?.date || ''))
			if (!maxBill || amt > Number(maxBill?.amount || 0)) maxBill = b
		})
		const recordDays = daysSet.size
		const netAssetChange = 8000 - totalSpent
		return ok({
			month,
			totalSpent,
			recordDays,
			maxBill: maxBill
				? {
					id: maxBill.id,
					amount: Number(maxBill.amount || 0),
					tag: maxBill.tag,
					note: maxBill.note,
					date: maxBill.date
				}
				: null,
			netAssetChange
		})
	}

	return fail('Mock：接口不存在')
}

export const MOCK_API_PREFIX = ''
