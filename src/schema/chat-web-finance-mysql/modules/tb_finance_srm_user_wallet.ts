import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'
import { BigintNumberTransformer, DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

export enum TbFinanceSrmUserWalletColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
    CURRENCY = 'currency',
    PAY_MODE = 'pay_mode',
    BALANCE = 'balance',
    BALANCE_USD = 'balance_usd',
    CREDIT = 'credit',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 供应商付款模式：取值与 SRM tb_srm_user.pay_mode 一致，两边各声明一份，取值改动时要同步。 */
export enum TbFinanceSrmUserWalletPayMode {
    POSTPAID = 'postpaid',
    PREPAID = 'prepaid'
}

export const TbFinanceSrmUserWalletPayModeDefinition = defineEnumMetadata(TbFinanceSrmUserWalletPayMode, '付款模式', {
    [TbFinanceSrmUserWalletPayMode.POSTPAID]: { label: '后付', description: '账期后付费；余额为负表示应付', type: 'orange' },
    [TbFinanceSrmUserWalletPayMode.PREPAID]: { label: '预付', description: '账户预付费；余额为负表示欠费', type: 'cyan' }
})

export class TbFinanceSrmUserWalletDto extends DataBaseDto {
    @ApiProperty({ description: '供应商主键：SRM 供应商主键，一个供应商一个钱包', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '财务币种编码', example: 'USD' })
    @IsString({ message: '财务币种编码必须是字符串' })
    @IsNotEmpty({ message: '财务币种编码必填' })
    @MaxLength(16, { message: '财务币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({
        description: TbFinanceSrmUserWalletPayModeDefinition.comment,
        enum: TbFinanceSrmUserWalletPayMode,
        enumName: 'TbFinanceSrmUserWalletPayMode'
    })
    @IsEnum(TbFinanceSrmUserWalletPayMode, { message: '付款模式格式错误' })
    payMode: TbFinanceSrmUserWalletPayMode

    @ApiProperty({ description: '余额（放大百万倍存储）：按钱包币种计', example: 0 })
    balance: number

    @ApiProperty({ description: 'USD 余额（放大百万倍存储）：预付为负表示欠费，后付为负表示应付', example: 0 })
    balanceUsd: number

    @ApiProperty({ description: '信用额度（放大百万倍存储）：按钱包币种计', example: 0 })
    credit: number
}

/**
 * 供应商钱包：Finance 是供应商余额的权威来源，按 SRM 供应商主键一个钱包。
 * 计费事件落账时自动创建；预付、后付共用同一余额，扣成负数分别表示欠费、应付。
 */
@Index('uk_tb_finance_srm_user_wallet_user_key_id', ['userKeyId'], { unique: true })
@Index('idx_tb_finance_srm_user_wallet_currency', ['currency'])
@Entity({ name: 'tb_finance_srm_user_wallet', comment: '财务供应商钱包表' })
export class TbFinanceSrmUserWallet extends DataBaseAdapter {
    @Column({ name: TbFinanceSrmUserWalletColumn.USER_KEY_ID, type: 'int', nullable: false, comment: '供应商主键：SRM 供应商主键' })
    userKeyId: number

    @Column({ name: TbFinanceSrmUserWalletColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '财务币种编码' })
    currency: string

    @Column({
        name: TbFinanceSrmUserWalletColumn.PAY_MODE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceSrmUserWalletPayModeDefinition.comment
    })
    payMode: TbFinanceSrmUserWalletPayMode

    @Column({
        name: TbFinanceSrmUserWalletColumn.BALANCE,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '余额（放大百万倍存储）：按钱包币种计'
    })
    balance: number

    @Column({
        name: TbFinanceSrmUserWalletColumn.BALANCE_USD,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: 'USD 余额（放大百万倍存储）：预付为负表示欠费，后付为负表示应付'
    })
    balanceUsd: number

    @Column({
        name: TbFinanceSrmUserWalletColumn.CREDIT,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '信用额度（放大百万倍存储）：按钱包币种计'
    })
    credit: number
}
