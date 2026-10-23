-- 通道 owner_user_uid 文案由负责人改为归属人，字段和取值不变。
-- 回滚：ALTER TABLE `tb_srm_channel` MODIFY COLUMN `owner_user_uid` varchar(19) NOT NULL COMMENT '负责人账号UID';

ALTER TABLE `tb_srm_channel`
    MODIFY COLUMN `owner_user_uid` varchar(19) NOT NULL COMMENT '归属人账号UID';
