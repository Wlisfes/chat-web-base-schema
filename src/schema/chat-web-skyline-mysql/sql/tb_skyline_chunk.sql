CREATE TABLE IF NOT EXISTS `tb_skyline_chunk` (
    `key_id` int NOT NULL AUTO_INCREMENT COMMENT '表主键',
    `pid` int NULL COMMENT '父枚举项主键；根节点为空',
    `module` varchar(32) NOT NULL DEFAULT 'system' COMMENT '枚举所属模块：system=系统；sales=销售；purchase=采购',
    `type` varchar(128) NOT NULL COMMENT '枚举类型编码',
    `name` varchar(128) NOT NULL COMMENT '枚举项显示名称',
    `value` varchar(128) NOT NULL COMMENT '枚举项业务值',
    `json` text NULL COMMENT '枚举项扩展配置',
    `sort` int NOT NULL DEFAULT 0 COMMENT '枚举项排序值',
    `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '枚举项状态：disable=禁用（枚举项不可用于业务选择）；enable=启用（枚举项可正常用于业务选择）',
    `allow_delete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许删除此枚举项',
    `allow_update` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许更新此枚举项',
    `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `modify_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    PRIMARY KEY (`key_id`),
    UNIQUE KEY `uk_tb_skyline_chunk_module_type_value` (`module`, `type`, `value`),
    KEY `idx_tb_skyline_chunk_pid` (`pid`),
    KEY `idx_tb_skyline_chunk_module_type_sort` (`module`, `type`, `sort`),
    KEY `idx_tb_skyline_chunk_status` (`status`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 10000
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Skyline 后端枚举字典表';
