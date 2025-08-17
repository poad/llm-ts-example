import { v7 as uuidv7 } from 'uuid';

import { CallbackHandler } from 'langfuse-langchain';
import { createGraph } from './graph';
 
import { logger } from '@llm-ts-example/common-backend';

export async function handle(
  sessionId: string,
  { question, model: modelType, embeddingType }: { question: string, model?: string, embeddingType?: string },
  output: NodeJS.WritableStream,
) {

  const langfuse = {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
  };

  try {
    const { platform, modelName, graph: app } = await createGraph({
      embeddingType,
      modelType,
    });

    // Initialize Langfuse callback handler
    const langfuseHandler = langfuse.publicKey && langfuse.secretKey ? new CallbackHandler({
      sessionId,
      flushInterval: 0,
      flushAt: 1,
      tags: [modelName],
    }) : undefined;

    logger.debug(`Langfuse: ${langfuseHandler ? 'enable' : 'disable'}`);

    const threadId = uuidv7();

    const stream = await app.streamEvents(
      {
        input: question,
      },
      {
        version: 'v2',
        configurable: {
          sessionId,
          thread_id: threadId,
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
