-- 短信应用别名规则调整为：客户别名 + 4位应用类型后缀 + 同一客户同类型3位自增序号，例如 CSK1233R7MPSOTP001。
-- 测试库现有3个应用均属于客户 10241001（别名 CSK1233R7MP），按类型分别回填001；关联报价表当前没有数据，同步更新快照以保证后续执行一致。
-- 回滚：UPDATE `tb_crm_sms_app` SET `app_alias` = CASE `key_id` WHEN 1 THEN 'CSK12330001MRKT' WHEN 2 THEN 'CSK12330002NTFY' WHEN 3 THEN 'CSK12330003SOTP' ELSE `app_alias` END WHERE `key_id` IN (1, 2, 3);

UPDATE `tb_crm_sms_app` AS `a`
JOIN (
    SELECT
        `app`.`key_id`,
        CONCAT(
            `user`.`alias`,
            CASE `app`.`type` WHEN 'market' THEN 'MRKT' WHEN 'notify' THEN 'NTFY' WHEN 'otp' THEN 'SOTP' END,
            LPAD(ROW_NUMBER() OVER (PARTITION BY `app`.`user_key_id`, `app`.`type` ORDER BY `app`.`key_id`), 3, '0')
        ) AS `app_alias`
    FROM `tb_crm_sms_app` AS `app`
    JOIN `tb_crm_user` AS `user` ON `user`.`key_id` = `app`.`user_key_id`
    WHERE `user`.`alias` IS NOT NULL AND `user`.`alias` <> ''
) AS `n` ON `n`.`key_id` = `a`.`key_id`
SET `a`.`app_alias` = `n`.`app_alias`;

UPDATE `tb_crm_sms_quote` AS `q`
JOIN `tb_crm_sms_app` AS `a` ON `a`.`key_id` = `q`.`app_key_id`
SET `q`.`app_alias` = `a`.`app_alias`;

UPDATE `tb_crm_sms_quote_draft` AS `q`
JOIN `tb_crm_sms_app` AS `a` ON `a`.`key_id` = `q`.`app_key_id`
SET `q`.`app_alias` = `a`.`app_alias`;