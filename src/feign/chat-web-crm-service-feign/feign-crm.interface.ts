import type {
    CrmConsumerPageResponseDto,
    CrmConsumerResponseDto,
    CrmConsumerSelectResponseDto,
    CrmCreateConsumerRequestDto,
    CrmListConsumerRequestDto,
    CrmResolveConsumerRequestDto,
    CrmSelectConsumerRequestDto,
    CrmUpdateConsumerRequestDto,
    CrmUpdateConsumerStatusRequestDto
} from './feign-crm.dto'

export type CrmConsumer = CrmConsumerResponseDto
export type CrmConsumerSelect = CrmConsumerSelectResponseDto
export type CrmConsumerPage = CrmConsumerPageResponseDto
export type CrmCreateConsumerInput = CrmCreateConsumerRequestDto
export type CrmUpdateConsumerInput = CrmUpdateConsumerRequestDto
export type CrmUpdateConsumerStatusInput = CrmUpdateConsumerStatusRequestDto
export type CrmResolveConsumerInput = CrmResolveConsumerRequestDto
export type CrmSelectConsumerInput = CrmSelectConsumerRequestDto
export type CrmListConsumerInput = CrmListConsumerRequestDto

export interface FeignClientCrmImplementation {
    resolveConsumer(authorization: string, keyId: number): Promise<CrmConsumer>
    selectConsumers(authorization: string, name?: string): Promise<CrmConsumerSelect[]>
    createConsumer(authorization: string, input: CrmCreateConsumerInput): Promise<CrmConsumer>
    updateConsumer(authorization: string, input: CrmUpdateConsumerInput): Promise<CrmConsumer>
    updateConsumerStatus(authorization: string, input: CrmUpdateConsumerStatusInput): Promise<CrmConsumer>
    columnConsumers(authorization: string, input: CrmListConsumerInput): Promise<CrmConsumerPage>
}
