import { pgMcp } from './pgMcp.js';
import { McpServer } from '@modelcontextprotocol/server';

export const createMcpServer = () => {
  const server = new McpServer({
    name: 'postgresql',
    version: '1.0.0',
  });
  const resouces = [pgMcp.resources.schema, pgMcp.resources.status];
  resouces.forEach((resource) => {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        title: 'PostgreSQL Client MCP Server',
        mimeType: 'text/plain',
      },
      async () => {
        const content = await resource.load();
        return { contents: [{ ...content, uri: resource.uri, mimeType: resource.mimeType }] };
      },
    );
  });

  /* @mcp-codemod-error Could not automatically migrate .tool() call. Manual migration required. */
  server.registerTool(
    pgMcp.tools.query.name,
    {
      description: pgMcp.tools.query.description,
      inputSchema: pgMcp.tools.query.parameters.shape,
      annotations: pgMcp.tools.query.annotations,
    },
    async (params) => {
      const resp = await pgMcp.tools.query.execute(params);
      return {
        ...resp,
      };
    },
  );

  server.registerTool(
    pgMcp.tools['list-tables'].name,
    {
      description: pgMcp.tools['list-tables'].description,
      inputSchema: pgMcp.tools['list-tables'].parameters.shape,
      annotations: pgMcp.tools['list-tables'].annotations,
    },
    async (params) => {
      const resp = await pgMcp.tools['list-tables'].execute(params);
      return {
        ...resp,
      };
    });

  server.registerTool(
    pgMcp.tools['describe-table'].name,
    {
      description: pgMcp.tools['describe-table'].description,
      inputSchema: pgMcp.tools['describe-table'].parameters.shape,
      annotations: pgMcp.tools['describe-table'].annotations,
    },
    async (params) => {
      const resp = await pgMcp.tools['describe-table'].execute(params);
      return {
        ...resp,
      };
    });

  server.registerTool(
    pgMcp.tools['call-procedure'].name,
    {
      description: pgMcp.tools['call-procedure'].description,
      inputSchema: pgMcp.tools['call-procedure'].parameters.shape,
      annotations: pgMcp.tools['call-procedure'].annotations,
    },
    async (params) => {
      const resp = await pgMcp.tools['call-procedure'].execute(params);
      return {
        ...resp,
      };
    });

  server.registerTool(
    pgMcp.tools['export-schema'].name,
    {
      description: pgMcp.tools['export-schema'].description,
      inputSchema: pgMcp.tools['export-schema'].parameters.shape,
      annotations: pgMcp.tools['export-schema'].annotations,
    },
    async (params) => {
      const resp = await pgMcp.tools['export-schema'].execute(params);
      return {
        ...resp,
      };
    });

  return server;
};
