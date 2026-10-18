-- 设备表端口数字段 port_count 更名为 total（与设备型号枚举扩展配置 json.total 保持一致），主键从 100201 开始自增。
-- 执行前表内无数据。
-- 回滚：ALTER TABLE `tb_srm_simbank` RENAME COLUMN `total` TO `port_count`, AUTO_INCREMENT = 1;

ALTER TABLE `tb_srm_simbank`
    RENAME COLUMN `port_count` TO `total`,
    AUTO_INCREMENT = 100201;
