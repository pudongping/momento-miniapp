<template>
	<view class="page">
		<view class="card">
			<view class="title">预算设置</view>
			<view class="sub">修改后会同步首页红绿灯</view>
		</view>

		<view class="card mt">
			<view class="label">本月总预算</view>
			<input class="input" type="digit" v-model="total" placeholder="10000" />
			<button class="btn mtSm" type="default" @click="save">保存</button>
		</view>
	</view>
</template>

<script setup>
// 预算设置页：
// 1) 未绑定时强制跳转绑定页
// 2) 读取预算（/budget/get），展示输入框
// 3) 保存预算（/budget/set）后：
//    - 写入 budgetStore（全局同步）
//    - 返回上一页

import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { apiBudgetGet, apiBudgetSet } from '@/api/index.js'
import { useBindingStore } from '@/store/binding.js'
import { useBudgetStore } from '@/store/budget.js'

const bindingStore = useBindingStore()
const budgetStore = useBudgetStore()

const total = ref('')

async function load() {
	const res = await apiBudgetGet()
	const n = Number(res?.total)
	total.value = Number.isFinite(n) ? String(n) : String(budgetStore.total || 10000)
}

async function save() {
	const n = Number(total.value)
	if (!Number.isFinite(n) || n <= 0) {
		uni.showToast({ title: '预算不合法', icon: 'none' })
		return
	}
	await apiBudgetSet(n)
	budgetStore.setTotal(n)
	uni.showToast({ title: '已保存', icon: 'none' })
	setTimeout(() => {
		uni.navigateBack()
	}, 300)
}

onShow(() => {
	bindingStore.init()
	budgetStore.init()
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

.mtSm {
	margin-top: 16rpx;
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

.label {
	font-size: 28rpx;
	font-weight: 800;
	color: $app-text;
}

.input {
	margin-top: 16rpx;
	padding: 18rpx 20rpx;
	border-radius: 18rpx;
	background: rgba(242, 232, 207, 0.55);
	font-size: 36rpx;
	font-weight: 800;
	color: $app-text;
}

.btn {
	border-radius: 18rpx;
	background: $app-primary;
	color: #fff;
	font-size: 30rpx;
}
</style>
