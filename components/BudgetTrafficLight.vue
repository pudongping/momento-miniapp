<template>
	<view class="card">
		<view class="row">
			<view class="title">本月预算</view>
			<view class="action" @click="$emit('set-budget')">设置</view>
		</view>

		<view class="meta">预算：{{ total }} 元 · 已用：{{ spent }} 元</view>
		<view class="bar">
			<view class="fill" :style="fillStyle"></view>
		</view>
	</view>
</template>

<script setup>
// 预算红绿灯组件（骨架）：
// - 根据 spent/total 比例自动变色
// - < 50%：绿色；50%-80%：黄色；>80%：红色

import { computed } from 'vue'

const props = defineProps({
	total: { type: Number, default: 10000 },
	spent: { type: Number, default: 0 }
})

defineEmits(['set-budget'])

const percent = computed(() => {
	if (!props.total || props.total <= 0) return 0
	return Math.min(100, Math.max(0, Math.round((props.spent / props.total) * 100)))
})

const color = computed(() => {
	if (percent.value < 50) return '#34C759'
	if (percent.value < 80) return '#FFCC00'
	return '#FF3B30'
})

const fillStyle = computed(() => ({
	width: percent.value + '%',
	backgroundColor: color.value
}))
</script>

<style lang="scss" scoped>
.card {
	background: $app-surface;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: $app-shadow;
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.title {
	font-size: 32rpx;
	font-weight: 700;
	color: $app-text;
}

.action {
	font-size: 28rpx;
	color: $app-primary;
}

.meta {
	margin-top: 12rpx;
	font-size: 26rpx;
	color: $app-subtext;
}

.bar {
	margin-top: 18rpx;
	height: 18rpx;
	border-radius: 99rpx;
	background: $app-fill;
	overflow: hidden;
}

.fill {
	height: 100%;
	border-radius: 99rpx;
}
</style>
