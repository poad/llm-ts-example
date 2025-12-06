import { Agent, BedrockModel } from '@strands-agents/sdk';

const createAgent = ({ model: modelId }: { model: string }) => {
  const model = new BedrockModel({
    region: 'us-east-1',
    modelId: modelId,
    maxTokens: 4096,
    temperature: 0.7,
  });

  return new Agent({ model });
};

export { createAgent };
