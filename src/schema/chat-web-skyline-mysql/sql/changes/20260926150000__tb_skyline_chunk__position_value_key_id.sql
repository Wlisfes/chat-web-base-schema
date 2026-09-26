-- 职位枚举 CHUNK_ACCOUNT_POSITION 的 value 统一为枚举主键，作为 tb_account_user_position.position_key_id 的取值；
-- 同时清理迁移时写入的 legacyKeyId 扩展配置。已对齐的环境重复执行不产生变化。
-- 回滚：UPDATE `tb_skyline_chunk` SET `value` = CAST(`key_id` - 1024099 + 1000 AS CHAR) WHERE `type` = 'CHUNK_ACCOUNT_POSITION' AND `key_id` BETWEEN 1024100 AND 1024164;

UPDATE `tb_skyline_chunk`
SET `value` = CAST(`key_id` AS CHAR),
    `json` = JSON_REMOVE(COALESCE(`json`, JSON_OBJECT()), '$.legacyKeyId')
WHERE `module` = 'CHUNK_SYSTEM'
  AND `type` = 'CHUNK_ACCOUNT_POSITION'
  AND `key_id` BETWEEN 1024100 AND 1024164;
