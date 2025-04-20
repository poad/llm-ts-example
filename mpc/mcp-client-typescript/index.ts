import { BedrockRuntimeClient, ConverseCommand, ConverseCommandInput, Message, Tool, ToolInputSchema } from '@aws-sdk/client-bedrock-runtime';
import { input } from '@inquirer/prompts';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import dotenv from 'dotenv';

dotenv.config();

class ConverseMcpClient {
  private mcp: Client; // from "@modelcontextprotocol/sdk/client/index.js"
  private bedrock: BedrockRuntimeClient;
  private transport: StdioClientTransport | null = null; // from "@modelcontextprotocol/sdk/client/stdio.js"
  private tools: Tool[] = [];
  constructor() {
    const region = process.env.AWS_REGION ?? 'us-west-2';

    this.bedrock = new BedrockRuntimeClient({ region });
    this.mcp = new Client({ name: 'mcp-client-cli', version: '1.0.0' });
  }
  async connectToMcpServer(serverScriptPath: string) {
    try {
      // Determine script type and appropriate command
      const isJs = serverScriptPath.endsWith('.js');
      const isPy = serverScriptPath.endsWith('.py');
      if (!isJs && !isPy) {
        throw new Error('Server script must be a .js or .py file');
      }
      const command = isPy
        ? process.platform === 'win32'
          ? 'python'
          : 'python3'
        : process.execPath;

      // Initialize transport and connect to server
      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      });
      await this.mcp.connect(this.transport);

      // List available tools
      const toolsResult = await this.mcp.listTools();

      this.tools = toolsResult.tools.map((tool) => {
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
    }
    catch (e) {
      console.log('Failed to connect to MCP server: ', e);
      throw e;
    }
  }
  async converse(conversation: Message[]) {
    const input: ConverseCommandInput = {
      modelId: modelId,
      messages: conversation,
    };
    if (this.tools.length > 0) {
      input.toolConfig = {
        tools: this.tools,
      };
    }
    const response = await this.bedrock.send(
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
            const response = await client.mcp.callTool({
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
            await this.converse(conversation);
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

  async questionPrompt(conversation: Message[]): Promise<boolean> {
    const answer = await input({ message: '' });
    if (answer && answer !== 'quit') {
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

  async chat() {
    const conversation: Message[] = [];
    try {
      console.log('\nMCP Client Started!');
      console.log('Type your queries or \'quit\' to exit.');

      if (await this.questionPrompt(conversation)) {
        while (true) {
          await client.converse(conversation);
          if (!await this.questionPrompt(conversation)) { break; }
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
}

const MODEL_ID = process.env.MODEL_ID ?? 'us.amazon.nova-micro-v1:0';

const modelId = MODEL_ID;
console.log(`use ${modelId}`);

const client = new ConverseMcpClient();
await client.connectToMcpServer('../weather/build/index.js');
await client.chat();
