import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ChatBedrockConverse } from '@langchain/aws';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import dotenv from "dotenv";
import * as sourceMap from 'source-map-support';
sourceMap.install();

dotenv.config();


export async function createAgent() {

  // Initialize the ChatOpenAI model
  const model = new ChatBedrockConverse({
    model: process.env.MODEL_ID ?? 'us.amazon.nova-pro-v1:0',
    temperature: 0,
    streaming: true,
    metadata: {
      tag: 'chat',
    },
    region: process.env.AWS_REGION ?? 'us-west-2',
  })

  // Automatically starts and connects to a MCP reference server
  function createTransportOption(serverScriptPath?: string) {
    if (serverScriptPath) {
      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");
      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }
      const command = isPy
        ? process.platform === "win32"
          ? "python"
          : "python3"
        : process.execPath;
      return {
        command,
        args: [serverScriptPath],
        restart: {
          enabled: true,      // Enable automatic restart
          maxAttempts: 3,     // Maximum restart attempts
          delayMs: 1000       // Delay between attempts in ms
        }
      }
    } else {
      return {
        command: "npx",
        args: ["@modelcontextprotocol/server-math"],
      }
    }
  }

  const transport = new StdioClientTransport(createTransportOption(process.env.MCP_SERVER_PATH));

  // Initialize the client
  const client = new Client({
    name: "math-client",
    version: "1.0.0",
  });

  const serverName = process.env.MCP_SERVER_NAME ?? 'math';

  // Connect to the transport
  await client.connect(transport);

  // Get tools with custom configuration
  const tools = await loadMcpTools(serverName, client, {
    // Whether to throw errors if a tool fails to load (optional, default: true)
    throwOnLoadError: true,
    // Whether to prefix tool names with the server name (optional, default: false)
    prefixToolNameWithServerName: true,
    // Optional additional prefix for tool names (optional, default: "")
    additionalToolNamePrefix: "",
  });

  // Create and run the agent
  const agent = createReactAgent({ llm: model, tools });

  return {
    invoke: async (content: string) => agent.invoke({
      messages: [{ role: "user", content }],
    }),
    close: async () => client.close()
  }
}
