-- 新增客户配置子表，一个客户一条配置；短信应用最大数默认 5，并为历史客户补齐默认配置。重复执行不产生变化。
-- 回滚：DROP TABLE `tb_crm_user_config`;

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

INSERT IGNORE INTO `tb_crm_user_config` (`user_key_id`, `sms_app_limit`, `create_by`, `modify_by`)
SELECT `key_id`, 5, `owner_user_uid`, `owner_user_uid`
FROM `tb_crm_user`;
