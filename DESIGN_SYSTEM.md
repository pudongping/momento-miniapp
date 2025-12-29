# 时光小账本 - 设计系统文档

## 概述

本文档定义了时光小账本小程序的统一设计规范，包括字体、颜色、按钮样式、间距和阴影等。所有页面和组件应遵循此规范以确保视觉一致性。

---

## 字体系统

### 字体家族
```scss
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
$font-family-mono: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
```

### 字体大小

| 用途 | 变量 | 大小 | 使用场景 |
|------|------|------|---------|
| 大标题 | `$font-size-display` | 48rpx | 登录页欢迎语 |
| 一级标题 | `$font-size-h1` | 40rpx | 页面主标题 |
| 二级标题 | `$font-size-h2` | 36rpx | 页面标题、协议标题 |
| 三级标题 | `$font-size-h3` | 32rpx | 区块标题（预算、概览、账单等） |
| 四级标题 | `$font-size-h4` | 28rpx | 小标题、Tab标签 |
| 正文 | `$font-size-body` | 28rpx | 主要内容文本 |
| 小文本 | `$font-size-small` | 24rpx | 辅助信息、标签 |
| 超小文本 | `$font-size-xs` | 22rpx | 提示文字、时间戳 |
| 标签文本 | `$font-size-caption` | 20rpx | 图标标签 |

### 字体权重

| 权重 | 变量 | 值 | 使用场景 |
|------|------|-----|---------|
| 轻 | `$font-weight-light` | 300 | 不常用 |
| 正常 | `$font-weight-normal` | 400 | 正文内容 |
| 中等 | `$font-weight-medium` | 500 | 小按钮、次要标题 |
| 半粗 | `$font-weight-semibold` | 600 | 主要标题、按钮 |
| 粗 | `$font-weight-bold` | 700 | 强调标题、金额 |

### 行高

| 类型 | 变量 | 值 | 使用场景 |
|------|------|-----|---------|
| 紧凑 | `$line-height-tight` | 1.2 | 标题 |
| 正常 | `$line-height-normal` | 1.5 | 正文 |
| 宽松 | `$line-height-relaxed` | 1.8 | 长文本、协议 |

---

## 颜色系统

### 主色系

| 名称 | 变量 | 颜色值 | 用途 |
|------|------|--------|------|
| 主色 | `$color-primary` | #FF9A5A | 按钮、链接、强调 |
| 主色浅色 | `$color-primary-light` | #FFD166 | 渐变、背景 |
| 主色深色 | `$color-primary-dark` | #E67E3C | 悬停状态 |
| 主色背景 | `$color-primary-bg` | #FFF5F0 | 背景色 |

### 功能色

| 名称 | 变量 | 颜色值 | 用途 |
|------|------|--------|------|
| 成功/收入 | `$color-success` | #52C41A | 收入、成功状态 |
| 成功背景 | `$color-success-light` | #F6FFED | 背景 |
| 警告 | `$color-warning` | #FAAD14 | 警告信息 |
| 警告背景 | `$color-warning-light` | #FFFBE6 | 背景 |
| 错误/支出 | `$color-error` | #FF4D4F | 支出、错误、删除 |
| 错误背景 | `$color-error-light` | #FFF1F0 | 背景 |
| 信息 | `$color-info` | #1890FF | 信息提示 |
| 信息背景 | `$color-info-light` | #E6F7FF | 背景 |

### 中性色

| 名称 | 变量 | 颜色值 | 用途 |
|------|------|--------|------|
| 主要文字 | `$color-text-primary` | #333333 | 主要内容 |
| 次要文字 | `$color-text-secondary` | #666666 | 辅助信息 |
| 三级文字 | `$color-text-tertiary` | #999999 | 弱化信息 |
| 占位符文字 | `$color-text-placeholder` | #CCCCCC | 占位符、禁用 |
| 禁用文字 | `$color-text-disabled` | #D9D9D9 | 禁用状态 |
| 反色文字 | `$color-text-inverse` | #FFFFFF | 深色背景上的文字 |

### 背景色

| 名称 | 变量 | 颜色值 | 用途 |
|------|------|--------|------|
| 主背景 | `$color-bg-primary` | #FFFFFF | 卡片、容器 |
| 次背景 | `$color-bg-secondary` | #F8F9FA | 页面背景 |
| 三级背景 | `$color-bg-tertiary` | #F5F5F5 | 按钮、输入框 |
| 禁用背景 | `$color-bg-disabled` | #FAFAFA | 禁用状态 |

### 边框色

| 名称 | 变量 | 颜色值 | 用途 |
|------|------|--------|------|
| 浅边框 | `$color-border-light` | #F0F0F0 | 分割线 |
| 普通边框 | `$color-border-normal` | #E5E5E5 | 边框 |
| 深边框 | `$color-border-dark` | #D9D9D9 | 强调边框 |

---

## 按钮样式

### 主按钮 (`.btn-primary`)
- 背景：渐变（主色 → 主色浅色）
- 高度：100rpx
- 字体：32rpx, 600 weight
- 圆角：50rpx
- 阴影：0 4rpx 12rpx rgba(255, 154, 90, 0.2)
- 用途：主要操作（登录、保存、确认）

