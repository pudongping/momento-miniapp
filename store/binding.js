import { defineStore } from 'pinia'
import { generateSnowflakeId } from '@/common/snowflake.js'

export const useBindingStore = defineStore('binding', {
	state: () => ({
		uid: '',
		partnerUid: '',
		isBound: false
	}),
	actions: {
		init() {
			let uid = uni.getStorageSync('uid')
			if (!uid) {
				uid = generateSnowflakeId()
				uni.setStorageSync('uid', uid)
			}

			this.uid = String(uid)
			this.partnerUid = String(uni.getStorageSync('partner_uid') || '')
			this.isBound = !!uni.getStorageSync('is_bound')
		},
		setBound(partnerUid) {
			this.isBound = true
			this.partnerUid = String(partnerUid || '')
			uni.setStorageSync('is_bound', true)
			uni.setStorageSync('partner_uid', this.partnerUid)
		}
	}
})
