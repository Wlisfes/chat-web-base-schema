-- 短信基础价格直接关联国家/地区主键，避免共用国际区号时只能依赖 code + mcc 隐式匹配。
-- 历史数据按 code + mcc 回填国家/地区主键；存在无法匹配的数据时，后续 NOT NULL 约束会执行失败，需要先修正数据。
-- 回滚：ALTER TABLE `tb_finance_frozen_sms` DROP INDEX `uk_tb_finance_frozen_sms_country_key_id`, DROP COLUMN `country_key_id`;

ALTER TABLE `tb_finance_frozen_sms`
    ADD COLUMN `country_key_id` int NULL COMMENT '国家/地区主键' AFTER `key_id`;

UPDATE `tb_finance_frozen_sms` AS `sms`
INNER JOIN `tb_finance_country` AS `country` ON `country`.`code` = `sms`.`code` AND `country`.`mcc` = `sms`.`mcc`
SET `sms`.`country_key_id` = `country`.`key_id`
WHERE `sms`.`country_key_id` IS NULL;

ALTER TABLE `tb_finance_frozen_sms`
    MODIFY COLUMN `country_key_id` int NOT NULL COMMENT '国家/地区主键',
    ADD UNIQUE KEY `uk_tb_finance_frozen_sms_country_key_id` (`country_key_id`);
