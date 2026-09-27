-- 账号职位枚举更名为岗位：类型编码 CHUNK_ACCOUNT_POSITION -> CHUNK_ACCOUNT_POST，分类名称同步改为岗位；已更名的环境重复执行不产生变化。
-- 回滚：将 tb_skyline_chunk_module / tb_skyline_chunk 中 CHUNK_ACCOUNT_POST 改回 CHUNK_ACCOUNT_POSITION，分类名称改回“职位”、备注改回“账号职位”。

UPDATE `tb_skyline_chunk_module`
SET `type` = 'CHUNK_ACCOUNT_POST',
    `name` = '岗位',
    `remark` = '账号岗位'
WHERE `module` = 'CHUNK_SYSTEM'
  AND `type` = 'CHUNK_ACCOUNT_POSITION';

UPDATE `tb_skyline_chunk`
SET `type` = 'CHUNK_ACCOUNT_POST'
WHERE `module` = 'CHUNK_SYSTEM'
  AND `type` = 'CHUNK_ACCOUNT_POSITION';
