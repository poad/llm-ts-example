
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
  Span,
} from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { LangChainInstrumentation } from '@arizeai/openinference-instrumentation-langchain';
import * as lcCallbackManager from '@langchain/core/callbacks/manager';
import { resourceFromAttributes } from '@opentelemetry/resources';

if (process.env.ENABLED_OPENINFERENCE_TELEMETRY === 'true') {
  // For troubleshooting, set the log level to DiagLogLevel.DEBUG
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);


  class FilteringSpanProcessor extends SimpleSpanProcessor {
    onEnd(span: Span) {
      const outputValue = span.attributes['output.value'];

      // 文字列チェックと簡易フィルタ
      if (!outputValue || typeof outputValue !== 'string' || !outputValue.includes('HumanMessage')) {
        return super.onEnd(span);
      }

      try {
        const parsed = JSON.parse(outputValue);

        // messagesが存在する場合のみ処理
        if (parsed.messages && Array.isArray(parsed.messages)) {
          // HumanMessage以外のみを残す
          parsed.messages = parsed.messages.filter((msg: { id?: string[] }) => {
            return !(msg.id && msg.id.includes('HumanMessage'));
          });

          span.attributes['output.value'] = JSON.stringify(parsed);
        }
      } catch {
        // パースエラーは無視
      }

      super.onEnd(span);
    }
  }

  const provider = new NodeTracerProvider({
    spanProcessors: [new FilteringSpanProcessor(
      new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:6006/v1/traces',
        headers: {
          'x-api-key': process.env.OTEL_EXPORTER_OTLP_API_KEY ?? '',
          'Langsmith-Project': 'default',
        },
      }),
    ),
    ],
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'chat-service',
    }),
  });

  registerInstrumentations({
    instrumentations: [],
  });

  // LangChain must be manually instrumented as it doesn't have a traditional module structure
  const lcInstrumentation = new LangChainInstrumentation();
  lcInstrumentation.manuallyInstrument(lcCallbackManager);

  provider.register();

  console.log('👀 OpenInference initialized');
}
