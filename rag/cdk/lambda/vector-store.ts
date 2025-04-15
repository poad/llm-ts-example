import { Embeddings } from '@langchain/core/embeddings';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

async function createVectorStore({embeddings, indexName}: {embeddings: Embeddings, indexName: string}) {
  const pinecone = new PineconeClient();
  const pineconeIndex = pinecone.Index(indexName);
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });
}

export { createVectorStore };
