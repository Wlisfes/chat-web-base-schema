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
