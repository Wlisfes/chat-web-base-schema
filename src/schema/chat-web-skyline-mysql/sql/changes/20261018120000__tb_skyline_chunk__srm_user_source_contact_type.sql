-- 新增供应商注册来源枚举 CHUNK_SRM_USER_SOURCE（模块 CHUNK_SRM），数据与客户注册来源 CHUNK_CRM_USER_SOURCE 一致：
-- 1. 主表按客户注册来源分类复制一条分类（字段类型 kind 与客户注册来源保持一致）；
-- 2. 子表按执行时的客户注册来源枚举项整树复制：新主键 = 当前最大主键 + 序号，value 同步为新主键，pid 按新旧主键映射重建父子关系；
-- 3. 联系方式枚举编码 CHUNK_SKYLINE_COMMON_CONTACT_TYPE 更名为 CHUNK_SKYLINE_CONTACT_TYPE（主键不变）；
-- 4. 同步主子表 type 字段注释。供应商注册来源已有数据时不再复制，重复执行不产生变化；两套枚举复制后各自独立维护。
-- 回滚：DELETE FROM `tb_skyline_chunk` WHERE `type` = 'CHUNK_SRM_USER_SOURCE';
--       DELETE FROM `tb_skyline_chunk_module` WHERE `type` = 'CHUNK_SRM_USER_SOURCE';
--       UPDATE `tb_skyline_chunk_module` / `tb_skyline_chunk` SET `type` = 'CHUNK_SKYLINE_COMMON_CONTACT_TYPE' WHERE `type` = 'CHUNK_SKYLINE_CONTACT_TYPE';

ALTER TABLE `tb_skyline_chunk_module`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SKYLINE_USER_POST=用户岗位（Skyline 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SKYLINE_USER_LEVEL=用户职级（Skyline 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）；CHUNK_SKYLINE_CONTACT_TYPE=联系方式（系统通用联系方式类型，仅一级枚举项）；CHUNK_CRM_USER_SOURCE=客户注册来源（CRM 客户注册来源，仅一级枚举项）；CHUNK_SRM_USER_SOURCE=供应商注册来源（SRM 供应商注册来源，初始数据复制自客户注册来源）';

ALTER TABLE `tb_skyline_chunk`
    MODIFY COLUMN `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SKYLINE_USER_POST=用户岗位（Skyline 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SKYLINE_USER_LEVEL=用户职级（Skyline 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）；CHUNK_SKYLINE_CONTACT_TYPE=联系方式（系统通用联系方式类型，仅一级枚举项）；CHUNK_CRM_USER_SOURCE=客户注册来源（CRM 客户注册来源，仅一级枚举项）；CHUNK_SRM_USER_SOURCE=供应商注册来源（SRM 供应商注册来源，初始数据复制自客户注册来源）';

UPDATE `tb_skyline_chunk_module` SET `type` = 'CHUNK_SKYLINE_CONTACT_TYPE' WHERE `type` = 'CHUNK_SKYLINE_COMMON_CONTACT_TYPE';

UPDATE `tb_skyline_chunk` SET `type` = 'CHUNK_SKYLINE_CONTACT_TYPE' WHERE `type` = 'CHUNK_SKYLINE_COMMON_CONTACT_TYPE';

INSERT INTO `tb_skyline_chunk_module` (`module`, `type`, `name`, `kind`, `remark`, `create_by`, `modify_by`)
SELECT 'CHUNK_SRM', 'CHUNK_SRM_USER_SOURCE', '供应商注册来源', `source`.`kind`, 'SRM 供应商注册来源', '0', '0'
FROM `tb_skyline_chunk_module` AS `source`
WHERE `source`.`type` = 'CHUNK_CRM_USER_SOURCE'
  AND NOT EXISTS (SELECT 1 FROM `tb_skyline_chunk_module` AS `target` WHERE `target`.`type` = 'CHUNK_SRM_USER_SOURCE')
LIMIT 1;

INSERT INTO `tb_skyline_chunk` (`key_id`, `pid`, `module`, `type`, `name`, `value`, `json`, `sort`, `status`, `allow_delete`, `allow_update`, `create_by`, `modify_by`)
WITH `mapping` AS (
    SELECT `chunk`.`key_id` AS `old_id`,
           (SELECT MAX(`latest`.`key_id`) FROM `tb_skyline_chunk` AS `latest`) + ROW_NUMBER() OVER (ORDER BY `chunk`.`key_id`) AS `new_id`
    FROM `tb_skyline_chunk` AS `chunk`
    WHERE `chunk`.`type` = 'CHUNK_CRM_USER_SOURCE'
      AND NOT EXISTS (SELECT 1 FROM `tb_skyline_chunk` AS `target` WHERE `target`.`type` = 'CHUNK_SRM_USER_SOURCE')
)
SELECT `current`.`new_id`, `parent`.`new_id`, 'CHUNK_SRM', 'CHUNK_SRM_USER_SOURCE', `source`.`name`, CAST(`current`.`new_id` AS CHAR),
       `source`.`json`, `source`.`sort`, `source`.`status`, `source`.`allow_delete`, `source`.`allow_update`, '0', '0'
FROM `mapping` AS `current`
INNER JOIN `tb_skyline_chunk` AS `source` ON `source`.`key_id` = `current`.`old_id`
LEFT JOIN `mapping` AS `parent` ON `parent`.`old_id` = `source`.`pid`
ORDER BY `current`.`new_id`;
