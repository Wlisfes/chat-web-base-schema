-- 枚举分类由 SQL 维护，接口不提供增删改，移除无用的允许删除、允许更新标识。
-- 回滚：ALTER TABLE `tb_skyline_chunk_module`
--           ADD COLUMN `allow_delete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许删除此枚举分类' AFTER `remark`,
--           ADD COLUMN `allow_update` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许更新此枚举分类' AFTER `allow_delete`;

ALTER TABLE `tb_skyline_chunk_module`
    DROP COLUMN `allow_delete`,
    DROP COLUMN `allow_update`;
