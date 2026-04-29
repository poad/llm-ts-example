import { logger } from './logging.js';
import * as opentelemetry from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { LangChainInstrumentation } from '@arizeai/openinference-instrumentation-langchain';
import * as lcCallbackManager from '@langchain/core/callbacks/manager';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';

import { logs } from '@opentelemetry/api-logs';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';

import type { Exporters } from './otel/otel-exporters.js';
import { Provider, createExporters } from './otel/otel-exporters.js';
import dotenv from '@dotenvx/dotenvx';

dotenv.config({ path: ['.env', '.env.test'], override: true });

const initialize = async (): Promise<Exporters & { flush?: () => Promise<void> }> => {

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

  logger.info('begin initialize opentelemetry exporters');

  const exporters = await createExporters(
    process.env.OTEL_PROVIDER ?? Provider.PROVIDER_DATABRICS,
    { useGrpc: process.env.ENABLED_OTEL_EXPORTER_OTLP_GRPC === 'true' });

  const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'agent-langchain',
      [ATTR_SERVICE_VERSION]: '0.1.0',
      ['openinference.project.name']: 'default',
    }),
  );

  if (exporters.trace) {
    logger.info('Enable tracing');

    const provider = new NodeTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(
        exporters.trace,
      ),
      ],
      resource,
    });

    registerInstrumentations({
      instrumentations: [],
    });

    const lcInstrumentation = new LangChainInstrumentation();
    lcInstrumentation.manuallyInstrument(lcCallbackManager);


    registerInstrumentations({
      instrumentations: [
        getNodeAutoInstrumentations({
        }),
      ],
    });
    provider.register();
  }

  if (exporters.metric) {
    logger.info('Enable metrics');

    const metricReader = new PeriodicExportingMetricReader({
      exporter: exporters.metric,
      exportIntervalMillis: 10000,
    });

    const myServiceMeterProvider = new MeterProvider({
      resource: resource,
      readers: [metricReader],
    });

    opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
  }

  if (exporters.logs) {
    logger.info('Enable logs');

    const loggerProvider = new LoggerProvider({
      processors: [
        new SimpleLogRecordProcessor(
          exporters.logs,
        ),
      ],
    });

    logs.setGlobalLoggerProvider(loggerProvider);
  }

  logger.info('👀 OpenInference initialized');

  return {
    ...exporters,
    flush: async () => {
      await exporters.trace?.forceFlush?.();
      await exporters.logs?.forceFlush?.();
      await exporters.metric?.forceFlush?.();
    }
  };
}

export { initialize };
