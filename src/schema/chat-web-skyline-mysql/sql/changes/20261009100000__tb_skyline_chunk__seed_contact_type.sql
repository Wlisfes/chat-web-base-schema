-- 新增系统联系方式枚举 CHUNK_SYSTEM_COMMON_CONTACT_TYPE：主表分类 1003，子表 1024188-1024201 共 14 项，主键即枚举 value。
-- 同步主子表 type 字段注释；重复执行不产生变化。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `key_id` BETWEEN 1024188 AND 1024201 AND `type` = 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE';
--       DELETE FROM `tb_skyline_chunk_module` WHERE `key_id` = 1003 AND `type` = 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE';

ALTER TABLE `tb_skyline_chunk_module`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SYSTEM_ACCOUNT_USER_LEVEL=用户职级（Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）；CHUNK_CRM_CRM_USER_SOURCE=客户注册来源（CRM 客户注册来源，仅一级枚举项）；CHUNK_SYSTEM_COMMON_CONTACT_TYPE=联系方式（系统通用联系方式类型，仅一级枚举项）';

ALTER TABLE `tb_skyline_chunk`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SYSTEM_ACCOUNT_USER_LEVEL=用户职级（Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）；CHUNK_CRM_CRM_USER_SOURCE=客户注册来源（CRM 客户注册来源，仅一级枚举项）；CHUNK_SYSTEM_COMMON_CONTACT_TYPE=联系方式（系统通用联系方式类型，仅一级枚举项）';

INSERT INTO `tb_skyline_chunk_module` (`key_id`, `module`, `type`, `name`, `kind`, `remark`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`kind`, `seed`.`remark`, `seed`.`create_by`, `seed`.`modify_by`
FROM (
    SELECT 1003 AS `key_id`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '联系方式' AS `name`, 'select' AS `kind`, '系统通用联系方式类型' AS `remark`, '0' AS `create_by`, '0' AS `modify_by`
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
    SELECT 1024188 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '邮箱' AS `name`, '1024188' AS `value`, '{}' AS `json`, 10 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024189 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Facebook' AS `name`, '1024189' AS `value`, '{}' AS `json`, 20 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024190 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Line' AS `name`, '1024190' AS `value`, '{}' AS `json`, 30 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024191 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'LinkedIn' AS `name`, '1024191' AS `value`, '{}' AS `json`, 40 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024192 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Skype' AS `name`, '1024192' AS `value`, '{}' AS `json`, 50 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024193 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'WhatsApp' AS `name`, '1024193' AS `value`, '{}' AS `json`, 60 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024194 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Zalo' AS `name`, '1024194' AS `value`, '{}' AS `json`, 70 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024195 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '企业微信' AS `name`, '1024195' AS `value`, '{}' AS `json`, 80 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024196 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Telegram' AS `name`, '1024196' AS `value`, '{}' AS `json`, 90 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024197 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'QQ' AS `name`, '1024197' AS `value`, '{}' AS `json`, 100 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024198 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, 'Viber' AS `name`, '1024198' AS `value`, '{}' AS `json`, 110 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024199 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '微信（Wechat）' AS `name`, '1024199' AS `value`, '{}' AS `json`, 120 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024200 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '电话' AS `name`, '1024200' AS `value`, '{}' AS `json`, 130 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024201 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE' AS `type`, '在线客服' AS `name`, '1024201' AS `value`, '{}' AS `json`, 140 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND (`chunk`.`value` = `seed`.`value` OR `chunk`.`name` = `seed`.`name`))
);

ALTER TABLE `tb_skyline_chunk_module` AUTO_INCREMENT = 1004;

ALTER TABLE `tb_skyline_chunk` AUTO_INCREMENT = 1024202;
