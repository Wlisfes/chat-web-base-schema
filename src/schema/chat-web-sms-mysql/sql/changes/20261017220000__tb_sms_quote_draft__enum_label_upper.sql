-- 报价草稿来源、状态枚举标签改为英文大写，同步列注释（仅修改注释，不影响数据）。
-- 回滚：把 COMMENT 恢复为 '报价来源：addition=新增（本次新增的国家或地区报价）；existing=已有（从现有有效报价复制）' / '报价草稿状态：deleted=已删除（草稿已软删除，可恢复，不参与预览和发布）；enable=正常（草稿参与预览和发布）'。

ALTER TABLE `tb_sms_quote_draft`
    MODIFY COLUMN `source` varchar(32) NOT NULL COMMENT '报价来源：addition=NEW（本次新增的国家或地区报价）；existing=CURRENT（从现有有效报价复制）',
    MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '报价草稿状态：deleted=DELETED（草稿已软删除，可恢复，不参与预览和发布）；enable=ENABLE（草稿参与预览和发布）';
