-- 供应商钱包已改为按钱包币种记账，流水不再保存 USD 余额快照。
-- cost_usd 改为 cost，并补上本次成本使用的币种。存量流水币种按 USD 回填，金额沿用原 cost_usd。
-- 回滚：ALTER TABLE `tb_finance_srm_user_bill` ADD COLUMN `balance_usd` bigint NOT NULL DEFAULT 0 COMMENT '落账后供应商 USD 余额（放大百万倍存储）' AFTER `cost`, CHANGE COLUMN `cost` `cost_usd` bigint NOT NULL COMMENT '本次计费成本 USD（放大百万倍存储）', DROP COLUMN `currency`;

ALTER TABLE `tb_finance_srm_user_bill`
    ADD COLUMN `currency` varchar(16) NOT NULL DEFAULT 'USD' COMMENT '财务币种编码：本次成本使用的钱包币种' AFTER `segments`,
    CHANGE COLUMN `cost_usd` `cost` bigint NOT NULL COMMENT '本次计费成本（放大百万倍存储）：按钱包币种计',
    DROP COLUMN `balance_usd`;

ALTER TABLE `tb_finance_srm_user_bill` ALTER COLUMN `currency` DROP DEFAULT;