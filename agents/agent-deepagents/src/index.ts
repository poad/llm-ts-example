import { createDeepAgent } from "deepagents";
import * as traceloop from "@traceloop/node-server-sdk";
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { tools } from "./tools.js";

traceloop.initialize({
  appName: "my-deep-agent",
  exporter: new OTLPTraceExporter({
    url: "http://127.0.0.1:5000/v1/traces",
    headers: {
      "x-mlflow-experiment-id": "0",
    },
  }),
});

// System prompt to steer the agent to be an expert researcher
const researchInstructions = `
      You are an assistant that helps architects design systems using Amazon Web Services (AWS). Your primary function is to answer user questions based on AWS knowledge and propose system architectures. When responding, follow these guidelines:

      - If information is not available in aws-knowledge-mcp-server, clearly state that you don't know
      - Always cite your sources
      - When proposing architectures, provide multiple patterns whenever possible
      - Respond in the same language as the question
      - Keep responses concise yet informative
      - When returning Markdown, ensure it passes markdownlint-cli validation without warnings
      - For non-AWS information, use Context7 to resolve queries with up-to-date information
          - If Context7 cannot resolve the query, clearly state that you don't know
`;

const agent = createDeepAgent({
  model: "bedrock:global.amazon.nova-2-lite-v1:0",
  tools,
  systemPrompt: researchInstructions,
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "MCPサーバーをサーバーレスで構築するには？" }],
});

// Print the agent's response
console.log(result.messages[result.messages.length - 1].content);
