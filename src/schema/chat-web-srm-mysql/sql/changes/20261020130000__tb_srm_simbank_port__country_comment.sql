-- 国家/地区基础数据迁移到 Skyline，激活方向字段注释改为 Skyline 国家/地区主键；主键保持不变，数据无需调整。
-- 回滚：ALTER TABLE `tb_srm_simbank_port` MODIFY COLUMN `country_key_id` int NULL COMMENT '激活方向：Finance 国家/地区主键；激活后必填';

ALTER TABLE `tb_srm_simbank_port`
    MODIFY COLUMN `country_key_id` int NULL COMMENT '激活方向：Skyline 国家/地区主键；激活后必填';
