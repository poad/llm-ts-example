import type { SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { LogRecordExporter } from '@opentelemetry/sdk-logs';
import type { PushMetricExporter } from '@opentelemetry/sdk-metrics';
import * as databricks from './providers/databricks/exporters.js';
import * as mlflow from './providers/mlflow/exporters.js';
import * as phoenix from './providers/phoenix/exporters.js';
import * as apiKey from './providers/api-key/exporters.js';

export interface Exporters { trace?: SpanExporter, logs?: LogRecordExporter, metric?: PushMetricExporter, flush: () => Promise<void> }

export const Provider = {
  PROVIDER_PHOENIX: 'phoenix',
  PROVIDER_DATABRICS: 'databrics',
  PROVIDER_MLFLOW: 'mlflow',
  PROVIDER_AUTH_API_KEY: 'api-key',
}

type PROVIDER_TYPE = typeof Provider.PROVIDER_PHOENIX | typeof Provider.PROVIDER_DATABRICS | typeof Provider.PROVIDER_MLFLOW | typeof Provider.PROVIDER_AUTH_API_KEY;

const createExporters = async (auth: PROVIDER_TYPE, options: { useGrpc: boolean }): Promise<Exporters> => {
  if (auth === Provider.PROVIDER_DATABRICS) {
    return await databricks.init(options);
  }
  if (auth == Provider.PROVIDER_MLFLOW) {
    if (options.useGrpc) {
      throw new Error('Unsupported gRPC');
    }
    return mlflow.init();
  }
  if (auth == Provider.PROVIDER_PHOENIX) {
    if (options.useGrpc) {
      throw new Error('Unsupported gRPC');
    }
    return phoenix.init();
  }
  if (auth === Provider.PROVIDER_AUTH_API_KEY) {
    return await apiKey.init(options);
  }
  throw new Error('Unsupported PROVIDER');
}

export { createExporters };
