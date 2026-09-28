-- 短信基础价格表迁移为 tb_finance_frozen_sms：表名与索引名同步调整，数据保留。
-- 回滚：RENAME TABLE `tb_finance_frozen_sms` TO `tb_finance_basic_sms_rate`，并按相反方向执行 RENAME INDEX。

RENAME TABLE `tb_finance_basic_sms_rate` TO `tb_finance_frozen_sms`;

ALTER TABLE `tb_finance_frozen_sms`
    RENAME INDEX `uk_tb_finance_basic_sms_rate_code_mcc` TO `uk_tb_finance_frozen_sms_code_mcc`,
    RENAME INDEX `idx_tb_finance_basic_sms_rate_code` TO `idx_tb_finance_frozen_sms_code`;
