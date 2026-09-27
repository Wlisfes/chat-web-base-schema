CREATE TABLE IF NOT EXISTS `tb_skyline_chunk_module` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `module` varchar(32) NOT NULL DEFAULT 'CHUNK_SYSTEM' COMMENT '枚举所属模块：CHUNK_SYSTEM=系统（系统管理模块使用的枚举项）；CHUNK_CRM=CRM（CRM 客户关系管理模块使用的枚举项）；CHUNK_SRM=SRM（SRM 供应商关系管理模块使用的枚举项）',
    `type` varchar(128) NOT NULL COMMENT '枚举类型编码：CHUNK_SYSTEM_ACCOUNT_USER_POST=用户岗位（Account 账号岗位，仅一级枚举项，适用于普通下拉选择）；CHUNK_SYSTEM_ACCOUNT_USER_LEVEL=用户职级（Account 账号职级，P1-P8 专业序列、M1-M8 管理序列，仅一级枚举项）',
    `name` varchar(128) NOT NULL COMMENT '枚举分类名称',
    `kind` varchar(32) NOT NULL DEFAULT 'select' COMMENT '枚举字段类型：select=下拉选项（仅一级枚举项，适用于普通下拉选择）；tree=树形选项（支持多级枚举项，适用于树形选择）',
    `remark` varchar(256) NULL COMMENT '枚举分类备注',
    `create_by` varchar(19) NOT NULL COMMENT '创建账号UID',
    `modify_by` varchar(19) NULL COMMENT '更新账号UID',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_skyline_chunk_module_module_type` (`module`, `type`),
    KEY `idx_tb_skyline_chunk_module_module` (`module`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1002
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Skyline 枚举分类表';

-- 系统枚举分类：用户岗位、用户职级。本表主键从 1000 起号，后续新增数据从 1002 开始自增。
-- 回滚：DELETE FROM `tb_skyline_chunk_module` WHERE `key_id` IN (1000, 1001);

INSERT INTO `tb_skyline_chunk_module` (`key_id`, `module`, `type`, `name`, `kind`, `remark`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`module`, `seed`.`type`, `seed`.`name`, `seed`.`kind`, `seed`.`remark`, `seed`.`create_by`, `seed`.`modify_by`
FROM (
    SELECT 1000 AS `key_id`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_POST' AS `type`, '用户岗位' AS `name`, 'select' AS `kind`, '账号岗位' AS `remark`, '0' AS `create_by`, '0' AS `modify_by`
    UNION ALL SELECT 1001 AS `key_id`, 'CHUNK_SYSTEM' AS `module`, 'CHUNK_SYSTEM_ACCOUNT_USER_LEVEL' AS `type`, '用户职级' AS `name`, 'select' AS `kind`, '账号职级：P1-P8 专业序列，M1-M8 管理序列' AS `remark`, '0' AS `create_by`, '0' AS `modify_by`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_skyline_chunk_module` AS `chunk_module`
    WHERE `chunk_module`.`key_id` = `seed`.`key_id`
       OR (`chunk_module`.`module` = `seed`.`module` AND `chunk_module`.`type` = `seed`.`type`)
);
