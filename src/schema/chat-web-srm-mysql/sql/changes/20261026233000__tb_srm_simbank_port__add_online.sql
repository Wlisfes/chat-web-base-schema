-- 端口新增在线状态：现有端口统一初始化为离线，后续由设备上报维护。
-- 回滚：ALTER TABLE `tb_srm_simbank_port` DROP INDEX `idx_tb_srm_simbank_port_online`, DROP COLUMN `online`;

ALTER TABLE `tb_srm_simbank_port`
    ADD COLUMN `online` varchar(32) NOT NULL DEFAULT 'offline' COMMENT '在线状态：offline=离线（端口未连接）；online=在线（端口已连接）' AFTER `status`,
    ADD INDEX `idx_tb_srm_simbank_port_online` (`online`);
