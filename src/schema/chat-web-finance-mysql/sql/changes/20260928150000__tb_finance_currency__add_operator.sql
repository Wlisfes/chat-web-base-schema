-- 币种补充创建人、更新人审计字段；历史数据统一回填系统账号 0。
-- 回滚：ALTER TABLE `tb_finance_currency` DROP COLUMN `create_by`, DROP COLUMN `modify_by`;

ALTER TABLE `tb_finance_currency`
    ADD COLUMN `create_by` varchar(19) NOT NULL DEFAULT '0' COMMENT '创建账号UID' AFTER `status`,
    ADD COLUMN `modify_by` varchar(19) NULL DEFAULT '0' COMMENT '更新账号UID' AFTER `create_by`;

-- 回填完成后移除默认值，后续写入必须由服务显式传入操作人。
ALTER TABLE `tb_finance_currency`
    ALTER COLUMN `create_by` DROP DEFAULT,
    ALTER COLUMN `modify_by` DROP DEFAULT;
