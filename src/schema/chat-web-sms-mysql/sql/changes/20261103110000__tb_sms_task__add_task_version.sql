-- 短信任务增加已入队版本：发布成功后写入，避免每小时扫描重复推送同一版本。
-- 回滚：ALTER TABLE `tb_sms_task` DROP COLUMN `task_version`;

ALTER TABLE `tb_sms_task`
    ADD COLUMN `task_version` int NULL COMMENT '已入队版本：等于 version 表示当前版本已进入短信任务队列；为空或小于 version 表示尚未入队' AFTER `version`;
