# 时光小账本 - 样式规范化指南

## 规范化目标

根据 `DESIGN_SYSTEM.md` 设计系统文档，统一整个小程序的视觉风格，确保：
1. 所有相同功能的组件使用相同的样式
2. 所有文字大小、颜色、字重符合设计规范
3. 所有按钮使用统一的按钮样式类
4. 所有间距、圆角、阴影符合设计规范

## 规范化检查清单

### 1. 按钮规范化
- [ ] 主要操作按钮使用 `.btn-primary` (如：保存、确认、登录)
- [ ] 次要操作按钮使用 `.btn-secondary` (如：取消、返回)
- [ ] 危险操作按钮使用 `.btn-danger` (如：删除)
- [ ] 小按钮使用 `.btn-small` 或 `.btn-small-secondary`
- [ ] 所有按钮高度统一：主按钮 100rpx，小按钮 64rpx
- [ ] 所有按钮圆角统一：主按钮 50rpx，小按钮 30rpx

### 2. 文字规范化
- [ ] 页面标题使用 `$font-size-h2` (36rpx) + `$font-weight-semibold` (600)
- [ ] 区块标题使用 `$font-size-h3` (32rpx) + `$font-weight-semibold` (600)
- [ ] 小标题使用 `$font-size-h4` (28rpx) + `$font-weight-medium` (500)
- [ ] 正文使用 `$font-size-body` (28rpx) + `$font-weight-normal` (400)
- [ ] 辅助信息使用 `$font-size-small` (24rpx)
- [ ] 提示文字使用 `$font-size-xs` (22rpx)
- [ ] 主要文字颜色使用 `$color-text-primary` (#333333)
- [ ] 次要文字颜色使用 `$color-text-secondary` (#666666)

### 3. 颜色规范化
- [ ] 主色使用 `$color-primary` (#FF9A5A)
- [ ] 渐变背景使用 `linear-gradient(135deg, $color-primary, $color-primary-light)`
- [ ] 成功/收入使用 `$color-success` (#52C41A)
- [ ] 错误/支出使用 `$color-error` (#FF4D4F)
- [ ] 背景色使用 `$color-bg-secondary` (#F8F9FA)
- [ ] 卡片背景使用 `$color-bg-primary` (#FFFFFF)

### 4. 间距规范化
- [ ] 页面内边距使用 `$spacing-md` (24rpx) 或 `$spacing-lg` (32rpx)
- [ ] 元素间距使用 `$spacing-sm` (16rpx)
- [ ] 紧凑间距使用 `$spacing-xs` (8rpx)

### 5. 圆角规范化
- [ ] 卡片圆角使用 `$border-radius-md` (16rpx)
- [ ] 大容器圆角使用 `$border-radius-lg` (24rpx)
- [ ] 按钮圆角使用 `$border-radius-full` (50rpx)
- [ ] 小组件圆角使用 `$border-radius-sm` (8rpx)

### 6. 阴影规范化
- [ ] 卡片阴影使用 `$shadow-light`
- [ ] 浮动元素阴影使用 `$shadow-medium`
- [ ] 模态框阴影使用 `$shadow-heavy`

## 需要规范化的页面列表

1. ✅ /pages/record/index.vue - 记账页面
2. ✅ /pages/edit-transaction/index.vue - 编辑账单页面
3. ⏳ /pages/home/index.vue - 首页
4. ⏳ /pages/login/index.vue - 登录页面
5. ⏳ /pages/profile/index.vue - 个人中心
6. ⏳ /pages/account-books/index.vue - 账本管理
7. ⏳ /pages/budget/index.vue - 预算页面
8. ⏳ /pages/festivals/index.vue - 节日页面
9. ⏳ /pages/privacy-policy/index.vue - 隐私政策
10. ⏳ /pages/user-agreement/index.vue - 用户协议

## 规范化步骤

### 步骤 1: 替换硬编码的颜色值
```scss
// 替换前
color: #333333;
background: #FF9A5A;

// 替换后
color: $color-text-primary;
background: $color-primary;
```

### 步骤 2: 替换硬编码的字体大小
```scss
// 替换前
font-size: 32rpx;
font-weight: 600;

// 替换后
font-size: $font-size-h3;
font-weight: $font-weight-semibold;
```

### 步骤 3: 统一按钮样式
```html
<!-- 替换前 -->
<button class="custom-btn">保存</button>

<!-- 替换后 -->
<button class="btn-primary">保存</button>
```

### 步骤 4: 统一间距和圆角
```scss
// 替换前
padding: 24rpx;
border-radius: 16rpx;

// 替换后
padding: $spacing-md;
border-radius: $border-radius-md;
```

## 注意事项

1. **保持功能不变**: 只修改样式，不改变任何业务逻辑
2. **测试验证**: 每个页面规范化后都要测试功能是否正常
3. **渐进式修改**: 一次修改一个页面，避免大范围改动
4. **保持一致性**: 相同功能的组件必须使用相同的样式
5. **使用设计变量**: 优先使用设计系统中定义的变量，避免硬编码

## 常见模式

### 模态框底部按钮
```html
<view class="modal-footer">
  <button class="btn-secondary">取消</button>
  <button class="btn-primary">确认</button>
</view>
```

### 卡片容器
```scss
.card {
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-light;
}
```

### 标题文字
```scss
.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
}
```
