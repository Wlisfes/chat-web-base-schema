-- 新增供应商账户与计费流水：Finance 消费 Dispatch 发布的供应商计费事件，按短信ID幂等落账；Finance 是供应商余额的权威来源。
-- 预付供应商短信提交到设备即计费，后付供应商设备发送成功才计费；余额允许为负。
-- 回滚：DROP TABLE IF EXISTS `tb_finance_supplier_bill`; DROP TABLE IF EXISTS `tb_finance_supplier_account`;

CREATE TABLE IF NOT EXISTS `tb_finance_supplier_account` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_key_id` int NOT NULL COMMENT '供应商主键：SRM 供应商主键',
    `pay_mode` varchar(32) NOT NULL COMMENT '付款模式：postpaid=后付（账期后付费；余额为负表示应付）；prepaid=预付（账户预付费；余额为负表示欠费）',
    `balance_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD 余额（放大百万倍存储）：预付为负表示欠费，后付为负表示应付',
    `billed_usd` bigint NOT NULL DEFAULT 0 COMMENT '累计计费成本 USD（放大百万倍存储）',
    `bill_count` int NOT NULL DEFAULT 0 COMMENT '累计计费短信条数',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_supplier_account_user_key_id` (`user_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务供应商账户表';
CREATE TABLE IF NOT EXISTS `tb_finance_supplier_bill` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `event_id` varchar(64) NOT NULL COMMENT '计费事件ID：msgId + 触发节点',
    `msg_id` varchar(36) NOT NULL COMMENT '短信ID',
    `user_key_id` int NOT NULL COMMENT '供应商主键：SRM 供应商主键',
    `simbank_key_id` int NOT NULL COMMENT '设备主键：SRM SIMBANK 设备主键',
    `port_key_id` int NOT NULL COMMENT '端口主键：SRM SIMBANK 端口主键',
    `pay_mode` varchar(32) NOT NULL COMMENT '付款模式：postpaid=后付（账期后付费；余额为负表示应付）；prepaid=预付（账户预付费；余额为负表示欠费）',
    `trigger` varchar(32) NOT NULL COMMENT '计费触发节点：submitted=提交设备（预付供应商：短信提交到设备即计费）；success=发送成功（后付供应商：设备发送成功才计费）',
    `segments` int NOT NULL DEFAULT 1 COMMENT '计费段数',
    `cost_usd` bigint NOT NULL COMMENT '本次计费成本 USD（放大百万倍存储）',
    `balance_usd` bigint NOT NULL COMMENT '落账后供应商 USD 余额（放大百万倍存储）',
    `occurred_time` datetime(3) NOT NULL COMMENT '计费发生时间',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_supplier_bill_event_id` (`event_id`),
    UNIQUE KEY `uk_tb_finance_supplier_bill_msg_id` (`msg_id`),
    KEY `idx_tb_finance_supplier_bill_user_occurred_time` (`user_key_id`, `occurred_time`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务供应商计费流水表';