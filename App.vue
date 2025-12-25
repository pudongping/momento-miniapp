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

<style lang="scss">
	/*每个页面公共css */
	page {
		background-color: $app-bg;
		color: $app-text;
		font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	}
</style>
