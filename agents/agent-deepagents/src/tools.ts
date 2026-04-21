
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const client = new MultiServerMCPClient({
  'aws-knowledge-mcp-server': {
    transport: "http",
    url: 'https://knowledge-mcp.global.api.aws',
  },
});

export const tools = await client.getTools();
