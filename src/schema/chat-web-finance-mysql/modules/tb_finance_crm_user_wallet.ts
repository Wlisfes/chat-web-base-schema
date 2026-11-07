import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'
import { BigintNumberTransformer, DataBaseAdapter, DataBaseDto, defineEnumMetadata } from '@/utils'

export enum TbFinanceCrmUserWalletColumn {
    KEY_ID = 'key_id',
    USER_KEY_ID = 'user_key_id',
    CURRENCY = 'currency',
    PAY_MODE = 'pay_mode',
    BALANCE = 'balance',
    CREDIT = 'credit',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 客户付款模式：取值与 CRM tb_crm_user.pay_mode 一致，两边各声明一份，取值改动时要同步。 */
export enum TbFinanceCrmUserWalletPayMode {
    POSTPAID = 'postpaid',
    PREPAID = 'prepaid'
}

export const TbFinanceCrmUserWalletPayModeDefinition = defineEnumMetadata(TbFinanceCrmUserWalletPayMode, '付款模式', {
    [TbFinanceCrmUserWalletPayMode.POSTPAID]: { label: '后付', description: '账期后付费；余额为负表示应付', type: 'orange' },
    [TbFinanceCrmUserWalletPayMode.PREPAID]: { label: '预付', description: '账户预付费；余额为负表示欠费', type: 'cyan' }
})

export class TbFinanceCrmUserWalletDto extends DataBaseDto {
    @ApiProperty({ description: '客户主键：CRM 客户主键，一个客户一个钱包', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '客户主键必须是整数' })
    @Min(1, { message: '客户主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '财务币种编码', example: 'USD' })
    @IsString({ message: '财务币种编码必须是字符串' })
    @IsNotEmpty({ message: '财务币种编码必填' })
    @MaxLength(16, { message: '财务币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({
        description: TbFinanceCrmUserWalletPayModeDefinition.comment,
        enum: TbFinanceCrmUserWalletPayMode,
        enumName: 'TbFinanceCrmUserWalletPayMode'
    })
    @IsEnum(TbFinanceCrmUserWalletPayMode, { message: '付款模式格式错误' })
    payMode: TbFinanceCrmUserWalletPayMode

    @ApiProperty({ description: '余额（放大百万倍存储）：按钱包币种计', example: 0 })
    balance: number

    @ApiProperty({ description: '信用额度（放大百万倍存储）：按钱包币种计', example: 0 })
    credit: number
}

/**
 * 客户钱包：Finance 是客户余额的权威来源，按 CRM 客户主键一个钱包。
 * 计费事件落账时自动创建；预付、后付共用同一余额，扣成负数分别表示欠费、应付。
 */
@Index('uk_tb_finance_crm_user_wallet_user_key_id', ['userKeyId'], { unique: true })
@Index('idx_tb_finance_crm_user_wallet_currency', ['currency'])
@Entity({ name: 'tb_finance_crm_user_wallet', comment: '财务客户钱包表' })
export class TbFinanceCrmUserWallet extends DataBaseAdapter {
    @Column({ name: TbFinanceCrmUserWalletColumn.USER_KEY_ID, type: 'int', nullable: false, comment: '客户主键：CRM 客户主键' })
    userKeyId: number

    @Column({ name: TbFinanceCrmUserWalletColumn.CURRENCY, type: 'varchar', length: 16, nullable: false, comment: '财务币种编码' })
    currency: string

    @Column({
        name: TbFinanceCrmUserWalletColumn.PAY_MODE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceCrmUserWalletPayModeDefinition.comment
    })
    payMode: TbFinanceCrmUserWalletPayMode

    @Column({
        name: TbFinanceCrmUserWalletColumn.BALANCE,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '余额（放大百万倍存储）：按钱包币种计'
    })
    balance: number

    @Column({
        name: TbFinanceCrmUserWalletColumn.CREDIT,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        default: 0,
        comment: '信用额度（放大百万倍存储）：按钱包币种计'
    })
    credit: number
}
