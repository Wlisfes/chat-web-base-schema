CREATE TABLE IF NOT EXISTS `tb_account_user_role` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_uid` varchar(19) NOT NULL COMMENT '账号UID',
    `role_key_id` int NOT NULL COMMENT '角色主键',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_user_role_assignment` (`user_uid`, `role_key_id`),
    KEY `idx_tb_account_user_role_role` (`role_key_id`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '用户角色关系表';
