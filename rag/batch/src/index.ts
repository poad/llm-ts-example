import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { listEmbeddings } from './embeddings-models.js';
import 'dotenv/config';
import 'source-map-support/register.js';

console.info('Loading HTMLs');

const loader = new CheerioWebBaseLoader('https://qiita.com/terms');

const docs = await loader.load();

console.info('Split chunks');

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

const splitDocs = await splitter.splitDocuments(docs);

console.info('Add documents');

const indexName = process.env.PINECONE_INDEX;

const pinecone = new PineconeClient();

for (const { type, model: embeddings, dimension } of listEmbeddings()) {
  const name = `${type}-${indexName}`;

  const indexes = await pinecone.listIndexes();
  if (indexes.indexes?.some((index) => index.name === name)) {
    await pinecone.deleteIndex(name);
  }

  await pinecone.createIndex({
    name,
    dimension,
    metric: 'cosine', // Replace with your model metric
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
  });

  const pineconeIndex = pinecone.Index(name);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });
  await vectorStore.addDocuments(splitDocs);
}
