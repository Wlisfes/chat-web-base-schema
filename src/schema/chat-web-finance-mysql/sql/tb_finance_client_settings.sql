CREATE TABLE IF NOT EXISTS `tb_finance_client_settings` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `client_key_id` int NOT NULL COMMENT '客户主键',
    `sms_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT '短信业务是否激活',
    `sms_max` int NOT NULL DEFAULT 1 COMMENT '短信应用最大数量',
    `mail_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT '邮件业务是否激活；兼容旧表 main_active 拼写',
    `mail_max` int NOT NULL DEFAULT 1 COMMENT '邮件应用最大数量',
    `social_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT '社媒业务是否激活；兼容旧表 meta_active 字段',
    `social_max` int NOT NULL DEFAULT 1 COMMENT '社媒应用最大数量',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_finance_client_settings_client_key_id` (`client_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '财务客户业务配置表';
