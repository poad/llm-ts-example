import { AzureChatOpenAI } from '@langchain/openai';
import { ChatBedrockConverse } from '@langchain/aws';
import { logger } from './logger';
 
import { LanguageModelLike } from '@langchain/core/language_models/base';
 
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

import { models } from '@llm-ts-example/common-core';

interface SelectLlmResult {
  platform: 'aws' | 'azure';
  modelName: string;
  model: LanguageModelLike & BaseChatModel;
}

export function selectLlm(modelType?: string): SelectLlmResult {
  const model = models.find((model) => model.id === modelType);
  if (!model) {
    logger.error(`Model type "${modelType}" is not supported.`);
    logger.error(`Supported model types: ${models.map((model) => model.id).join(', ')}`);
    throw new Error(`Model type "${modelType}" is not supported.`);
  }

  if (model.platform === 'aws') {
    const region = process.env.BEDROCK_AWS_REGION;
    logger.debug(`use: ${model.modelId} on Amazon Bedrock`);
    const modelId = model.modelId;
    return {
      platform: 'aws',
      modelName: modelId,
      model: new ChatBedrockConverse({
        model: modelId,
        ...(model.temperatureSupport ? {temperature: 0} : {}),
        streaming: true,
        metadata: {
          tag: 'chat',
        },
        region,
      }),
    };
  }

  logger.debug(`use: ${model.modelId} on Azure OpenAI Service`);
  return {
    platform: 'azure',
    modelName: model.modelId,
    model: new AzureChatOpenAI({
      azureOpenAIApiDeploymentName: model.modelId,
      ...(model.temperatureSupport ? {temperature: 0} : {}),
      streaming: true,
      metadata: {
        tag: 'chat',
      },
    }),
  };
}

export default selectLlm;
