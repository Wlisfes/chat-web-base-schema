CREATE TABLE IF NOT EXISTS `tb_account_role` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `code` varchar(64) NOT NULL COMMENT '角色编码',
    `name` varchar(64) NOT NULL COMMENT '角色名称',
    `description` varchar(255) NULL COMMENT '角色说明',
    `sort` int NOT NULL DEFAULT 0 COMMENT '排序值',
    `builtin` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否为系统内置角色',
    `status` varchar(32) NOT NULL COMMENT '角色状态：disabled=禁用（角色不参与菜单和数据权限计算）；enabled=启用（角色正常参与菜单和数据权限计算）',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_role_code` (`code`),
    KEY `idx_tb_account_role_status_sort` (`status`, `sort`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '系统角色表';

INSERT INTO `tb_account_role` (`code`, `name`, `description`, `sort`, `builtin`, `status`)
SELECT 'super_admin', '超级管理员', '系统内置超级管理员角色', 0, 1, 'enabled'
WHERE NOT EXISTS (
    SELECT 1 FROM `tb_account_role` WHERE `code` = 'super_admin'
);
