'use strict';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CallbackHandler } from 'langfuse-langchain';
import { selectLlm } from './llm';
import { logger } from './logger';

const TEMPLATE = `Answer the user's question to the best of your ability.
However, please keep your answers brief and in the same language as the question.

{question}`;

export async function handle(
  sessionId: string,
  { question, model: modelType }: { question: string, model?: string },
  output: NodeJS.WritableStream,
) {

  const langfuse = {
    sessionId,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASEURL,
    flushAt: 1,
  };

  const model = selectLlm(modelType);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', TEMPLATE],
    ['human', 'question'],
  ]);

  try {
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    // Initialize Langfuse callback handler
    const langfuseHandler = langfuse.publicKey && langfuse.secretKey ? new CallbackHandler(langfuse) : undefined;

    logger.debug(`Langfuse: ${langfuseHandler ? 'enable' : 'disable'}`);

    const stream = await chain.streamEvents(
      {
        question,
      },
      {
        version: 'v1',
        configurable: {
          sessionId,
          callbacks: langfuseHandler ? [langfuseHandler] : [],
        },
      },
    );
    for await (const sEvent of stream) {
      logger.trace('event', sEvent);
      if (sEvent.event === 'on_llm_stream') {
        if (modelType === 'aws') {
          output.write(sEvent.data.chunk.content ?? '');
        } else {
          output.write(sEvent.data.chunk.text ?? '');
        }
      }
    }
    output.write('\n');
  } catch (e) {
    logger.error('', JSON.parse(JSON.stringify(e)));
    output.write(`Error: ${(e as Error).message}\n`);
  }
}
