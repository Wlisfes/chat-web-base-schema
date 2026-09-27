-- 用户组织关系中的岗位名称字段统一使用 post 命名：position_name -> post_name。
-- 回滚：ALTER TABLE `tb_account_user_organization` CHANGE COLUMN `post_name` `position_name` varchar(64) NULL COMMENT '用户在该组织中的岗位名称';

ALTER TABLE `tb_account_user_organization`
    CHANGE COLUMN `position_name` `post_name` varchar(64) NULL COMMENT '用户在该组织中的岗位名称';
