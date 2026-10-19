-- 供应商配置表新增 SIMBANK 设备最大数 simbank_limit，历史配置默认 5。
-- 回滚：ALTER TABLE `tb_srm_user_config` DROP COLUMN `simbank_limit`;

ALTER TABLE `tb_srm_user_config`
    ADD COLUMN `simbank_limit` int NOT NULL DEFAULT 5 COMMENT 'SIMBANK 设备最大数' AFTER `user_key_id`;
