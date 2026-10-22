-- 通道补充名称 name。已有通道先用别名回填，避免非空列没有值。
-- 回滚：ALTER TABLE `tb_srm_channel` DROP COLUMN `name`;

ALTER TABLE `tb_srm_channel`
    ADD COLUMN `name` varchar(64) NULL COMMENT '通道名称' AFTER `alias`;

UPDATE `tb_srm_channel`
SET `name` = `alias`
WHERE `name` IS NULL OR `name` = '';

ALTER TABLE `tb_srm_channel`
    MODIFY COLUMN `name` varchar(64) NOT NULL COMMENT '通道名称';
