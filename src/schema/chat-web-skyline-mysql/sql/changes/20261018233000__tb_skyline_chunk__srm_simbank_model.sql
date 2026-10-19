-- 新增 SRM SIMBANK 设备型号枚举 CHUNK_SRM_SIMBANK_MODEL（模块 CHUNK_SRM，下拉选项）：T32、T64、T128、T256，主键即枚举 value。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `type` = 'CHUNK_SRM_SIMBANK_MODEL';
--       DELETE FROM `tb_skyline_chunk_module` WHERE `type` = 'CHUNK_SRM_SIMBANK_MODEL';

ALTER TABLE `tb_skyline_chunk_module`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT 'CHUNK_SRM_USER_SOURCE=供应商注册来源（SRM 供应商注册来源，初始数据复制自客户注册来源）；CHUNK_SRM_SIMBANK_MODEL=设备型号（SRM SIMBANK 设备型号，仅一级枚举项）';

ALTER TABLE `tb_skyline_chunk`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT 'CHUNK_SRM_USER_SOURCE=供应商注册来源（SRM 供应商注册来源，初始数据复制自客户注册来源）；CHUNK_SRM_SIMBANK_MODEL=设备型号（SRM SIMBANK 设备型号，仅一级枚举项）';

INSERT INTO `tb_skyline_chunk_module` (`key_id`, `module`, `type`, `name`, `kind`, `remark`, `create_by`, `modify_by`)
SELECT 1005, 'CHUNK_SRM', 'CHUNK_SRM_SIMBANK_MODEL', '设备型号', 'select', 'SRM SIMBANK 设备型号', '0', '0'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `tb_skyline_chunk_module` WHERE `key_id` = 1005 OR `type` = 'CHUNK_SRM_SIMBANK_MODEL');

INSERT INTO `tb_skyline_chunk` (`key_id`, `pid`, `module`, `type`, `name`, `value`, `json`, `sort`, `status`, `allow_delete`, `allow_update`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`pid`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`value`, `seed`.`json`, `seed`.`sort`, `seed`.`status`, `seed`.`allow_delete`, `seed`.`allow_update`, '0', '0'
FROM (
    SELECT 1024316 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SRM' AS `module`, 'CHUNK_SRM_SIMBANK_MODEL' AS `type`, 'T32' AS `name`, '1024316' AS `value`, '{}' AS `json`, 10 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024317 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SRM' AS `module`, 'CHUNK_SRM_SIMBANK_MODEL' AS `type`, 'T64' AS `name`, '1024317' AS `value`, '{}' AS `json`, 20 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024318 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SRM' AS `module`, 'CHUNK_SRM_SIMBANK_MODEL' AS `type`, 'T128' AS `name`, '1024318' AS `value`, '{}' AS `json`, 30 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024319 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SRM' AS `module`, 'CHUNK_SRM_SIMBANK_MODEL' AS `type`, 'T256' AS `name`, '1024319' AS `value`, '{}' AS `json`, 40 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND (`chunk`.`value` = `seed`.`value` OR `chunk`.`name` = `seed`.`name`))
);
