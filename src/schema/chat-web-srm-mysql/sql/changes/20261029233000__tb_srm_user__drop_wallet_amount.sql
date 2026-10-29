-- 供应商钱包已迁移到 Finance `tb_finance_srm_user_wallet`，余额和信用额度以 Finance 为准；删除 SRM 供应商表中不再使用的金额字段。
-- 回滚：ALTER TABLE `tb_srm_user`
--       ADD COLUMN `balance` bigint NOT NULL DEFAULT 0 COMMENT '余额（放大百万倍存储）' AFTER `pay_mode`,
--       ADD COLUMN `balance_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD余额（放大百万倍存储）' AFTER `balance`,
--       ADD COLUMN `credit` bigint NOT NULL DEFAULT 0 COMMENT '信用额度（放大百万倍存储）' AFTER `balance_usd`,
--       ADD COLUMN `credit_usd` bigint NOT NULL DEFAULT 0 COMMENT 'USD信用额度（放大百万倍存储）' AFTER `credit`;
--       金额数据不恢复，以 Finance 钱包为准。

ALTER TABLE `tb_srm_user`
    DROP COLUMN `balance`,
    DROP COLUMN `balance_usd`,
    DROP COLUMN `credit`,
    DROP COLUMN `credit_usd`;