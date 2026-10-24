-- 移除路由归属人，别名改为 LSK + 主键 + 路由类型，例如 LSK1002001-MRKT。已有别名按主键和类型重写。
-- 回滚：ALTER TABLE `tb_srm_route` ADD COLUMN `owner_user_uid` varchar(19) NULL COMMENT '归属人账号UID' AFTER `status`, ADD KEY `idx_tb_srm_route_owner_user_uid` (`owner_user_uid`);
--       别名不恢复旧值。

UPDATE `tb_srm_route`
SET `alias` = CONCAT('LSK', `key_id`, '-', `type`);

ALTER TABLE `tb_srm_route`
    DROP INDEX `idx_tb_srm_route_owner_user_uid`,
    DROP COLUMN `owner_user_uid`,
    MODIFY COLUMN `alias` varchar(64) NULL COMMENT '路由别名：创建后按 LSK + 主键 + 路由类型自动生成，例如 LSK1002001-MRKT，全表唯一，创建后不可修改';
