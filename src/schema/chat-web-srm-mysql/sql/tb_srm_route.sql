CREATE TABLE IF NOT EXISTS `tb_srm_route` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `name` varchar(64) NOT NULL COMMENT '方案名称',
    `alias` varchar(64) NULL COMMENT '方案别名：自定义的方案简称，全表唯一',
    `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否默认方案：未绑定方案或绑定方案无匹配规则的短信应用走默认方案',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由方案状态：disable=停用（方案不参与选路，绑定该方案的短信应用回落到默认方案）；enable=启用（方案参与选路）',
    `remark` varchar(512) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_route_alias` (`alias`),
    KEY `idx_tb_srm_route_is_default` (`is_default`),
    KEY `idx_tb_srm_route_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 短信路由方案表';