const initialize = async () => {
  if (process.env.ENABLED_OPENINFERENCE_TELEMETRY === 'true') {
    const { registerInstrumentations } = await import('@opentelemetry/instrumentation');
    const {
      NodeTracerProvider,
      SimpleSpanProcessor,
    } = await import('@opentelemetry/sdk-trace-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-proto');
    const { ATTR_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions');
    const { diag, DiagConsoleLogger, DiagLogLevel, metrics } = await import('@opentelemetry/api');
    const { LangChainInstrumentation } = await import('@arizeai/openinference-instrumentation-langchain');
    const lcCallbackManager = await import('@langchain/core/callbacks/manager');
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    const { LoggerProvider, SimpleLogRecordProcessor } = await import('@opentelemetry/sdk-logs');
    const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-proto');
    const api = await import('@opentelemetry/api-logs');
    const { MeterProvider, PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
    const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-proto');

    // For troubleshooting, set the log level to DiagLogLevel.DEBUG
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

    const otlpApiKey = process.env.OTEL_EXPORTER_OTLP_API_KEY;
    const headers = otlpApiKey ? {
      'x-api-key': otlpApiKey,
      'Langsmith-Project': 'default',
    } : undefined;

    const otlpTracesEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? 'http://localhost:6006/v1/traces';
    const provider = new NodeTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url: otlpTracesEndpoint,
          headers,
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

    const otlpLogsEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? 'http://localhost:6006/v1/logs';
    const logExporter = new OTLPLogExporter({
      url: otlpLogsEndpoint, // url is optional and can be omitted - default is http://localhost:4318/v1/logs
      headers, //an optional object containing custom headers to be sent with each request will only work with http
    });
    const loggerProvider = new LoggerProvider({
      resource: resourceFromAttributes({ 'service.name': 'testApp' }),
      processors: [new SimpleLogRecordProcessor(logExporter)],
    });
    api.logs.setGlobalLoggerProvider(loggerProvider);

    const otlpMetricsEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? 'http://localhost:6006/v1/metrics';
    const collectorOptions = {
      url: otlpMetricsEndpoint, // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers,
    };
    const metricExporter = new OTLPMetricExporter(collectorOptions);
    const meterProvider = new MeterProvider({
      readers: [
        new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 1000,
        }),
      ],
    });
    metrics.setGlobalMeterProvider(meterProvider);


    // LangChain must be manually instrumented as it doesn't have a traditional module structure
    const lcInstrumentation = new LangChainInstrumentation();
    lcInstrumentation.manuallyInstrument(lcCallbackManager);

    provider.register();

    console.log('👀 OpenInference initialized');
  };
};

export { initialize };
