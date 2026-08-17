CREATE TABLE IF NOT EXISTS `tb_account_role_menu` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `role_uid` varchar(19) NOT NULL COMMENT '角色UID',
    `menu_uid` varchar(19) NOT NULL COMMENT '菜单UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_role_menu_grant` (`role_uid`, `menu_uid`),
    KEY `idx_tb_account_role_menu_menu` (`menu_uid`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '角色菜单权限关系表';
