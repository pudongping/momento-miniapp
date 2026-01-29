# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在处理本仓库代码时提供指南。

## 项目概览

**Momento** 是一个使用 Uni-app 和 Vue 3 构建的个人财务管理微信小程序。它允许用户记录收入/支出、管理多个账本、设置预算、处理周期性交易，并查看节日倒计时。该应用支持与朋友/家人协作管理账本。

- **框架**: Uni-app (Vue 3 配合 Composition/Options API)
- **目标平台**: 微信小程序 (通过 Uni-app 支持其他平台)
- **样式**: SCSS 并在 `uni.scss` 中定义全局变量
- **后端**: REST API (在 `config/index.js` 中配置)

## 开发设置

### 环境配置

在 `config/index.js` 中切换环境：
- **开发/测试环境**: 注释掉生产配置，启用本地 `baseURL` 并设置 `useMock = true`

### 运行应用

1. 安装 **HBuilderX** 编辑器 (Uni-app 官方 IDE)
2. 安装 **微信开发者工具**
3. 将项目导入 HBuilderX: 文件 → 导入 → 从本地目录
4. 配置 `manifest.json`:
   - 在 `mp-weixin.appid` 下设置微信小程序 AppID
5. 运行: HBuilderX 菜单 → 运行 → 运行到小程序模拟器 → 微信开发者工具
6. 项目将自动编译并在模拟器中加载

### 开发用 Mock 数据

`mock/` 目录包含用于无后端开发的模拟 API 响应。在 `config/index.js` 中设置 `useMock: true` 以启用。Mock 结构与 `api/index.js` 中的 API 端点一一对应。

## 架构与代码组织

### 目录结构

```
api/                    # API 层
  ├── index.js         # 统一 API 导出 (所有方法以 "Api" 后缀)
  └── request.js       # 集成 Mock 和认证的 HTTP 请求处理
config/
  ├── index.js         # 环境配置与基础 URL
  └── permission.js    # 认证守卫的路由白名单
utils/
  ├── auth.js          # 认证辅助函数 (checkToken, logout 等)
  ├── time.js          # 日期/时间工具
  ├── account-book.js  # 账本计算逻辑
  └── snowflake.js     # 用于设备 ID 的雪花算法生成器
pages/
  ├── home/            # 仪表盘 (月度概览, 节日)
  ├── record/          # 交易记录页面
  ├── profile/         # 用户资料与 UID 显示
  ├── login/           # 微信授权登录
  ├── budget/          # 预算配置
  ├── festivals/       # 节日倒计时管理
  ├── account-books/   # 多账本管理与协作
  ├── edit-transaction/# 交易编辑
  └── ...
components/           # 可复用 Vue 组件
mock/                  # 开发用 Mock API 数据
styles/               # 全局 SCSS 文件
static/               # 图片, 图标, 底部标签栏资源
uni_modules/          # Uni-app 插件 (uni-icons, uni-scss)
App.vue               # 根组件与生命周期钩子
main.js               # 应用入口点
manifest.json         # 项目配置 (微信 AppID, 平台配置)
pages.json            # 路由与底部标签栏配置
```

### 数据流架构

1. **API 层** (`api/index.js`): 集中管理的 API 方法 (如 `getTransactionsApi`, `addTransactionApi`)
2. **请求处理器** (`api/request.js`):
   - 集成 Mock 的 HTTP 请求
   - 处理认证头 (Bearer token)
   - 设备追踪 (使用雪花算法生成 device_id)
   - 带有唯一请求 ID 的请求日志
3. **存储**: `uni.setStorageSync()` / `uni.getStorageSync()` 用于本地持久化
   - `token`: 认证令牌
   - `userInfo`: 用户资料数据
   - `device_id`: 设备标识符

### 认证流程

- `App.vue` 中的路由守卫拦截导航
- 白名单 (`config/permission.js`) 允许未认证访问: 登录页, 用户协议, 隐私政策
- 受保护路由需要存储中有有效的 `token`
- 微信 OAuth 登录后存储 Token
- `utils/auth.js` 提供辅助函数: `checkToken()`, `clearAuth()`, `logout()`, `checkLoginStatus()`

### 路由与页面配置

路由在 `pages.json` 中定义:
- **标签栏页面** (底部导航): home, record, profile
- **模态页面**: login, user agreement, privacy policy (自定义导航样式)
- **栈页面**: edit-transaction, budget, festivals, account-books
- 部分页面通过 `navigationStyle: "custom"` 使用自定义导航栏

