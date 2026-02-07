if (process.env.ENABLED_OPENINFERENCE_TELEMETRY === 'true') {
  const opentelemetry = await import('@opentelemetry/api');
  const { registerInstrumentations } = await import('@opentelemetry/instrumentation');
  const {
    NodeTracerProvider,
    SimpleSpanProcessor,
  } = await import('@opentelemetry/sdk-trace-node');
  const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-proto');
  const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-proto');
  const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-proto');
  const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
  } = await import('@opentelemetry/semantic-conventions');
  const { diag, DiagConsoleLogger, DiagLogLevel } = await import('@opentelemetry/api');
  const { LangChainInstrumentation } = await import('@arizeai/openinference-instrumentation-langchain');
  const lcCallbackManager = await import('@langchain/core/callbacks/manager');
  const {
    defaultResource,
    resourceFromAttributes,
  } = await import('@opentelemetry/resources');
  const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
  const {
    MeterProvider,
    PeriodicExportingMetricReader,
  } = await import('@opentelemetry/sdk-metrics');

  const { logs } = await import('@opentelemetry/api-logs');
  const {
    LoggerProvider,
    SimpleLogRecordProcessor,
  } = await import('@opentelemetry/sdk-logs');

  // For troubleshooting, set the log level to DiagLogLevel.DEBUG
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const headers = {
    ...(process.env.OTEL_EXPORTER_OTLP_API_KEY ? {
      'x-api-key': process.env.OTEL_EXPORTER_OTLP_API_KEY ?? '',
    } : {}),
    ...(process.env.PHOENIX_API_KEY && process.env.PHOENIX_SPACE_ID ? {
      'space_id': process.env.PHOENIX_SPACE_ID,
      'api_key': process.env.PHOENIX_API_KEY,
    } : {}),
  };
  const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'chat-service',
      [ATTR_SERVICE_VERSION]: '0.1.0',
      ['openinference.project.name']: 'default',
    }),
  );

  if (process.env.OTEL_EXPORTER_OTLP_TRACE_ENDPOINT) {
    const provider = new NodeTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url: process.env.OTEL_EXPORTER_OTLP_TRACE_ENDPOINT,
          headers,
        }),
      ),
      ],
      resource,
    });

    registerInstrumentations({
      instrumentations: [],
    });

    // LangChain must be manually instrumented as it doesn't have a traditional module structure
    const lcInstrumentation = new LangChainInstrumentation();
    lcInstrumentation.manuallyInstrument(lcCallbackManager);


    registerInstrumentations({
      instrumentations: [
        getNodeAutoInstrumentations({
          // '@opentelemetry/instrumentation-aws-lambda': {
          // },
        }),
      ],
    });
    provider.register();
  }

  if (process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT) {
    const metricExporter = new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
      headers,
    });
    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
      exportIntervalMillis: 10000,
    });

    const myServiceMeterProvider = new MeterProvider({
      resource: resource,
      readers: [metricReader],
    });

    // Set this MeterProvider to be global to the app being instrumented.
    opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
  }

  if (process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT) {
    const loggerProvider = new LoggerProvider({
      processors: [
        new SimpleLogRecordProcessor(
          new OTLPLogExporter({
            url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ?? 'http://localhost:6006/v1/logs',
            headers,
          }),
        ),
      ],
    });

    logs.setGlobalLoggerProvider(loggerProvider);
  }

  console.log('👀 OpenInference initialized');
}
