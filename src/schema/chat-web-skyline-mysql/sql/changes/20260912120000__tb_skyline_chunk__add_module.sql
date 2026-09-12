-- 为 Skyline 枚举字典补充所属业务模块，供管理端按模块筛选。
ALTER TABLE `tb_skyline_chunk`
    ADD COLUMN `module` varchar(32) NOT NULL DEFAULT 'system' COMMENT '枚举所属模块：system=系统；sales=销售；purchase=采购' AFTER `pid`,
    DROP INDEX `uk_tb_skyline_chunk_type_value`,
    ADD UNIQUE KEY `uk_tb_skyline_chunk_module_type_value` (`module`, `type`, `value`),
    DROP INDEX `idx_tb_skyline_chunk_type_sort`,
    ADD KEY `idx_tb_skyline_chunk_module_type_sort` (`module`, `type`, `sort`);
