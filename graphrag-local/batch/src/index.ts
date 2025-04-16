import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { listEmbeddings } from './embeddings-models.js';
// import 'neo4j-driver';
// import { Neo4jVectorStore } from '@langchain/community/vectorstores/neo4j_vector';
import { createVectorStore } from './vector-store.js';
import 'dotenv/config';
import 'source-map-support/register.js';

async function main() {
  console.info('Loading HTMLs');

  const loader = new CheerioWebBaseLoader('https://qiita.com/terms');

  const docs = await loader.load();

  console.info('Split chunks');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 50,
  });

  const documents = await splitter.splitDocuments(docs);

  console.info('Add documents');

  const indexName = process.env.INDEX;

  for (const { type, model: embeddings } of listEmbeddings()) {
    const name = `${type}_${indexName}`;

    // const neo4jVectorIndex = await Neo4jVectorStore.fromDocuments(
    //   documents,
    //   embeddings,
    //   {
    //     url: process.env.NEO4J_URL ?? '',
    //     username: process.env.NEO4J_USERNAME ?? 'neo4j',
    //     password: process.env.NEO4J_PASSWORD ?? '',
    //     indexName: name,
    //     keywordIndexName: 'keyword',
    //     searchType: 'vector' as const,
    //     nodeLabel: 'Chunk',
    //     textNodeProperty: 'text',
    //     embeddingNodeProperty: 'embedding',
    //     retrievalQuery: `
    //       RETURN node.text AS text, score, {a: node.a * 2} AS metadata
    //     `,
    //     // preDeleteCollection: true,
    //     // createIdIndex: true,
    //   },
    // );
    // const results = await neo4jVectorIndex.similaritySearch("water", 1);

    // console.log(results);

    // await neo4jVectorIndex.close();

    const vectorStore = await createVectorStore({embeddings, indexName: name});
    await vectorStore.addDocuments(documents);
    await vectorStore.close();
  }
}

main().catch((e) => console.error(e));
