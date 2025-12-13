import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

const client = new MultiServerMCPClient({
  'aws-knowledge-mcp-server': {
    transport: "http",
    url: 'https://knowledge-mcp.global.api.aws',
  },
  context7: {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp@latest'],
  },

});

const tools = await client.getTools();

const agent = createAgent({
  model: "bedrock:global.amazon.nova-2-lite-v1:0",
  systemPrompt: `
      You are an assistant that helps architects design systems using Amazon Web Services (AWS). Your primary function is to answer user questions based on AWS knowledge and propose system architectures. When responding, follow these guidelines:

      - If information is not available in aws-knowledge-mcp-server, clearly state that you don't know
      - Always cite your sources
      - When proposing architectures, provide multiple patterns whenever possible
      - Respond in the same language as the question
      - Keep responses concise yet informative
      - When returning Markdown, ensure it passes markdownlint-cli validation without warnings
      - For non-AWS information, use Context7 to resolve queries with up-to-date information
          - If Context7 cannot resolve the query, clearly state that you don't know
`,
  tools,
});

const stream = await agent.stream({
  messages: [{ role: "user", content: "MCPサーバーをサーバーレスで構築するには？" }],

}, { streamMode: "values" });
for await (const chunk of stream) {
  console.log('Agent', chunk.messages);
}
process.exit(0);
