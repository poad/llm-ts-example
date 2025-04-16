import { Embeddings } from '@langchain/core/embeddings';
// import { BedrockEmbeddings } from '@langchain/aws';
import { AzureOpenAIEmbeddings } from '@langchain/openai';

interface EmbeddingsModel {
  type: 'titan' | 'openai'
  model: Embeddings
  dimension: number
}

function listEmbeddings(): EmbeddingsModel[] {
  console.log(process.env.AZURE_OPENAI_API_KEY);
  return [
    // {
    //   type: 'titan', model: new BedrockEmbeddings({
    //     region: process.env.BEDROCK_AWS_REGION ?? 'us-west-2',
    //     model: 'amazon.titan-embed-text-v2:0',
    //   }),
    //   dimension: 1024,
    // },
    {
      type: 'openai', model: new AzureOpenAIEmbeddings({
        maxRetries: 1,
      }),
      dimension: 1536,
    },
  ];
}

export { listEmbeddings };
