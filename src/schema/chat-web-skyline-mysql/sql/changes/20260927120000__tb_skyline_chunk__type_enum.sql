-- 枚举类型编码 type 改为 Schema 枚举 TbSkylineChunkModuleType 定义：岗位类型编码统一为 CHUNK_SYSTEM_ACCOUNT_USER_POST，同步主子表 type 字段注释。
-- 兼容尚未执行上一条改名迁移的环境（CHUNK_ACCOUNT_POSITION）与已执行的环境（CHUNK_ACCOUNT_POST）；重复执行不产生变化。
-- 回滚：UPDATE 主子表 SET `type` = 'CHUNK_ACCOUNT_POST' WHERE `type` = 'CHUNK_SYSTEM_ACCOUNT_USER_POST'；type 字段注释恢复为“枚举类型编码，对应主表/子表 type”。

UPDATE `tb_skyline_chunk_module`
SET `type` = 'CHUNK_SYSTEM_ACCOUNT_USER_POST',
    `name` = '用户岗位'
WHERE `module` = 'CHUNK_SYSTEM'
  AND `type` IN ('CHUNK_ACCOUNT_POSITION', 'CHUNK_ACCOUNT_POST');

UPDATE `tb_skyline_chunk`
SET `type` = 'CHUNK_SYSTEM_ACCOUNT_USER_POST'
WHERE `module` = 'CHUNK_SYSTEM'
  AND `type` IN ('CHUNK_ACCOUNT_POSITION', 'CHUNK_ACCOUNT_POST');

ALTER TABLE `tb_skyline_chunk_module`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）';

ALTER TABLE `tb_skyline_chunk`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）';
