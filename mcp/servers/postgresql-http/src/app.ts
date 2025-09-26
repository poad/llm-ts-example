import { Logger } from '@aws-lambda-powertools/logger';
import { handler } from './route';
import { Hono } from 'hono';

const logger = new Logger();

export const app = new Hono();

app.post('/mcp', async (c) => {
  // In stateless mode, create a new instance of transport and server for each request
  // to ensure complete isolation. A single instance would cause request ID collisions
  // when multiple clients connect concurrently.

  try {
    return await handler(c.req.raw);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    return c.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      },
      500,
    );
  }
});

app.get('/mcp', async (c) => {
  logger.info('Received GET MCP request');
  return c.json(
    {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed.',
      },
      id: null,
    },
    405,
  );
});

app.delete('/mcp', async (c) => {
  logger.info('Received DELETE MCP request');
  return c.json(
    {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed.',
      },
      id: null,
    },
    405,
  );
});
