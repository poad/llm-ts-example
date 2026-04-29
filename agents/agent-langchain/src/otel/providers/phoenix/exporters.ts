import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';

import type { Exporters } from '../../otel-exporters.js';

export const init = (): Exporters => {
  const spaceId = process.env.PHOENIX_SPACE_ID;
  const apiKey = process.env.PHOENIX_API_KEY;

  const enableTracing = process.env.ENABLE_TRACING?.toLocaleLowerCase() === 'true';
  const enableLogs = process.env.ENABLE_LOGS?.toLocaleLowerCase() === 'true';
  const enableMetrics = process.env.ENABLE_METRICS?.toLocaleLowerCase() === 'true';

  const url = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  if (!spaceId || !apiKey) {
    return {
      flush: async () => {
          // pass
      }
    };
  }
  const commonHeaders = {
    'space_id': spaceId,
    'api_key': apiKey,
  };

  const traceEndpoint = `${url}/v1/traces`;
  const traceHeaders = {
    ...commonHeaders,
  };
  const traceExporter = enableTracing ? new OTLPTraceExporter({
    url: traceEndpoint,
    headers: traceHeaders,
  }) : undefined;

  const logsEndpoint = `${url}/v1/logs`;
  const logsHeaders = {
    ...commonHeaders,
  };
  const logsExporter = enableLogs ? new OTLPLogExporter({
    url: logsEndpoint,
    headers: logsHeaders,
  }) : undefined;

  const metricsEndpoint = `${url}/v1/metrics`;
  const metricsHeaders = {
    ...commonHeaders,
  };
  const metricExporter = enableMetrics ? new OTLPMetricExporter({
    url: metricsEndpoint,
    headers: metricsHeaders,
  }) : undefined;

  return {
    trace: traceExporter,
    logs: logsExporter,
    metric: metricExporter,
    flush: async () => {
      await traceExporter?.forceFlush();
      await logsExporter?.forceFlush();
      await metricExporter?.forceFlush();
    },
  };
}
