import { CallbackHandler } from 'langfuse-langchain';
// eslint-disable-next-line import/no-unresolved
import { v7 as uuidv7 } from 'uuid';
import { logger } from '@llm-ts-example/common-backend-core';
// eslint-disable-next-line import/no-unresolved
import { selectLlm } from '@llm-ts-example/common-backend-langchain';
import { createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { selectEmbeddings } from './embeddings-models';
import { createTool } from './tool';
import { createRetriever } from './retriever';
import './instrumentation';

export async function handle(
  { body }: { body: string | null | undefined },
  output: NodeJS.WritableStream,
) {
  logger.info('event.body', { event: { body } });
  const { question, model, embeddingType, sessionId } = body ? JSON.parse(body) : { question: undefined, model: undefined, sessionId: uuidv7() };

  const modelType = model || 'gpt-5-nano';

  const langfuse = {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
  };

  try {
    const { indexName, model: embeddings } = selectEmbeddings({
      type: embeddingType ?? 'titan', dataSource: process.env.PINECONE_INDEX ?? '',
    });
    const retriever = await createRetriever({ embeddings, indexName });
    const tool = createTool(retriever);
    const systemPrompt =
      'あなたは文書からコンテキストを取得する専門家です。ツールを使用してユーザーの質問に答える手助けをしてください。必ずユーザーの質問と同じ言語で答えてください。';

    const { platform, model, modelName } = selectLlm(modelType);
    // Initialize Langfuse callback handler
    const langfuseHandler = langfuse.publicKey && langfuse.secretKey ? new CallbackHandler({
      sessionId,
      flushInterval: 0,
      flushAt: 1,
      tags: [modelName],
    }) : undefined;

    const checkpointer = new MemorySaver();

    const agent = createAgent({
      model,
      tools: [tool],
      systemPrompt,
      checkpointer,
    });

    logger.debug(`Langfuse: ${langfuseHandler ? 'enable' : 'disable'}`);

    const threadId = uuidv7();

    const stream = await agent.streamEvents(
      { messages: [{ role: 'user', content: question }] },
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
