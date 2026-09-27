-- 补充岗位枚举：前端开发工程师、高级采购经理、行政经理、人事经理、招聘经理；主键即枚举 value。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `key_id` BETWEEN 1024165 AND 1024169 AND `type` = 'CHUNK_SYSTEM_ACCOUNT_USER_POST';

INSERT INTO `tb_skyline_chunk` (`key_id`, `pid`, `module`, `type`, `name`, `value`, `json`, `sort`, `status`, `allow_delete`, `allow_update`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`pid`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`value`, `seed`.`json`, `seed`.`sort`, `seed`.`status`, `seed`.`allow_delete`, `seed`.`allow_update`, '0', '0'
FROM (
    SELECT 1024165 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '前端开发工程师' AS `name`, '1024165' AS `value`, '{}' AS `json`, 660 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024166 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '高级采购经理' AS `name`, '1024166' AS `value`, '{}' AS `json`, 670 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024167 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '行政经理' AS `name`, '1024167' AS `value`, '{}' AS `json`, 680 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024168 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '人事经理' AS `name`, '1024168' AS `value`, '{}' AS `json`, 690 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
    UNION ALL SELECT 1024169 AS `key_id`, CAST(NULL AS SIGNED) AS `pid`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '招聘经理' AS `name`, '1024169' AS `value`, '{}' AS `json`, 700 AS `sort`, 'enable' AS `status`, 1 AS `allow_delete`, 1 AS `allow_update`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`key_id` = `seed`.`key_id`
       OR (`chunk`.`module` = `seed`.`module` AND `chunk`.`type` = `seed`.`type` AND (`chunk`.`value` = `seed`.`value` OR `chunk`.`name` = `seed`.`name`))
);

ALTER TABLE `tb_skyline_chunk` AUTO_INCREMENT = 1024170;
