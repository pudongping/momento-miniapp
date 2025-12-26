<template>
	<view class="page">
		<view class="card">
			<view class="title">人情往来</view>
			<view class="sub">我收到的 / 我送出的 · 姓名搜索实时筛选</view>
		</view>

		<view class="card mt">
			<view class="row">
				<view class="seg" :class="{ on: tab === 'received' }" @click="setTab('received')">我收到的</view>
				<view class="seg" :class="{ on: tab === 'sent' }" @click="setTab('sent')">我送出的</view>
			</view>
			<input class="search" type="text" v-model="keyword" placeholder="输入姓名，实时筛选" />
		</view>

		<view class="card mt">
			<view v-if="filteredList.length === 0" class="empty">暂无记录</view>
			<view v-for="item in filteredList" :key="item.id" class="item">
				<view class="left">
					<view class="name">{{ item.name }}</view>
					<view class="meta">{{ item.event }} · {{ item.date }}</view>
					<view v-if="item.note" class="note">{{ item.note }}</view>
				</view>
				<view class="right" :class="{ income: tab === 'received', outcome: tab === 'sent' }">
					{{ amountText(item.amount) }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
// 人情往来（Social Gifts）：
// 1) 未绑定时强制跳转绑定页（全局路由拦截也会兜底）
// 2) Tab 切换：我收到的(received) / 我送出的(sent)
// 3) 搜索：输入姓名实时筛选并展示与该人的往来记录（当前按 tab 维度筛选）
// 4) 字段：姓名、事件、金额、日期、备注
// 5) 数据来源：统一请求层 + mock（common/mock.js）

import { onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import { apiGiftsList } from '@/api/index.js'
import { useBindingStore } from '@/store/binding.js'

const bindingStore = useBindingStore()

const tab = ref('received')
const keyword = ref('')
const list = ref([])

const filteredList = computed(() => {
	const k = String(keyword.value || '').trim().toLowerCase()
	if (!k) return list.value
	return list.value.filter((x) => String(x?.name || '').toLowerCase().includes(k))
})

function amountText(amount) {
	const n = Number(amount || 0)
	if (tab.value === 'received') return `+${n}`
	return `-${n}`
}

async function load() {
	const res = await apiGiftsList(tab.value)
	list.value = Array.isArray(res?.list) ? res.list : []
}

function setTab(t) {
	if (tab.value === t) return
	tab.value = t
	load()
}

watch(
	() => keyword.value,
	() => {
		// 实时筛选在 computed 里完成，这里不需要额外请求
	},
	{ immediate: false }
)

onShow(() => {
	bindingStore.init()
	if (!bindingStore.isBound) {
		uni.redirectTo({ url: '/pages/bind/index' })
		return
	}
	load()
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
	padding: 28rpx;
	box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
}

.title {
	font-size: 38rpx;
	font-weight: 700;
	color: $app-text;
}

.sub {
	margin-top: 10rpx;
	font-size: 28rpx;
	color: $app-subtext;
}

.row {
	display: flex;
	align-items: center;
	gap: 14rpx;
}

.seg {
	flex: 1;
	text-align: center;
	padding: 14rpx 0;
	border-radius: 18rpx;
	background: rgba(163, 177, 138, 0.10);
	color: $app-text;
	font-size: 26rpx;
}

.seg.on {
	background: rgba(163, 177, 138, 0.22);
	font-weight: 800;
}

.search {
	margin-top: 16rpx;
	padding: 16rpx 18rpx;
	border-radius: 18rpx;
	background: rgba(242, 232, 207, 0.55);
	font-size: 28rpx;
	color: $app-text;
}

.empty {
	font-size: 26rpx;
	color: $app-subtext;
}

.item {
	padding: 18rpx 18rpx;
	border-radius: 18rpx;
	background: rgba(242, 232, 207, 0.55);
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 14rpx;
}

.left {
	flex: 1;
	min-width: 0;
}

.name {
	font-size: 28rpx;
	font-weight: 800;
	color: $app-text;
}

.meta {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: $app-subtext;
}

.note {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: $app-subtext;
}

.right {
	flex-shrink: 0;
	margin-left: 14rpx;
	font-size: 32rpx;
	font-weight: 900;
}

.right.income {
	color: $app-primary;
}

.right.outcome {
	color: $app-warning;
}
</style>
