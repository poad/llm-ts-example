
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { LangChainInstrumentation } from '@arizeai/openinference-instrumentation-langchain';
import * as lcCallbackManager from '@langchain/core/callbacks/manager';
import { resourceFromAttributes } from '@opentelemetry/resources';

if (process.env.ENABLED_OPENINFERENCE_TELEMETRY === 'true') {
  // For troubleshooting, set the log level to DiagLogLevel.DEBUG
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const provider = new NodeTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(
      new OTLPTraceExporter({

        url: process.env.COLLECTOR_ENDPOINT ?? 'http://localhost:6006/v1/traces',
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
