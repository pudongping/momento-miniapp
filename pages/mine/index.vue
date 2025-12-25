<template>
	<view class="page">
		<view class="card">
			<view class="title">我的</view>
			<view class="sub">家庭管理 / 纪念日管理 / 预算设置</view>

			<view class="row">
				<view class="label">我的 UID</view>
				<view class="value">{{ uid }}</view>
				<view class="actions">
					<view class="action" @click="copy(uid)">复制</view>
				</view>
			</view>
			<view class="row">
				<view class="label">对方 UID</view>
				<view class="value">{{ partnerUid }}</view>
				<view class="actions">
					<view class="action" @click="copy(partnerUid)">复制</view>
				</view>
			</view>
		</view>

		<view class="card mt">
			<view class="menu" @click="goAnniversary">
				<view class="menuTitle">纪念日管理</view>
				<view class="menuSub">增删改 · 首页显示开关</view>
			</view>
			<view class="menu" @click="goBudget">
				<view class="menuTitle">预算设置</view>
				<view class="menuSub">修改本月总预算</view>
			</view>
		</view>
	</view>
</template>

<script setup>
// 我的（Settings）：
// 1) 未绑定时强制跳转绑定页
// 2) 家庭管理：展示双方 UID（并提供复制）
// 3) 入口：纪念日管理、预算设置
// 4) 数据来源：统一请求层 + mock（common/mock.js）

import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import { apiFamilyInfo } from '@/api/index.js'
import { useBindingStore } from '@/store/binding.js'

const bindingStore = useBindingStore()

const uid = computed(() => bindingStore.uid)
const partnerUid = computed(() => bindingStore.partnerUid)

async function load() {
	await apiFamilyInfo()
}

function copy(text) {
	const v = String(text || '')
	if (!v) {
		uni.showToast({ title: '暂无可复制内容', icon: 'none' })
		return
	}
	uni.setClipboardData({
		data: v,
		success: () => uni.showToast({ title: '已复制', icon: 'none' })
	})
}

function goAnniversary() {
	uni.navigateTo({ url: '/pages/anniversary/index' })
}

function goBudget() {
	uni.navigateTo({ url: '/pages/budget/index' })
}

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
	margin-top: 20rpx;
	padding: 18rpx 20rpx;
	border-radius: 18rpx;
	background: $app-fill;
}

.actions {
	margin-top: 10rpx;
	display: flex;
	justify-content: flex-end;
}

.action {
	font-size: 24rpx;
	color: $app-primary;
	font-weight: 700;
	padding: 8rpx 12rpx;
	border-radius: 14rpx;
	background: $app-primary-soft;
}

.menu {
	padding: 20rpx;
	border-radius: 18rpx;
	background: $app-fill;
	margin-top: 14rpx;
}

.menuTitle {
	font-size: 28rpx;
	font-weight: 800;
	color: $app-text;
}

.menuSub {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: $app-subtext;
}

.label {
	font-size: 26rpx;
	color: $app-subtext;
}

.value {
	margin-top: 8rpx;
	font-size: 28rpx;
	color: $app-text;
	word-break: break-all;
}
</style>
