import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { Omix } from '@/types'
import cookieParser from 'cookie-parser'
import express from 'express'
export interface SetupOptions extends Omix {
    title: string
    description: string
    port: number | string
    NODE_ENV: string
}

/**文档挂载**/
export async function setupSwagger(app: NestExpressApplication, options: SetupOptions) {
    if (typeof options.NODE_ENV !== 'string' || !options.NODE_ENV.trim()) {
        throw new Error('NODE_ENV 必须配置为非空字符串')
    }
    /**允许跨域**/
    app.enableCors()
    /**解析body参数**/
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    /**全局注册验证管道**/
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    /**获取配置服务**/
    const configService = app.get(ConfigService)
    /**初始化文档**/
    const builder = new DocumentBuilder()
        .setTitle(options.title)
        .setDescription(options.description)
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'apiKey', in: 'header', name: 'authorization' }, 'authorization')
        .build()
    const document = SwaggerModule.createDocument(app, builder)
    SwaggerModule.setup('/api/swagger', app, document, {
        customSiteTitle: options.title,
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            defaultModelExpandDepth: 5,
            filter: true,
            docExpansion: 'none'
        }
    })
    const port = Number(options.port)
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new Error('PORT 必须是 1-65535 之间的整数')
    }
    return await app.listen(port).then(async () => {
        return {
            vm: app,
            configService,
            port: (app.getHttpServer().address() as Omix<{ port: number }>).port,
            NODE_ENV: options.NODE_ENV
        }
    })
}
