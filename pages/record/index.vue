<template>
	<view class="page">
		<view class="card">
			<view class="title">记一笔</view>
			<view class="sub">极简记录 · 夫妻共享</view>
		</view>

		<view class="card mt">
			<view class="sectionTitle">金额</view>
			<input
				class="amountInput"
				type="digit"
				v-model="amount"
				placeholder="0.00"
				placeholder-style="color: #C7C7CC"
			/>

			<view class="sectionTitle mtSm">备注</view>
			<input class="noteInput" type="text" v-model="note" placeholder="比如：晚餐、买奶粉…" />
		</view>

		<view class="card mt">
			<view class="rowTitle">
				<view class="sectionTitle">标签</view>
				<view class="hint">长按自定义标签可改名（不可删除）</view>
			</view>

			<view class="chips">
				<view
					v-for="t in systemTags"
					:key="t"
					class="chip"
					:class="{ on: selectedTag === t }"
					@click="selectTag(t)"
				>
					{{ t }}
				</view>
			</view>

			<view class="chips mtSm">
				<view
					v-for="t in customTags"
					:key="t.id"
					class="chip custom"
					:class="{ on: selectedTag === t.name }"
					@click="selectTag(t.name)"
					@longpress="renameCustomTag(t)"
				>
					{{ t.name }}
				</view>
				<view class="chip add" @click="addCustomTag">+ 新增</view>
			</view>
		</view>

		<button class="btn mt" type="default" @click="submitBill">保存记账</button>

		<view class="card mt">
			<view class="rowTitle">
				<view class="sectionTitle">周期账单</view>
				<view class="hint">每月固定日自动生成（Mock 模拟）</view>
			</view>

			<view v-if="recurringList.length === 0" class="empty">暂无周期账单</view>
			<view v-for="r in recurringList" :key="r.id" class="rule" @click="editRecurring(r)" @longpress="deleteRecurring(r)">
				<view class="ruleTop">
					<view class="ruleTitle">每月 {{ r.day }} 日 · {{ r.tag }}</view>
					<view class="ruleAmount">-{{ r.amount }}</view>
				</view>
				<view class="ruleNote">{{ r.note || '周期账单' }}</view>
			</view>

			<button class="btn ghost mtSm" type="default" @click="addRecurring">新增周期账单</button>
		</view>
	</view>
</template>

<script setup>
// 记账页（Record）：
// 1) 金额输入：使用系统数字键盘（input type="digit"）
// 2) 备注输入：普通文本输入
// 3) 标签系统：
//    - 系统标签（固定不可删改）：餐饮、买菜、房贷、车贷、交通、医疗、孩子
//    - 自定义标签：支持新增；校验重名；一旦添加只能改名，不能删除（长按改名）
// 4) 周期账单：
//    - 规则管理（新增/编辑/删除）
//    - Mock 模拟：在获取首页时间轴时，会自动生成本月周期账单
// 5) 所有数据请求均走统一请求层（api/request.js），当前由 common/mock.js 返回标准格式 {code,msg,data}

import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import {
	apiBillCreate,
	apiCustomTagAdd,
	apiCustomTagRename,
	apiRecurringCreate,
	apiRecurringDelete,
	apiRecurringList,
	apiRecurringUpdate,
	apiTagsList
} from '@/api/index.js'
import { useBindingStore } from '@/store/binding.js'

const bindingStore = useBindingStore()

const amount = ref('')
const note = ref('')

const systemTags = ref([])
const customTags = ref([])
const selectedTag = ref('')

const recurringList = ref([])

async function loadTags() {
	const res = await apiTagsList()
	systemTags.value = Array.isArray(res?.system) ? res.system : []
	customTags.value = Array.isArray(res?.custom) ? res.custom : []
	if (!selectedTag.value && systemTags.value.length) {
		selectedTag.value = systemTags.value[0]
	}
}

async function loadRecurring() {
	const res = await apiRecurringList()
	recurringList.value = Array.isArray(res?.list) ? res.list : []
}

function selectTag(name) {
	selectedTag.value = String(name || '')
}

function addCustomTag() {
	uni.showModal({
		title: '新增标签',
		editable: true,
		placeholderText: '请输入标签名（不可重复）',
		success: async (r) => {
			if (!r.confirm) return
			await apiCustomTagAdd(r.content)
			await loadTags()
		}
	})
}

function renameCustomTag(tag) {
	uni.showModal({
		title: '修改标签名',
		editable: true,
		placeholderText: `当前：${tag?.name || ''}`,
		success: async (r) => {
			if (!r.confirm) return
			await apiCustomTagRename(tag.id, r.content)
			await loadTags()
		}
	})
}

async function submitBill() {
	const n = Number(amount.value)
	if (!Number.isFinite(n) || n <= 0) {
		uni.showToast({ title: '请输入正确金额', icon: 'none' })
		return
	}
	if (!selectedTag.value) {
		uni.showToast({ title: '请选择标签', icon: 'none' })
		return
	}

	await apiBillCreate({ amount: n, tag: selectedTag.value, note: note.value })
	uni.showToast({ title: '已保存', icon: 'none' })
	amount.value = ''
	note.value = ''
}

