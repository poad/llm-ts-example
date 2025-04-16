import 'neo4j-driver';

import { Neo4jVectorStore } from '@langchain/community/vectorstores/neo4j_vector';
import { Embeddings } from '@langchain/core/embeddings';

import 'source-map-support/register.js';


function createVectorStore({
  embeddings,
  indexName,
}: {
  embeddings: Embeddings
  indexName: string
}) {
  try {
    return new Neo4jVectorStore(
      embeddings, {
      url: process.env.NEO4J_URL ?? '',
      username: process.env.NEO4J_USERNAME ?? 'neo4j',
      password: process.env.NEO4J_PASSWORD ?? '',
      indexName,
      keywordIndexName: "keyword",
      searchType: "vector" as const,
      nodeLabel: "Chunk",
      textNodeProperty: "text",
      embeddingNodeProperty: "embedding",
      preDeleteCollection: true,
      createIdIndex: true,
    },
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export { createVectorStore };