### 次按钮 (`.btn-secondary`)
- 背景：#F5F5F5
- 边框：2rpx solid #E5E5E5
- 高度：100rpx
- 字体：32rpx, 600 weight
- 圆角：50rpx
- 用途：次要操作（取消、返回）

### 危险按钮 (`.btn-danger`)
- 背景：#FF4D4F
- 高度：100rpx
- 字体：32rpx, 600 weight
- 圆角：50rpx
- 用途：危险操作（删除、退出）

### 成功按钮 (`.btn-success`)
- 背景：#52C41A
- 高度：100rpx
- 字体：32rpx, 600 weight
- 圆角：50rpx
- 用途：成功操作（确认、完成）

### 小按钮 (`.btn-small`)
- 背景：渐变（主色 → 主色浅色）
- 高度：64rpx
- 字体：28rpx, 500 weight
- 圆角：30rpx
- 阴影：0 2rpx 8rpx rgba(255, 154, 90, 0.15)
- 用途：次要操作（添加、邀请）

### 小次按钮 (`.btn-small-secondary`)
- 背景：#F5F5F5
- 边框：1rpx solid #E5E5E5
- 高度：64rpx
- 字体：28rpx, 500 weight
- 圆角：30rpx
- 用途：次要小操作（拒绝、取消）

### 小危险按钮 (`.btn-small-danger`)
- 背景：#FF4D4F
- 高度：64rpx
- 字体：28rpx, 500 weight
- 圆角：30rpx
- 用途：危险小操作（删除）

### 文字按钮 (`.btn-text`)
- 背景：透明
- 字体：28rpx, 500 weight
- 用途：链接、轻量级操作

### 图标按钮 (`.btn-icon`)
- 背景：#F5F5F5
- 大小：60rpx × 60rpx
- 圆角：16rpx
- 用途：编辑、删除等图标操作

---

## 间距系统

| 名称 | 变量 | 值 | 用途 |
|------|------|-----|------|
| 超小 | `$spacing-xs` | 8rpx | 紧凑间距 |
| 小 | `$spacing-sm` | 16rpx | 元素间距 |
| 中 | `$spacing-md` | 24rpx | 块间距 |
| 大 | `$spacing-lg` | 32rpx | 大块间距 |
| 超大 | `$spacing-xl` | 48rpx | 页面顶部间距 |

---

## 圆角系统

| 名称 | 变量 | 值 | 用途 |
|------|------|-----|------|
| 小 | `$border-radius-sm` | 8rpx | 小组件 |
| 中 | `$border-radius-md` | 16rpx | 卡片、容器 |
| 大 | `$border-radius-lg` | 24rpx | 大容器 |
| 全圆 | `$border-radius-full` | 50rpx | 按钮、头像 |

---

## 阴影系统

| 名称 | 变量 | 值 | 用途 |
|------|------|-----|------|
| 轻 | `$shadow-light` | 0 2rpx 8rpx rgba(0, 0, 0, 0.06) | 卡片 |
| 正常 | `$shadow-normal` | 0 4rpx 12rpx rgba(0, 0, 0, 0.08) | 容器 |
| 中等 | `$shadow-medium` | 0 8rpx 24rpx rgba(0, 0, 0, 0.12) | 浮动元素 |
| 重 | `$shadow-heavy` | 0 12rpx 32rpx rgba(0, 0, 0, 0.16) | 模态框 |

---

## 使用指南

### 导入设计规范

在任何 Vue 文件中，设计规范会通过 `uni.scss` 自动导入：

```scss
<style lang="scss" scoped>
// 直接使用设计规范变量
.my-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.my-button {
  @extend .btn-primary;
}
</style>
```

### 常见用法示例

#### 标题
```scss
.page-title {
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  line-height: $line-height-tight;
}
```

#### 正文
```scss
.body-text {
  font-size: $font-size-body;
  font-weight: $font-weight-normal;
  color: $color-text-primary;
  line-height: $line-height-normal;
}
```

#### 卡片
```scss
.card {
  background: $color-bg-primary;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-light;
}
```

#### 按钮
```scss
// 主按钮
<button class="btn-primary">确定</button>

// 小按钮
<button class="btn-small">添加</button>

// 危险按钮
<button class="btn-danger">删除</button>
```

---

## 维护说明

1. **修改设计规范**：编辑 `/styles/design-tokens.scss` 文件
2. **修改按钮样式**：编辑 `/styles/buttons.scss` 文件
3. **向后兼容**：所有旧变量（如 `$primary-color`）已映射到新变量，无需修改现有代码

---

## 文件结构

```
styles/
├── design-tokens.scss    # 设计令牌（字体、颜色、间距等）
├── buttons.scss          # 按钮样式库
└── ...

uni.scss                  # 主样式文件（导入上述文件）
```

---

## 更新日志

### v1.0 (2024-12-29)
- 创建统一的设计系统
- 定义字体、颜色、按钮样式
- 统一所有页面的视觉风格
