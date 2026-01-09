# 时光账记 API 接口文档

## 接口规范

### 基础信息
- **接口协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时间戳**: 所有时间戳均为秒级时间戳（10位）
- **ID规范**: 
  - 用户 UID: 字符串格式的雪花算法分布式 ID
  - 其他业务主键: int 自增 ID

### 统一响应格式

```json
{
  "code": 0,
  "msg": "成功",
  "data": {}
}
```

**响应码说明**:
- `0`: 成功
- `1`: 失败
- 其他: 具体业务错误码

### 请求头
```
Content-Type: application/json
Authorization: Bearer {token}
X-Request-ID: {request_id}          // 请求唯一标识，用于防重复提交
X-Device-ID: {device_id}            // 设备ID，用于设备识别
X-User-ID: {user_id}                // 用户ID（可选，已登录时携带）
```

**请求头字段说明**:
- `X-Request-ID`: 每次请求都会生成一个唯一的请求ID，用于幂等性控制和防重复提交
- `X-Device-ID`: 设备唯一标识，首次生成后存储在本地，用于设备识别和统计
- `X-User-ID`: 用户ID，仅在用户已登录时携带，用于关联用户请求

**注意**: 前端会自动在所有请求中添加这些请求头，无需在每个接口文档中重复说明

---

## 1. 用户相关接口

### 1.1 微信登录
**接口**: `POST /user/login`

**请求参数**:
```json
{
  "code": "微信登录返回的code",
  "request_id": "请求唯一标识"
}
```

**响应数据**:
```json
{
  "uid": "123456789012345678",
  "nickname": "小时光",
  "avatar": "https://thirdwx.qlogo.cn/...",
  "phone": "13812345678",
  "token": "mock_token_xxx",
  "created_at": 1704067200,
  "updated_at": 1704067200
}
```

### 1.2 获取用户信息
**接口**: `GET /user/info`

**响应数据**:
```json
{
  "uid": "123456789012345678",
  "nickname": "小时光",
  "avatar": "https://thirdwx.qlogo.cn/...",
  "phone": "13812345678",
  "created_at": 1704067200,
  "updated_at": 1704067200
}
```

### 1.3 更新用户信息
**接口**: `PUT /user/update`

**请求参数**:
```json
{
  "nickname": "新昵称",
  "avatar": "https://...",
  "request_id": "请求唯一标识"
}
```

**响应数据**: 返回更新后的用户信息

### 1.4 绑定手机号
**接口**: `POST /user/bind-phone`

**请求参数**:
```json
{
  "phone": "13812345678",
  "code": "验证码",
  "request_id": "请求唯一标识"
}
```

### 1.5 获取用户设置
**接口**: `GET /user/settings`

**响应数据**:
```json
{
  "background_url": "https://cdn.example.com/uploads/background/sample_bg.jpg",
  "budget": 10000,
  "updated_at": 1704067200
}
```

### 1.6 更新用户设置
**接口**: `PUT /user/settings`

**请求参数**:
```json
{
  "background_url": "https://...",
  "budget": 10000,
  "request_id": "请求唯一标识"
}
```

---

## 2. 账本相关接口

### 2.1 获取账本列表
**接口**: `GET /accountBooks/list`

**响应数据**:
```json
[
  {
    "book_id": 1,
    "name": "家庭账本",
    "creator_uid": "123456789012345678",
    "is_creator": true,
    "is_default": true,
    "member_count": 2,
    "created_at": 1704067200,
    "updated_at": 1704067200
  }
]
```

### 2.2 创建账本
**接口**: `POST /accountBooks/create`

**请求参数**:
```json
{
  "name": "旅游账本",
  "request_id": "请求唯一标识"
}
```

### 2.3 删除账本
**接口**: `DELETE /accountBooks/delete`

**请求参数**:
```json
{
  "book_id": 1,
  "request_id": "请求唯一标识"
}
```

### 2.4 邀请用户
**接口**: `POST /accountBooks/invite`

**请求参数**:
```json
{
  "book_id": 1,
  "target_uid": "223456789012345678",
  "request_id": "请求唯一标识"
}
```

### 2.5 获取邀请列表
**接口**: `GET /accountBooks/invitations`

**响应数据**:
```json
[
  {
    "invitation_id": 1,
    "book_id": 3,
    "book_name": "公司聚餐账本",
    "inviter_uid": "223456789012345678",
    "inviter_nickname": "账本达人",
    "target_uid": "123456789012345678",
    "status": "pending",
    "created_at": 1704067200
  }
]
```

### 2.6 接受邀请
**接口**: `POST /accountBooks/accept`

**请求参数**:
```json
{
  "invitation_id": 1,
  "request_id": "请求唯一标识"
}
```

### 2.7 拒绝邀请
**接口**: `POST /accountBooks/reject`

**请求参数**:
```json
{
  "invitation_id": 1,
  "request_id": "请求唯一标识"
}
```

