-- 通道不再绑定唯一方向。方向以端口激活方向为准，路由规则决定是否接收，发送时再按短信方向挑选端口。
-- 回滚：ALTER TABLE `tb_srm_channel` ADD COLUMN `country_key_id` int NOT NULL DEFAULT 0 COMMENT '方向：Skyline 国家/地区主键，创建后不可修改' AFTER `type`, ADD KEY `idx_tb_srm_channel_country_type` (`country_key_id`, `type`), DROP INDEX `idx_tb_srm_channel_type`;
--       方向数据不恢复。

ALTER TABLE `tb_srm_channel`
    DROP INDEX `idx_tb_srm_channel_country_type`,
    DROP COLUMN `country_key_id`,
    ADD KEY `idx_tb_srm_channel_type` (`type`);