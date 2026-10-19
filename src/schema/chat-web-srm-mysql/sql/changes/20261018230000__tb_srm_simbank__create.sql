-- 新建 SRM SIMBANK 设备表：设备名称、型号、MAC地址、端口数、归属供应商、归属人、设备状态。
-- 回滚：DROP TABLE IF EXISTS `tb_srm_simbank`;

CREATE TABLE IF NOT EXISTS `tb_srm_simbank` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `name` varchar(64) NOT NULL COMMENT '设备名称',
    `model` varchar(64) NOT NULL COMMENT '设备型号',
    `mac` varchar(17) NOT NULL COMMENT 'MAC地址，格式 AA:BB:CC:DD:EE:FF，全表唯一',
    `port_count` int NOT NULL COMMENT '端口数',
    `user_key_id` int NOT NULL COMMENT '归属供应商：SRM 供应商主键',
    `owner_user_uid` varchar(19) NOT NULL COMMENT '归属人账号UID',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '设备状态：disable=停用（设备已停用）；enable=启用（设备正常使用）',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_simbank_mac` (`mac`),
    KEY `idx_tb_srm_simbank_user_key_id` (`user_key_id`),
    KEY `idx_tb_srm_simbank_owner_user_uid` (`owner_user_uid`),
    KEY `idx_tb_srm_simbank_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM SIMBANK 设备表';
