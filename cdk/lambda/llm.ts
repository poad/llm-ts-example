import { AzureChatOpenAI } from '@langchain/openai';
import { ChatBedrockConverse } from '@langchain/aws';
import { logger } from './logger';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export function selectLlm(modelType?: string): {
  platform: 'aws' | 'azure' | 'anthropic';
  modelName: string;
  model: BaseChatModel;
} {
  const region = process.env.BEDROCK_AWS_REGION;
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
          region,
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
          region,
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
          region,
        }),
      };
    case 'llama33-70b':
      logger.debug('use: Meta LLama 3.3 70B Instruct');
      return {
        platform: 'aws',
        modelName: 'us.meta.llama3-3-70b-instruct-v1:0',
        model: new ChatBedrockConverse({
          model: 'us.meta.llama3-3-70b-instruct-v1:0',
          temperature: 0,
          streaming: true,
          metadata: {
            tag: 'chat',
          },
          region,
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
          region,
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
          region,
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
          region,
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

    // case 'claude-3.7-sonnet-v1':
    //   logger.debug('use: Claude 3.7 Sonnet v1 on AWS Bedrock');
    //   return {
    //     platform: 'aws',
    //     modelName: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    //     model: new ChatBedrockConverse({
    //       model: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    //       temperature: 0,
    //       streaming: true,
    //       metadata: {
    //         tag: 'chat',
    //       },
    //       region,
    //     }),
    //   };
    // case 'claude-3.5-sonnet-v2':
    //   logger.debug('use: Claude 3.5 Sonnet v2 on AWS Bedrock');
    //   return {
    //     platform: 'aws',
    //     modelName: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    //     model: new ChatBedrockConverse({
    //       model: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    //       temperature: 0,
    //       streaming: true,
    //       metadata: {
    //         tag: 'chat',
    //       },
    //       region,
    //     }),
    //   };
    // case 'claude-3.5-sonnet-v1':
    //   logger.debug('use: Claude 3.5 Sonnet v1 on AWS Bedrock');
    //   return {
    //     platform: 'aws',
    //     modelName: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
    //     model: new ChatBedrockConverse({
    //       model: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
    //       temperature: 0,
    //       streaming: true,
    //       metadata: {
    //         tag: 'chat',
    //       },
    //       region,
    //     }),
    //   };
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
  };
}

