import { BedrockRuntimeClient, ConverseCommand, ConverseCommandInput, Message, Tool, ToolInputSchema } from '@aws-sdk/client-bedrock-runtime';
import { input } from '@inquirer/prompts';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION ?? 'us-west-2';
const url = process.env.URL ?? 'http://localhost:3000/mcp';

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

async function converse(conversation: Message[], params: {
  tools: Tool[];
  bedrock: BedrockRuntimeClient;
  mcp: Client;
}) {
  const { tools, bedrock, mcp } = params;
  const input: ConverseCommandInput = {
    modelId: modelId,
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
          await converse(conversation, params);
        }
      }
    }
  }
  else if (response.output?.message) {
    const message = response.output.message;
    console.log(message.content?.[0].text);
    conversation.push(message);
  }
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

async function chat() {
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

async function createMcpClient({ region, url }: {
  region: string
  url: string
}) {
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

  return {
    converse: async (conversation: Message[]) => converse(conversation, {
      tools,
      bedrock,
      mcp: client,
    }),
    questionPrompt,
    chat,
  };
}

const MODEL_ID = process.env.MODEL_ID ?? 'us.amazon.nova-micro-v1:0';

const modelId = MODEL_ID;
console.log(`use ${modelId}`);

const client = await createMcpClient({region, url});
await client.chat();
