-- 报价草稿新增软删除状态：删除后可恢复，移除才物理删除；已删除草稿不参与预览和发布。
-- 回滚：ALTER TABLE `tb_sms_quote_draft` DROP INDEX `idx_tb_sms_quote_draft_batch_status`, DROP COLUMN `status`;

ALTER TABLE `tb_sms_quote_draft`
    ADD COLUMN `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '报价草稿状态：deleted=已删除（草稿已软删除，可恢复，不参与预览和发布）；enable=正常（草稿参与预览和发布）' AFTER `source`,
    ADD KEY `idx_tb_sms_quote_draft_batch_status` (`draft_batch_id`, `status`);
