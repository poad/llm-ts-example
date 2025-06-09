import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Logger } from '@aws-lambda-powertools/logger';
import { pgMcp } from './pgMcp';

const logger = new Logger();

const app = express();
app.use(express.json());

// Create server instance
const server = new McpServer({
  name: 'weather',
  version: '1.0.0',
  capabilities: {},
});

app.post('/mcp', async (req: Request, res: Response) => {
  // In stateless mode, create a new instance of transport and server for each request
  // to ensure complete isolation. A single instance would cause request ID collisions
  // when multiple clients connect concurrently.

  try {
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    const body = req.body;
    logger.info('Received MCP request:', body);
    await transport.handleRequest(req, res, body);
    res.on('close', () => {
      logger.info('Request closed');
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

app.get('/mcp', async (req: Request, res: Response) => {
  logger.info('Received GET MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed.',
    },
    id: null,
  }));
});

app.delete('/mcp', async (req: Request, res: Response) => {
  logger.info('Received DELETE MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed.',
    },
    id: null,
  }));
});

const resouces = [pgMcp.resources.schema, pgMcp.resources.status];
resouces.forEach((resource) => {
  server.resource(
    resource.name,
    resource.uri,
    async () => {
      const content = await resource.load();
      return { contents: [{ ...content, uri: resource.uri, mimeType: resource.mimeType }] };
    },
  );
});

server.tool(
  pgMcp.tools.query.name,
  pgMcp.tools.query.description,
  pgMcp.tools.query.parameters.shape,
  pgMcp.tools.query.annotations,
  async (params) => {
    const resp = await pgMcp.tools.query.execute(params);
    return {
      ...resp,
    };
  });

server.tool(
  pgMcp.tools['list-tables'].name,
  pgMcp.tools['list-tables'].description,
  pgMcp.tools['list-tables'].parameters.shape,
  pgMcp.tools['list-tables'].annotations,
  async (params) => {
    const resp = await pgMcp.tools['list-tables'].execute(params);
    return {
      ...resp,
    };
  });

server.tool(
  pgMcp.tools['describe-table'].name,
  pgMcp.tools['describe-table'].description,
  pgMcp.tools['describe-table'].parameters.shape,
  pgMcp.tools['describe-table'].annotations,
  async (params) => {
    const resp = await pgMcp.tools['describe-table'].execute(params);
    return {
      ...resp,
    };
  });

server.tool(
  pgMcp.tools['call-procedure'].name,
  pgMcp.tools['call-procedure'].description,
  pgMcp.tools['call-procedure'].parameters.shape,
  pgMcp.tools['call-procedure'].annotations,
  async (params) => {
    const resp = await pgMcp.tools['call-procedure'].execute(params);
    return {
      ...resp,
    };
  });

server.tool(
  pgMcp.tools['export-schema'].name,
  pgMcp.tools['export-schema'].description,
  pgMcp.tools['export-schema'].parameters.shape,
  pgMcp.tools['export-schema'].annotations,
  async (params) => {
    const resp = await pgMcp.tools['export-schema'].execute(params);
    return {
      ...resp,
    };
  });

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});
