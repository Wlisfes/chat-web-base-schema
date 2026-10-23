CREATE TABLE IF NOT EXISTS `tb_srm_route_app` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `app_key_id` int NOT NULL COMMENT '短信应用主键：SMS 短信应用主键',
    `user_key_id` int NOT NULL COMMENT '客户主键：短信应用所属 CRM 客户主键',
    `route_key_id` int NOT NULL COMMENT '路由ID：SRM 路由主键',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '短信应用绑定状态：disable=停用（绑定暂不生效，按未绑定走同类型路由）；enable=启用（短信优先走该路由）',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_route_app_app_key_id` (`app_key_id`),
    KEY `idx_tb_srm_route_app_user_key_id` (`user_key_id`),
    KEY `idx_tb_srm_route_app_route_key_id` (`route_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 短信应用路由绑定表';
