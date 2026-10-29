-- 供应商钱包不再单独记录 USD 余额，余额只按钱包币种记在 balance。
-- 回滚：ALTER TABLE `tb_finance_srm_user_wallet` ADD COLUMN `balance_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD 余额（放大百万倍存储）：预付为负表示欠费，后付为负表示应付' AFTER `balance`;

ALTER TABLE `tb_finance_srm_user_wallet` DROP COLUMN `balance_usd`;