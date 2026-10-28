-- 发送记录新增付款模式快照：Dispatch 写入发送记录时记录供应商当时的付款模式，决定供应商计费时机（预付提交即计、后付发送成功才计）。
-- 历史记录为 NULL，不参与计费。
-- 回滚：ALTER TABLE `tb_srm_simbank_message` DROP COLUMN `pay_mode`;

ALTER TABLE `tb_srm_simbank_message`
    ADD COLUMN `pay_mode` varchar(32) NULL COMMENT '付款模式快照：付款模式：postpaid=后付（账期后付费）；prepaid=预付（账户预付费）' AFTER `owner_user_uid`;
