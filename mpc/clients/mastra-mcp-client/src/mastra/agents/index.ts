import { bedrock } from '@ai-sdk/amazon-bedrock';
import { Agent } from '@mastra/core/agent';
import { mcp } from '../mcp';

export const agent = new Agent({
  name: 'Agent',
  instructions: `
      あなたは PostgreSQLデータベースを管理しています。
  `,
  model: bedrock('us.amazon.nova-premier-v1:0'),
  tools: {...await mcp.getTools()},
});