## API 集成模式

所有 API 方法遵循命名约定: `<operation><Entity>Api()`. 示例:
- `getTransactionsApi(params)` → GET `/transactions/list`
- `addTransactionApi(data)` → POST `/transactions/add`
- `updateTransactionApi(data)` → PUT `/transactions/update`
- `deleteTransactionApi(id)` → DELETE `/transactions/delete`
- `uploadFileApi(filePath, type, business)` → POST `/upload/file` (multipart form)

使用 `api/request.js` 中的 `setRequestConfig()` 自定义请求行为 (基础 URL, 超时, 错误处理)。

## 常见开发任务

### 添加新 API 端点

1. 按照命名模式在 `api/index.js` 中添加方法:
   ```javascript
   export const getNewDataApi = (params) => get('/path/to/endpoint', params);
   ```

2. 在组件中导入并使用:
   ```javascript
   import { getNewDataApi } from '@/api/index.js';
   ```

### 添加开发用 Mock 数据

1. 在 `mock/` 中创建/编辑匹配端点的 mock 文件
2. 导出返回 mock 数据的处理函数
3. 在 `mock/index.js` 中导入并添加到 `mockApis` 对象
4. 在 `config/index.js` 中启用 `useMock: true`

### 修改路由与导航

- 更新 `pages.json` 以添加/修改页面和标签栏
- 使用 `uni.navigateTo()` 进行栈导航, `uni.switchTab()` 切换标签栏
- 受保护路由通过 `App.vue` 路由守卫和 `config/permission.js` 白名单进行检查

### 样式与全局变量

- 全局 SCSS 变量在 `uni.scss` 中
- 组件作用域样式在 `<style scoped>` 块中
- 使用 `uni.scss` 变量保持一致性 (如 `$uni-primary-color`)
- 响应式单位: `rpx` (响应式像素, 相对于 750px 屏幕宽度)

## 关键实现细节

### 设备追踪

- 雪花算法 ID 生成器 (`utils/snowflake.js`) 创建唯一设备 ID
- 作为 `device_id` 存储在本地存储中
- 通过 `api/request.js` 包含在所有 API 请求中

### 多账本管理

- 用户可以创建多个账本并邀请协作者
- 账本通过 `getAccountBooksApi()`, `createAccountBookApi()` 追踪
- 协作者通过邀请系统管理: `inviteUserApi()`, `acceptInvitationApi()`, `rejectInvitationApi()`
- 通过 `setDefaultAccountBookApi()` 设置默认账本

### 周期性交易

- 在创建交易时通过频率设置进行配置
- 单独管理: `getRecurringTransactionsApi()`, `deleteRecurringTransactionApi()`
- Mock 数据在 `mock/recurring-transactions.js`

### 预算与预测

- 通过 `updateUserSettingsApi()` 设置月度预算
- 用于预算追踪的交易统计: `getTransactionStats(params)`
- 预算 UI 在 `pages/budget/index`

## 测试与调试

### 启用控制台日志

日志显示在微信开发者工具控制台中:
- 应用启动时检查 `App.vue` 生命周期日志
- `api/request.js` 中记录请求 ID 以追踪 API 调用
- 首次应用启动时记录设备 ID 生成

### 切换真实 API 与 Mock

在 `config/index.js` 中:
```javascript
// 用于 mock 数据 (开发环境):
export const useMock = true;

// 用于生产 API:
export const useMock = false;
export const baseURL = '用生产环境的接口地址';
```

### 存储检查

通过微信开发者工具检查持久化数据:
- Storage 面板显示 `token`, `userInfo`, `device_id` 等
- 开发期间使用 `uni.clearStorageSync()` 重置所有存储

## 微信小程序特性

- 在登录页获取微信 OAuth code，发送至后端交换 token
- 授权后自动同步用户信息 (头像, 昵称)
- 小程序能力: 文件上传, 设备信息, 存储, 推送通知
- 在 `manifest.json` 的 `mp-weixin` 部分配置

## 重要文件说明

| 文件 | 用途 |
|------|------|
| `api/request.js` | 核心 HTTP 逻辑，含 Mock 路由与认证 |
| `config/index.js` | 环境切换 (Mock/真实 API) |
| `config/permission.js` | 认证守卫的路由白名单 |
| `App.vue` | 应用生命周期与路由拦截设置 |
| `pages.json` | 所有路由定义与标签栏配置 |
| `utils/auth.js` | 登录/登出/认证状态辅助函数 |
| `mock/index.js` | Mock API 注册表 |
