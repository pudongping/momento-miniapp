<template>
	<view class="card">
		<view class="title">账单时间轴</view>

		<view v-for="group in localItems" :key="group.day" class="group">
			<view class="groupHeader">
				<view class="day">{{ group.day }}</view>
				<view class="sum">当日支出 {{ group.total }} 元</view>
			</view>

			<view v-for="bill in group.bills" :key="bill.id" class="bill">
				<view class="left">
					<view class="avatar">
						<image v-if="bill.recorderAvatar" class="avatarImg" :src="bill.recorderAvatar" mode="aspectFill" />
						<view v-else class="avatarText">{{ (bill.recorderName || ' ').slice(0, 1) }}</view>
					</view>
					<view class="info">
						<view class="tagLine">
							<view class="tag">{{ bill.tag }}</view>
							<view class="recorder">{{ bill.recorderName }}</view>
						</view>
						<view class="note">{{ bill.note }}</view>
						<view v-if="bill.commentsPreview && bill.commentsPreview.length" class="comments">
							<view v-for="c in bill.commentsPreview" :key="c.id" class="commentLine">
								<text class="commentName">{{ c.nickname }}：</text>
								<text class="commentText">{{ c.content }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="right">
					<view class="amount">-{{ bill.amount }}</view>
					<view class="actions">
						<view class="like" :class="{ on: bill.liked }" @click="toggleLike(bill)">
							赞 {{ bill.likeCount || 0 }}
						</view>
						<view class="comment" @click="addComment(bill)">
							评 {{ bill.commentCount || 0 }}
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
// 账单时间轴组件：
// - 按天聚合展示
// - 互动：点赞切换 + 评论（弹窗输入）
// - 数据仍走统一请求层（当前为 mock），后续替换真实接口无需改组件调用方式

import { ref, watch } from 'vue'
import { apiBillCommentAdd, apiBillLikeToggle } from '@/api/index.js'

const props = defineProps({
	items: { type: Array, default: () => [] }
})

const localItems = ref([])

watch(
	() => props.items,
	(v) => {
		localItems.value = Array.isArray(v) ? JSON.parse(JSON.stringify(v)) : []
	},
	{ immediate: true }
)

function toggleLike(bill) {
	apiBillLikeToggle(bill.id).then((res) => {
		bill.liked = !!res?.liked
		bill.likeCount = Number(res?.likeCount || 0)
	})
}

function addComment(bill) {
	uni.showModal({
		title: '添加评论',
		editable: true,
		placeholderText: '说点温柔的话…',
		success: (r) => {
			if (!r.confirm) return
			apiBillCommentAdd(bill.id, r.content).then((res) => {
				const c = res?.comment
				bill.commentCount = Number(bill.commentCount || 0) + 1
				if (!Array.isArray(bill.commentsPreview)) bill.commentsPreview = []
				if (c) bill.commentsPreview.unshift(c)
				bill.commentsPreview = bill.commentsPreview.slice(0, 2)
			})
		}
	})
}
</script>

<style lang="scss" scoped>
.card {
	background: rgba(255, 255, 255, 0.65);
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
}

.title {
	font-size: 32rpx;
	font-weight: 700;
	color: $app-text;
}

.group {
	margin-top: 18rpx;
}

.groupHeader {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	padding: 10rpx 6rpx;
}

.day {
	font-size: 28rpx;
	color: $app-text;
	font-weight: 600;
}

.sum {
	font-size: 24rpx;
	color: $app-subtext;
}

.bill {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 18rpx 16rpx;
	border-radius: 18rpx;
	background: rgba(242, 232, 207, 0.55);
	margin-top: 12rpx;
}

.left {
	display: flex;
	align-items: flex-start;
	flex: 1;
	min-width: 0;
}

.avatar {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: rgba(163, 177, 138, 0.18);
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.avatarImg {
	width: 56rpx;
	height: 56rpx;
}

.avatarText {
	font-size: 24rpx;
	color: $app-text;
	font-weight: 700;
}

.info {
	margin-left: 14rpx;
	flex: 1;
	min-width: 0;
}

.tagLine {
	display: flex;
	align-items: center;
}

.recorder {
	margin-left: 10rpx;
	font-size: 22rpx;
	color: $app-subtext;
}

.tag {
	font-size: 26rpx;
	color: $app-text;
	font-weight: 600;
}

.note {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: $app-subtext;
}

.right {
	flex-shrink: 0;
	margin-left: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.amount {
	font-size: 30rpx;
	font-weight: 700;
	color: $app-warning;
	text-align: right;
}

.actions {
	margin-top: 8rpx;
	display: flex;
	justify-content: flex-end;
	gap: 14rpx;
}

.comment {
	font-size: 24rpx;
	color: $app-subtext;
}

.comments {
	margin-top: 8rpx;
}

.commentLine {
	font-size: 22rpx;
	color: $app-subtext;
	line-height: 32rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.commentName {
	color: $app-text;
}

.commentText {
	color: $app-subtext;
}

.like {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: $app-subtext;
	text-align: right;
}

.like.on {
	color: $app-primary;
	font-weight: 700;
}
</style>
