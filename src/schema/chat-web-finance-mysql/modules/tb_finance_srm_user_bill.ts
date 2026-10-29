import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'
import { BigintNumberTransformer, DataBaseAdapter, DataBaseDto, DateWithColumn, defineEnumMetadata } from '@/utils'
import { TbFinanceSrmUserWalletPayMode, TbFinanceSrmUserWalletPayModeDefinition } from './tb_finance_srm_user_wallet'

export enum TbFinanceSrmUserBillColumn {
    KEY_ID = 'key_id',
    EVENT_ID = 'event_id',
    MSG_ID = 'msg_id',
    USER_KEY_ID = 'user_key_id',
    SIMBANK_KEY_ID = 'simbank_key_id',
    PORT_KEY_ID = 'port_key_id',
    PAY_MODE = 'pay_mode',
    TRIGGER = 'trigger',
    SEGMENTS = 'segments',
    COST_USD = 'cost_usd',
    BALANCE_USD = 'balance_usd',
    OCCURRED_TIME = 'occurred_time',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 计费触发节点：取值与 SRM tb_srm_billing_outbox.trigger 一致，两边各声明一份，取值改动时要同步。 */
export enum TbFinanceSrmUserBillTrigger {
    SUBMITTED = 'submitted',
    SUCCESS = 'success'
}

export const TbFinanceSrmUserBillTriggerDefinition = defineEnumMetadata(TbFinanceSrmUserBillTrigger, '计费触发节点', {
    [TbFinanceSrmUserBillTrigger.SUBMITTED]: { label: '提交设备', description: '预付供应商：短信提交到设备即计费', type: 'info' },
    [TbFinanceSrmUserBillTrigger.SUCCESS]: { label: '发送成功', description: '后付供应商：设备发送成功才计费', type: 'success' }
})

export class TbFinanceSrmUserBillDto extends DataBaseDto {
    @ApiProperty({
        description: '计费事件ID：msgId + 触发节点，同一事件只落账一次',
        example: 'c2f45ce1-30a5-4d14-b0d7-cb76b10f0e21:submitted'
    })
    @IsString({ message: '计费事件ID必须是字符串' })
    @IsNotEmpty({ message: '计费事件ID必填' })
    @MaxLength(64, { message: '计费事件ID长度不能超过64位' })
    eventId: string

    @ApiProperty({ description: '短信ID：同一条短信只计费一次', example: 'c2f45ce1-30a5-4d14-b0d7-cb76b10f0e21' })
    @IsString({ message: '短信ID必须是字符串' })
    @MaxLength(36, { message: '短信ID长度不能超过36位' })
    msgId: string

    @ApiProperty({ description: '供应商主键：SRM 供应商主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '设备主键：SRM SIMBANK 设备主键', example: 100201 })
    simbankKeyId: number

    @ApiProperty({ description: '端口主键：SRM SIMBANK 端口主键', example: 1002401 })
    portKeyId: number

    @ApiProperty({
        description: TbFinanceSrmUserWalletPayModeDefinition.comment,
        enum: TbFinanceSrmUserWalletPayMode,
        enumName: 'TbFinanceSrmUserWalletPayMode'
    })
    @IsEnum(TbFinanceSrmUserWalletPayMode, { message: '付款模式格式错误' })
    payMode: TbFinanceSrmUserWalletPayMode

    @ApiProperty({
        description: TbFinanceSrmUserBillTriggerDefinition.comment,
        enum: TbFinanceSrmUserBillTrigger,
        enumName: 'TbFinanceSrmUserBillTrigger'
    })
    @IsEnum(TbFinanceSrmUserBillTrigger, { message: '计费触发节点格式错误' })
    trigger: TbFinanceSrmUserBillTrigger

    @ApiProperty({ description: '计费段数', example: 1 })
    segments: number

    @ApiProperty({ description: '本次计费成本 USD（放大百万倍存储）', example: 54100 })
    costUsd: number

    @ApiProperty({ description: '落账后供应商 USD 余额（放大百万倍存储）', example: -54100 })
    balanceUsd: number

    @ApiProperty({ description: '计费发生时间：短信提交到设备或发送成功的时间', example: '2026-10-28 10:00:00' })
    occurredTime: Date
}

/**
 * 供应商计费流水：Finance 消费 Dispatch 发布的计费事件后写入，一条短信只计费一次（msgId 唯一）。
 * 流水与账户余额在同一事务中写入，balance_usd 记录落账后的余额，便于对账。
 */
@Index('uk_tb_finance_srm_user_bill_event_id', ['eventId'], { unique: true })
@Index('uk_tb_finance_srm_user_bill_msg_id', ['msgId'], { unique: true })
@Index('idx_tb_finance_srm_user_bill_user_occurred_time', ['userKeyId', 'occurredTime'])
@Entity({ name: 'tb_finance_srm_user_bill', comment: '财务供应商计费流水表' })
export class TbFinanceSrmUserBill extends DataBaseAdapter {
    @Column({
        name: TbFinanceSrmUserBillColumn.EVENT_ID,
        type: 'varchar',
        length: 64,
        nullable: false,
        comment: '计费事件ID：msgId + 触发节点'
    })
    eventId: string

    @Column({ name: TbFinanceSrmUserBillColumn.MSG_ID, type: 'varchar', length: 36, nullable: false, comment: '短信ID' })
    msgId: string

    @Column({ name: TbFinanceSrmUserBillColumn.USER_KEY_ID, type: 'int', nullable: false, comment: '供应商主键：SRM 供应商主键' })
    userKeyId: number

    @Column({ name: TbFinanceSrmUserBillColumn.SIMBANK_KEY_ID, type: 'int', nullable: false, comment: '设备主键：SRM SIMBANK 设备主键' })
    simbankKeyId: number

    @Column({ name: TbFinanceSrmUserBillColumn.PORT_KEY_ID, type: 'int', nullable: false, comment: '端口主键：SRM SIMBANK 端口主键' })
    portKeyId: number

    @Column({
        name: TbFinanceSrmUserBillColumn.PAY_MODE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceSrmUserWalletPayModeDefinition.comment
    })
    payMode: TbFinanceSrmUserWalletPayMode

    @Column({
        name: TbFinanceSrmUserBillColumn.TRIGGER,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceSrmUserBillTriggerDefinition.comment
    })
    trigger: TbFinanceSrmUserBillTrigger

    @Column({ name: TbFinanceSrmUserBillColumn.SEGMENTS, type: 'int', nullable: false, default: 1, comment: '计费段数' })
    segments: number

    @Column({
        name: TbFinanceSrmUserBillColumn.COST_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '本次计费成本 USD（放大百万倍存储）'
    })
    costUsd: number

    @Column({
        name: TbFinanceSrmUserBillColumn.BALANCE_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '落账后供应商 USD 余额（放大百万倍存储）'
    })
    balanceUsd: number

    @DateWithColumn(Column, {
        name: TbFinanceSrmUserBillColumn.OCCURRED_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '计费发生时间'
    })
    occurredTime: Date
}
