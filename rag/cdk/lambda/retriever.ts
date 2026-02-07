import { Embeddings } from '@langchain/core/embeddings';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';

interface CreateVectorStoreProps {
  readonly embeddings: Embeddings
  readonly indexName: string
}

async function createRetriever({embeddings, indexName}: CreateVectorStoreProps): Promise<VectorStoreRetriever<PineconeStore>> {
  const pinecone = new PineconeClient();
  const pineconeIndex = pinecone.Index(indexName);
  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });
  return store.asRetriever();
}

export { createRetriever };
