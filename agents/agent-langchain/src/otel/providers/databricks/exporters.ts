import { Metadata } from '@grpc/grpc-js';

import grpcTraceing from '@opentelemetry/exporter-trace-otlp-grpc';
import grpcLogs from '@opentelemetry/exporter-logs-otlp-grpc';
import grpcMetrics from '@opentelemetry/exporter-metrics-otlp-grpc';

import httpTraceing from '@opentelemetry/exporter-trace-otlp-proto';
import httpLogs from '@opentelemetry/exporter-logs-otlp-proto';
import httpMetrics from '@opentelemetry/exporter-metrics-otlp-proto';

import { getAccessToken } from './access-token-manager.js';

import { Exporters } from '../../otel-exporters.js';
import { logger } from '../../../logging.js';
import dotenv from '@dotenvx/dotenvx';

dotenv.config({ path: ['.env', '.env.test'], override: true });

export const init = async ({ useGrpc }: { useGrpc: boolean }): Promise<Exporters> => {
  const token = await getAccessToken();
  if (!token) {
    logger.warn('Databricks Accsess token is undefined');
    return {
      flush: async () => {
        logger.trace('skip');
       }
    };
  }
  const ucSchema = process.env.DATABRICKS_UC_SCHEMA_NAME;
  if (!ucSchema) {
    logger.warn('DATABRICKS_UC_SCHEMA_NAME is undefined');
    return {
      flush: async () => {
        logger.trace('skip');
       }
    };
  }

  const enableTracing = process.env.ENABLE_TRACING?.toLocaleLowerCase() === 'true';
  const enableLogs = process.env.ENABLE_LOGS?.toLocaleLowerCase() === 'true';
  const enableMetrics = process.env.ENABLE_METRICS?.toLocaleLowerCase() === 'true';

  const url = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const tablePrefix = process.env.DATABRICKS_UC_TABLE_PREFIX;
  if (!tablePrefix) {
    return {
      flush: async () => {
        logger.trace('skip');
       },
    };
  }
  const traceTableName = `${ucSchema}.${tablePrefix}_otel_spans`;
  const logsTableName = `${ucSchema}.${tablePrefix}_otel_logs`;
  const metricTableName = `${ucSchema}.${tablePrefix}_otel_metrics`;

  if (useGrpc) {
    logger.info('Use OTLP/gRPC');

    const traceMetadata = new Metadata({});
    traceMetadata.set('x-databricks-zerobus-table-name', traceTableName);
    traceMetadata.set('Authorization', `Bearer ${token}`);
    const traceExporter = enableTracing ? new grpcTraceing.OTLPTraceExporter({
      url,
      metadata: traceMetadata,
    }) : undefined;

    const logsMetadata = new Metadata({});
    logsMetadata.set('x-databricks-zerobus-table-name', logsTableName);
    logsMetadata.set('Authorization', `Bearer ${token}`);
    const logsExporter = new grpcLogs.OTLPLogExporter({
      url,
      metadata: logsMetadata,
    });

    const metricMetadata = new Metadata({});
    metricMetadata.set('x-databricks-zerobus-table-name', metricTableName);
    metricMetadata.set('Authorization', `Bearer ${token}`);
    const metricExporter = new grpcMetrics.OTLPMetricExporter({
      url,
      metadata: metricMetadata,
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

  logger.info('Use OTLP/HTTP');
  const commonHeaders = {
    'content-type': 'application/x-protobuf',
    Authorization: `Bearer ${token}`,
  };

  const traceEndpoint = `${url}/api/2.0/otel/v1/traces`;
  console.log(traceEndpoint);
  const traceHeaders = {
    ...commonHeaders,
    'X-Databricks-UC-Table-Name': traceTableName,
  };
  const traceExporter = enableTracing ? new httpTraceing.OTLPTraceExporter({
    url: traceEndpoint,
    headers: traceHeaders,
  }) : undefined;

  const logsEndpoint = `${url}/api/2.0/otel/v1/logs`;
  const logsHeaders = {
    ...commonHeaders,
    'X-Databricks-UC-Table-Name': logsTableName,
  };
  const logsExporter = enableLogs ? new httpLogs.OTLPLogExporter({
    url: logsEndpoint,
    headers: logsHeaders,
  }) : undefined;

  const metricsEndpoint = `${url}/api/2.0/otel/v1/metrics`;
  const metricsHeaders = {
    ...commonHeaders,
    'X-Databricks-UC-Table-Name': `${tablePrefix}_otel_metrics`,
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
