-- 扣费记录关联字段改名：ref_id -> business_id，索引同步改名。
-- 回滚：ALTER TABLE `tb_finance_srm_user_deduct` CHANGE COLUMN `business_id` `ref_id` varchar(64) NULL COMMENT '关联业务ID：短信扣费为短信ID', RENAME INDEX `idx_tb_finance_srm_user_deduct_biz_business` TO `idx_tb_finance_srm_user_deduct_biz_ref`;

ALTER TABLE `tb_finance_srm_user_deduct`
    CHANGE COLUMN `ref_id` `business_id` varchar(64) NULL COMMENT '业务ID：短信扣费为短信ID',
    RENAME INDEX `idx_tb_finance_srm_user_deduct_biz_ref` TO `idx_tb_finance_srm_user_deduct_biz_business`;