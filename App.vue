<script>
	import { generateSnowflakeId } from './utils/snowflake.js';
	import { whiteList } from './config/permission.js';

	export default {
		onLaunch: function() {
			console.log('App Launch');
			
			// 初始化路由拦截
			this.initRouteGuard();
			
			// 生成设备唯一ID
			if (!uni.getStorageSync('device_id')) {
				const deviceId = generateSnowflakeId();
				uni.setStorageSync('device_id', deviceId);
				console.log('生成设备ID:', deviceId);
			}
		},
		
		onShow: function() {
			console.log('App Show');
			// 移除强制登录检查，允许用户浏览
			// this.ensureAuthedOnShow();
		},
		
		onHide: function() {
			console.log('App Hide');
		},
		
		// 方法
		methods: {
			ensureAuthedOnShow() {
				// 已移除强制跳转逻辑
			},

			// 初始化路由拦截
			initRouteGuard() {
				// 添加页面拦截器
				// 白名单配置已移至 config/permission.js
				
				// 监听路由跳转
				uni.addInterceptor('navigateTo', {
					invokeStart: (args) => {
						const token = uni.getStorageSync('token');
						const url = args.url.split('?')[0]; // 忽略参数
						
						// 检查是否需要登录
						if (!token && !whiteList.some(white => url.startsWith(white))) {
							// 未登录，跳转到登录页
							uni.navigateTo({
								url: `/pages/login/index?redirect=${encodeURIComponent(args.url)}`
							});
							return false;
						}
						return args;
					}
				});
				
				// 监听switch路由跳转
				uni.addInterceptor('switchTab', {
					invokeStart: (args) => {
						const token = uni.getStorageSync('token');
						const url = args.url;
						
						// TabBar页面通常都在白名单中，但为了保险起见还是检查一下
						if (!token && !whiteList.some(white => url.startsWith(white))) {
							uni.navigateTo({
								url: `/pages/login/index?redirect=${encodeURIComponent(url)}`
							});
							return false;
						}
						return args;
					}
				});
				
				// 监听reLaunch路由跳转
				uni.addInterceptor('reLaunch', {
					invokeStart: (args) => {
						const token = uni.getStorageSync('token');
						const url = args.url.split('?')[0];
						
						if (!token && !whiteList.some(white => url.startsWith(white))) {
							uni.navigateTo({
								url: `/pages/login/index?redirect=${encodeURIComponent(args.url)}`
							});
							return false;
						}
						return args;
					}
				});
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
