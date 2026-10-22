-- 通道别名生成规则改为 TSK + 归属人工号 + 类型 + 分段序号，例如 TSK1233-MRKT-A001。已有别名不改写。
-- 回滚：ALTER TABLE `tb_srm_channel` MODIFY COLUMN `alias` varchar(32) NOT NULL COMMENT '通道别名：按 创建人工号-方向MCC-类型-序号 自动生成，全表唯一，创建后不可修改，用于队列命名';

ALTER TABLE `tb_srm_channel`
    MODIFY COLUMN `alias` varchar(32) NOT NULL COMMENT '通道别名：创建时按 TSK + 归属人工号 + 类型 + 分段序号自动生成，全表唯一，创建后不可修改，用于队列命名';
