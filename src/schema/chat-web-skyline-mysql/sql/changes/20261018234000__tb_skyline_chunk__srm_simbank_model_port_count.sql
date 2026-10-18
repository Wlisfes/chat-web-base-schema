-- 设备型号枚举 CHUNK_SRM_SIMBANK_MODEL 的扩展配置补充端口数 json.total：T32=32、T64=64、T128=128、T256=256。
-- 回滚：UPDATE `tb_skyline_chunk` SET `json` = '{}' WHERE `type` = 'CHUNK_SRM_SIMBANK_MODEL' AND `name` IN ('T32', 'T64', 'T128', 'T256');

UPDATE `tb_skyline_chunk`
SET `json` = CASE `name`
        WHEN 'T32' THEN '{"total":32}'
        WHEN 'T64' THEN '{"total":64}'
        WHEN 'T128' THEN '{"total":128}'
        WHEN 'T256' THEN '{"total":256}'
    END
WHERE `type` = 'CHUNK_SRM_SIMBANK_MODEL'
  AND `name` IN ('T32', 'T64', 'T128', 'T256');
