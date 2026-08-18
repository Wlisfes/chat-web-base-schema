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
