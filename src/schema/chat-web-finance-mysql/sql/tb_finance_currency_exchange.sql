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
