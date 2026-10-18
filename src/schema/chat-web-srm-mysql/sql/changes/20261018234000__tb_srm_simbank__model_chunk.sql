-- 设备型号改为 Skyline 枚举 CHUNK_SRM_SIMBANK_MODEL 的枚举项主键，端口数由型号枚举扩展配置 json.total 决定。
-- 执行前表内无数据，直接变更字段类型。
-- 回滚：ALTER TABLE `tb_srm_simbank` DROP INDEX `idx_tb_srm_simbank_model`, MODIFY COLUMN `model` varchar(64) NOT NULL COMMENT '设备型号', MODIFY COLUMN `port_count` int NOT NULL COMMENT '端口数';

ALTER TABLE `tb_srm_simbank`
    MODIFY COLUMN `model` int NOT NULL COMMENT '设备型号：Skyline 枚举 CHUNK_SRM_SIMBANK_MODEL 的枚举项主键',
    MODIFY COLUMN `port_count` int NOT NULL COMMENT '端口数：由设备型号枚举扩展配置 json.total 决定',
    ADD INDEX `idx_tb_srm_simbank_model` (`model`);
