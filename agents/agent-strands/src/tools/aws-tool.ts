import { McpClient, ToolList } from '@strands-agents/sdk';

export const mcp = new McpClient({
  url: 'https://j356wgjoob.execute-api.us-west-2.amazonaws.com/v2/mcp',
});

export const tools: ToolList = await mcp.listTools();
