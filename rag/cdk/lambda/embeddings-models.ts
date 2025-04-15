import { BedrockEmbeddings } from '@langchain/aws';
import { Embeddings } from '@langchain/core/embeddings';
// import { AzureOpenAIEmbeddings } from '@langchain/openai';

interface EmbeddingsModel {
  indexName: string
  model: Embeddings
}

function selectEmbeddings(
  {
    // type,
    dataSource,
  }: { type: string, dataSource: string },
): EmbeddingsModel {
  // if (type === 'openai') {
  //   return {
  //     indexName: `openai-${dataSource}`,
  //     model: new AzureOpenAIEmbeddings({
  //       maxRetries: 1,
  //     }),
  //   };
  // }
  return {
    indexName: `titan-${dataSource}`,
    model: new BedrockEmbeddings({
      region: process.env.BEDROCK_AWS_REGION ?? 'us-west-2',
      model: 'amazon.titan-embed-text-v2:0',
    }),
  };
}

export { selectEmbeddings };
