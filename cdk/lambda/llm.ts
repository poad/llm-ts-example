import { AzureChatOpenAI } from '@langchain/openai';
import { ChatBedrockConverse } from '@langchain/aws';
import { logger } from './logger';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export function selectLlm(modelType?: string): {
  platform: 'aws' | 'azure' | 'anthropic';
  modelName: string;
  model: BaseChatModel;
} {
  const bedrockRegion = process.env.BEDROCK_AWS_REGION;
  const credentials = process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_ACCESS_KEY_ID ? {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  } : undefined;

  if (modelType === 'cohere') {
    logger.debug('use: cohere.command-r-plus-v1:0 on AWS Bedrock');
    return {
      platform: 'aws',
      modelName: 'cohere.command-r-v1:0',
      model: new ChatBedrockConverse({
        model: 'cohere.command-r-v1:0',
        temperature: 0,
        streaming: true,
        metadata: {
          tag: 'chat',
        },
        region: bedrockRegion,
        credentials,
      }),
    };
  }
  if (modelType === 'llama32-1b') {
    logger.debug('use: Meta LLama 3.2 1B Instruct');
    return {
      platform: 'aws',
      modelName: 'us.meta.llama3-2-1b-instruct-v1:0',
      model: new ChatBedrockConverse({
        model: 'us.meta.llama3-2-1b-instruct-v1:0',
        temperature: 0,
        streaming: true,
        metadata: {
          tag: 'chat',
        },
        region: bedrockRegion,
        credentials,
      }),
    };
  }
  if (modelType === 'llama32-3b') {
    logger.debug('use: Meta LLama 3.2 3B Instruct');
    return {
      platform: 'aws',
      modelName: 'us.meta.llama3-2-3b-instruct-v1:0',
      model: new ChatBedrockConverse({
        model: 'us.meta.llama3-2-3b-instruct-v1:0',
        temperature: 0,
        streaming: true,
        metadata: {
          tag: 'chat',
        },
        region: bedrockRegion,
        credentials,
      }),
    };
  }
  if (modelType === 'gpt-4o-mini') {
    logger.debug('use: GPT-4o mini on Azure OpenAI Service');
    return {
      platform: 'azure',
      modelName: 'gpt-4o-mini',
      model: new AzureChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0,
        streaming: true,
        metadata: {
          tag: 'chat',
        },
      }),
    };
  }
  logger.debug('use: GPT-4o on Azure OpenAI Service');
  return {
    platform: 'azure',
    modelName: 'gpt-4o',
    model: new AzureChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
      streaming: true,
      metadata: {
        tag: 'chat',
      },
    }),
  };
}

