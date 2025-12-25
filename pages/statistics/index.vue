<template>
	<view class="page">
		<view class="card">
			<view class="title">统计</view>
			<view class="sub">趋势 / 大额预警 / 月度小报</view>
		</view>

		<view class="card mt">
			<view class="segRow">
				<view class="seg" :class="{ on: range === 'week' }" @click="setRange('week')">周</view>
				<view class="seg" :class="{ on: range === 'month' }" @click="setRange('month')">月</view>
				<view class="seg" :class="{ on: range === 'year' }" @click="setRange('year')">年</view>
			</view>
			<StatsLineChart :labels="trendLabels" :values="trendValues" :height="170" />
		</view>

		<view class="card mt">
			<view class="sectionTitle">大额预警</view>
			<view class="sub2">默认阈值 500 元，点击后列出本月所有超过阈值的账单</view>
			<view class="row mtSm">
				<input class="thresholdInput" type="digit" v-model="threshold" placeholder="500" />
				<button class="btnSm" type="default" @click="loadLarge">筛选</button>
			</view>
			<view v-if="largeList.length === 0" class="empty">暂无大额账单</view>
			<view v-for="b in largeList" :key="b.id" class="billRow">
				<view class="billLeft">
					<view class="billTag">{{ b.tag }}</view>
					<view class="billNote">{{ b.note }}</view>
					<view class="billDate">{{ b.date }}</view>
				</view>
				<view class="billAmt">-{{ b.amount }}</view>
			</view>
		</view>

		<view class="card mt">
			<view class="sectionTitle">月度小报</view>
			<view class="report">
				<view class="reportRow">
					<view class="k">本月最大支出</view>
					<view class="v">{{ reportMaxText }}</view>
				</view>
				<view class="reportRow">
					<view class="k">记账天数</view>
					<view class="v">{{ report.recordDays }} 天</view>
				</view>
				<view class="reportRow">
					<view class="k">家庭净资产变化（模拟）</view>
					<view class="v" :class="{ warn: report.netAssetChange < 0 }">{{ report.netAssetChange }} 元</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
// 统计页（Statistics）：
// 1) 未绑定时强制跳转绑定页
// 2) 趋势分析：周/月/年切换（当前用 mock + canvas 折线图）
// 3) 大额预警：阈值筛选器（默认 500 元），列出本月所有超过阈值的账单
// 4) 月度小报：模拟生成卡片数据（最大支出、记账天数、净资产变化）

import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import StatsLineChart from '@/components/StatsLineChart.vue'
import { apiStatsLarge, apiStatsReport, apiStatsTrend } from '@/api/index.js'
import { useBindingStore } from '@/store/binding.js'

const bindingStore = useBindingStore()

const range = ref('month')
const trendLabels = ref([])
const trendValues = ref([])

const threshold = ref('500')
const largeList = ref([])

const report = ref({ month: '', totalSpent: 0, recordDays: 0, maxBill: null, netAssetChange: 0 })

const reportMaxText = computed(() => {
	if (!report.value?.maxBill) return '-'
	const b = report.value.maxBill
	return `${b.amount}（${b.tag || ''}）`
})

function getMonthKey() {
	const d = new Date()
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	return `${y}-${m}`
}

async function loadTrend() {
	const month = range.value === 'year' ? '' : getMonthKey()
	const res = await apiStatsTrend(range.value, month)
	trendLabels.value = Array.isArray(res?.labels) ? res.labels : []
	trendValues.value = Array.isArray(res?.values) ? res.values : []
}

async function loadLarge() {
	const n = Number(threshold.value)
	const month = getMonthKey()
	const res = await apiStatsLarge(Number.isFinite(n) ? n : 500, month)
	largeList.value = Array.isArray(res?.list) ? res.list : []
}

async function loadReport() {
	const month = getMonthKey()
	const res = await apiStatsReport(month)
	report.value = res || report.value
}

async function init() {
	await loadTrend()
	await loadLarge()
	await loadReport()
}

function setRange(r) {
	range.value = r
	loadTrend()
}

onShow(() => {
	bindingStore.init()
	if (!bindingStore.isBound) {
		uni.redirectTo({ url: '/pages/bind/index' })
		return
	}
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
	background: $app-surface;
	border-radius: 24rpx;
	padding: 28rpx;
	box-shadow: $app-shadow;
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
}

.segRow {
	display: flex;
	align-items: center;
	padding: 6rpx;
	border-radius: 20rpx;
	background: $app-fill;
	border: 1rpx solid $app-border;
}

.seg {
	flex: 1;
	text-align: center;
	padding: 12rpx 0;
	border-radius: 16rpx;
	background: transparent;
	color: $app-subtext;
	font-size: 26rpx;
	font-weight: 600;
}

.seg.on {
	background: $app-surface;
	color: $app-text;
	font-weight: 700;
	box-shadow: $app-shadow-sm;
}

.sectionTitle {
	font-size: 30rpx;
	font-weight: 800;
	color: $app-text;
}

.sub2 {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: $app-subtext;
}

.mtSm {
	margin-top: 16rpx;
}

.thresholdInput {
	flex: 1;
	padding: 14rpx 16rpx;
	border-radius: 16rpx;
	background: $app-fill;
	font-size: 28rpx;
	color: $app-text;
}

.btnSm {
	margin-left: 16rpx;
	border-radius: 16rpx;
	background: $app-primary;
	color: #fff;
	font-size: 26rpx;
	line-height: 1;
	padding: 0 24rpx;
}

.empty {
	margin-top: 18rpx;
	font-size: 26rpx;
	color: $app-subtext;
}

.billRow {
	margin-top: 14rpx;
	padding: 18rpx 18rpx;
	border-radius: 18rpx;
	background: $app-fill;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.billLeft {
	flex: 1;
	min-width: 0;
}

.billTag {
	font-size: 26rpx;
	font-weight: 800;
	color: $app-text;
}

.billNote {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: $app-subtext;
}

.billDate {
	margin-top: 6rpx;
	font-size: 22rpx;
	color: $app-subtext;
}

.billAmt {
	flex-shrink: 0;
	margin-left: 14rpx;
	font-size: 30rpx;
	font-weight: 900;
	color: $app-warning;
}

.report {
	margin-top: 14rpx;
	padding: 18rpx;
	border-radius: 18rpx;
	background: $app-primary-soft;
}

.reportRow {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	padding: 10rpx 0;
}

.k {
	font-size: 24rpx;
	color: $app-subtext;
}

.v {
	font-size: 26rpx;
	color: $app-text;
	font-weight: 800;
}

.v.warn {
	color: $app-warning;
}
</style>
