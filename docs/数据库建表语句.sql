-- =============================================
-- 时光小账本数据库建表语句
-- 数据库版本: MySQL 5.7
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_unicode_ci
-- 时间戳: 所有时间戳字段均为秒级时间戳（INT(10) UNSIGNED）
-- ID规范: 用户UID为VARCHAR(20)雪花算法ID，其他业务主键为INT自增ID
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `momento_miniapp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `momento_miniapp`;

-- =============================================
-- 1. 用户相关表
-- =============================================

-- 用户表
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `uid` VARCHAR(20) NOT NULL COMMENT '用户唯一ID（雪花算法）',
  `openid` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '微信openid',
  `unionid` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '微信unionid',
  `nickname` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '用户昵称',
  `avatar` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '用户头像URL',
  `phone` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '手机号',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_phone` (`phone`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户设置表
DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE `user_settings` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `uid` VARCHAR(20) NOT NULL COMMENT '用户ID',
  `background_url` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '首页背景图片URL',
  `budget` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '月度预算',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设置表';

-- =============================================
-- 2. 账本相关表
-- =============================================

-- 账本表
DROP TABLE IF EXISTS `account_books`;
CREATE TABLE `account_books` (
  `book_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账本ID',
  `name` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '账本名称',
  `creator_uid` VARCHAR(20) NOT NULL COMMENT '创建者UID',
  `member_count` INT(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT '成员数量',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`book_id`),
  KEY `idx_creator_uid` (`creator_uid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账本表';

-- 账本成员表
DROP TABLE IF EXISTS `account_book_members`;
CREATE TABLE `account_book_members` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `book_id` INT(10) UNSIGNED NOT NULL COMMENT '账本ID',
  `uid` VARCHAR(20) NOT NULL COMMENT '用户ID',
  `is_creator` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为创建者 0-否 1-是',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为默认账本 0-否 1-是',
  `status` ENUM('joined','waiting','rejected') NOT NULL DEFAULT 'joined' COMMENT '成员状态',
  `joined_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '加入时间（秒级时间戳）',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_book_uid` (`book_id`, `uid`),
  KEY `idx_uid` (`uid`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账本成员表';

-- 账本邀请表
DROP TABLE IF EXISTS `account_book_invitations`;
CREATE TABLE `account_book_invitations` (
  `invitation_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '邀请ID',
  `book_id` INT(10) UNSIGNED NOT NULL COMMENT '账本ID',
  `inviter_uid` VARCHAR(20) NOT NULL COMMENT '邀请人UID',
  `target_uid` VARCHAR(20) NOT NULL COMMENT '被邀请人UID',
  `status` ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending' COMMENT '邀请状态',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`invitation_id`),
  KEY `idx_book_id` (`book_id`),
  KEY `idx_target_uid` (`target_uid`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账本邀请表';

-- =============================================
-- 3. 标签相关表
-- =============================================

-- 标签表
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `tag_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `uid` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '用户ID（系统标签为空）',
  `name` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '标签名称',
  `color` VARCHAR(20) NOT NULL DEFAULT '#4CAF50' COMMENT '标签颜色',
  `icon` VARCHAR(50) NOT NULL DEFAULT 'tag' COMMENT '标签图标',
  `is_system` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为系统标签 0-否 1-是',
  `type` ENUM('expense','income') NOT NULL DEFAULT 'expense' COMMENT '标签类型',
  `sort_order` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`tag_id`),
  KEY `idx_uid_type` (`uid`, `type`),
  KEY `idx_is_system` (`is_system`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- =============================================
-- 4. 交易记录相关表
-- =============================================

-- 交易记录表
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `transaction_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '交易记录ID',
  `book_id` INT(10) UNSIGNED NOT NULL COMMENT '账本ID',
  `uid` VARCHAR(20) NOT NULL COMMENT '用户ID',
  `type` ENUM('expense','income') NOT NULL DEFAULT 'expense' COMMENT '交易类型',
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '金额',
  `tag_id` INT(10) UNSIGNED NOT NULL COMMENT '标签ID',
  `remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `transaction_time` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '交易时间（秒级时间戳）',
  `is_auto_generated` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否自动生成 0-否 1-是',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`transaction_id`),
  KEY `idx_book_id` (`book_id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_type` (`type`),
  KEY `idx_tag_id` (`tag_id`),
  KEY `idx_transaction_time` (`transaction_time`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易记录表';

-- =============================================
-- 5. 周期性记账相关表
-- =============================================

-- 周期性记账表
DROP TABLE IF EXISTS `recurring_transactions`;
CREATE TABLE `recurring_transactions` (
  `recurring_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '周期性记账ID',
  `book_id` INT(10) UNSIGNED NOT NULL COMMENT '账本ID',
  `uid` VARCHAR(20) NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '记账名称',
  `type` ENUM('expense','income') NOT NULL DEFAULT 'expense' COMMENT '交易类型',
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '金额',
  `tag_id` INT(10) UNSIGNED NOT NULL COMMENT '标签ID',
  `remark` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `recurring_type` ENUM('daily','weekly','monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly' COMMENT '周期类型',
  `recurring_hour` TINYINT(2) UNSIGNED NOT NULL DEFAULT 9 COMMENT '执行小时（0-23）',
  `recurring_minute` TINYINT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '执行分钟（0-59）',
  `recurring_weekday` TINYINT(1) UNSIGNED DEFAULT NULL COMMENT '星期几（0-6，0为周日）',
  `recurring_month` TINYINT(2) UNSIGNED DEFAULT NULL COMMENT '月份（1-12）',
  `recurring_day` TINYINT(2) UNSIGNED DEFAULT NULL COMMENT '日期（1-31）',
  `is_recurring_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用 0-否 1-是',
  `last_executed_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '最后执行时间（秒级时间戳）',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`recurring_id`),
  KEY `idx_book_id` (`book_id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_type` (`type`),
  KEY `idx_enabled` (`is_recurring_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='周期性记账表';

-- =============================================
-- 6. 节日相关表
-- =============================================

-- 节日表
DROP TABLE IF EXISTS `festivals`;
CREATE TABLE `festivals` (
  `festival_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '节日ID',
  `uid` VARCHAR(20) NOT NULL COMMENT '用户ID',
  `festival_name` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '节日名称',
  `festival_date` INT(8) UNSIGNED NOT NULL DEFAULT 0 COMMENT '节日日期（YYYYMMDD格式）',
  `is_show_home` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否在首页显示 0-否 1-是',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  `updated_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
  PRIMARY KEY (`festival_id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_festival_date` (`festival_date`),
  KEY `idx_is_show_home` (`is_show_home`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='节日表';

-- =============================================
-- 7. 文件上传相关表
-- =============================================

-- 文件上传记录表
DROP TABLE IF EXISTS `upload_files`;
CREATE TABLE `upload_files` (
  `file_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文件ID',
  `uid` VARCHAR(20) NOT NULL COMMENT '用户ID',
  `relative_path` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '文件相对路径',
  `absolute_url` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '文件绝对URL',
  `file_size` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  `file_type` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '文件类型',
  `business_type` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '业务类型',
  `upload_time` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '上传时间（秒级时间戳）',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  PRIMARY KEY (`file_id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_business_type` (`business_type`),
  KEY `idx_upload_time` (`upload_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件上传记录表';

-- =============================================
-- 8. 系统相关表
-- =============================================

-- 请求日志表（用于防重复提交）
DROP TABLE IF EXISTS `request_logs`;
CREATE TABLE `request_logs` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `request_id` VARCHAR(64) NOT NULL COMMENT '请求唯一标识',
  `uid` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '用户ID',
  `api_path` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'API路径',
  `request_data` TEXT COMMENT '请求数据',
  `response_data` TEXT COMMENT '响应数据',
  `status_code` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态码',
  `created_at` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_request_id` (`request_id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='请求日志表';

-- =============================================
-- 初始化系统标签数据
-- =============================================

INSERT INTO `tags` (`tag_id`, `uid`, `name`, `color`, `icon`, `is_system`, `type`, `sort_order`) VALUES
(1, '', '买菜', '#4CAF50', 'shopping-cart', 1, 'expense', 1),
(2, '', '房贷', '#2196F3', 'home', 1, 'expense', 2),
(3, '', '孩子', '#FF9800', 'child', 1, 'expense', 3),
(4, '', '餐饮', '#F44336', 'food', 1, 'expense', 4),
(5, '', '交通', '#9C27B0', 'car', 1, 'expense', 5),
(6, '', '其他', '#607D8B', 'more', 1, 'expense', 6),
(7, '', '工资', '#4CAF50', 'wallet', 1, 'income', 7),
(8, '', '奖金', '#FF9800', 'gift', 1, 'income', 8),
(9, '', '投资', '#2196F3', 'chart', 1, 'income', 9),
(10, '', '其他收入', '#607D8B', 'more', 1, 'income', 10);

-- =============================================
-- 索引优化说明
-- =============================================
-- 1. 所有外键字段都建立了索引
-- 2. 常用查询条件字段建立了索引
-- 3. 时间字段建立了索引，便于按时间范围查询
-- 4. 组合索引遵循最左前缀原则
-- 5. 唯一索引用于保证数据唯一性

-- =============================================
-- 表设计说明
-- =============================================
-- 1. 所有时间戳字段使用 INT(10) UNSIGNED 存储秒级时间戳
-- 2. 用户UID使用 VARCHAR(20) 存储雪花算法生成的ID
-- 3. 其他业务主键使用 INT(10) UNSIGNED 自增ID
-- 4. 金额字段使用 DECIMAL(10,2) 精确存储
-- 5. 枚举字段使用 ENUM 类型提高查询效率
-- 6. 所有表都使用 InnoDB 引擎支持事务
-- 7. 字符集使用 utf8mb4 支持emoji等特殊字符
