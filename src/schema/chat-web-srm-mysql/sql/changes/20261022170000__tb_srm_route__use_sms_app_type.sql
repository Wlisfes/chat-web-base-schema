-- 路由 type 改为本地路由类型：MRKT=营销路由、NTFY=通知路由、SOTP=OTP路由。取值与短信应用类型一致，不引用短信枚举。不再使用 general/targeted。
-- 已有 general/targeted 无法对应到短信类型，本脚本不改历史取值，需手工改为 MRKT、NTFY 或 SOTP。
-- 回滚：ALTER TABLE `tb_srm_route` MODIFY COLUMN `type` varchar(32) NOT NULL DEFAULT 'general' COMMENT '路由类型：general=通用路由（不绑定短信应用；未绑定路由的短信应用，以及定向路由没有可用通道时，按优先级依次使用）；targeted=定向路由（只供绑定的短信应用使用，没有可用通道时回落到通用路由）', MODIFY COLUMN `priority` int NOT NULL DEFAULT 1 COMMENT '优先级：通用路由按优先级从小到大依次尝试，1 最优先，最大 100', MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由状态：disable=停用（路由不参与选路，绑定该路由的短信应用回落到通用路由）；enable=启用（路由参与选路）';

ALTER TABLE `tb_srm_route`
    MODIFY COLUMN `type` varchar(32) NOT NULL COMMENT '路由类型：MRKT=营销路由（用于营销推广内容）；NTFY=通知路由（用于业务通知内容）；SOTP=OTP路由（用于一次性验证码）',
    MODIFY COLUMN `priority` int NOT NULL DEFAULT 1 COMMENT '优先级：同类型路由按优先级从小到大依次尝试，1 最优先，最大 100',
    MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'enable' COMMENT '路由状态：disable=停用（路由不参与选路，绑定该路由的短信应用回落到同类型路由）；enable=启用（路由参与选路）';
