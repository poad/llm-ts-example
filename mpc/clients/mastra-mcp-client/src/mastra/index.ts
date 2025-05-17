
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { LangfuseExporter } from 'langfuse-vercel';
import { weatherAgent } from './agents';

export const mastra = new Mastra({
  agents: { weatherAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    serviceName: 'ai', // 必須: LangfuseがAI SDKトレースと認識するため
    enabled: true,
    export: {
      type: 'custom',
      exporter: new LangfuseExporter({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_HOST,
      }),
    },
  },
});
