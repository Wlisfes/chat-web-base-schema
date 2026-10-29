CREATE TABLE IF NOT EXISTS `tb_finance_srm_user_deduct` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `event_id` varchar(64) NOT NULL COMMENT '业务事件ID：同一笔扣费只记一次',
    `user_key_id` int NOT NULL COMMENT '供应商主键：SRM 供应商主键',
    `currency` varchar(16) NOT NULL COMMENT '财务币种编码：本次扣费使用的钱包币种',
    `biz_type` varchar(32) NOT NULL COMMENT '扣费来源：sms=短信扣费（短信发送扣减钱包余额）',
    `amount` bigint NOT NULL COMMENT '扣费金额（放大百万倍存储）：按钱包币种计，只记正数',
    `business_id` varchar(64) NULL COMMENT '业务ID：短信扣费为短信ID',
    `occurred_time` datetime(3) NOT NULL COMMENT '扣费发生时间',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_srm_user_deduct_event_id` (`event_id`),
    KEY `idx_tb_finance_srm_user_deduct_user_occurred_time` (`user_key_id`, `occurred_time`),
    KEY `idx_tb_finance_srm_user_deduct_biz_business` (`biz_type`, `business_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务供应商扣费记录表';