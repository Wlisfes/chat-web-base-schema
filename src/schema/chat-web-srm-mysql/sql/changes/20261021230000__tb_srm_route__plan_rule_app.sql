-- 路由改为 方案 + 规则 + 规则通道 + 短信应用绑定 四层结构：
-- tb_srm_route 只保存方案（名称、别名、默认标记、状态），方向和短信类型移到 tb_srm_route_rule；
-- tb_srm_route_channel 从挂在路由下改为挂在规则下；短信应用通过 tb_srm_route_app 绑定方案，未绑定的应用走默认方案。
-- 旧路由按 方向 + 类型 + 客户 建模，与新结构语义不兼容且功能尚未上线，直接重建路由相关表，旧路由配置需重新维护。
-- 回滚：DROP TABLE IF EXISTS `tb_srm_route_app`, `tb_srm_route_channel`, `tb_srm_route_rule`, `tb_srm_route`; 再执行 20261021220000__tb_srm_route__create.sql 中的建表语句。

DROP TABLE IF EXISTS `tb_srm_route_channel`;
DROP TABLE IF EXISTS `tb_srm_route`;

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
CREATE TABLE IF NOT EXISTS `tb_srm_route_app` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `app_key_id` int NOT NULL COMMENT '短信应用主键：SMS 短信应用主键',
    `user_key_id` int NOT NULL COMMENT '客户主键：短信应用所属 CRM 客户主键',
    `route_key_id` int NOT NULL COMMENT '方案ID：SRM 路由方案主键',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_route_app_app_key_id` (`app_key_id`),
    KEY `idx_tb_srm_route_app_user_key_id` (`user_key_id`),
    KEY `idx_tb_srm_route_app_route_key_id` (`route_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 短信应用路由方案绑定表';