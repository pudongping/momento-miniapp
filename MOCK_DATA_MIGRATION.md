# Mock数据迁移指南

## 概述
根据最新的数据库建表语句（`docs/数据库建表语句.sql`），需要对mock数据进行以下调整，以确保与数据库schema保持一致。

## 需要调整的字段映射

### 1. 用户表 (users)
- **主键**: `uid` → `user_id` (BIGINT)
- **新增字段**: `is_disable` (TINYINT, 默认1表示启用)
- **字段类型调整**:
  - `openid`: VARCHAR(255)
  - `unionid`: VARCHAR(255)
  - `avatar`: VARCHAR(1024)
  - `phone`: VARCHAR(80)

**影响的mock文件**: `mock/user.js`

### 2. 账本表 (account_books)
- `creator_uid` → `creator_user_id` (BIGINT)
- `book_id`: INT → BIGINT

**影响的mock文件**: `mock/account-books.js`

### 3. 账本成员表 (account_book_members)
- `uid` → `user_id` (BIGINT)
- `is_creator`: 默认值从0改为2（1-是，2-否）
- `is_default`: 默认值从0改为2（1-是，2-否）
- `book_id`: INT → BIGINT

**影响的mock文件**: `mock/account-books.js`

### 4. 标签表 (tags)
- `uid` → `user_id` (BIGINT)
- `is_system`: 默认值从0改为2（1-是，2-否）
- `sort_order` → `sort_num`

**影响的mock文件**: `mock/tags.js`

### 5. 交易表 (transactions)
- `uid` → `user_id` (BIGINT)
- `tag_id`: 添加默认值0
- `is_auto_generated`: 默认值从0改为2（1-是，2-否）
- `transaction_id`: INT → BIGINT
- `book_id`: INT → BIGINT

**影响的mock文件**: `mock/transactions.js`

### 6. 周期记账表 (recurring_transactions)
- `uid` → `user_id` (BIGINT)
- `is_recurring_enabled`: 默认值从1改为2（1-是，2-否）
- `recurring_weekday/month/day`: 默认值改为0，不允许NULL
- `book_id`: INT → BIGINT

**影响的mock文件**: `mock/recurring-transactions.js`

### 7. 节日表 (festivals)
- `uid` → `user_id` (BIGINT)

**影响的mock文件**: `mock/festivals.js`

### 8. 文件表 (upload_files)
- `uid` → `user_id` (BIGINT)
- `file_id`: INT → BIGINT

**影响的mock文件**: `mock/upload.js`

## 重要说明

1. **数据库中已移除的表**:
   - `request_logs` 表已被移除（防重复提交现在通过请求头的X-Request-ID实现）

2. **API文档更新**:
   - 所有接口文档中不再需要在请求参数中包含`request_id`
   - `request_id`现在通过请求头`X-Request-ID`传递

3. **前端request.js已更新**:
   - 自动添加`X-Request-ID`、`X-Device-ID`、`X-User-ID`请求头
   - 不再需要在请求body中传递`request_id`

## 实施步骤

1. 更新`mock/user.js`中的用户数据结构
2. 更新`mock/account-books.js`中的账本和成员数据
3. 更新`mock/tags.js`中的标签数据
4. 更新`mock/transactions.js`中的交易数据
5. 更新`mock/recurring-transactions.js`中的周期记账数据
6. 更新`mock/festivals.js`中的节日数据
7. 更新`mock/upload.js`中的文件数据
8. 更新`mock/index.js`中的所有API响应数据

## 注意事项

- 所有BIGINT类型的ID在JavaScript中应该保持为数字类型（不需要转换为字符串）
- 时间戳继续使用秒级时间戳（INT(11) UNSIGNED）
- 布尔值使用TINYINT(1)，1表示是/启用，2表示否/禁用
