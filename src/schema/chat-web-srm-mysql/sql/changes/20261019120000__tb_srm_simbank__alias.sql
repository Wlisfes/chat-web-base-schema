-- 设备表新增别名 alias：自定义的设备简称，可为空，非空时全表唯一。
-- 回滚：ALTER TABLE `tb_srm_simbank` DROP INDEX `uk_tb_srm_simbank_alias`, DROP COLUMN `alias`;

ALTER TABLE `tb_srm_simbank`
    ADD COLUMN `alias` varchar(64) NULL COMMENT '设备别名：自定义的设备简称，全表唯一' AFTER `name`,
    ADD UNIQUE INDEX `uk_tb_srm_simbank_alias` (`alias`);
