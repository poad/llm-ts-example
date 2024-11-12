import { AzureChatOpenAI } from '@langchain/openai';
import { ChatBedrockConverse } from '@langchain/aws';
import { ChatAnthropic } from '@langchain/anthropic';
import { logger } from './logger';

export function selectLlm(modelType?: string) {
  if (modelType === 'aws') {
    logger.debug('use: cohere.command-r-plus-v1:0 on AWS Bedrock');

    return new ChatBedrockConverse({
      model: 'cohere.command-r-v1:0',
      temperature: 0,
      streaming: true,
      metadata: {
        tag: 'chat',
      },
    });
  }
  if (modelType === 'llama32-1b') {
    logger.debug('use: Meta LLama 3.2 1B Instruct');
    return new ChatBedrockConverse({
      model: 'us.meta.llama3-2-1b-instruct-v1:0',
      temperature: 0,
      streaming: true,
      metadata: {
        tag: 'chat',
      },
    });
  }
  if (modelType === 'llama32-3b') {
    logger.debug('use: Meta LLama 3.2 3B Instruct');
    return new ChatBedrockConverse({
      model: 'us.meta.llama3-2-3b-instruct-v1:0',
      streaming: true,
      temperature: 0,
      metadata: {
        tag: 'chat',
      },
    });
  }
  if (modelType === 'anthropic') {
    logger.debug('use: Anthropic Claude 3.5 Sonnet');
    return new ChatAnthropic({
      model: process.env.CLAUDE_MODEL ?? 'claude-3-5-sonnet-20240620',
      streaming: true,
      temperature: 0,
      metadata: {
        tag: 'chat',
      },
    });
  }
  logger.debug('use: GPT-4o on Azure OpenAI Service');
  return new AzureChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0,
    streaming: true,
    metadata: {
      tag: 'chat',
    },
  });
}

