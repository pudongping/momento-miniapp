<template>
	<view class="page">
		<view class="hero card">
			<view class="heroTitle">时光小账本</view>
			<view class="heroSub">{{ heroText }}</view>
		</view>

		<BudgetTrafficLight class="mt" :total="budgetTotal" :spent="monthSpent" @set-budget="onSetBudget" />
		<BillTimeline class="mt" :items="timeline" />
	</view>
</template>

<script setup>
// 首页（Dashboard）骨架：
// 1) 若未绑定：强制跳转绑定页
// 2) 展示：纪念日倒计时（先用 mock 占位数据）
// 3) 展示：预算红绿灯组件（先用 mock 的预算 + 模拟月支出）
// 4) 展示：账单时间轴流组件（先用 mock 占位数据）

import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import BudgetTrafficLight from '@/components/BudgetTrafficLight.vue'
import BillTimeline from '@/components/BillTimeline.vue'
import { apiAnniversaryHome, apiBillTimeline, apiBudgetGet, apiBudgetSet } from '@/api/index.js'
import { useBindingStore } from '@/store/binding.js'
import { useBudgetStore } from '@/store/budget.js'

const bindingStore = useBindingStore()
const budgetStore = useBudgetStore()

const monthSpent = ref(0)
const timeline = ref([])

const countdownDays = ref(null)
const anniversaryTitle = ref('')
const budgetTotal = computed(() => budgetStore.total)

const heroText = computed(() => {
	if (!anniversaryTitle.value) {
		return '去「我的 - 纪念日管理」设置首页展示纪念日'
	}
	if (typeof countdownDays.value !== 'number') {
		return `距离${anniversaryTitle.value}还有 - 天`
	}
	return `距离${anniversaryTitle.value}还有 ${countdownDays.value} 天`
})

function getMonthKey() {
	const d = new Date()
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	return `${y}-${m}`
}

function calcCountdownDays(dateStr) {
	const date = new Date(String(dateStr).replace(/-/g, '/'))
	if (Number.isNaN(date.getTime())) return null
	const now = new Date()
	const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
	const end = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
	return Math.ceil((end - start) / (24 * 60 * 60 * 1000))
}

async function init() {
	bindingStore.init()
	budgetStore.init()

	if (!bindingStore.isBound) {
		uni.redirectTo({ url: '/pages/bind/index' })
		return
	}

	const res = await apiBudgetGet()
	budgetStore.setTotal(res?.total)

	const a = await apiAnniversaryHome()
	const item = a?.item
	anniversaryTitle.value = item?.title ? String(item.title) : ''
	countdownDays.value = item?.date ? calcCountdownDays(item.date) : null

	const month = getMonthKey()
	const billRes = await apiBillTimeline(month)
	monthSpent.value = Number(billRes?.monthSpent || 0)
	timeline.value = Array.isArray(billRes?.timeline) ? billRes.timeline : []
}

async function onSetBudget() {
	// 骨架阶段：先用弹窗输入预算，后续会拆分为“预算设置页”并全局同步
	uni.showModal({
		title: '设置本月预算',
		editable: true,
		placeholderText: '例如：10000',
		success: async (r) => {
			if (!r.confirm) return
			const v = Number(r.content)
			if (!Number.isFinite(v) || v <= 0) {
				uni.showToast({ title: '预算不合法', icon: 'none' })
				return
			}
			await apiBudgetSet(v)
			budgetStore.setTotal(v)
		}
	})
}

onShow(() => {
	init()
})
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: $app-bg;
	padding: 28rpx;
}

.mt {
	margin-top: 24rpx;
}

.card {
	background: rgba(255, 255, 255, 0.65);
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
}

.hero {
	padding: 32rpx;
}

.heroTitle {
	font-size: 40rpx;
	font-weight: 700;
	color: $app-text;
}

.heroSub {
	margin-top: 10rpx;
	font-size: 28rpx;
	color: $app-subtext;
}
</style>
