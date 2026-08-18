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
