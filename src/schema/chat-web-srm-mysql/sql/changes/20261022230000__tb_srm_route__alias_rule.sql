-- 路由别名生成规则改为 LSK + 归属人工号 + 类型 + 分段序号，例如 LSK1233-MRKT-A001。已有别名不改写。
-- 回滚：ALTER TABLE `tb_srm_route` MODIFY COLUMN `alias` varchar(64) NULL COMMENT '路由别名：创建时按 SK + 归属人工号 + 路由类型 + 分段序号自动生成，全表唯一，创建后不可修改';

ALTER TABLE `tb_srm_route`
    MODIFY COLUMN `alias` varchar(64) NULL COMMENT '路由别名：创建时按 LSK + 归属人工号 + 路由类型 + 分段序号自动生成，全表唯一，创建后不可修改';
