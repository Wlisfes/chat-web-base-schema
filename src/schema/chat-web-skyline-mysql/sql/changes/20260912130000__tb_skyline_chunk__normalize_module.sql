-- 统一 Skyline 枚举模块编码格式，并将历史值迁移到新的 CHUNK_* 编码。
UPDATE `tb_skyline_chunk`
SET `module` = CASE `module`
    WHEN 'system' THEN 'CHUNK_SYSTEM'
    WHEN 'sales' THEN 'CHUNK_CRM'
    WHEN 'purchase' THEN 'CHUNK_SRM'
    ELSE `module`
END;

ALTER TABLE `tb_skyline_chunk`
    ALTER COLUMN `module` SET DEFAULT 'CHUNK_SYSTEM',
    MODIFY COLUMN `module` varchar(32) NOT NULL COMMENT '枚举所属模块：CHUNK_SYSTEM=系统；CHUNK_CRM=CRM；CHUNK_SRM=SRM';
