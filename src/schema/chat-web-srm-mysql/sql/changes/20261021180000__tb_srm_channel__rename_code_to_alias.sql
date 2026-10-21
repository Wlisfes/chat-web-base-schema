-- 通道编码字段 code 改名为别名 alias，与 SIMBANK 设备、供应商的 alias 命名保持一致；唯一索引同步改名。
-- 回滚：ALTER TABLE `tb_srm_channel` RENAME INDEX `uk_tb_srm_channel_alias` TO `uk_tb_srm_channel_code`, CHANGE COLUMN `alias` `code` varchar(32) NOT NULL COMMENT '通道编码：全表唯一，创建后不可修改，用于队列命名';

ALTER TABLE `tb_srm_channel`
    CHANGE COLUMN `code` `alias` varchar(32) NOT NULL COMMENT '通道别名：字母、数字、中划线，保存时统一转为大写，全表唯一，创建后不可修改，用于队列命名',
    RENAME INDEX `uk_tb_srm_channel_code` TO `uk_tb_srm_channel_alias`;
