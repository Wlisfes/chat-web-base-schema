-- 供应商账号密码只存哈希。未传密码时使用默认密码 123456 的 scrypt 摘要，算法与 Skyline PasswordService 一致。
-- 回滚：ALTER TABLE `tb_srm_user` DROP COLUMN `password`;

ALTER TABLE `tb_srm_user`
    ADD COLUMN `password` varchar(255) NOT NULL DEFAULT 'scrypt-v1$16384$8$1$wf9kkcyZ-RJEMAv3HlkV0g$BQqzasPKIcOSU31LTuM3V04lrSXyeKmRaFncG1llmZI-H75GyEE957CXuB6aLyb5v4qlGzSdH660C68_q4-XzQ' COMMENT '密码哈希：未设置时为默认密码 123456 的摘要' AFTER `email`;
