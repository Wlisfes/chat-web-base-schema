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
