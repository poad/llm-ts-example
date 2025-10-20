import { Logger } from '@aws-lambda-powertools/logger';
import { StreamableHTTPTransport } from '@hono/mcp';
import { createMcpServer } from './route';
import { Context, Hono } from 'hono';
import { BlankEnv, BlankInput } from 'hono/types';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const logger = new Logger();

export const app = new Hono();

const handleError = (
  c: Context<BlankEnv, '/mcp', BlankInput>,
  reason: unknown,
  logMessage: string,
) => {
  const errorDetails = reason instanceof Error
    ? { message: reason.message, stack: reason.stack, name: reason.name }
    : { reason };
  logger.error(logMessage, errorDetails);
  return c.json(
    {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: '内部サーバーエラー',
      },
      id: null,
    },
    { status: 500 },
  );
};

const closeResources = async (server: McpServer, transport: StreamableHTTPTransport) => {
  // 両方のクローズを確実に実行（片方が失敗してももう片方を実行）
  const closeResults = await Promise.allSettled([
    transport.close(),
    server.close(),
  ]);

  // クローズエラーをログ出力
  closeResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      const resourceName = index === 0 ? 'transport' : 'server';
      const error = result.reason;
      const errorDetails = error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error;
      logger.error(`Error closing ${resourceName}:`, { error: errorDetails });
    }
  });
};


app.post('/mcp', async (c) => {
  // In stateless mode, create a new instance of transport and server for each request
  // to ensure complete isolation. A single instance would cause request ID collisions
  // when multiple clients connect concurrently.

  const server = createMcpServer();
  const transport = new StreamableHTTPTransport({
    sessionIdGenerator: undefined, // セッションIDを生成しない（ステートレスモード）
    enableJsonResponse: true,
  });
  transport.onclose = async () => {
    await server.close();
    logger.trace('MCP transport closed');
  };
  try {
    await server.connect(transport);

    try {
      logger.trace('MCP リクエストを受信');
      return await transport.handleRequest(c);
    } catch (error) {
      return handleError(c, error, 'MCP リクエスト処理中のエラー:');
    } finally {
      await closeResources(server, transport);
    }
  } catch (error) {
    // サーバー接続に失敗した場合、transportのみクローズ（serverは未接続のため）
    // この時点でserver(サーバー)は未接続と考えられる。未接続のサーバーに対してクローズ処理を実行すると予期しないエラーが発生する可能性があるため
    try {
      await transport.close();
    } catch (closeError) {
      const errorDetails = closeError instanceof Error
        ? { message: closeError.message, stack: closeError.stack }
        : closeError;
      logger.error('Transport close failed after connection error:', { closeError: errorDetails });
    }
    return handleError(c, error, 'MCP 接続中のエラー:');
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
