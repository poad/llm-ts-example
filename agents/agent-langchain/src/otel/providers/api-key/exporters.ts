import { Metadata } from '@grpc/grpc-js';

import * as grpcTraceing from '@opentelemetry/exporter-trace-otlp-grpc';
import * as grpcLogs from '@opentelemetry/exporter-logs-otlp-grpc';
import * as grpcMetrics from '@opentelemetry/exporter-metrics-otlp-grpc';

import * as httpTraceing from '@opentelemetry/exporter-trace-otlp-proto';
import * as httpLogs from '@opentelemetry/exporter-logs-otlp-proto';
import * as httpMetrics from '@opentelemetry/exporter-metrics-otlp-proto';

import { Exporters } from '../../otel-exporters.js';

export const init = async ({ useGrpc }: { useGrpc: boolean }): Promise<Exporters> => {
  const apiKey = process.env.OTEL_EXPORTER_OTLP_API_KEY;
  if (!apiKey) {
    return {
      flush: async () => {
          // pass
      }
    };
  }

  const enableTracing = process.env.ENABLE_TRACING?.toLocaleLowerCase() === 'true';
  const enableLogs = process.env.ENABLE_LOGS?.toLocaleLowerCase() === 'true';
  const enableMetrics = process.env.ENABLE_METRICS?.toLocaleLowerCase() === 'true';

  const url = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (useGrpc) {
    const metadata = new Metadata({});
    metadata.set('x-api-key', apiKey);

    const traceExporter = enableTracing ? new grpcTraceing.OTLPTraceExporter({
      url,
      metadata,
    }) : undefined;
    const logsExporter = new grpcLogs.OTLPLogExporter({
      url,
      metadata,
    });
    const metricExporter = new grpcMetrics.OTLPMetricExporter({
      url,
      metadata,
    });

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

  const commonHeaders = {
    'x-api-key': apiKey,
  };

  const traceEndpoint = `${url}/v1/traces`;
  const traceHeaders = {
    ...commonHeaders,
  };
  const traceExporter = enableTracing ? new httpTraceing.OTLPTraceExporter({
    url: traceEndpoint,
    headers: traceHeaders,
  }) : undefined;

  const logsEndpoint = `${url}/v1/logs`;
  const logsHeaders = {
    ...commonHeaders,
  };
  const logsExporter = enableLogs ? new httpLogs.OTLPLogExporter({
    url: logsEndpoint,
    headers: logsHeaders,
  }) : undefined;

  const metricsEndpoint = `${url}/v1/metrics`;
  const metricsHeaders = {
    ...commonHeaders,
  };
  const metricExporter = enableMetrics ? new httpMetrics.OTLPMetricExporter({
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
