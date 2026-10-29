CREATE TABLE IF NOT EXISTS `tb_finance_srm_user_wallet` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_key_id` int NOT NULL COMMENT '供应商主键：SRM 供应商主键',
    `currency` varchar(16) NOT NULL COMMENT '财务币种编码',
    `pay_mode` varchar(32) NOT NULL COMMENT '付款模式：postpaid=后付（账期后付费；余额为负表示应付）；prepaid=预付（账户预付费；余额为负表示欠费）',
    `balance` bigint NOT NULL DEFAULT 0 COMMENT '余额（放大百万倍存储）：按钱包币种计',
    `credit` bigint NOT NULL DEFAULT 0 COMMENT '信用额度（放大百万倍存储）：按钱包币种计',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_srm_user_wallet_user_key_id` (`user_key_id`),
    KEY `idx_tb_finance_srm_user_wallet_currency` (`currency`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务供应商钱包表';