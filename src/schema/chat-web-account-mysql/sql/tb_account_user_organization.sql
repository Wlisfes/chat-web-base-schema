CREATE TABLE IF NOT EXISTS `tb_account_user_organization` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `user_uid` varchar(19) NOT NULL COMMENT '账号UID',
    `organization_key_id` int NOT NULL COMMENT '组织主键',
    `is_primary` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否为用户主组织',
    `position_name` varchar(64) NULL COMMENT '用户在该组织中的岗位名称',
    `status` varchar(32) NOT NULL COMMENT '用户组织关系状态：disabled=禁用（成员关系暂不参与组织和权限计算）；enabled=启用（成员关系正常参与组织和权限计算）',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_user_organization_member` (`user_uid`, `organization_key_id`),
    KEY `idx_tb_account_user_organization_org_status` (`organization_key_id`, `status`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '用户组织成员关系表';
