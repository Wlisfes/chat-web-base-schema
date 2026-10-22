-- 路由别名改为创建时自动生成：SK + 归属人工号 + 路由类型 + 分段序号，例如 SK1233MRKTA001。
-- 回滚：ALTER TABLE `tb_srm_route` MODIFY COLUMN `alias` varchar(64) NULL COMMENT '路由别名：自定义的路由简称，全表唯一';

ALTER TABLE `tb_srm_route`
    MODIFY COLUMN `alias` varchar(64) NULL COMMENT '路由别名：创建时按 SK + 归属人工号 + 路由类型 + 分段序号自动生成，全表唯一，创建后不可修改';
