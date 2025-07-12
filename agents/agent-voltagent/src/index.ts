import { VoltAgent, Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";

import { bedrock } from "@ai-sdk/amazon-bedrock";

const agent = new Agent({
  name: "agent-voltagent",
  instructions: "A helpful assistant that answers questions without using tools",
  llm: new VercelAIProvider(),
  model: bedrock('us.amazon.nova-premier-v1:0'),
  tools: [],
});

new VoltAgent({
  agents: {
    agent,
  },
});