### 2.8 退出账本
**接口**: `POST /accountBooks/exit`

**请求参数**:
```json
{
  "book_id": 1,
  "request_id": "请求唯一标识"
}
```

### 2.9 设置默认账本
**接口**: `PUT /accountBooks/setDefault`

**请求参数**:
```json
{
  "book_id": 1,
  "request_id": "请求唯一标识"
}
```

### 2.10 获取账本成员
**接口**: `GET /accountBooks/members`

**请求参数**:
```json
{
  "book_id": 1
}
```

**响应数据**:
```json
[
  {
    "uid": "123456789012345678",
    "nickname": "小时光",
    "avatar": "https://...",
    "status": "joined"
  }
]
```

### 2.11 移除成员
**接口**: `POST /accountBooks/removeMember`

**请求参数**:
```json
{
  "book_id": 1,
  "target_uid": "223456789012345678",
  "request_id": "请求唯一标识"
}
```

---

## 3. 交易记录相关接口

### 3.1 获取交易记录列表
**接口**: `GET /transactions/list`

**请求参数**:
```json
{
  "book_id": 1,
  "type": "expense",
  "tag_id": 1,
  "start_date": 1704067200,
  "end_date": 1704153600,
  "page": 1,
  "per_page": 20,
  "last_transaction_id": 0
}
```

**响应数据**:
```json
{
  "list": [
    {
      "transaction_id": 1,
      "book_id": 1,
      "type": "expense",
      "amount": 100.50,
      "tag_id": 1,
      "tag_name": "买菜",
      "tag_color": "#4CAF50",
      "tag_icon": "shopping-cart",
      "remark": "超市购物",
      "created_at": 1704067200,
      "updated_at": 1704067200,
      "is_auto_generated": false
    }
  ],
  "has_more": true,
  "total": 50,
  "page": 1,
  "per_page": 20
}
```

### 3.2 添加交易记录
**接口**: `POST /transactions/add`

**请求参数**:
```json
{
  "book_id": 1,
  "type": "expense",
  "amount": 100.50,
  "tag_id": 1,
  "remark": "超市购物",
  "timestamp": 1704067200,
  "is_auto_generated": false,
  "request_id": "请求唯一标识"
}
```

### 3.3 更新交易记录
**接口**: `PUT /transactions/update`

**请求参数**:
```json
{
  "transaction_id": 1,
  "type": "expense",
  "amount": 150.00,
  "tag_id": 1,
  "remark": "更新备注",
  "timestamp": 1704067200,
  "request_id": "请求唯一标识"
}
```

### 3.4 删除交易记录
**接口**: `DELETE /transactions/delete`

**请求参数**:
```json
{
  "transaction_id": 1,
  "request_id": "请求唯一标识"
}
```

### 3.5 获取统计数据
**接口**: `GET /transactions/stats`

**请求参数**:
```json
{
  "book_id": 1,
  "start_date": 1704067200,
  "end_date": 1704153600
}
```

**响应数据**:
```json
{
  "total_income": 10000.00,
  "total_expense": 3500.50,
  "balance": 6499.50,
  "tag_stats": [
    {
      "tag_id": 1,
      "tag_name": "买菜",
      "tag_color": "#4CAF50",
      "tag_icon": "shopping-cart",
      "count": 10,
      "amount": 500.00
    }
  ]
}
```

---

## 4. 标签相关接口

### 4.1 获取标签列表
**接口**: `GET /tags/list`

**请求参数**:
```json
{
  "type": "expense"
}
```

**响应数据**:
```json
[
  {
    "tag_id": 1,
    "name": "买菜",
    "color": "#4CAF50",
    "icon": "shopping-cart",
    "is_system": true,
    "type": "expense"
  }
]
```

### 4.2 添加自定义标签
**接口**: `POST /tags/add`

**请求参数**:
```json
{
  "name": "健身",
  "color": "#E91E63",
  "icon": "fitness",
  "type": "expense",
  "request_id": "请求唯一标识"
}
```

### 4.5 更新自定义标签
**接口**: `PUT /tags/update`

**请求参数**:
```json
{
  "tag_id": 101,
  "name": "健身房",
  "color": "#E91E63",
  "icon": "fitness",
  "request_id": "请求唯一标识"
}
```

### 4.6 删除自定义标签
**接口**: `DELETE /tags/delete`

**请求参数**:
```json
{
  "tag_id": 101,
  "request_id": "请求唯一标识"
}
```

---

## 5. 周期性记账相关接口

### 5.1 获取周期性记账列表
**接口**: `GET /recurring/list`

**请求参数**:
```json
{
  "book_id": 1,
  "type": "expense",
  "is_recurring_enabled": true
}
```

