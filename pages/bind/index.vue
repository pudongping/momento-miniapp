<template>
	<view class="page">
		<view class="card">
			<view class="title">时光小账本</view>
			<view class="sub">夫妻共享记账 · 极简温馨</view>

			<view class="section">
				<view class="label">我的 UID</view>
				<view class="uid">{{ uid }}</view>
			</view>

			<view class="section">
				<view class="label">对方 UID</view>
				<input class="input" v-model="partnerUid" placeholder="请输入对方 UID" />
			</view>

			<button class="btn" type="default" @click="onBind">确认绑定</button>
		</view>
	</view>
</template>

<script setup>
// 绑定页：
// 1) 初始化用户 UID（模拟雪花算法，使用字符串避免 JS 大数精度问题）
// 2) 检查本地是否已绑定：已绑定则直接跳转首页
// 3) 输入对方 UID 后点击确认：写入 is_bound/partner_uid 并跳转首页

import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { apiFamilyBind, apiUserInit } from '@/api/index.js'
import { useBindingStore } from '@/store/binding.js'

const bindingStore = useBindingStore()
const uid = ref('')
const partnerUid = ref('')

async function init() {
	// 通过统一请求层走 mock 接口，确保所有返回符合 {code,msg,data} 标准
	const res = await apiUserInit()
	uid.value = String(res?.uid || '')
	bindingStore.init()

	// 已绑定则直接进入首页（Dashboard）
	if (bindingStore.isBound) {
		uni.switchTab({ url: '/pages/dashboard/index' })
	}
}

async function onBind() {
	// 绑定动作统一走 API：失败会自动 toast 并抛错（在 request.js 内已处理）
	const res = await apiFamilyBind(partnerUid.value)
	bindingStore.setBound(res?.partnerUid)
	uni.switchTab({ url: '/pages/dashboard/index' })
}

onShow(() => {
	init()
})
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: $app-bg;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32rpx;
}

.card {
	width: 100%;
	background: rgba(255, 255, 255, 0.65);
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
}

.title {
	font-size: 44rpx;
	font-weight: 700;
	color: $app-text;
	margin-bottom: 8rpx;
}

.sub {
	font-size: 26rpx;
	color: $app-subtext;
	margin-bottom: 28rpx;
}

.section {
	margin-bottom: 22rpx;
}

.label {
	font-size: 26rpx;
	color: $app-subtext;
	margin-bottom: 10rpx;
}

.uid {
	padding: 18rpx 20rpx;
	border-radius: 16rpx;
	background: rgba(163, 177, 138, 0.12);
	color: $app-text;
	font-size: 26rpx;
	word-break: break-all;
}

.input {
	padding: 18rpx 20rpx;
	border-radius: 16rpx;
	background: rgba(255, 255, 255, 0.8);
	border: 2rpx solid rgba(163, 177, 138, 0.35);
	color: $app-text;
	font-size: 28rpx;
}

.btn {
	margin-top: 8rpx;
	border-radius: 18rpx;
	background: $app-primary;
	color: #fff;
	font-size: 30rpx;
}
</style>
