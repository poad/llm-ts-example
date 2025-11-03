import { BedrockEmbeddings } from '@langchain/aws';
import { Embeddings } from '@langchain/core/embeddings';

interface EmbeddingsModel {
  indexName: string
  model: Embeddings
}

interface SelectEmbeddingsProps {
  type: string
  dataSource: string
}

function selectEmbeddings(
  {
    // type,
    dataSource,
  }: SelectEmbeddingsProps,
): EmbeddingsModel {
  return {
    indexName: `titan-${dataSource}`,
    model: new BedrockEmbeddings({
      region: process.env.BEDROCK_AWS_REGION ?? 'us-west-2',
      model: 'amazon.titan-embed-text-v2:0',
    }),
  };
}

export { selectEmbeddings };
