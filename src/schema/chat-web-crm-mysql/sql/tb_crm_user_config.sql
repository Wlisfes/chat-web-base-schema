CREATE TABLE IF NOT EXISTS `tb_crm_user_config` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_key_id` int NOT NULL COMMENT 'CRM 客户主键',
    `sms_app_limit` int NOT NULL DEFAULT 5 COMMENT '短信应用最大数',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_crm_user_config_user_key_id` (`user_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'CRM 客户配置表';