async function pickTag(defaultTag) {
	const all = [...systemTags.value, ...customTags.value.map((x) => x.name)]
	const list = all.filter(Boolean)
	if (list.length === 0) {
		uni.showToast({ title: '暂无可用标签', icon: 'none' })
		return null
	}
	return new Promise((resolve) => {
		const idx = Math.max(0, list.findIndex((x) => x === defaultTag))
		uni.showActionSheet({
			itemList: list,
			itemColor: '#1C1C1E',
			popDirection: 'bottom',
			success: (r) => resolve(list[r.tapIndex]),
			fail: () => resolve(null)
		})
	})
}

async function addRecurring() {
	const tag = await pickTag(selectedTag.value)
	if (!tag) return
	uni.showModal({
		title: '每月固定日（1-31）',
		editable: true,
		placeholderText: '例如：15',
		success: (r1) => {
			if (!r1.confirm) return
			uni.showModal({
				title: '金额',
				editable: true,
				placeholderText: '例如：1200',
				success: (r2) => {
					if (!r2.confirm) return
					uni.showModal({
						title: '备注（可选）',
						editable: true,
						placeholderText: '例如：房贷',
						success: async (r3) => {
							if (!r3.confirm) return
							await apiRecurringCreate({
								day: Number(r1.content),
								amount: Number(r2.content),
								tag,
								note: r3.content
							})
							await loadRecurring()
						}
					})
				}
			})
		}
	})
}

async function editRecurring(rule) {
	const tag = await pickTag(rule.tag)
	if (!tag) return
	uni.showModal({
		title: `每月固定日（当前：${rule.day}）`,
		editable: true,
		placeholderText: '例如：15',
		success: (r1) => {
			if (!r1.confirm) return
			uni.showModal({
				title: `金额（当前：${rule.amount}）`,
				editable: true,
				placeholderText: '例如：1200',
				success: (r2) => {
					if (!r2.confirm) return
					uni.showModal({
						title: `备注（当前：${rule.note || ''}）`,
						editable: true,
						placeholderText: '可留空',
						success: async (r3) => {
							if (!r3.confirm) return
							await apiRecurringUpdate({
								id: rule.id,
								day: Number(r1.content),
								amount: Number(r2.content),
								tag,
								note: r3.content
							})
							await loadRecurring()
						}
					})
				}
			})
		}
	})
}

function deleteRecurring(rule) {
	uni.showModal({
		title: '删除周期账单',
		content: '确认删除该周期账单规则？',
		success: async (r) => {
			if (!r.confirm) return
			await apiRecurringDelete(rule.id)
			await loadRecurring()
		}
	})
}

onShow(() => {
	bindingStore.init()
	if (!bindingStore.isBound) {
		uni.redirectTo({ url: '/pages/bind/index' })
		return
	}
	loadTags()
	loadRecurring()
})
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: $app-bg;
	padding: 28rpx;
}

.card {
	background: $app-surface;
	border-radius: 24rpx;
	padding: 28rpx;
	box-shadow: $app-shadow;
}

.mt {
	margin-top: 24rpx;
}

.mtSm {
	margin-top: 16rpx;
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

.sectionTitle {
	font-size: 28rpx;
	font-weight: 700;
	color: $app-text;
}

.rowTitle {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
}

.hint {
	font-size: 22rpx;
	color: $app-subtext;
}

.amountInput {
	margin-top: 14rpx;
	padding: 18rpx 20rpx;
	border-radius: 18rpx;
	background: $app-fill;
	font-size: 44rpx;
	font-weight: 800;
	color: $app-text;
}

.noteInput {
	margin-top: 14rpx;
	padding: 18rpx 20rpx;
	border-radius: 18rpx;
	background: $app-fill;
	font-size: 28rpx;
	color: $app-text;
}

.chips {
	margin-top: 16rpx;
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
}

.chip {
	padding: 12rpx 18rpx;
	border-radius: 999rpx;
	background: $app-fill;
	color: $app-text;
	font-size: 26rpx;
	border: 2rpx solid transparent;
}

.chip.on {
	background: $app-primary-soft;
	border-color: $app-primary-border;
	color: $app-primary;
	font-weight: 700;
}

.chip.custom {
	background: $app-fill;
}

.chip.add {
	background: $app-primary-soft;
	color: $app-primary;
	font-weight: 700;
}

.btn {
	border-radius: 18rpx;
	background: $app-primary;
	color: #fff;
	font-size: 30rpx;
}

.btn.ghost {
	background: $app-primary-soft;
	color: $app-primary;
}

.empty {
	margin-top: 18rpx;
	font-size: 26rpx;
	color: $app-subtext;
}

.rule {
	margin-top: 14rpx;
	padding: 18rpx 18rpx;
	border-radius: 18rpx;
	background: $app-fill;
}

.ruleTop {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
}

.ruleTitle {
	font-size: 26rpx;
	color: $app-text;
	font-weight: 700;
}

.ruleAmount {
	font-size: 28rpx;
	color: $app-warning;
	font-weight: 800;
}

.ruleNote {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: $app-subtext;
}
</style>
