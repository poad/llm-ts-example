
import { Mastra } from '@mastra/core/mastra';
import { ConsoleLogger } from '@mastra/core/logger';
import { weatherAgent } from './agents';
import { LangfuseExporter } from 'langfuse-vercel';

export const mastra = new Mastra({
  agents: { weatherAgent },
  logger: new ConsoleLogger({
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
