import 'dotenv/config';
import { VoltAgent, VoltOpsClient, Agent, Memory } from '@voltagent/core';
import { LibSQLMemoryAdapter } from '@voltagent/libsql';
import { createPinoLogger } from '@voltagent/logger';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { honoServer } from '@voltagent/server-hono';

import { cors } from 'hono/cors';

// Create a logger instance
const logger = createPinoLogger({
  name: 'agent',
  level: 'info',
});

// Configure persistent memory (LibSQL / SQLite)
const memory = new Memory({
  storage: new LibSQLMemoryAdapter({
    url: 'file:./.voltagent/memory.db',
    logger: logger.child({ component: 'libsql' }),
  }),
});

const agent = new Agent({
  name: 'agent',
  instructions: 'A helpful assistant that can check weather and help with various tasks',
  model: bedrock('openai.gpt-oss-20b-1:0'),
  tools: [],
  memory,
});

new VoltAgent({
  agents: {
    agent,
  },
  server: honoServer({
    configureApp: (app) => {
      app.use('*', cors());
    },
  }),
  logger,
  voltOpsClient: new VoltOpsClient({
    publicKey: process.env.VOLTAGENT_PUBLIC_KEY || '',
    secretKey: process.env.VOLTAGENT_SECRET_KEY || '',
  }),
});
