-- 短信应用主键改为从 1002001 开始自增：现有应用主键整体加 1002000（1 -> 1002001），同步刷新报价表、报价草稿表的 app_key_id。
-- 执行前（测试库）：tb_sms_app 28 条，key_id 1-28；tb_sms_quote、tb_sms_quote_draft 的 app_key_id 均能关联到应用，无孤儿数据。
-- chat-web-srm.tb_srm_route_app.app_key_id 也引用短信应用主键，执行时该表无数据；跨库数据由 SRM 自行处理，本脚本不跨库更新。
-- 新主键全部大于旧主键最大值，按 key_id 倒序更新，避免更新过程中主键冲突。
-- 回滚：同样三张表的 key_id / app_key_id 减去 1002000（主表按 key_id 正序更新），再把 AUTO_INCREMENT 设为 MAX(key_id) + 1。

UPDATE `tb_sms_quote` SET `app_key_id` = `app_key_id` + 1002000 WHERE `app_key_id` < 1002000;

UPDATE `tb_sms_quote_draft` SET `app_key_id` = `app_key_id` + 1002000 WHERE `app_key_id` < 1002000;

UPDATE `tb_sms_app` SET `key_id` = `key_id` + 1002000 WHERE `key_id` < 1002000 ORDER BY `key_id` DESC;

ALTER TABLE `tb_sms_app` AUTO_INCREMENT = 1002001;
