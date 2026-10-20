-- SIM 卡号码统一不带 + 号：去除历史数据开头的 + 号。
-- 回滚：无法区分原值是否带 + 号，如需回滚请从备份恢复。

UPDATE `tb_srm_simbank_port`
SET `sim` = SUBSTRING(`sim`, 2)
WHERE `sim` LIKE '+%';
