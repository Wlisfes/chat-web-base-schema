import { context, isSpanContextValid, trace } from '@opentelemetry/api'

export interface ActiveTraceContext {
    traceId?: string
    spanId?: string
}

export function getActiveTraceContext(): ActiveTraceContext {
    const spanContext = trace.getSpan(context.active())?.spanContext()
    if (!spanContext || !isSpanContextValid(spanContext)) return {}
    return { traceId: spanContext.traceId, spanId: spanContext.spanId }
}
