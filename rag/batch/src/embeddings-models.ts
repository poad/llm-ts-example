import { BedrockEmbeddings } from '@langchain/aws';
import { Embeddings } from '@langchain/core/embeddings';

interface EmbeddingsModel {
  type: 'titan' | 'openai'
  model: Embeddings
  dimension: number
}

function listEmbeddings(): EmbeddingsModel[] {
  // Do not log sensitive information such as API keys.
  return [
    {
      type: 'titan', model: new BedrockEmbeddings({
        region: process.env.BEDROCK_AWS_REGION ?? 'us-west-2',
        model: 'amazon.titan-embed-text-v2:0',
      }),
      dimension: 1024,
    },
    // {
    //   type: 'openai', model: new AzureOpenAIEmbeddings({
    //     maxRetries: 1,
    //   }),
    //   dimension: 1536,
    // },
  ];
}

export { listEmbeddings };
