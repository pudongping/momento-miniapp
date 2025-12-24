import { defineStore } from 'pinia'

export const useBudgetStore = defineStore('budget', {
	state: () => ({
		total: 10000
	}),
	actions: {
		init() {
			const total = Number(uni.getStorageSync('budget_total') || 10000)
			this.total = Number.isFinite(total) ? total : 10000
		},
		setTotal(total) {
			const n = Number(total)
			if (!Number.isFinite(n) || n <= 0) return
			this.total = n
			uni.setStorageSync('budget_total', n)
		}
	}
})
