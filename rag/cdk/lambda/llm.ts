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
  switch (modelType) {
    case 'cohere':
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
        }),
      };
    case 'llama32-1b':
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
        }),
      };
    case 'llama32-3b':
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
        }),
      };
    case 'nova-lite':
      logger.debug('use: amazon.nova-lite-v1:0 on AWS Bedrock');
      return {
        platform: 'aws',
        modelName: 'us.amazon.nova-lite-v1:0',
        model: new ChatBedrockConverse({
          model: 'us.amazon.nova-lite-v1:0',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
          region: bedrockRegion,
        }),
      };
    case 'nova-micro':
      logger.debug('use: amazon.nova-micro-v1:0 on AWS Bedrock');
      return {
        platform: 'aws',
        modelName: 'us.amazon.nova-micro-v1:0',
        model: new ChatBedrockConverse({
          model: 'us.amazon.nova-micro-v1:0',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
          region: bedrockRegion,
        }),
      };
    case 'nova-pro':
      logger.debug('use: amazon.nova-pro-v1:0 on AWS Bedrock');
      return {
        platform: 'aws',
        modelName: 'us.amazon.nova-pro-v1:0',
        model: new ChatBedrockConverse({
          model: 'us.amazon.nova-pro-v1:0',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
          region: bedrockRegion,
        }),
      };
    case 'nova-premier':
      logger.debug('use: amazon.nova-premier-v1:0 on AWS Bedrock');
      return {
        platform: 'aws',
        modelName: 'us.amazon.nova-premier-v1:0',
        model: new ChatBedrockConverse({
          model: 'us.amazon.nova-premier-v1:0',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
          region: bedrockRegion,
        }),
      };
    case 'gpt-4o-mini':
      logger.debug('use: GPT-4o mini on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'gpt-4o-mini',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'gpt-4o-mini',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
    case 'gpt-4.1':
      logger.debug('use: GPT-4.1 on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'gpt-4.1',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'gpt-4.1',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
    case 'gpt-4.1-mini':
      logger.debug('use: GPT-4.1-mini on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'gpt-4.1-mini',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'gpt-4.1-mini',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
    case 'gpt-4.1-nano':
      logger.debug('use: GPT-4.1-nano on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'gpt-4.1-nano',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'gpt-4.1-nano',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
    case 'o1-mini':
      logger.debug('use: o1 mini on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'o1-mini',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'o1-mini',
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
    case 'o1':
      logger.debug('use: o1 on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'o1',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'o1',
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
    case 'o3-mini':
      logger.debug('use: o3 mini on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'o3-mini',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'o3-mini',
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
    case 'o4-mini':
      logger.debug('use: o4 mini on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'o4-mini',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'o4-mini',
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
    default:
      logger.debug('use: GPT-4o on Azure OpenAI Service');
      return {
        platform: 'azure',
        modelName: 'gpt-4o',
        model: new AzureChatOpenAI({
          azureOpenAIApiDeploymentName: 'gpt-4o',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
        }),
      };
  }
}

