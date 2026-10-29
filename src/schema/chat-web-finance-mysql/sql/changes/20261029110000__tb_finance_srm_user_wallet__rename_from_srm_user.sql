-- 供应商账户改成钱包：tb_finance_srm_user -> tb_finance_srm_user_wallet。
-- 去掉累计成本和计费条数，新增本币余额、币种、信用额度。存量 USD 余额回填到本币余额，币种记为 USD。
-- 回滚：见文件末尾注释，已产生的本币余额和信用额度不会自动还原。

RENAME TABLE `tb_finance_srm_user` TO `tb_finance_srm_user_wallet`;

ALTER TABLE `tb_finance_srm_user_wallet`
    RENAME INDEX `uk_tb_finance_srm_user_user_key_id` TO `uk_tb_finance_srm_user_wallet_user_key_id`,
    DROP COLUMN `billed_usd`,
    DROP COLUMN `bill_count`,
    ADD COLUMN `currency` varchar(16) NOT NULL DEFAULT 'USD' COMMENT '财务币种编码' AFTER `pay_mode`,
    ADD COLUMN `balance` bigint NOT NULL DEFAULT 0 COMMENT '余额（放大百万倍存储）：按钱包币种计' AFTER `currency`,
    ADD COLUMN `credit` bigint NOT NULL DEFAULT 0 COMMENT '信用额度（放大百万倍存储）：按钱包币种计' AFTER `balance_usd`,
    ADD KEY `idx_tb_finance_srm_user_wallet_currency` (`currency`);

UPDATE `tb_finance_srm_user_wallet` SET `balance` = `balance_usd`;

ALTER TABLE `tb_finance_srm_user_wallet` ALTER COLUMN `currency` DROP DEFAULT;

-- 回滚：
-- ALTER TABLE `tb_finance_srm_user_wallet`
--     DROP INDEX `idx_tb_finance_srm_user_wallet_currency`,
--     DROP COLUMN `credit`,
--     DROP COLUMN `balance`,
--     DROP COLUMN `currency`,
--     ADD COLUMN `billed_usd` bigint NOT NULL DEFAULT 0 COMMENT '累计计费成本 USD（放大百万倍存储）' AFTER `balance_usd`,
--     ADD COLUMN `bill_count` int NOT NULL DEFAULT 0 COMMENT '累计计费短信条数' AFTER `billed_usd`,
--     RENAME INDEX `uk_tb_finance_srm_user_wallet_user_key_id` TO `uk_tb_finance_srm_user_user_key_id`;
-- RENAME TABLE `tb_finance_srm_user_wallet` TO `tb_finance_srm_user`;