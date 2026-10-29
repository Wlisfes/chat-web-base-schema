-- 扣费记录从通用流水改回只记扣费，并改名：tb_finance_srm_user_bill -> tb_finance_srm_user_deduct。
-- 充值不进这张表。存量金额如果是负数，改回正数扣费金额。
-- 回滚：RENAME TABLE `tb_finance_srm_user_deduct` TO `tb_finance_srm_user_bill`;（索引按下方反向改名）

UPDATE `tb_finance_srm_user_bill` SET `amount` = -`amount` WHERE `amount` < 0;
DELETE FROM `tb_finance_srm_user_bill` WHERE `biz_type` <> 'sms';

ALTER TABLE `tb_finance_srm_user_bill`
    MODIFY COLUMN `biz_type` varchar(32) NOT NULL COMMENT '扣费来源：sms=短信扣费（短信发送扣减钱包余额）',
    MODIFY COLUMN `amount` bigint NOT NULL COMMENT '扣费金额（放大百万倍存储）：按钱包币种计，只记正数',
    MODIFY COLUMN `ref_id` varchar(64) NULL COMMENT '关联业务ID：短信扣费为短信ID',
    MODIFY COLUMN `currency` varchar(16) NOT NULL COMMENT '财务币种编码：本次扣费使用的钱包币种',
    MODIFY COLUMN `event_id` varchar(64) NOT NULL COMMENT '业务事件ID：同一笔扣费只记一次',
    MODIFY COLUMN `occurred_time` datetime(3) NOT NULL COMMENT '扣费发生时间';

RENAME TABLE `tb_finance_srm_user_bill` TO `tb_finance_srm_user_deduct`;

ALTER TABLE `tb_finance_srm_user_deduct`
    RENAME INDEX `uk_tb_finance_srm_user_bill_event_id` TO `uk_tb_finance_srm_user_deduct_event_id`,
    RENAME INDEX `idx_tb_finance_srm_user_bill_user_occurred_time` TO `idx_tb_finance_srm_user_deduct_user_occurred_time`,
    RENAME INDEX `idx_tb_finance_srm_user_bill_biz_ref` TO `idx_tb_finance_srm_user_deduct_biz_ref`,
    COMMENT = '财务供应商扣费记录表';