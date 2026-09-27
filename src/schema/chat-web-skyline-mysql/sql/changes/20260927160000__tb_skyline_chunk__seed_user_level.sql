-- 新增用户职级枚举 CHUNK_SYSTEM_ACCOUNT_USER_LEVEL：主表分类 1001，子表 P1-P8、M1-M8 共 16 个职级，主键即枚举 value。
-- 同步主子表 type 字段注释；重复执行不产生变化。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `key_id` BETWEEN 1024170 AND 1024185 AND `type` = 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL';
--       DELETE FROM `tb_skyline_chunk_module` WHERE `key_id` = 1001 AND `type` = 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL';
--       主子表 type 字段注释恢复为仅包含 CHUNK_SYSTEM_ACCOUNT_USER_POST。

ALTER TABLE `tb_skyline_chunk_module`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SYSTEM_ACCOUNT_USER_LEVEL=用户职级（Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）';

ALTER TABLE `tb_skyline_chunk`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SYSTEM_ACCOUNT_USER_LEVEL=用户职级（Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）';

INSERT INTO `tb_skyline_chunk_module` (`key_id`, `module`, `type`, `name`, `kind`, `remark`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`kind`, `seed`.`remark`, `seed`.`create_by`, `seed`.`modify_by`
FROM (
    SELECT 1001 AS `key_id`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, '用户职级' AS `name`, 'select' AS `kind`, '账号职级：P1-P8 专业序列，M1-M8 管理序列' AS `remark`, '0' AS `create_by`, '0' AS `modify_by`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk_module` AS `chunk_module`
    WHERE `chunk_module`.`key_id` = `seed`.`key_id`
       OR (`chunk_module`.`module` = `seed`.`module` AND `chunk_module`.`type` = `seed`.`type`)
);

INSERT INTO `tb_skyline_chunk` (`key_id`, `pid`, `module`, `type`, `name`, `value`, `json`, `sort`, `status`, `allow_delete`, `allow_update`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`pid`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`value`, `seed`.`json`, `seed`.`sort`, `seed`.`status`, `seed`.`allow_delete`, `seed`.`allow_update`, '0', '0'
FROM (
    SELECT 1024170 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P1' AS `name`, '1024170' AS `value`, '{}' AS `json`, 10 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024171 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P2' AS `name`, '1024171' AS `value`, '{}' AS `json`, 20 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024172 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P3' AS `name`, '1024172' AS `value`, '{}' AS `json`, 30 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024173 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P4' AS `name`, '1024173' AS `value`, '{}' AS `json`, 40 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024174 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P5' AS `name`, '1024174' AS `value`, '{}' AS `json`, 50 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024175 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P6' AS `name`, '1024175' AS `value`, '{}' AS `json`, 60 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024176 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P7' AS `name`, '1024176' AS `value`, '{}' AS `json`, 70 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024177 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'P8' AS `name`, '1024177' AS `value`, '{}' AS `json`, 80 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024178 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M1' AS `name`, '1024178' AS `value`, '{}' AS `json`, 90 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024179 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M2' AS `name`, '1024179' AS `value`, '{}' AS `json`, 100 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024180 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M3' AS `name`, '1024180' AS `value`, '{}' AS `json`, 110 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024181 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M4' AS `name`, '1024181' AS `value`, '{}' AS `json`, 120 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024182 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M5' AS `name`, '1024182' AS `value`, '{}' AS `json`, 130 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024183 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M6' AS `name`, '1024183' AS `value`, '{}' AS `json`, 140 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024184 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M7' AS `name`, '1024184' AS `value`, '{}' AS `json`, 150 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024185 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, 'M8' AS `name`, '1024185' AS `value`, '{}' AS `json`, 160 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND (`chunk`.`value` = `seed`.`value` OR `chunk`.`name` = `seed`.`name`))
);

ALTER TABLE `tb_skyline_chunk_module` AUTO_INCREMENT = 1002;

ALTER TABLE `tb_skyline_chunk` AUTO_INCREMENT = 1024186;
