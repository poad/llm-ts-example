import { Embeddings } from '@langchain/core/embeddings';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

interface CreateVectorStoreProps {
  embeddings: Embeddings
  indexName: string
}

async function createVectorStore({embeddings, indexName}: CreateVectorStoreProps): Promise<PineconeStore> {
  const pinecone = new PineconeClient();
  const pineconeIndex = pinecone.Index(indexName);
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });
}

export { createVectorStore };
