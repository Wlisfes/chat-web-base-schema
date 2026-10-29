import { Column, Entity, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { BigintNumberTransformer, DataBaseAdapter, DataBaseDto, DateWithColumn, defineEnumMetadata } from '@/utils'

export enum TbFinanceSrmUserDeductColumn {
    KEY_ID = 'key_id',
    EVENT_ID = 'event_id',
    USER_KEY_ID = 'user_key_id',
    CURRENCY = 'currency',
    BIZ_TYPE = 'biz_type',
    AMOUNT = 'amount',
    BUSINESS_ID = 'business_id',
    OCCURRED_TIME = 'occurred_time',
    CREATE_TIME = 'create_time',
    MODIFY_TIME = 'modify_time'
}

/** 扣费来源。充值不进这张表。 */
export enum TbFinanceSrmUserDeductBizType {
    SMS = 'sms'
}

export const TbFinanceSrmUserDeductBizTypeDefinition = defineEnumMetadata(TbFinanceSrmUserDeductBizType, '扣费来源', {
    [TbFinanceSrmUserDeductBizType.SMS]: { label: '短信扣费', description: '短信发送扣减钱包余额', type: 'info' }
})

export class TbFinanceSrmUserDeductDto extends DataBaseDto {
    @ApiProperty({ description: '业务事件ID：同一笔扣费只记一次', example: 'sms:c2f45ce1-30a5-4d14-b0d7-cb76b10f0e21' })
    @IsString({ message: '业务事件ID必须是字符串' })
    @IsNotEmpty({ message: '业务事件ID必填' })
    @MaxLength(64, { message: '业务事件ID长度不能超过64位' })
    eventId: string

    @ApiProperty({ description: '供应商主键：SRM 供应商主键', example: 10241000 })
    @Type(() => Number)
    @IsInt({ message: '供应商主键必须是整数' })
    @Min(1, { message: '供应商主键必须大于0' })
    userKeyId: number

    @ApiProperty({ description: '财务币种编码：本次扣费使用的钱包币种', example: 'USD' })
    @IsString({ message: '财务币种编码必须是字符串' })
    @IsNotEmpty({ message: '财务币种编码必填' })
    @MaxLength(16, { message: '财务币种编码长度不能超过16位' })
    currency: string

    @ApiProperty({
        description: TbFinanceSrmUserDeductBizTypeDefinition.comment,
        enum: TbFinanceSrmUserDeductBizType,
        enumName: 'TbFinanceSrmUserDeductBizType'
    })
    @IsEnum(TbFinanceSrmUserDeductBizType, { message: '扣费来源格式错误' })
    bizType: TbFinanceSrmUserDeductBizType

    @ApiProperty({ description: '扣费金额（放大百万倍存储）：按钱包币种计，只记正数', example: 54100 })
    amount: number

    @ApiProperty({ description: '业务ID：短信扣费为短信ID', example: 'c2f45ce1-30a5-4d14-b0d7-cb76b10f0e21', required: false })
    @IsOptional()
    @IsString({ message: '业务ID必须是字符串' })
    @MaxLength(64, { message: '业务ID长度不能超过64位' })
    businessId: string

    @ApiProperty({ description: '扣费发生时间', example: '2026-10-29 18:00:00' })
    occurredTime: Date
}

/**
 * 供应商扣费记录：只记扣费，不记充值。
 * eventId 保证同一笔扣费只记一次；amount 只记正数，按钱包币种计。
 */
@Index('uk_tb_finance_srm_user_deduct_event_id', ['eventId'], { unique: true })
@Index('idx_tb_finance_srm_user_deduct_user_occurred_time', ['userKeyId', 'occurredTime'])
@Index('idx_tb_finance_srm_user_deduct_biz_business', ['bizType', 'businessId'])
@Entity({ name: 'tb_finance_srm_user_deduct', comment: '财务供应商扣费记录表' })
export class TbFinanceSrmUserDeduct extends DataBaseAdapter {
    @Column({
        name: TbFinanceSrmUserDeductColumn.EVENT_ID,
        type: 'varchar',
        length: 64,
        nullable: false,
        comment: '业务事件ID：同一笔扣费只记一次'
    })
    eventId: string

    @Column({ name: TbFinanceSrmUserDeductColumn.USER_KEY_ID, type: 'int', nullable: false, comment: '供应商主键：SRM 供应商主键' })
    userKeyId: number

    @Column({
        name: TbFinanceSrmUserDeductColumn.CURRENCY,
        type: 'varchar',
        length: 16,
        nullable: false,
        comment: '财务币种编码：本次扣费使用的钱包币种'
    })
    currency: string

    @Column({
        name: TbFinanceSrmUserDeductColumn.BIZ_TYPE,
        type: 'varchar',
        length: 32,
        nullable: false,
        comment: TbFinanceSrmUserDeductBizTypeDefinition.comment
    })
    bizType: TbFinanceSrmUserDeductBizType

    @Column({
        name: TbFinanceSrmUserDeductColumn.AMOUNT,
        type: 'bigint',
        transformer: BigintNumberTransformer,
        nullable: false,
        comment: '扣费金额（放大百万倍存储）：按钱包币种计，只记正数'
    })
    amount: number

    @Column({
        name: TbFinanceSrmUserDeductColumn.BUSINESS_ID,
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: '业务ID：短信扣费为短信ID'
    })
    businessId: string

    @DateWithColumn(Column, {
        name: TbFinanceSrmUserDeductColumn.OCCURRED_TIME,
        type: 'datetime',
        precision: 3,
        nullable: false,
        comment: '扣费发生时间'
    })
    occurredTime: Date
}
