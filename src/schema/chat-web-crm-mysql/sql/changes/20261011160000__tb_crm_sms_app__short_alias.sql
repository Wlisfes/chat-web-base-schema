-- 短信应用别名缩短为：CSK + 创建人工号 + 4位应用类型 + 4位分段序号，例如 CSK1233SOTPA001；A001-Z999 后进入 AA01-ZZ99。
-- 测试库现有3个应用的创建人工号均为 1233，且每种类型各1个，因此分别回填 A001；仅更新仍为上一版别名的数据，可重复执行。
-- 回滚：UPDATE `tb_crm_sms_app` SET `app_alias` = CASE `key_id` WHEN 1 THEN 'CSK1233R7MPMRKT001' WHEN 2 THEN 'CSK1233R7MPNTFY001' WHEN 3 THEN 'CSK1233R7MPSOTP001' ELSE `app_alias` END WHERE `key_id` IN (1, 2, 3);

UPDATE `tb_crm_sms_app`
SET `app_alias` = CASE `key_id`
    WHEN 1 THEN 'CSK1233MRKTA001'
    WHEN 2 THEN 'CSK1233NTFYA001'
    WHEN 3 THEN 'CSK1233SOTPA001'
    ELSE `app_alias`
END
WHERE (`key_id`, `app_alias`) IN ((1, 'CSK1233R7MPMRKT001'), (2, 'CSK1233R7MPNTFY001'), (3, 'CSK1233R7MPSOTP001'));

UPDATE `tb_crm_sms_quote` AS `q`
JOIN `tb_crm_sms_app` AS `a` ON `a`.`key_id` = `q`.`app_key_id`
SET `q`.`app_alias` = `a`.`app_alias`
WHERE `q`.`app_key_id` IN (1, 2, 3);

UPDATE `tb_crm_sms_quote_draft` AS `q`
JOIN `tb_crm_sms_app` AS `a` ON `a`.`key_id` = `q`.`app_key_id`
SET `q`.`app_alias` = `a`.`app_alias`
WHERE `q`.`app_key_id` IN (1, 2, 3);