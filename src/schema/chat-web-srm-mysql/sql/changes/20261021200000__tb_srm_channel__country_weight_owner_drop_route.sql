-- 通道与方向一对一：通道新增方向 country_key_id、分流权重 weight、负责人 owner_user_uid，别名改为自动生成；删除路由表 tb_srm_channel_route，SMS 直接按 方向 + 类型 在启用通道间按权重分流。
-- 执行前通道表为空，新增 NOT NULL 字段无需回填。
-- 回滚：ALTER TABLE `tb_srm_channel` DROP INDEX `idx_tb_srm_channel_country_type`, DROP INDEX `idx_tb_srm_channel_owner_user_uid`, DROP COLUMN `country_key_id`, DROP COLUMN `weight`, DROP COLUMN `owner_user_uid`, ADD INDEX `idx_tb_srm_channel_type` (`type`); 并按 20261021190100 后的结构重建 tb_srm_channel_route。

ALTER TABLE `tb_srm_channel`
    MODIFY COLUMN `alias` varchar(32) NOT NULL COMMENT '通道别名：按 创建人工号-方向MCC-类型-序号 自动生成，全表唯一，创建后不可修改，用于队列命名',
    ADD COLUMN `country_key_id` int NOT NULL COMMENT '方向：Skyline 国家/地区主键，创建后不可修改' AFTER `type`,
    ADD COLUMN `weight` int NOT NULL DEFAULT 100 COMMENT '分流权重：同一方向和类型的启用通道之间按权重比例分配短信' AFTER `country_key_id`,
    ADD COLUMN `owner_user_uid` varchar(19) NOT NULL COMMENT '负责人账号UID' AFTER `weight`,
    DROP INDEX `idx_tb_srm_channel_type`,
    ADD INDEX `idx_tb_srm_channel_country_type` (`country_key_id`, `type`),
    ADD INDEX `idx_tb_srm_channel_owner_user_uid` (`owner_user_uid`);

DROP TABLE IF EXISTS `tb_srm_channel_route`;
