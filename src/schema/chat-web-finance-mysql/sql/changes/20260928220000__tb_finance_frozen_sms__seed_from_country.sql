-- 短信基础价格按国家/地区表初始化：每个国家/地区（code + mcc）一条记录，上下行价格默认 0，由业务后续维护。
-- 本表主键从 1000 起号，初始化数据按国家/地区主键顺序依次分配；重复执行不产生变化。
-- 回滚：DELETE FROM `tb_finance_frozen_sms` WHERE `create_by` = '0' AND `up_usd` = 0 AND `down_usd` = 0;

ALTER TABLE `tb_finance_frozen_sms` AUTO_INCREMENT = 1000;

INSERT INTO `tb_finance_frozen_sms` (`key_id`, `code`, `mcc`, `up_usd`, `down_usd`, `remark`, `create_by`, `modify_by`)
SELECT `seed`.`key_id`, `seed`.`code`, `seed`.`mcc`, 0, 0, NULL, '0', '0'
FROM (
    SELECT 999 + ROW_NUMBER() OVER (ORDER BY `country`.`key_id`) AS `key_id`, `country`.`code`, `country`.`mcc`
    FROM `tb_finance_country` AS `country`
) AS `seed`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_finance_frozen_sms` AS `sms`
    WHERE `sms`.`key_id` = `seed`.`key_id`
       OR (`sms`.`code` = `seed`.`code` AND `sms`.`mcc` = `seed`.`mcc`)
);
