-- 枚举分类主键改为从 1000 起号：职位分类种子数据由 1023000 调整为 1000，后续新增数据从 1001 开始自增。
-- 子表 tb_skyline_chunk 通过 module、type 关联本表，不引用 key_id，调整主键不影响子表数据。
-- 回滚：UPDATE `tb_skyline_chunk_module` SET `key_id` = 1023000 WHERE `key_id` = 1000 AND `module` = 'CHUNK_SYSTEM' AND `type` = 'CHUNK_ACCOUNT_POSITION';
--       ALTER TABLE `tb_skyline_chunk_module` AUTO_INCREMENT = 1023001;

UPDATE `tb_skyline_chunk_module`
SET `key_id` = 1000
WHERE `key_id` = 1023000
  AND `module` = 'CHUNK_SYSTEM'
  AND `type` = 'CHUNK_ACCOUNT_POSITION'
  AND NOT EXISTS (
        SELECT 1
        FROM (SELECT `key_id` FROM `tb_skyline_chunk_module` WHERE `key_id` = 1000) AS `occupied`
  );

-- InnoDB 不允许把 AUTO_INCREMENT 设置到现有最大主键以下；若仍有更大的主键，MySQL 会自动取 MAX(key_id) + 1。
ALTER TABLE `tb_skyline_chunk_module` AUTO_INCREMENT = 1001;
