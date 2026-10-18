-- 设备表新增在线状态 online：offline=离线、online=在线，默认离线。
-- 回滚：ALTER TABLE `tb_srm_simbank` DROP INDEX `idx_tb_srm_simbank_online`, DROP COLUMN `online`;

ALTER TABLE `tb_srm_simbank`
    ADD COLUMN `online` varchar(32) NOT NULL DEFAULT 'offline' COMMENT '在线状态：offline=离线（设备未连接）；online=在线（设备已连接）' AFTER `status`,
    ADD INDEX `idx_tb_srm_simbank_online` (`online`);
