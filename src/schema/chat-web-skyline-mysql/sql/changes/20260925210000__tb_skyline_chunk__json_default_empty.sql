-- 枚举扩展配置不再保存迁移残留的 legacyKeyId，缺省统一为空对象。
-- 回滚：ALTER TABLE `tb_skyline_chunk` MODIFY COLUMN `json` text NULL COMMENT '枚举项扩展配置';

UPDATE `tb_skyline_chunk`
SET `json` = '{}'
WHERE `json` IS NULL
   OR TRIM(`json`) = ''
   OR (
        JSON_VALID(`json`)
        AND JSON_CONTAINS_PATH(`json`, 'one', '$.legacyKeyId')
        AND JSON_LENGTH(JSON_REMOVE(`json`, '$.legacyKeyId')) = 0
   );

UPDATE `tb_skyline_chunk`
SET `json` = JSON_REMOVE(`json`, '$.legacyKeyId')
WHERE JSON_VALID(`json`)
  AND JSON_CONTAINS_PATH(`json`, 'one', '$.legacyKeyId');

ALTER TABLE `tb_skyline_chunk`
    MODIFY COLUMN `json` text NOT NULL DEFAULT ('{}') COMMENT '枚举项扩展配置，默认空对象';
