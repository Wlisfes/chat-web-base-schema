CREATE TABLE IF NOT EXISTS `tb_account_menu` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `uid` varchar(19) NOT NULL COMMENT '菜单UID',
    `parent_uid` varchar(19) NULL COMMENT '父菜单UID',
    `type` varchar(32) NOT NULL COMMENT '菜单类型：directory=目录（只用于组织下级菜单的目录节点）；menu=菜单（可导航到页面的菜单节点）；button=按钮（不参与导航、用于绑定后端权限码的操作节点）',
    `name` varchar(64) NOT NULL COMMENT '菜单名称',
    `route_name` varchar(128) NULL COMMENT '前端路由名称',
    `path` varchar(255) NULL COMMENT '前端路由路径',
    `component` varchar(255) NULL COMMENT '前端组件标识',
    `permission_code` varchar(128) NULL COMMENT '后端权限码',
    `icon` varchar(128) NULL COMMENT '图标标识',
    `external_url` varchar(512) NULL COMMENT '外部链接地址',
    `sort` int NOT NULL DEFAULT 0 COMMENT '同级排序值',
    `visible` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否在导航中显示',
    `keep_alive` tinyint(1) NOT NULL DEFAULT 0 COMMENT '页面是否保持缓存',
    `status` varchar(32) NOT NULL COMMENT '菜单状态：disabled=禁用（菜单及权限码不参与授权计算）；enabled=启用（菜单及权限码正常参与授权计算）',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_account_menu_uid` (`uid`),
    UNIQUE KEY `uk_tb_account_menu_permission_code` (`permission_code`),
    KEY `idx_tb_account_menu_parent_sort` (`parent_uid`, `sort`)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '系统菜单与操作权限表';
