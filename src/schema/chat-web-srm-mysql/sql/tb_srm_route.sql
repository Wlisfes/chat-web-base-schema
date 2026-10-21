CREATE TABLE IF NOT EXISTS `tb_srm_route` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `name` varchar(64) NOT NULL COMMENT '路由名称',
    `alias` varchar(64) NULL COMMENT '路由别名：自定义的路由简称，全表唯一',
    `type` varchar(32) NOT NULL DEFAULT 'general' COMMENT '路由类型：general=通用路由（没有绑定短信应用，所有短信应用都可回落使用）；targeted=定向路由（已绑定短信应用，只供绑定的短信应用使用）',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由状态：disable=停用（路由不参与选路，绑定该路由的短信应用回落到通用路由）；enable=启用（路由参与选路）',
    `remark` varchar(512) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_route_alias` (`alias`),
    KEY `idx_tb_srm_route_type` (`type`),
    KEY `idx_tb_srm_route_status` (`status`)
) ENGINE = InnoDB AUTO_INCREMENT = 1002001 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 短信路由表';