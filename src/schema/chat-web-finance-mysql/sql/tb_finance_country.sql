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
