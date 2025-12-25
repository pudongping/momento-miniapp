<template>
	<view class="card">
		<view class="title">家庭支出趋势</view>
		<canvas
			class="canvas"
			:canvas-id="canvasId"
			:id="canvasId"
			:style="{ height: height + 'px' }"
		></canvas>
		<view v-if="!values || values.length === 0" class="placeholder">暂无数据</view>
	</view>
</template>

<script setup>
// 折线图组件（最小可用版）：
// - 采用 canvas 绘制，不引入第三方库，保持项目干净
// - 通过 props 接收 labels/values，在数据变化时自动重绘

import { onMounted, watch } from 'vue'

const props = defineProps({
	labels: { type: Array, default: () => [] },
	values: { type: Array, default: () => [] },
	height: { type: Number, default: 160 }
})

const canvasId = `stats_line_${Math.random().toString(36).slice(2)}`

function draw() {
	const values = Array.isArray(props.values) ? props.values : []
	const labels = Array.isArray(props.labels) ? props.labels : []
	const ctx = uni.createCanvasContext(canvasId)

	const w = 320
	const h = props.height
	const pad = 18
	const chartW = w - pad * 2
	const chartH = h - pad * 2

	ctx.clearRect(0, 0, w, h)

	// 背景网格
	ctx.setStrokeStyle('rgba(60, 60, 67, 0.18)')
	ctx.setLineWidth(1)
	for (let i = 0; i <= 4; i++) {
		const y = pad + (chartH / 4) * i
		ctx.beginPath()
		ctx.moveTo(pad, y)
		ctx.lineTo(w - pad, y)
		ctx.stroke()
	}

	if (values.length === 0) {
		ctx.draw()
		return
	}

	const max = Math.max(...values, 0)
	const min = Math.min(...values, 0)
	const span = Math.max(1, max - min)
	const stepX = values.length <= 1 ? 0 : chartW / (values.length - 1)

	function toPoint(i) {
		const v = Number(values[i] || 0)
		const x = pad + stepX * i
		const y = pad + chartH - ((v - min) / span) * chartH
		return { x, y }
	}

	// 折线
	ctx.setStrokeStyle('#FF9500')
	ctx.setLineWidth(2)
	ctx.beginPath()
	const p0 = toPoint(0)
	ctx.moveTo(p0.x, p0.y)
	for (let i = 1; i < values.length; i++) {
		const p = toPoint(i)
		ctx.lineTo(p.x, p.y)
	}
	ctx.stroke()

	// 点
	ctx.setFillStyle('#FF9500')
	for (let i = 0; i < values.length; i++) {
		const p = toPoint(i)
		ctx.beginPath()
		ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2)
		ctx.fill()
	}

	// 仅显示首尾 label（避免拥挤）
	ctx.setFillStyle('rgba(60, 60, 67, 0.65)')
	ctx.setFontSize(10)
	if (labels.length > 0) {
		ctx.fillText(String(labels[0]), pad, h - 4)
		ctx.fillText(String(labels[labels.length - 1]), w - pad - 24, h - 4)
	}

	ctx.draw()
}

onMounted(() => {
	draw()
})

watch(
	() => [props.labels, props.values, props.height],
	() => draw(),
	{ deep: true }
)
</script>

<style lang="scss" scoped>
.card {
	background: $app-surface;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: $app-shadow;
}

.title {
	font-size: 32rpx;
	font-weight: 700;
	color: $app-text;
}

.placeholder {
	margin-top: 14rpx;
	padding: 26rpx;
	border-radius: 18rpx;
	background: $app-primary-soft;
	font-size: 26rpx;
	color: $app-subtext;
}

.canvas {
	width: 100%;
	margin-top: 14rpx;
	border-radius: 18rpx;
	background: rgba($app-primary, 0.06);
}
</style>