**响应数据**:
```json
[
  {
    "recurring_id": 1,
    "book_id": 1,
    "name": "房贷",
    "type": "expense",
    "amount": 3500,
    "tag_id": 2,
    "remark": "每月房贷还款",
    "recurring_type": "monthly",
    "recurring_hour": 9,
    "recurring_minute": 0,
    "recurring_month": null,
    "recurring_day": 10,
    "recurring_weekday": null,
    "is_recurring_enabled": true,
    "created_at": 1704067200,
    "updated_at": 1704067200
  }
]
```

**周期类型说明**:
- `daily`: 每天
- `weekly`: 每周
- `monthly`: 每月
- `quarterly`: 每季度
- `yearly`: 每年

### 5.2 添加周期性记账
**接口**: `POST /recurring/add`

**请求参数**:
```json
{
  "book_id": 1,
  "name": "房贷",
  "type": "expense",
  "amount": 3500,
  "tag_id": 2,
  "remark": "每月房贷还款",
  "recurring_type": "monthly",
  "recurring_hour": 9,
  "recurring_minute": 0,
  "recurring_day": 10,
  "is_recurring_enabled": true,
  "request_id": "请求唯一标识"
}
```

### 5.3 更新周期性记账
**接口**: `PUT /recurring/update`

**请求参数**:
```json
{
  "recurring_id": 1,
  "name": "房贷",
  "amount": 3600,
  "request_id": "请求唯一标识"
}
```

### 5.4 删除周期性记账
**接口**: `DELETE /recurring/delete`

**请求参数**:
```json
{
  "recurring_id": 1,
  "request_id": "请求唯一标识"
}
```

### 5.5 切换周期性记账状态
**接口**: `PUT /recurring/toggle`

**请求参数**:
```json
{
  "recurring_id": 1,
  "status": true,
  "request_id": "请求唯一标识"
}
```

### 5.6 执行周期性记账
**接口**: `POST /recurring/process`

**说明**: 系统定时任务调用，检查并执行到期的周期性记账

---

## 6. 节日相关接口

### 6.1 获取节日列表
**接口**: `GET /festivals/list`

**响应数据**:
```json
[
  {
    "festival_id": 1,
    "festival_name": "春节",
    "festival_date": 20240210,
    "is_show_home": 1,
    "created_at": 1704067200,
    "updated_at": 1704067200
  }
]
```

**说明**: `festival_date` 格式为 YYYYMMDD 数字

### 6.2 添加节日
**接口**: `POST /festivals/add`

**请求参数**:
```json
{
  "festival_name": "结婚纪念日",
  "festival_date": 20240615,
  "is_show_home": 1,
  "request_id": "请求唯一标识"
}
```

### 6.3 更新节日
**接口**: `PUT /festivals/update`

**请求参数**:
```json
{
  "festival_id": 1,
  "festival_name": "春节",
  "festival_date": 20250129,
  "is_show_home": 1,
  "request_id": "请求唯一标识"
}
```

### 6.4 删除节日
**接口**: `DELETE /festivals/delete`

**请求参数**:
```json
{
  "festival_id": 1,
  "request_id": "请求唯一标识"
}
```

### 6.5 切换节日显示状态
**接口**: `PUT /festivals/toggle`

**请求参数**:
```json
{
  "festival_id": 1,
  "is_show_home": 0,
  "request_id": "请求唯一标识"
}
```

---

## 7. 文件上传相关接口

### 7.1 上传文件
**接口**: `POST /upload/file`

**请求参数**: multipart/form-data
```
file: 文件对象
file_type: image/excel
business_type: user_avatar/background/transaction_image
request_id: 请求唯一标识
```

**响应数据**:
```json
{
  "relative_path": "/uploads/user_avatar/1704067200_abc123.jpg",
  "absolute_url": "https://cdn.example.com/uploads/user_avatar/1704067200_abc123.jpg",
  "file_size": 102400,
  "file_type": "image",
  "business_type": "user_avatar",
  "upload_time": 1704067200
}
```

---

## 附录

### A. 状态码说明

**邀请状态**:
- `pending`: 待处理
- `accepted`: 已接受
- `rejected`: 已拒绝

**成员状态**:
- `joined`: 已加入
- `waiting`: 等待中
- `rejected`: 已拒绝

**交易类型**:
- `expense`: 支出
- `income`: 收入

### B. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 1001 | 参数错误 |
| 1002 | 未登录 |
| 1003 | 无权限 |
| 2001 | 用户不存在 |
| 2002 | 账本不存在 |
| 2003 | 标签不存在 |
| 2004 | 交易记录不存在 |

### C. 注意事项

1. 所有需要登录的接口都需要在请求头中携带 token
2. 所有时间戳均为秒级时间戳（10位）
3. 用户 UID 为字符串格式的雪花算法 ID
4. 其他业务主键均为 int 自增 ID
5. 所有写操作接口都需要传递 request_id 用于防重复提交
6. 分页查询支持两种方式：
   - 传统分页：使用 page 和 per_page
   - 游标分页：使用 last_transaction_id
