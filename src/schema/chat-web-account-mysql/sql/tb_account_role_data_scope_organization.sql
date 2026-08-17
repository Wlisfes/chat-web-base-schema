CREATE TABLE IF NOT EXISTS `tb_account_role_data_scope_organization` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `data_scope_uid` varchar(19) NOT NULL COMMENT '数据范围规则UID',
    `organization_uid` varchar(19) NOT NULL COMMENT '授权组织UID',
    `include_children` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否同时授权该组织的全部下级组织',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_role_data_scope_organization_grant` (`data_scope_uid`, `organization_uid`),
    KEY `idx_tb_account_role_data_scope_organization_org` (`organization_uid`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '角色自定义数据范围组织表';
