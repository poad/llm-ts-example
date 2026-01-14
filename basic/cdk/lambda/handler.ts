import './instrumentation';
import { CallbackHandler } from 'langfuse-langchain';

import { selectLlm, logger } from '@llm-ts-example/common-backend';
import { createApp } from './app.js';

interface HandleProps { question: string, model?: string }

export async function handle(
  sessionId: string,
  { question, model: modelType }: HandleProps,
  output: NodeJS.WritableStream,
) {

  const langfuse = {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
  };

  const { platform, model, modelName } = selectLlm(modelType);

  try {
    // Initialize Langfuse callback handler
    const langfuseHandler = langfuse.publicKey && langfuse.secretKey ? new CallbackHandler({
      sessionId,
      flushInterval: 0,
      flushAt: 1,
      tags: [modelName],
    }) : undefined;

    logger.debug(`Langfuse: ${langfuseHandler ? 'enable' : 'disable'}`);

    const chain = createApp({model, modelName});

    const stream = await chain.streamEvents(
      { messages: [{ role: 'user', content: question }] },
      {
        version: 'v2',
        configurable: {
          sessionId,
        },
        callbacks: langfuseHandler ? [langfuseHandler] : [],
      },
    );
    for await (const sEvent of stream) {
      logger.trace('event', sEvent);
      if (sEvent.event === 'on_chat_model_stream') {
        const chunk = sEvent.data.chunk;
        if (platform === 'aws') {
          output.write(chunk.content ?? '');
        } else {
          output.write(chunk.text ?? '');
        }
      }
    }
    output.write('\n');
  } catch (e) {
    logger.error('', JSON.parse(JSON.stringify(e)));
    output.write(`Error: ${(e as Error).message}\n`);
  }
}
