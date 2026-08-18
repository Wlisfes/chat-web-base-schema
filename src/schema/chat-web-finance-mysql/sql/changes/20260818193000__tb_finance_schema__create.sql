CREATE TABLE IF NOT EXISTS `tb_finance_brand` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `name` varchar(64) NOT NULL COMMENT '品牌名称',
    `document` varchar(1024) NULL COMMENT '品牌描述',
    `status` varchar(32) NOT NULL COMMENT '品牌状态：disable=禁用（品牌不可用于新客户）；enable=启用（品牌可正常使用）',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_brand_name` (`name`),
    KEY `idx_tb_finance_brand_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务品牌表';

CREATE TABLE IF NOT EXISTS `tb_finance_currency` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `currency` varchar(16) NOT NULL COMMENT '币种编码',
    `name` varchar(64) NOT NULL COMMENT '币种名称',
    `symbol` varchar(8) NOT NULL COMMENT '币种符号',
    `status` varchar(32) NOT NULL COMMENT '币种状态：disable=禁用（币种不可用于新业务）；enable=启用（币种可正常使用）',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_currency_currency` (`currency`),
    KEY `idx_tb_finance_currency_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务币种表';

CREATE TABLE IF NOT EXISTS `tb_finance_currency_exchange` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `currency` varchar(16) NOT NULL COMMENT '币种编码',
    `rate` decimal(16, 6) NOT NULL COMMENT '基于 USD 的汇率',
    `rate_date` date NOT NULL COMMENT '汇率日期',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_currency_exchange_currency_date` (`currency`, `rate_date`),
    KEY `idx_tb_finance_currency_exchange_rate_date` (`rate_date`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务币种汇率表';

CREATE TABLE IF NOT EXISTS `tb_finance_country` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `code` varchar(10) NOT NULL COMMENT '国家/地区国际区号',
    `mcc` varchar(4) NOT NULL COMMENT '移动国家代码',
    `cn_name` varchar(64) NOT NULL COMMENT '中文名称',
    `en_name` varchar(64) NOT NULL COMMENT '英文名称',
    `status` varchar(32) NOT NULL COMMENT '国家/地区状态：disable=禁用（国家/地区不可用于新业务）；enable=启用（国家/地区可正常使用）',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_country_code_mcc` (`code`, `mcc`),
    KEY `idx_tb_finance_country_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务国家地区表';

CREATE TABLE IF NOT EXISTS `tb_finance_client` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `owner_user_uid` varchar(19) NOT NULL COMMENT '归属账号UID',
    `name` varchar(64) NOT NULL COMMENT '客户名称',
    `alias` varchar(64) NULL COMMENT '客户别名',
    `brand_key_id` int NOT NULL COMMENT '归属品牌主键',
    `currency` varchar(16) NOT NULL COMMENT '币种编码',
    `email` varchar(128) NOT NULL COMMENT '邮箱',
    `phone` varchar(32) NULL COMMENT '电话号码',
    `status` varchar(32) NOT NULL COMMENT '客户状态：disable=禁用（客户账号不可用）；enable=启用（客户账号正常使用）',
    `pay_mode` varchar(32) NOT NULL COMMENT '付款模式：postpaid=后付（账期后付费）；prepaid=预付（账户预付费）',
    `class_type` varchar(32) NOT NULL DEFAULT 'common' COMMENT '客户类型：common=普通客户（普通业务客户）；cooperate=推广客户（合作推广客户）',
    `balance` bigint NOT NULL DEFAULT 0 COMMENT '余额（放大百万倍存储）',
    `balance_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD余额（放大百万倍存储）',
    `credit` bigint NOT NULL DEFAULT 0 COMMENT '信用额度（放大百万倍存储）',
    `credit_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD信用额度（放大百万倍存储）',
    `level` int NOT NULL DEFAULT 1 COMMENT '客户等级',
    `stage` varchar(32) NOT NULL DEFAULT 'cluetrail' COMMENT '客户阶段：authenticate=认证阶段（客户正在认证）；charge=充值阶段（客户准备充值）；cluetrail=线索阶段（客户处于线索跟进）；cooperate=价值阶段（客户已形成稳定价值）；intention=意向阶段（客户已有合作意向）；production=生产阶段（客户已进入生产）；testing=测试阶段（客户正在业务测试）',
    `auth_status` varchar(32) NOT NULL DEFAULT 'unverified' COMMENT '认证状态：pending=认证中（认证资料审核中）；rejected=认证失败（认证资料未通过）；unverified=未认证（尚未提交认证）；verified=已认证（认证已通过）',
    `source` varchar(32) NOT NULL DEFAULT 'manual' COMMENT '注册来源：manual=手动创建（管理端人工创建）；platform=平台注册（客户从平台注册）',
    `remark` varchar(1024) NULL COMMENT '备注',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    KEY `idx_tb_finance_client_owner_user_uid` (`owner_user_uid`),
    KEY `idx_tb_finance_client_brand_key_id` (`brand_key_id`),
    KEY `idx_tb_finance_client_status` (`status`),
    KEY `idx_tb_finance_client_currency` (`currency`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务消费客户表';

CREATE TABLE IF NOT EXISTS `tb_finance_client_tag` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `client_key_id` int NOT NULL COMMENT '客户主键',
    `tag_name` varchar(64) NOT NULL COMMENT '标签名称',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_client_tag_client_name` (`client_key_id`, `tag_name`),
    KEY `idx_tb_finance_client_tag_client_key_id` (`client_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务客户标签表';

CREATE TABLE IF NOT EXISTS `tb_finance_client_share` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `client_key_id` int NOT NULL COMMENT '客户主键',
    `shared_user_uid` varchar(19) NOT NULL COMMENT '共享账号UID',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_client_share_client_user` (`client_key_id`, `shared_user_uid`),
    KEY `idx_tb_finance_client_share_shared_user_uid` (`shared_user_uid`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务客户共享表';

CREATE TABLE IF NOT EXISTS `tb_finance_client_settings` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `client_key_id` int NOT NULL COMMENT '客户主键',
    `sms_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT '短信业务是否激活',
    `sms_max` int NOT NULL DEFAULT 1 COMMENT '短信应用最大数量',
    `mail_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT '邮件业务是否激活；兼容旧表 main_active 拼写',
    `mail_max` int NOT NULL DEFAULT 1 COMMENT '邮件应用最大数量',
    `social_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT '社媒业务是否激活；兼容旧表 meta_active 字段',
    `social_max` int NOT NULL DEFAULT 1 COMMENT '社媒应用最大数量',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_client_settings_client_key_id` (`client_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务客户业务配置表';

CREATE TABLE IF NOT EXISTS `tb_finance_basic_sms_rate` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `code` varchar(10) NOT NULL COMMENT '国家/地区国际区号',
    `mcc` varchar(4) NOT NULL COMMENT '移动国家代码',
    `up_usd` bigint NOT NULL COMMENT '上行短信价格（放大百万倍存储）',
    `down_usd` bigint NOT NULL COMMENT '下行短信价格（放大百万倍存储）',
    `remark` varchar(1024) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_basic_sms_rate_code_mcc` (`code`, `mcc`),
    KEY `idx_tb_finance_basic_sms_rate_code` (`code`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务短信基础价格表';
