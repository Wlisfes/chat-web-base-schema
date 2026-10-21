CREATE TABLE IF NOT EXISTS `tb_srm_route` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `country_key_id` int NOT NULL COMMENT '方向：Skyline 国家/地区主键',
    `type` varchar(32) NOT NULL COMMENT '通道类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=验证码（用于一次性验证码）',
    `user_key_id` int NOT NULL DEFAULT 0 COMMENT 'CRM 客户主键：0 表示默认路由，大于0 表示该客户的专属路由',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由状态：disable=停用（路由不参与选通道，专属路由停用后客户回落到默认路由）；enable=启用（路由参与选通道）',
    `remark` varchar(512) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_route_country_type_user` (`country_key_id`, `type`, `user_key_id`),
    KEY `idx_tb_srm_route_user_key_id` (`user_key_id`),
    KEY `idx_tb_srm_route_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 短信路由策略表';
