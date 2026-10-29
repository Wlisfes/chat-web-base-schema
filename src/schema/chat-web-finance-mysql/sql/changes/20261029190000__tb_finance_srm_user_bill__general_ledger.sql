-- 供应商流水改为通用钱包流水：短信扣费、充值、调账共用。
-- 存量短信流水记为 sms，金额改为负数，关联业务ID沿用短信ID。
-- 回滚需按当时列结构重建，已产生的充值、调账流水不会自动还原。

ALTER TABLE `tb_finance_srm_user_bill`
    ADD COLUMN `biz_type` varchar(32) NULL COMMENT '钱包流水类型：sms=短信扣费（短信发送扣减钱包余额）；recharge=充值（供应商充值增加钱包余额）；adjust=调账（人工调整钱包余额）' AFTER `currency`,
    ADD COLUMN `amount` bigint NULL COMMENT '变动金额（放大百万倍存储）：充值为正，扣费为负，按钱包币种计' AFTER `biz_type`,
    ADD COLUMN `ref_id` varchar(64) NULL COMMENT '关联业务ID：短信为短信ID，充值为充值单号，调账可空' AFTER `amount`;

UPDATE `tb_finance_srm_user_bill`
SET `biz_type` = 'sms',
    `amount` = -`cost`,
    `ref_id` = `msg_id`;

ALTER TABLE `tb_finance_srm_user_bill`
    MODIFY COLUMN `biz_type` varchar(32) NOT NULL COMMENT '钱包流水类型：sms=短信扣费（短信发送扣减钱包余额）；recharge=充值（供应商充值增加钱包余额）；adjust=调账（人工调整钱包余额）',
    MODIFY COLUMN `amount` bigint NOT NULL COMMENT '变动金额（放大百万倍存储）：充值为正，扣费为负，按钱包币种计',
    DROP INDEX `uk_tb_finance_srm_user_bill_msg_id`,
    DROP COLUMN `msg_id`,
    DROP COLUMN `simbank_key_id`,
    DROP COLUMN `port_key_id`,
    DROP COLUMN `pay_mode`,
    DROP COLUMN `trigger`,
    DROP COLUMN `segments`,
    DROP COLUMN `cost`,
    ADD KEY `idx_tb_finance_srm_user_bill_biz_ref` (`biz_type`, `ref_id`);

ALTER TABLE `tb_finance_srm_user_bill` COMMENT = '财务供应商钱包流水表';