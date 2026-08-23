const test = require('node:test')
const assert = require('node:assert/strict')
const { Get, Module, Post, RequestMethod } = require('@nestjs/common')
const { PATH_METADATA, METHOD_METADATA } = require('@nestjs/common/constants')
const { NestFactory } = require('@nestjs/core')
const { ApiProperty, DECORATORS, DocumentBuilder, SwaggerModule } = require('@nestjs/swagger')
const { ApiServiceDecorator, ApifoxController } = require('../dist/src/decorator')

class RequestDto {}
ApiProperty({ description: '名称', example: '测试名称' })(RequestDto.prototype, 'name')

class ResponseDto {}
ApiProperty({ description: '主键', example: 1 })(ResponseDto.prototype, 'keyId')

function decorateMethod(controller, methodName, decorator) {
    const descriptor = Object.getOwnPropertyDescriptor(controller.prototype, methodName)
    decorator(controller.prototype, methodName, descriptor)
}

test('ApifoxController 聚合控制器路径、标签和 Bearer 鉴权', () => {
    class TestController {}
    ApifoxController('测试分组', 'test', { bearerAuth: true })(TestController)

    assert.equal(Reflect.getMetadata(PATH_METADATA, TestController), 'test')
    assert.deepEqual(Reflect.getMetadata(DECORATORS.API_TAGS, TestController), ['测试分组'])
    assert.deepEqual(Reflect.getMetadata(DECORATORS.API_SECURITY, TestController), [{ authorization: [] }])
})

test('ApiServiceDecorator 生成 body 请求与统一 DTO 响应 Schema', () => {
    class TestController {
        create() {}
    }
    decorateMethod(
        TestController,
        'create',
        ApiServiceDecorator(Post('create'), {
            operation: { summary: '创建测试数据' },
            request: { source: 'body', type: RequestDto },
            response: { type: ResponseDto }
        })
    )
    const method = TestController.prototype.create
    const parameters = Reflect.getMetadata(DECORATORS.API_PARAMETERS, method)
    const responses = Reflect.getMetadata(DECORATORS.API_RESPONSE, method)
    const schema = responses[200].content['application/json'].schema

    assert.equal(Reflect.getMetadata(PATH_METADATA, method), 'create')
    assert.equal(Reflect.getMetadata(METHOD_METADATA, method), RequestMethod.POST)
    assert.equal(parameters[0].in, 'body')
    assert.equal(parameters[0].type, RequestDto)
    assert.equal(schema.allOf[0].$ref, '#/components/schemas/ApiResponseDocumentDto')
    assert.equal(schema.allOf[1].properties.data.$ref, '#/components/schemas/ResponseDto')
})

test('ApiServiceDecorator 支持数组 data 和原始非 JSON 响应', () => {
    class TestController {
        list() {}
        captcha() {}
    }
    decorateMethod(
        TestController,
        'list',
        ApiServiceDecorator(Get('list'), {
            operation: { summary: '获取列表' },
            response: { type: ResponseDto, isArray: true }
        })
    )
    decorateMethod(
        TestController,
        'captcha',
        ApiServiceDecorator(Get('captcha'), {
            operation: { summary: '获取验证码' },
            response: { envelope: false, contentType: 'image/svg+xml', schema: { type: 'string' }, description: 'SVG 图形验证码' }
        })
    )

    const listResponses = Reflect.getMetadata(DECORATORS.API_RESPONSE, TestController.prototype.list)
    const listData = listResponses[200].content['application/json'].schema.allOf[1].properties.data
    const captchaResponses = Reflect.getMetadata(DECORATORS.API_RESPONSE, TestController.prototype.captcha)

    assert.deepEqual(listData, { type: 'array', items: { $ref: '#/components/schemas/ResponseDto' } })
    assert.deepEqual(captchaResponses[200].content['image/svg+xml'].schema, { type: 'string' })
})

test('共享完整字段 DTO 的标量字段均提供类型和示例', async () => {
    const schemaModules = [
        require('../dist/src/schema/chat-web-account-mysql'),
        require('../dist/src/schema/chat-web-finance-mysql'),
        require('../dist/src/schema/chat-web-crm-mysql')
    ]
    const extraModels = schemaModules.flatMap(schemaModule =>
        Object.entries(schemaModule)
            .filter(([name, value]) => name.endsWith('Dto') && typeof value === 'function')
            .map(([, value]) => value)
    )
    class DocumentationModule {}
    Module({})(DocumentationModule)
    const app = await NestFactory.create(DocumentationModule, { logger: false })
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().build(), { extraModels })
    const missingExamples = []

    for (const [schemaName, schema] of Object.entries(document.components.schemas ?? {})) {
        for (const [propertyName, property] of Object.entries(schema.properties ?? {})) {
            assert.ok(property.type || property.$ref || property.allOf || property.oneOf, `${schemaName}.${propertyName} 缺少字段类型`)
            if (
                ['string', 'number', 'integer', 'boolean'].includes(property.type) &&
                property.example === undefined &&
                property.default === undefined &&
                property.enum === undefined
            ) {
                missingExamples.push(`${schemaName}.${propertyName}`)
            }
        }
    }

    await app.close()
    assert.deepEqual(missingExamples, [])
})
