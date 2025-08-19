// index.ts

import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createDeepAgent } from 'deepagents';
import { ChatBedrockConverse } from '@langchain/aws';

async function main() {
  try {
    const model = new ChatBedrockConverse({
      model: 'openai.gpt-oss-20b-1:0',
      temperature: 0,
      streaming: false,
      region: 'us-west-2',
      // Add explicit configuration to prevent contentBlockIndex issues
      maxTokens: 4096,
    });

    const client = new MultiServerMCPClient({
      // Global tool configuration options
      throwOnLoadError: false,
      prefixToolNameWithServerName: false,
      additionalToolNamePrefix: '',

      // Disable standardized content blocks to prevent contentBlockIndex conflicts
      useStandardContentBlocks: false,

      // Server configuration
      mcpServers: {
        sequentialthinking: {
          transport: 'stdio',
          command: 'npx',
          args: [
            '-y',
            '@modelcontextprotocol/server-sequential-thinking',
          ],
        },
        context7: {
          transport: 'stdio',
          command: 'npx',
          args: [
            '-y',
            '@upstash/context7-mcp',
          ],
        },
      },
    });

    console.log('Initializing MCP client...');
    const tools = await client.getTools();
    console.log(`Loaded ${tools.length} tools`);

    // Prompt prefix to steer the agent to be an expert researcher
    const researchInstructions = 'あなたはチャットボットです。質問に答えるために、Context 7を使ったり、インターネットを検索したりして情報を収集してください。あなたの回答は、質問に対する正確で詳細な情報を提供することを目的としています。';

    console.log('Creating deep agent...');
    // Create the agent
    const agent = createDeepAgent({
      tools,
      instructions: researchInstructions,
      model,
    });

    console.log('Invoking agent...');
    // Invoke the agent with clean message structure
    const result = await agent.invoke({
      messages: [{
        role: 'user',
        content: 'LangGraphとは?',
      }],
    });

    result.messages
      .filter((message) => message.getType() === 'ai')
      .forEach((mensage) => console.log(typeof mensage.content === 'string' ? mensage.content : mensage.content.filter((c) => c.type === 'text').map((c) => c.type === 'text' ? c.text : c).join('')));

    process.exit(0);
  } catch (error) {
    console.error('Error occurred:', error);

    // Handle specific contentBlockIndex errors
    if (error instanceof Error && error.message.includes('contentBlockIndex')) {
      console.error('\n=== ContentBlockIndex Error Detected ===');
      console.error('This error typically occurs due to:');
      console.error('1. Version conflicts between @langchain packages');
      console.error('2. Incompatible @smithy/eventstream-codec versions');
      console.error('3. useStandardContentBlocks setting conflicts');
      console.error('4. Duplicate contentBlockIndex in message chunks');

      console.log('\n=== Applied Fixes ===');
      console.log('✓ Set useStandardContentBlocks: false');
      console.log('✓ Updated @smithy/eventstream-codec to ^2.0.5');
      console.log('✓ Simplified message structure');
      console.log('✓ Added explicit model configuration');

      console.log('\n=== Additional Steps to Try ===');
      console.log('1. Run: pnpm install --force');
      console.log('2. Clear node_modules: rm -rf node_modules && pnpm install');
      console.log('3. Check for conflicting peer dependencies');
    }

    // Handle streaming errors
    if (error instanceof Error && error.message.includes('streaming')) {
      console.error('\n=== Streaming Error Detected ===');
      console.error('Try disabling streaming in the model configuration');
    }

    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
