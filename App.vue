<script>
	import { generateSnowflakeId } from '@/common/snowflake.js'
	import { initRouteGuard } from '@/common/routeGuard.js'

	export default {
		onLaunch: function() {
			initRouteGuard()
			const uid = uni.getStorageSync('uid')
			if (!uid) {
				uni.setStorageSync('uid', generateSnowflakeId())
			}
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
