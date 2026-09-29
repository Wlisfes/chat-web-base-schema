-- 新增 CRM 客户注册来源枚举 CHUNK_CRM_CRM_USER_SOURCE：主表分类 1002，子表 手动创建=1024186、平台注册=1024187，主键即枚举 value。
-- CRM 的 tb_crm_user.source 存储枚举项主键；枚举项为系统内置，不允许删除。同步主子表 type 字段注释；重复执行不产生变化。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `key_id` IN (1024186, 1024187) AND `type` = 'CHUNK_CRM_CRM_USER_SOURCE';
--       DELETE FROM `tb_skyline_chunk_module` WHERE `key_id` = 1002 AND `type` = 'CHUNK_CRM_CRM_USER_SOURCE';

ALTER TABLE `tb_skyline_chunk_module`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SYSTEM_ACCOUNT_USER_LEVEL=用户职级（Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）；CHUNK_CRM_CRM_USER_SOURCE=客户注册来源（CRM 客户注册来源，仅一级枚举项）';

ALTER TABLE `tb_skyline_chunk`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SYSTEM_ACCOUNT_USER_LEVEL=用户职级（Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）；CHUNK_CRM_CRM_USER_SOURCE=客户注册来源（CRM 客户注册来源，仅一级枚举项）';

INSERT INTO `tb_skyline_chunk_module` (`key_id`, `module`, `type`, `name`, `kind`, `remark`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`kind`, `seed`.`remark`, `seed`.`create_by`, `seed`.`modify_by`
FROM (
    SELECT 1002 AS `key_id`, 'CHUNK_CRM' AS `module`, 'CHUNK_CRM_CRM_USER_SOURCE' AS `type`, '客户注册来源' AS `name`, 'select' AS `kind`, 'CRM 客户注册来源' AS `remark`, '0' AS `create_by`, '0' AS `modify_by`
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
    SELECT 1024186 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_CRM' AS `module`, 'CHUNK_CRM_CRM_USER_SOURCE' AS `type`, '手动创建' AS `name`, '1024186' AS `value`, '{}' AS `json`, 10 AS `sort`, 'enable' AS `status`, 0 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024187 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_CRM' AS `module`, 'CHUNK_CRM_CRM_USER_SOURCE' AS `type`, '平台注册' AS `name`, '1024187' AS `value`, '{}' AS `json`, 20 AS `sort`, 'enable' AS `status`, 0 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND (`chunk`.`value` = `seed`.`value` OR `chunk`.`name` = `seed`.`name`))
);

ALTER TABLE `tb_skyline_chunk_module` AUTO_INCREMENT = 1003;

ALTER TABLE `tb_skyline_chunk` AUTO_INCREMENT = 1024188;
