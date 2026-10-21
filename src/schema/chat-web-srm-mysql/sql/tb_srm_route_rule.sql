CREATE TABLE IF NOT EXISTS `tb_srm_route_rule` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `route_key_id` int NOT NULL COMMENT '方案ID：SRM 路由方案主键',
    `country_key_id` int NOT NULL COMMENT '方向：Skyline 国家/地区主键',
    `type` varchar(32) NOT NULL COMMENT '通道类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=验证码（用于一次性验证码）',
    `mnc` varchar(3) NOT NULL DEFAULT '' COMMENT '运营商 MNC：空字符串表示该方向全部运营商',
    `prefix` varchar(15) NOT NULL DEFAULT '' COMMENT '号码段：含国际区号的号码前缀，空字符串表示不限号码段',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由规则状态：disable=停用（规则不参与匹配，继续匹配更粗粒度规则或默认方案）；enable=启用（规则参与匹配）',
    `remark` varchar(512) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_route_rule_route_match` (`route_key_id`, `country_key_id`, `type`, `mnc`, `prefix`),
    KEY `idx_tb_srm_route_rule_country_type` (`country_key_id`, `type`),
    KEY `idx_tb_srm_route_rule_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 路由规则表';