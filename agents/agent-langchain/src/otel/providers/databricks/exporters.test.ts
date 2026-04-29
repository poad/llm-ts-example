import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init } from './exporters.js';

vi.mock('./access-token-manager.js', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('../../../logging.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { getAccessToken } from './access-token-manager.js';

const mockGetAccessToken = vi.mocked(getAccessToken);

describe('databricks exporters', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('init', () => {
    it('should return empty object when token is null', async () => {
      mockGetAccessToken.mockResolvedValue(null);

      const result = await init({ useGrpc: true });

      expect(result).toEqual({});
      expect(mockGetAccessToken).toHaveBeenCalled();
    });

    it('should return empty object when UC schema is undefined', async () => {
      mockGetAccessToken.mockResolvedValue('test-token');
      delete process.env.DATABRICKS_UC_SCHEMA_NAME;

      const result = await init({ useGrpc: true });

      expect(result).toEqual({});
    });

    it('should return gRPC exporters when useGrpc is true', async () => {
      mockGetAccessToken.mockResolvedValue('test-token');
      process.env.DATABRICKS_UC_SCHEMA_NAME = 'test_schema';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4317';
      process.env.ENABLE_TRACING = 'true';
      process.env.ENABLE_LOGS = 'true';
      process.env.ENABLE_METRICS = 'true';

      const result = await init({ useGrpc: true });

      expect(result.trace).toBeDefined();
      expect(result.logs).toBeDefined();
      expect(result.metric).toBeDefined();
    });

    it('should return empty object when useGrpc is false and tablePrefix is undefined', async () => {
      mockGetAccessToken.mockResolvedValue('test-token');
      process.env.DATABRICKS_UC_SCHEMA_NAME = 'test_schema';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4317';
      delete process.env.DATABRICKS_UC_TABLE_PREFIX;

      const result = await init({ useGrpc: false });

      expect(result).toEqual({});
    });

    it('should return HTTP exporters when useGrpc is false', async () => {
      mockGetAccessToken.mockResolvedValue('test-token');
      process.env.DATABRICKS_UC_SCHEMA_NAME = 'test_schema';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4317';
      process.env.DATABRICKS_UC_TABLE_PREFIX = 'test_prefix';
      process.env.ENABLE_TRACING = 'true';
      process.env.ENABLE_LOGS = 'true';
      process.env.ENABLE_METRICS = 'true';

      const result = await init({ useGrpc: false });

      expect(result.trace).toBeDefined();
      expect(result.logs).toBeDefined();
      expect(result.metric).toBeDefined();
    });

    it('should handle ENABLE_TRACING false for gRPC', async () => {
      mockGetAccessToken.mockResolvedValue('test-token');
      process.env.DATABRICKS_UC_SCHEMA_NAME = 'test_schema';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4317';
      process.env.ENABLE_TRACING = 'false';

      const result = await init({ useGrpc: true });

      expect(result.trace).toBeUndefined();
    });

    it('should always return logs exporter for gRPC regardless of ENABLE_LOGS', async () => {
      mockGetAccessToken.mockResolvedValue('test-token');
      process.env.DATABRICKS_UC_SCHEMA_NAME = 'test_schema';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4317';
      process.env.ENABLE_LOGS = 'false';

      const result = await init({ useGrpc: true });

      expect(result.logs).toBeDefined();
    });

    it('should always return metrics exporter for gRPC regardless of ENABLE_METRICS', async () => {
      mockGetAccessToken.mockResolvedValue('test-token');
      process.env.DATABRICKS_UC_SCHEMA_NAME = 'test_schema';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4317';
      process.env.ENABLE_METRICS = 'false';

      const result = await init({ useGrpc: true });

      expect(result.metric).toBeDefined();
    });

    it('should handle lowercase boolean env values', async () => {
      mockGetAccessToken.mockResolvedValue('test-token');
      process.env.DATABRICKS_UC_SCHEMA_NAME = 'test_schema';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4317';
      process.env.DATABRICKS_UC_TABLE_PREFIX = 'test_prefix';
      process.env.ENABLE_TRACING = 'TRUE';
      process.env.ENABLE_LOGS = 'TRUE';
      process.env.ENABLE_METRICS = 'TRUE';

      const result = await init({ useGrpc: false });

      expect(result.trace).toBeDefined();
      expect(result.logs).toBeDefined();
      expect(result.metric).toBeDefined();
    });
  });
});
