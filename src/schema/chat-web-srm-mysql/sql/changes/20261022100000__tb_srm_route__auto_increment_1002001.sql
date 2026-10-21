-- 路由、路由规则、路由规则通道主键统一从 1002001 开始自增。
-- 已有数据按 key_id 顺序平移到 1002001 起，并同步更新 tb_srm_route_rule.route_key_id、tb_srm_route_app.route_key_id、tb_srm_route_channel.rule_key_id 引用。
-- 回滚：主键平移不可逆，如需回滚请从备份恢复；自增起点可通过 ALTER TABLE ... AUTO_INCREMENT = 1 还原。

UPDATE `tb_srm_route_channel` AS `channel`
INNER JOIN `tb_srm_route_rule` AS `rule` ON `rule`.`key_id` = `channel`.`rule_key_id`
SET `channel`.`rule_key_id` = `rule`.`key_id` + 1002000
WHERE `rule`.`key_id` < 1002001;

UPDATE `tb_srm_route_rule` SET `route_key_id` = `route_key_id` + 1002000 WHERE `route_key_id` < 1002001;
UPDATE `tb_srm_route_app` SET `route_key_id` = `route_key_id` + 1002000 WHERE `route_key_id` < 1002001;

UPDATE `tb_srm_route_channel` SET `key_id` = `key_id` + 1002000 WHERE `key_id` < 1002001 ORDER BY `key_id` DESC;
UPDATE `tb_srm_route_rule` SET `key_id` = `key_id` + 1002000 WHERE `key_id` < 1002001 ORDER BY `key_id` DESC;
UPDATE `tb_srm_route` SET `key_id` = `key_id` + 1002000 WHERE `key_id` < 1002001 ORDER BY `key_id` DESC;

ALTER TABLE `tb_srm_route` AUTO_INCREMENT = 1002001;
ALTER TABLE `tb_srm_route_rule` AUTO_INCREMENT = 1002001;
ALTER TABLE `tb_srm_route_channel` AUTO_INCREMENT = 1002001;