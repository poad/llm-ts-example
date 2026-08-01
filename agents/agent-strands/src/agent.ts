import { init } from './observability/exporters.js';
import { tools } from './tools/aws-tool.js';
import { Agent, BedrockModel } from '@strands-agents/sdk';
import { setupTracer } from '@strands-agents/sdk/telemetry';
import { NodeTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

const exporters = await init();
if (exporters.trace) {
  const provider = new NodeTracerProvider({
    spanProcessors: [
      // Configure OTLP endpoint programmatically
      new SimpleSpanProcessor(
        exporters.trace,
      ),
    ],
  });
  setupTracer({
    provider,
    exporters: { otlp: true, console: false },
  });
}

const createAgent = (
  { model: modelId, session, user = 'anonymous' }:
  { model: string, session: string, user?: string }
) => {
  const model = new BedrockModel({
    region: 'us-east-1',
    modelId: modelId,
    maxTokens: 4096,
  });

  return new Agent({
    model,
    id: 'general-agent',
    name: 'General Agent',
    systemPrompt: `
      MCP サーバーに、入力されたメッセージを渡して、返されたレスポンスを表示してください。
`,
    traceAttributes: {
      'session.id': session,
      'user.id': user,
    },
    tools,
    printer: false,
  });
};

const finalize = async () => {
  await exporters.flush();
};

export { createAgent, finalize };
