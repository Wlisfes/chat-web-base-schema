CREATE TABLE IF NOT EXISTS `tb_finance_srm_user` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_key_id` int NOT NULL COMMENT '供应商主键：SRM 供应商主键',
    `pay_mode` varchar(32) NOT NULL COMMENT '付款模式：postpaid=后付（账期后付费；余额为负表示应付）；prepaid=预付（账户预付费；余额为负表示欠费）',
    `balance_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD 余额（放大百万倍存储）：预付为负表示欠费，后付为负表示应付',
    `billed_usd` bigint NOT NULL DEFAULT 0 COMMENT '累计计费成本 USD（放大百万倍存储）',
    `bill_count` int NOT NULL DEFAULT 0 COMMENT '累计计费短信条数',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_srm_user_user_key_id` (`user_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务供应商账户表';