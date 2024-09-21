'use strict';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AzureChatOpenAI } from '@langchain/openai';
import { ChatBedrockConverse } from '@langchain/aws';
import { ChatAnthropic } from '@langchain/anthropic';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CallbackHandler } from 'langfuse-langchain';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger();

const TEMPLATE = `Answer the user's question to the best of your ability.
However, please keep your answers brief.

{question}`;

function selectModel(modelType?: string) {
  if (modelType === 'aws') {
    logger.info('use: cohere.command-r-plus-v1:0 on AWS Bedrock');

    return new ChatBedrockConverse({
      model: 'cohere.command-r-plus-v1:0',
      temperature: 0,
      streaming: true,
      metadata: {
        tag: 'chat',
      },
    });
  }
  if (modelType === 'anthropic') {
    logger.info('use: Anthropic Claude 3.5 Sonnet');
    return new ChatAnthropic({
      model: process.env.CLAUDE_MODEL ?? 'claude-3-5-sonnet-20240620',
      streaming: true,
      temperature: 0,
      metadata: {
        tag: 'chat',
      },
    });
  }
  logger.info('use: GPT-4o on Azure OpenAI Service');
  return new AzureChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0,
    streaming: true,
    metadata: {
      tag: 'chat',
    },
  });
}

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

  const model = selectModel(modelType);

  const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);
  try {
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    // Initialize Langfuse callback handler
    const langfuseHandler = langfuse.secretKey && langfuse.secretKey ? new CallbackHandler(langfuse) : undefined;

    logger.info(`Langfuse: ${langfuseHandler ? 'enable' : 'disable'}`);

    const stream = await chain.stream(
      {
        question,
      },
      {
        callbacks: langfuseHandler ? [langfuseHandler] : [],
      },
    );
    for await (const chunk of stream) {
      output.write(chunk);
    }
    output.write('\n');
  } catch (e) {
    logger.error('', JSON.parse(JSON.stringify(e)));
    output.write(`Error: ${(e as Error).message}\n`);
  }
}
