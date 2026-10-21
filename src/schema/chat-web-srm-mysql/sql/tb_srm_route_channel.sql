CREATE TABLE IF NOT EXISTS `tb_srm_route_channel` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `rule_key_id` int NOT NULL COMMENT '规则ID：SRM 路由规则主键',
    `channel_key_id` int NOT NULL COMMENT '通道ID：SRM 通道主键',
    `priority` int NOT NULL DEFAULT 1 COMMENT '优先级：1 为主通道，数字越大越靠后，当前优先级无可用通道时降级',
    `weight` int NOT NULL DEFAULT 100 COMMENT '分流权重：同一规则同一优先级内按权重比例分配',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由通道状态：disable=停用（通道暂不参与该规则分流）；enable=启用（通道参与该规则分流）',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_route_channel_rule_channel` (`rule_key_id`, `channel_key_id`),
    KEY `idx_tb_srm_route_channel_channel_key_id` (`channel_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 路由规则通道表';