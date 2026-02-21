import { bedrock } from '@ai-sdk/amazon-bedrock';
import { azure } from '@ai-sdk/azure';
import { logger } from '@llm-ts-example/common-backend-core';
import { models } from '@llm-ts-example/common-core';
import { ToolLoopAgent, smoothStream, ModelMessage } from 'ai';
import { Readable, PassThrough } from 'node:stream';

const createModel = (id?: string) => {
  const modelInfo = models.find((m) => m.id === id);
  if (modelInfo) {
    if (modelInfo.platform === 'aws') {
      return bedrock(modelInfo.modelId);
    }
    if (modelInfo.platform === 'azure') {
      return azure(modelInfo.modelId);
    }
  }
  return null;
};

const messages: ModelMessage[] = [];

export async function handle(
  { body }: { body: string },
  output: NodeJS.WritableStream,
) {
  try {
    const { prompt, modelId, session, id } = JSON.parse(body);
    if (!prompt) {
      logger.error('No prompt in request');
      output.write('error');
      return;
    }

    const model = createModel(modelId);
    if (!model) {
      logger.error('No model in request');
      output.write('error');
      return;
    }

    const result = new PassThrough();
    messages.push({ role: 'user', content: prompt });

    const agent = new ToolLoopAgent({
      model,
      instructions: 'You are a helpful assistant.',
      tools: {
        // Your tools here
      },
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          model: modelId,
          thread_id: session,
          query_id: id,
        },
      },
    });

    const stream = await agent.stream({
      messages,
      experimental_transform: smoothStream({
        delayInMs: 20, // optional: defaults to 10ms
        chunking: 'line', // optional: defaults to 'word'
      }),
      onStepFinish: async ({ usage, finishReason, toolCalls }) => {
        logger.info('Step completed:', {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          finishReason,
          toolsUsed: toolCalls?.map((tc) => tc.toolName),
        });
      },
    });
    Readable.fromWeb(stream.textStream).pipe(result).pipe(output);
    messages.push({ role: 'assistant', content: (await result.toArray()).join('') });
  } catch (e) {
    logger.error('', {error: e});
    output.write(JSON.stringify(e));
  }
}
