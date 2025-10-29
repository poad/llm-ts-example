import * as z from 'zod';
import { tool, StructuredTool } from '@langchain/core/tools';
import { PineconeStore } from '@langchain/pinecone';

const retrieveSchema = z.object({ query: z.string() });

const retrieveTool = (vectorStore: PineconeStore) => {
  return async ({ query }: { query: string }) => {
    const retrievedDocs = await vectorStore.similaritySearch(query, 2);
    const serialized = retrievedDocs
      .map(
        (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`,
      )
      .join('\n');
    return [serialized, retrievedDocs];
  };
};


export const createTool = (vectorStore: PineconeStore): StructuredTool => {
  const retrieve = tool<z.ZodObject<{
    query: z.ZodString;
  }, z.core.$strip>>(
    retrieveTool(vectorStore),
    {
      name: 'retrieve',
      description: 'Retrieve information related to a query.',
      schema: retrieveSchema,
      responseFormat: 'content_and_artifact',
    },
  );
  return retrieve;
};
