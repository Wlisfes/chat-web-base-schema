-- 新建 SRM SIMBANK 端口表：端口归属通过设备主键关联设备表；激活方向保存 Finance 国家/地区主键。
-- 回滚：DROP TABLE IF EXISTS `tb_srm_simbank_port`;

CREATE TABLE IF NOT EXISTS `tb_srm_simbank_port` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `simbank_key_id` int NOT NULL COMMENT '设备ID：SRM SIMBANK 设备主键',
    `port` int NOT NULL COMMENT '端口编号：从 1 开始，同一设备内唯一',
    `sim` varchar(32) NULL COMMENT 'SIM 卡号码',
    `iccid` varchar(22) NULL COMMENT 'ICCID：SIM 卡唯一编号，有值时全表唯一',
    `imei` varchar(15) NULL COMMENT 'IMEI：端口模块识别码',
    `activate_status` varchar(32) NOT NULL DEFAULT 'inactive' COMMENT '激活状态：active=已激活（SIM 卡已完成激活）；inactive=未激活（SIM 卡尚未激活）',
    `country_key_id` int NULL COMMENT '激活方向：Finance 国家/地区主键；激活后必填',
    `insert_status` varchar(32) NOT NULL DEFAULT 'removed' COMMENT '插卡状态：inserted=已插卡（端口当前已插入 SIM 卡）；removed=未插卡（端口当前没有插入 SIM 卡）',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '端口状态：disable=禁用（端口已停用）；enable=启用（端口正常使用）',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_srm_simbank_port_simbank_port` (`simbank_key_id`, `port`),
    UNIQUE KEY `uk_tb_srm_simbank_port_iccid` (`iccid`),
    KEY `idx_tb_srm_simbank_port_sim` (`sim`),
    KEY `idx_tb_srm_simbank_port_imei` (`imei`),
    KEY `idx_tb_srm_simbank_port_activate_status` (`activate_status`),
    KEY `idx_tb_srm_simbank_port_country_key_id` (`country_key_id`),
    KEY `idx_tb_srm_simbank_port_insert_status` (`insert_status`),
    KEY `idx_tb_srm_simbank_port_status` (`status`)
) ENGINE = InnoDB AUTO_INCREMENT = 1002401 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SRM SIMBANK 端口表';
