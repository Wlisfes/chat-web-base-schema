import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, Min } from 'class-validator'
import { BigintNumberTransformer, DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

export enum TbFinanceSrmUserColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
    PAY_MODE = 'pay_mode',
    BALANCE_USD = 'balance_usd',
    BILLED_USD = 'billed_usd',
    BILL_COUNT = 'bill_count',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 供应商付款模式：取值与 SRM tb_srm_user.pay_mode 一致，两边各声明一份，取值改动时要同步。 */
export enum TbFinanceSrmUserPayMode {
    POSTPAID = 'postpaid',
    PREPAID = 'prepaid'
}

export const TbFinanceSrmUserPayModeDefinition = defineEnumMetadata(TbFinanceSrmUserPayMode, '付款模式', {
    [TbFinanceSrmUserPayMode.POSTPAID]: { label: '后付', description: '账期后付费；余额为负表示应付', type: 'orange' },
    [TbFinanceSrmUserPayMode.PREPAID]: { label: '预付', description: '账户预付费；余额为负表示欠费', type: 'cyan' }
})

export class TbFinanceSrmUserDto extends DataBaseDto {
    @ApiProperty({ description: '供应商主键：SRM 供应商主键，一个供应商一个账户', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    userKeyId: number

    @ApiProperty({
        description: TbFinanceSrmUserPayModeDefinition.comment,
        enum: TbFinanceSrmUserPayMode,
        enumName: 'TbFinanceSrmUserPayMode'
    })
    @IsEnum(TbFinanceSrmUserPayMode, { message: '付款模式格式错误' })
    payMode: TbFinanceSrmUserPayMode

    @ApiProperty({ description: 'USD 余额（放大百万倍存储）：预付为负表示欠费，后付为负表示应付', example: 0 })
    balanceUsd: number

    @ApiProperty({ description: '累计计费成本 USD（放大百万倍存储）', example: 0 })
    billedUsd: number

    @ApiProperty({ description: '累计计费短信条数（按发送记录计，不按计费段数）', example: 0 })
    billCount: number
}

/**
 * 供应商账户：Finance 是供应商余额的权威来源，按 SRM 供应商主键一个账户。
 * 计费事件落账时自动创建；预付、后付共用同一余额，扣成负数分别表示欠费、应付。
 */
@Index('uk_tb_finance_srm_user_user_key_id', ['userKeyId'], { unique: true })
@Entity({ name: 'tb_finance_srm_user', comment: '财务供应商账户表' })
export class TbFinanceSrmUser extends DataBaseAdapter {
    @Column({ name: TbFinanceSrmUserColumn.USER_KEY_ID, type: 'int', nullable: false, comment: '供应商主键：SRM 供应商主键' })
    userKeyId: number

    @Column({
        name: TbFinanceSrmUserColumn.PAY_MODE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceSrmUserPayModeDefinition.comment
    })
    payMode: TbFinanceSrmUserPayMode

    @Column({
        name: TbFinanceSrmUserColumn.BALANCE_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: 'USD 余额（放大百万倍存储）：预付为负表示欠费，后付为负表示应付'
    })
    balanceUsd: number

    @Column({
        name: TbFinanceSrmUserColumn.BILLED_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '累计计费成本 USD（放大百万倍存储）'
    })
    billedUsd: number

    @Column({ name: TbFinanceSrmUserColumn.BILL_COUNT, type: 'int', nullable: false, default: 0, comment: '累计计费短信条数' })
    billCount: number
}
