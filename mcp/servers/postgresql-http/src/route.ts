import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { pgMcp } from './pgMcp';

export const createMcpServer = () => {
  const server = new McpServer({
    name: 'postgresql',
    version: '1.0.0',
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

  return server;
};
