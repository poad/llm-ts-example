import { MCPClient } from '@mastra/mcp';

const url = process.env.URL ?? 'http://localhost:3000/mcp';

// Configure MCPClient to connect to your server(s)
export const mcp = new MCPClient({
  servers: {
    weather: {
      url: new URL(url),
    },
  },
});
