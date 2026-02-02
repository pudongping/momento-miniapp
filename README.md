# 时光账记 (Momento)

**时光账记**是一款基于 `Uni-app` + `Vue 3` 开发的个人记账微信小程序。它不仅支持基础的收支记录，还提供了多账本管理、周期性自动记账、预算控制以及节日倒计时等贴心功能，帮助用户更好地管理个人及家庭财务。

## 源码

- 前端小程序端源码：[Momento MiniApp](https://github.com/pudongping/momento-miniapp) 或者 [Momento MiniApp (Gitee)](https://gitee.com/pudongping/momento-miniapp)
- 后端 API 接口源码：[Momento API](https://github.com/pudongping/momento-api) 或者 [Momento API (Gitee)](https://gitee.com/pudongping/momento-api)

## 体验

可以直接使用微信扫描下方小程序二维码进行体验：

> 微信小程序需要完成**微信认证后，账号才可获得“被搜索”和“被分享”能力**，我没有进行**微信认证**，因此，暂时**无法通过小程序名称搜索此小程序**，只能通过扫描小程序码进行体验。

<p align="center">
  <img src="https://github.com/pudongping/momento-api/blob/master/public/screenshot/gh_qrcode.jpg" alt="时光账记小程序二维码" width="350" style="border-radius: 10px;" />
</p>

## ✨ 主要功能

- 📝 便捷记账：快速记录日常收入与支出，支持自定义标签、备注、日期和时间。
- 微信授权登录：支持微信一键授权登录，自动同步头像与昵称。
- 📚 多账本协作：
    - 多账本管理：支持创建多个账本（如“个人账本”、“家庭账本”、“旅行账本”），满足不同场景需求。
    - 好友协作：支持邀请好友/家人共同管理同一个账本。
    - 邀请流程：
        1. 好友在“我的”页面复制自己的 UID。
        2. 账本创建者在“账本详情”中点击“邀请成员”，输入好友 UID 发起邀请。
        3. 好友在“账本管理”页面收到邀请通知，点击“同意”即可加入，点击“拒绝”则拒绝加入。
- 🔄 周期记账：支持设置每天、每周、每月或每年的固定收支项，自动生成账单，省去重复操作。
- 💰 预算管理：设置每月预算限额，实时查看预算使用进度和剩余可用金额，防止超支。
- 📊 数据概览：首页直观展示本月收入、支出及结余情况，支持按日折叠/展开查看明细。
- 📅 节日倒计时：内置节日管理，首页展示最近节日的倒计时，增添生活仪式感。
- 🎨 个性化体验：自定义首页背景墙，支持沉浸式导航栏设计。

## 部分功能展示

<div align="center">
  <img src="https://github.com/pudongping/momento-api/blob/master/public/screenshot/homepage.png" alt="首页" width="200" style="display:inline-block;margin:10px" />
  <img src="https://github.com/pudongping/momento-api/blob/master/public/screenshot/login.png" alt="登录页" width="200" style="display:inline-block;margin:10px"/>
  <img src="https://github.com/pudongping/momento-api/blob/master/public/screenshot/profile.png" alt="个人中心" width="200" style="display:inline-block;margin:10px"/>
  <img src="https://github.com/pudongping/momento-api/blob/master/public/screenshot/transaction.png" alt="记账页面" width="200" style="display:inline-block;margin:10px"/>
  <img src="https://github.com/pudongping/momento-api/blob/master/public/screenshot/recurring.png" alt="周期记账页面" width="200" style="display:inline-block;margin:10px"/>
</div>

## 🛠 技术栈

- 框架：[Uni-app](https://uniapp.dcloud.net.cn/)
- 逻辑层：[Vue 3 (Composition API / Options API)](https://vuejs.org/)
- 样式：SCSS
- 图标库：Uni-icons
- 平台：微信小程序 (主要适配)

## 📂 目录结构

```bash
momento-miniapp/
├── api/                # API 接口封装
├── components/         # 公共组件
├── mock/               # Mock 数据 (开发阶段使用)
├── pages/              # 页面文件
│   ├── home/           # 首页 (账单概览、倒计时)
│   ├── record/         # 记账页 (新增收支)
│   ├── profile/        # 个人中心 (用户信息、UID复制)
│   ├── login/          # 登录页 (微信授权)
│   ├── budget/         # 预算设置
│   ├── festivals/      # 节日管理
│   ├── account-books/  # 账本管理 (创建、邀请、成员管理)
│   └── ...
├── static/             # 静态资源 (图片、图标)
├── styles/             # 全局样式
├── uni_modules/        # Uni-app 插件
├── utils/              # 工具函数 (认证、时间处理等)
├── App.vue             # 应用入口组件
├── main.js             # 应用入口文件
├── manifest.json       # 项目配置文件
├── pages.json          # 页面路由配置
└── uni.scss            # Uni-app 全局样式变量
```

## 🚀 快速开始

1. 环境准备：

- 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 编辑器。
- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。

2. 克隆代码到本地：

```bash
# GitHub
git clone https://github.com/pudongping/momento-miniapp.git
# gitee
git clone https://gitee.com/pudongping/momento-miniapp.git
```

3. 导入项目：

- 打开 HBuilderX，选择“文件” -> “导入” -> “从本地目录导入”，选择项目根目录。

4. 配置项目：

- 打开 `manifest.json` 文件，配置小程序 AppID（修改 `mp-weixin` 下的 `appid`）。
- 修改 `config/index.js` 文件中的 `baseURL` 为你的后端 API 地址。

5. 运行项目：

- 在 HBuilderX 中点击菜单栏的“运行” -> “运行到小程序模拟器” -> “微信开发者工具”。
- 等待编译完成，微信开发者工具将自动启动并加载项目。

## 📝 开发说明

- **接口模拟**：目前项目包含 `mock` 目录，用于模拟后端 API 响应。
- **路由拦截**：`App.vue` 中配置了路由守卫，未登录用户会被重定向至登录页。
- **样式规范**：项目使用 SCSS 开发，全局变量定义在 `uni.scss` 中。
