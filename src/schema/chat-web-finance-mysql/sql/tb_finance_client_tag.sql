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
