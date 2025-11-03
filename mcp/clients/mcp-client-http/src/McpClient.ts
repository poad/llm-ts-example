import { BedrockRuntimeClient, ConverseCommand, ConverseCommandInput, Message, Tool, ToolInputSchema } from '@aws-sdk/client-bedrock-runtime';
import { input } from '@inquirer/prompts';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function createClient(baseUrl: URL) {
  try {
    const client = new Client({ name: 'mcp-client-cli', version: '1.0.0' });
    // Initialize transport and connect to server
    const transport = new StreamableHTTPClientTransport(
      baseUrl,
    );
    await client.connect(transport);
    console.log('Connected using Streamable HTTP transport');
    return client;
  } catch {
    const client = new Client({ name: 'mcp-client-cli', version: '1.0.0' });
    const sseTransport = new SSEClientTransport(baseUrl);
    await client.connect(sseTransport);
    console.log('Connected using SSE transport');
    return client;
  }
}

interface CreateConverseClientProps {
  tools: Tool[];
  bedrock: BedrockRuntimeClient;
  mcp: Client;
  modelId: string;
}

function createConverseClient(params:CreateConverseClientProps) {
  const converse = async (conversation: Message[]) => {
    const { tools, bedrock, mcp, modelId } = params;
    const input: ConverseCommandInput = {
      modelId,
      messages: conversation,
    };
    if (tools.length > 0) {
      input.toolConfig = {
        tools,
      };
    }
    const response = await bedrock.send(
      new ConverseCommand(input),
    );

    if (response.stopReason === 'tool_use') {
      if (response.output?.message?.content) {
        const message = response.output.message;
        conversation.push(message);
        const content = response.output?.message?.content;
        for (const contentBlock of content) {
          if (contentBlock.toolUse?.name) {
            const toolName = contentBlock.toolUse.name;
            const toolArguments = JSON.parse(JSON.stringify(contentBlock.toolUse.input));
            const response = await mcp.callTool({
              name: toolName,
              arguments: toolArguments,
            });
            const message: Message = {
              role: 'user',
              content: [{
                toolResult: {
                  toolUseId: contentBlock.toolUse.toolUseId,
                  content: [{
                    text: JSON.stringify(response),
                  }],
                },
              }],
            };
            conversation.push(message);
            await converse(conversation);
          }
        }
      }
    }
    else if (response.output?.message) {
      const message = response.output.message;
      console.log(message.content?.[0].text);
      conversation.push(message);
    }
  };
  return converse;
}

async function questionPrompt(conversation: Message[]): Promise<boolean> {
  const answer = await input({ message: '' });
  if (answer && answer !== 'quit' && answer !== 'exit') {
    const question: Message = {
      role: 'user',
      content: [{ text: answer }],
    };
    conversation.push(question);
    return true;
  }
  else {
    return false;
  }
}

interface ChatProps {
  converse: (conversation: Message[]) => Promise<void>;
}

async function chat(client: ChatProps) {
  const conversation: Message[] = [];
  try {
    console.log('\nMCP Client Started!');
    console.log('Type your queries or \'quit\' to exit.');

    if (await questionPrompt(conversation)) {
      while (true) {
        await client.converse(conversation);
        if (!await questionPrompt(conversation)) { break; }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      // noop; silence this error
    } else {
      console.error(error);
      throw error;
    }
  }
}

interface McpClient {
  chat: () => Promise<void>;
}

interface CreateMcpClientProps {
  region: string
  url: string
  modelId: string
}

async function createMcpClient({ region, url, modelId }: CreateMcpClientProps): Promise<McpClient> {
  const baseUrl = new URL(url);
  const bedrock = new BedrockRuntimeClient({ region });

  console.log(`Connect to ${baseUrl}`);
  const client = await createClient(baseUrl);
  console.log();
  const toolsResult = await client.listTools();
  const tools = toolsResult.tools.map((tool) => {
    const toolInputSchema: ToolInputSchema = {
      json: JSON.parse(JSON.stringify(tool.inputSchema)),
    };
    const bedrockTool: Tool = {
      toolSpec: {
        inputSchema: toolInputSchema,
        name: tool.name,
        description: tool.description,
      },
    };
    return bedrockTool;
  });

  const converse = createConverseClient({
    tools,
    bedrock,
    mcp: client,
    modelId,
  });

  return {
    chat: async () => chat({
      converse,
    }),
  };
}

export {
  McpClient,
  createMcpClient,
};
