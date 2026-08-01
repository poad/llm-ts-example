import { logger } from '../logger.js';

import { SpanExporter } from '@opentelemetry/sdk-trace-base';

import * as httpTraceing from '@opentelemetry/exporter-trace-otlp-proto';
import * as httpLogs from '@opentelemetry/exporter-logs-otlp-proto';
import * as httpMetrics from '@opentelemetry/exporter-metrics-otlp-proto';

import { LogRecordExporter } from '@opentelemetry/sdk-logs';
import { PushMetricExporter } from '@opentelemetry/sdk-metrics';

export interface Exporters { trace?: SpanExporter, logs?: LogRecordExporter, metric?: PushMetricExporter, flush: () => Promise<void> }

export const init = async (token?: string): Promise<Exporters> => {
  if (!token) {
    logger.warn('Databricks Accsess token is undefined');
    return {
      flush: async () => {
        logger.trace('skip');
      },
    };
  }
  const ucSchema = process.env.DATABRICKS_UC_SCHEMA_NAME;
  if (!ucSchema) {
    logger.warn('DATABRICKS_UC_SCHEMA_NAME is undefined');
    return {
      flush: async () => {
        logger.trace('skip');
      },
    };
  }

  const enableTracing = process.env.ENABLE_TRACING?.toLocaleLowerCase() === 'true';
  const enableLogs = process.env.ENABLE_LOGS?.toLocaleLowerCase() === 'true';
  const enableMetrics = process.env.ENABLE_METRICS?.toLocaleLowerCase() === 'true';

  const url = process.env.DATABRICKS_WORKSPACE_URL;
  const tablePrefix = process.env.DATABRICKS_UC_TABLE_PREFIX;
  if (!tablePrefix) {
    return {
      flush: async () => {
        logger.info('skip');
      },
    };
  }
  const traceTableName = `${ucSchema}.${tablePrefix}_otel_spans`;
  const logsTableName = `${ucSchema}.${tablePrefix}_otel_logs`;
  const metricTableName = `${ucSchema}.${tablePrefix}_otel_metrics`;

  logger.info('Use OTLP/HTTP');
  const commonHeaders = {
    'content-type': 'application/x-protobuf',
    Authorization: `Bearer ${token}`,
  };

  const traceEndpoint = `${url}/api/2.0/otel/v1/traces`;
  logger.info(traceEndpoint);
  const traceHeaders = {
    ...commonHeaders,
    'X-Databricks-UC-Table-Name': traceTableName,
  };
  const traceExporter = enableTracing ? new httpTraceing.OTLPTraceExporter({
    url: traceEndpoint,
    headers: traceHeaders,
  }) : undefined;
  logger.info(`trace exporter is ${enableTracing ? 'enabled' : 'disabled'}`);

  const logsEndpoint = `${url}/api/2.0/otel/v1/logs`;
  const logsHeaders = {
    ...commonHeaders,
    'X-Databricks-UC-Table-Name': logsTableName,
  };
  const logsExporter = enableLogs ? new httpLogs.OTLPLogExporter({
    url: logsEndpoint,
    headers: logsHeaders,
  }) : undefined;
  logger.info(`logs exporter is ${enableLogs ? 'enabled' : 'disabled'}`);

  const metricsEndpoint = `${url}/api/2.0/otel/v1/metrics`;
  const metricsHeaders = {
    ...commonHeaders,
    'X-Databricks-UC-Table-Name': metricTableName,
  };
  const metricExporter = enableMetrics ? new httpMetrics.OTLPMetricExporter({
    url: metricsEndpoint,
    headers: metricsHeaders,
  }) : undefined;
  logger.info(`metric exporter is ${enableMetrics ? 'enabled' : 'disabled'}`);

  return {
    trace: traceExporter,
    logs: logsExporter,
    metric: metricExporter,
    flush: async () => {
      if (traceExporter) {
        await traceExporter.forceFlush();
        logger.info('forceFlush for trace');
      }
      if (logsExporter) {
        await logsExporter.forceFlush();
        logger.info('forceFlush for logs');
      }
      if (metricExporter) {
        await metricExporter.forceFlush();
        logger.info('forceFlush for metric');
      }
    },
  };
};
