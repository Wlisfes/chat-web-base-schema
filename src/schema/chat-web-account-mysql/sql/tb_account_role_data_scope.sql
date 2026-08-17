CREATE TABLE IF NOT EXISTS `tb_account_role_data_scope` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `role_key_id` int NOT NULL COMMENT '角色主键',
    `resource_code` varchar(128) NOT NULL COMMENT '业务资源编码；星号表示默认规则',
    `scope_type` varchar(32) NOT NULL COMMENT '数据范围类型：all=全部数据（不限制组织或数据所有人）；self=仅本人（只允许访问本人拥有的数据）；organization=本组织（允许访问用户主组织的数据）；organization_tree=本组织及下级（允许访问用户主组织及全部下级组织的数据）；custom=自定义组织（允许访问显式授权的组织，可逐项包含下级组织）',
    `status` varchar(32) NOT NULL COMMENT '数据范围规则状态：disabled=禁用（规则不参与数据权限计算）；enabled=启用（规则正常参与数据权限计算）',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_role_data_scope_resource` (`role_key_id`, `resource_code`),
    KEY `idx_tb_account_role_data_scope_resource_status` (`resource_code`, `status`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '角色数据范围规则表';
