-- 新建短信通道相关表：通道、通道端口绑定（一个端口只属于一个通道）、按方向和短信类型的权重路由规则。
-- 回滚：DROP TABLE IF EXISTS `tb_srm_channel_route`; DROP TABLE IF EXISTS `tb_srm_channel_port`; DROP TABLE IF EXISTS `tb_srm_channel`;

CREATE TABLE IF NOT EXISTS `tb_srm_channel` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `name` varchar(64) NOT NULL COMMENT '通道名称',
    `code` varchar(32) NOT NULL COMMENT '通道编码：全表唯一，创建后不可修改，用于队列命名',
    `send_interval` int NOT NULL DEFAULT 3000 COMMENT '端口发送间隔：同一端口两条短信之间的最小间隔毫秒数',
    `max_retry` int NOT NULL DEFAULT 3 COMMENT '最大重试次数：无可用端口或下发失败时的重试上限',
    `status` varchar(32) NOT NULL DEFAULT 'disable' COMMENT '通道状态：disable=停用（通道暂停消费，消息保留在通道队列）；enable=启用（通道正常接收和消费消息）',
    `remark` varchar(512) NULL COMMENT '备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_channel_code` (`code`),
    KEY `idx_tb_srm_channel_status` (`status`)
) ENGINE = InnoDB AUTO_INCREMENT = 1001 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 短信通道表';

CREATE TABLE IF NOT EXISTS `tb_srm_channel_port` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `channel_key_id` int NOT NULL COMMENT '通道ID：SRM 通道主键',
    `port_key_id` int NOT NULL COMMENT '端口ID：SRM SIMBANK 端口主键；一个端口只能绑定一个通道',
    `simbank_key_id` int NOT NULL COMMENT '设备ID：端口所属 SRM SIMBANK 设备主键',
    `weight` int NOT NULL DEFAULT 1 COMMENT '端口权重：同一通道内按权重选择端口',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '绑定状态：disable=停用（端口暂不参与该通道发送）；enable=启用（端口参与该通道发送）',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_channel_port_port_key_id` (`port_key_id`),
    KEY `idx_tb_srm_channel_port_channel_key_id` (`channel_key_id`),
    KEY `idx_tb_srm_channel_port_simbank_key_id` (`simbank_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 通道端口绑定表';

CREATE TABLE IF NOT EXISTS `tb_srm_channel_route` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `channel_key_id` int NOT NULL COMMENT '通道ID：SRM 通道主键',
    `country_key_id` int NOT NULL COMMENT '方向：Skyline 国家/地区主键',
    `type` varchar(32) NULL COMMENT '短信类型：为空表示该方向所有类型；短信类型：MRKT=营销短信（用于营销推广内容）；NTFY=通知短信（用于业务通知内容）；SOTP=验证码（用于一次性验证码）',
    `weight` int NOT NULL DEFAULT 100 COMMENT '分流权重：同一方向和类型下按权重比例分配到各通道',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由状态：disable=停用（路由不参与分流）；enable=启用（路由参与分流）',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    KEY `idx_tb_srm_channel_route_country_type` (`country_key_id`, `type`),
    KEY `idx_tb_srm_channel_route_channel_key_id` (`channel_key_id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM 通道路由规则表';
