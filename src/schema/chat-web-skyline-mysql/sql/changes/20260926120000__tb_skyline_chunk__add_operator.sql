-- 枚举项补充创建人、更新人审计字段；历史数据统一回填系统账号 0，与枚举分类种子数据保持一致。
-- 回滚：ALTER TABLE `tb_skyline_chunk` DROP COLUMN `create_by`, DROP COLUMN `modify_by`;

ALTER TABLE `tb_skyline_chunk`
    ADD COLUMN `create_by` varchar(19) NOT NULL DEFAULT '0' COMMENT '创建账号UID' AFTER `allow_update`,
    ADD COLUMN `modify_by` varchar(19) NULL DEFAULT '0' COMMENT '更新账号UID' AFTER `create_by`;

-- 回填完成后移除默认值，后续写入必须由服务显式传入操作人。
ALTER TABLE `tb_skyline_chunk`
    ALTER COLUMN `create_by` DROP DEFAULT,
    ALTER COLUMN `modify_by` DROP DEFAULT;
