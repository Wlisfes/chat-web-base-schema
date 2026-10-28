-- 供应商账户与计费流水表改名：tb_finance_supplier_account -> tb_finance_srm_user，tb_finance_supplier_bill -> tb_finance_srm_user_bill，索引同步改名。
-- 20261028100200__tb_finance_supplier_account__create.sql 已在测试库执行，按规则不修改已执行文件，在这里改名。
-- 回滚：RENAME TABLE `tb_finance_srm_user` TO `tb_finance_supplier_account`, `tb_finance_srm_user_bill` TO `tb_finance_supplier_bill`;（索引按下方反向改名）

RENAME TABLE `tb_finance_supplier_account` TO `tb_finance_srm_user`, `tb_finance_supplier_bill` TO `tb_finance_srm_user_bill`;

ALTER TABLE `tb_finance_srm_user`
    RENAME INDEX `uk_tb_finance_supplier_account_user_key_id` TO `uk_tb_finance_srm_user_user_key_id`;

ALTER TABLE `tb_finance_srm_user_bill`
    RENAME INDEX `uk_tb_finance_supplier_bill_event_id` TO `uk_tb_finance_srm_user_bill_event_id`,
    RENAME INDEX `uk_tb_finance_supplier_bill_msg_id` TO `uk_tb_finance_srm_user_bill_msg_id`,
    RENAME INDEX `idx_tb_finance_supplier_bill_user_occurred_time` TO `idx_tb_finance_srm_user_bill_user_occurred_time`;