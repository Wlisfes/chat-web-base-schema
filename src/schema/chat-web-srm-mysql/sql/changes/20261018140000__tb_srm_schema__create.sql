-- 新建 SRM 供应商、供应商配置、供应商联系人表：结构参考 CRM 客户，供应商无品牌、客户类型、认证状态字段，也无短信应用概念。
-- 回滚：DROP TABLE IF EXISTS `tb_srm_user_contact`; DROP TABLE IF EXISTS `tb_srm_user_config`; DROP TABLE IF EXISTS `tb_srm_user`;

CREATE TABLE IF NOT EXISTS `tb_srm_user` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `owner_user_uid` varchar(19) NOT NULL COMMENT '归属账号UID',
    `name` varchar(64) NOT NULL COMMENT '供应商名称',
    `alias` varchar(64) NULL COMMENT '供应商别名：SSK + 创建人工号 + 4位数字或大写字母随机码，全表唯一',
    `currency` varchar(16) NOT NULL COMMENT '财务币种编码',
    `email` varchar(128) NOT NULL COMMENT '邮箱',
    `phone` varchar(32) NULL COMMENT '电话号码',
    `status` varchar(32) NOT NULL COMMENT '供应商状态：disable=禁用（供应商账号不可用）；enable=启用（供应商账号正常使用）',
    `pay_mode` varchar(32) NOT NULL COMMENT '付款模式：postpaid=后付（账期后付费）；prepaid=预付（账户预付费）',
    `balance` bigint NOT NULL DEFAULT 0 COMMENT '余额（放大百万倍存储）',
    `balance_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD余额（放大百万倍存储）',
    `credit` bigint NOT NULL DEFAULT 0 COMMENT '信用额度（放大百万倍存储）',
    `credit_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD信用额度（放大百万倍存储）',
    `level` int NOT NULL DEFAULT 1 COMMENT '供应商等级',
    `stage` varchar(32) NOT NULL DEFAULT 'cluetrail' COMMENT '供应商阶段：authenticate=认证阶段（供应商正在认证）；charge=充值阶段（供应商准备充值）；cluetrail=线索阶段（供应商处于线索跟进）；cooperate=价值阶段（供应商已形成稳定价值）；intention=意向阶段（供应商已有合作意向）；production=生产阶段（供应商已进入生产）；testing=测试阶段（供应商正在业务测试）',
    `source` int NOT NULL COMMENT '注册来源：Skyline 枚举 CHUNK_SRM_USER_SOURCE 的枚举项主键',
    `remark` varchar(1024) NULL COMMENT '备注',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_user_alias` (`alias`),
    KEY `idx_tb_srm_user_owner_user_uid` (`owner_user_uid`),
    KEY `idx_tb_srm_user_status` (`status`),
    KEY `idx_tb_srm_user_currency` (`currency`)
) ENGINE = InnoDB AUTO_INCREMENT = 10241000 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '供应商账号表';

CREATE TABLE IF NOT EXISTS `tb_srm_user_config` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_key_id` int NOT NULL COMMENT 'SRM 供应商主键',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_user_config_user_key_id` (`user_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 供应商配置表';

CREATE TABLE IF NOT EXISTS `tb_srm_user_contact` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_key_id` int NOT NULL COMMENT 'SRM 供应商主键',
    `name` varchar(64) NOT NULL COMMENT '联系人名称',
    `items` text NOT NULL DEFAULT ('[]') COMMENT '联系方式列表，JSON 数组：[{ type: 联系方式类型枚举项主键, value: 联系方式内容 }]',
    `address` varchar(512) NULL COMMENT '地址',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '联系人状态：disable=无效（联系人已标记无效）；enable=有效（联系人正常可用）',
    `remark` varchar(1024) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    KEY `idx_tb_srm_user_contact_user_key_id` (`user_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 供应商联系人表';
