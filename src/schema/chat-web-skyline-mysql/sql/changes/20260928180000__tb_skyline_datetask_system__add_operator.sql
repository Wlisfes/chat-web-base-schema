-- 系统定时任务补充创建人、更新人审计字段；任务由系统内置初始化，默认记为系统账号 0。
-- 保留默认值 '0'：内置任务由服务启动时自动写入，未显式传入操作人时按系统账号记录。
-- 回滚：ALTER TABLE `tb_skyline_datetask_system` DROP COLUMN `create_by`, DROP COLUMN `modify_by`;

ALTER TABLE `tb_skyline_datetask_system`
    ADD COLUMN `create_by` varchar(19) NOT NULL DEFAULT '0' COMMENT '创建账号UID' AFTER `next_time`,
    ADD COLUMN `modify_by` varchar(19) NULL DEFAULT '0' COMMENT '更新账号UID' AFTER `create_by`;
