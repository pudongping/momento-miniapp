<script>
	import { generateSnowflakeId } from './utils/snowflake.js';
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
			this.ensureAuthedOnShow();
		},
		
		onHide: function() {
			console.log('App Hide');
		},
		
		// 方法
		methods: {
			ensureAuthedOnShow() {
				const token = uni.getStorageSync('token');
				if (token) return;

				try {
					const pages = getCurrentPages();
					const current = pages?.[pages.length - 1];
					const route = current?.route || '';
					const fullPath = route ? `/${route}` : '';
					if (fullPath === '/pages/login/index') return;

					uni.reLaunch({
						url: `/pages/login/index${fullPath ? `?redirect=${encodeURIComponent(fullPath)}` : ''}`
					});
				} catch (e) {
					uni.reLaunch({
						url: '/pages/login/index'
					});
				}
			},

			// 初始化路由拦截
			initRouteGuard() {
				// 添加页面拦截器
				const whiteList = ['/pages/login/index']; // 不需要登录即可访问的页面
				
				// 监听路由跳转
				uni.addInterceptor('navigateTo', {
					invokeStart: (args) => {
						const token = uni.getStorageSync('token');
						const url = args.url;
						
						// 检查是否需要登录
						if (!token && !whiteList.some(white => url.startsWith(white))) {
							// 未登录，跳转到登录页
							uni.navigateTo({
								url: `/pages/login/index?redirect=${encodeURIComponent(url)}`
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
						
						// 检查是否需要登录
						if (!token && !whiteList.some(white => url.startsWith(white))) {
							// 未登录，跳转到登录页
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
						const url = args.url;
						
						// 检查是否需要登录
						if (!token && !whiteList.some(white => url.startsWith(white))) {
							// 未登录，跳转到登录页
							uni.navigateTo({
								url: `/pages/login/index?redirect=${encodeURIComponent(url)}`
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
