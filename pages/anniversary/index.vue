<template>
	<view class="page">
		<view class="card">
			<view class="title">纪念日管理</view>
			<view class="sub">增删改 · 首页显示开关</view>
		</view>

		<view class="card mt">
			<view v-if="list.length === 0" class="empty">暂无纪念日</view>
			<view v-for="item in list" :key="item.id" class="item">
				<view class="left" @click="editItem(item)">
					<view class="name">{{ item.title }}</view>
					<view class="meta">{{ item.date }}</view>
				</view>
				<view class="right">
					<switch :checked="!!item.showOnHome" color="#FF9500" @change="onToggleHome(item, $event)" />
					<view class="del" @click="deleteItem(item)">删除</view>
				</view>
			</view>

			<button class="btn mtSm" type="default" @click="addItem">新增纪念日</button>
		</view>
	</view>
</template>

<script setup>
// 纪念日管理页：
// 1) 未绑定时强制跳转绑定页
// 2) 列表展示纪念日，支持：新增 / 编辑 / 删除
// 3) “首页显示”开关：切换后调用接口同步（Dashboard 会从 /anniversary/home 获取）
// 4) 所有数据走统一请求层（api/request.js），当前为 common/mock.js

import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import {
	apiAnniversaryCreate,
	apiAnniversaryDelete,
	apiAnniversaryList,
	apiAnniversarySetHome,
	apiAnniversaryUpdate
} from '@/api/index.js'
import { useBindingStore } from '@/store/binding.js'

const bindingStore = useBindingStore()
const list = ref([])

async function load() {
	const res = await apiAnniversaryList()
	list.value = Array.isArray(res?.list) ? res.list : []
}

function addItem() {
	uni.showModal({
		title: '纪念日名称',
		editable: true,
		placeholderText: '例如：结婚纪念日',
		success: (r1) => {
			if (!r1.confirm) return
			uni.showModal({
				title: '日期（YYYY-MM-DD）',
				editable: true,
				placeholderText: '例如：2026-01-01',
				success: async (r2) => {
					if (!r2.confirm) return
					await apiAnniversaryCreate({ title: r1.content, date: r2.content, showOnHome: false })
					await load()
				}
			})
		}
	})
}

function editItem(item) {
	uni.showModal({
		title: '修改名称',
		editable: true,
		placeholderText: `当前：${item?.title || ''}`,
		success: (r1) => {
			if (!r1.confirm) return
			uni.showModal({
				title: '修改日期（YYYY-MM-DD）',
				editable: true,
				placeholderText: `当前：${item?.date || ''}`,
				success: async (r2) => {
					if (!r2.confirm) return
					await apiAnniversaryUpdate({ id: item.id, title: r1.content, date: r2.content })
					await load()
				}
			})
		}
	})
}

async function onToggleHome(item, e) {
	await apiAnniversarySetHome(item.id, !!e.detail.value)
	await load()
}

function deleteItem(item) {
	uni.showModal({
		title: '删除纪念日',
		content: '确认删除该纪念日？',
		success: async (r) => {
			if (!r.confirm) return
			await apiAnniversaryDelete(item.id)
			await load()
		}
	})
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

.mtSm {
	margin-top: 16rpx;
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

.empty {
	font-size: 26rpx;
	color: $app-subtext;
}

.item {
	margin-top: 14rpx;
	padding: 18rpx;
	border-radius: 18rpx;
	background: $app-fill;
	display: flex;
	justify-content: space-between;
	align-items: center;
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

.right {
	display: flex;
	align-items: center;
	gap: 18rpx;
	flex-shrink: 0;
}

.del {
	font-size: 24rpx;
	color: $app-warning;
	padding: 10rpx 12rpx;
	border-radius: 14rpx;
	background: $app-warning-soft;
}

.btn {
	border-radius: 18rpx;
	background: $app-primary;
	color: #fff;
	font-size: 30rpx;
}
</style>
