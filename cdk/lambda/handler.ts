'use strict';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AzureChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CallbackHandler } from 'langfuse-langchain';


const TEMPLATE = `Answer the user's question to the best of your ability.
However, please keep your answers brief.

{question}`;

export async function handle(sessionId: string, question: string, output: NodeJS.WritableStream) {

  const langfuseEnabled = process.env.LANGFUSE_SECRET_KEY && process.env.LANGFUSE_PUBLIC_KEY;

  const model = new AzureChatOpenAI({
    temperature: 0,
    streaming: true,
    modelName: 'gpt-4o',
  });

  // Initialize Langfuse callback handler
  const langfuseHandler = langfuseEnabled? new CallbackHandler({
    sessionId,
  }) : undefined;

  const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const stream = await chain.stream(
    {
      question,
    },
    {
      callbacks: langfuseHandler ? [langfuseHandler] : [],
    }
  );
  for await (const chunk of stream) {
    output.write(chunk);
  }
  output.write('\n');
  await langfuseHandler?.flushAsync();
}
