-- simbank 基础成本价格初始化：从 tb_finance_frozen_sms 复制每个国家/地区一条记录，上下行价格按短信基础价格的 50%（四舍五入为整数，价格放大百万倍存储）。
-- 主键与短信基础价格保持一致，便于对照；只补充 simbank 表中尚不存在的国家/地区，重复执行不产生变化，也不覆盖人工维护的价格。
-- 回滚：DELETE FROM `tb_finance_frozen_simbank` WHERE `remark` = '初始化自短信基础价格 50%';

INSERT INTO `tb_finance_frozen_simbank` (`key_id`, `country_key_id`, `code`, `mcc`, `up_usd`, `down_usd`, `remark`, `create_by`, `modify_by`)
SELECT
    `sms`.`key_id`,
    `sms`.`country_key_id`,
    `sms`.`code`,
    `sms`.`mcc`,
    ROUND(`sms`.`up_usd` * 0.5),
    ROUND(`sms`.`down_usd` * 0.5),
    '初始化自短信基础价格 50%',
    '0',
    '0'
FROM `tb_finance_frozen_sms` AS `sms`
WHERE NOT EXISTS (
    SELECT 1
    FROM `tb_finance_frozen_simbank` AS `simbank`
    WHERE `simbank`.`key_id` = `sms`.`key_id`
       OR `simbank`.`country_key_id` = `sms`.`country_key_id`
       OR (`simbank`.`code` = `sms`.`code` AND `simbank`.`mcc` = `sms`.`mcc`)
);

-- 主键接续：后续手工新增的记录从当前最大主键之后开始。
SET @next_key_id = (SELECT GREATEST(COALESCE(MAX(`key_id`), 999) + 1, 1000) FROM `tb_finance_frozen_simbank`);
SET @reset_auto_increment = CONCAT('ALTER TABLE `tb_finance_frozen_simbank` AUTO_INCREMENT = ', @next_key_id);
PREPARE `reset_auto_increment` FROM @reset_auto_increment;
EXECUTE `reset_auto_increment`;
DEALLOCATE PREPARE `reset_auto_increment`;
