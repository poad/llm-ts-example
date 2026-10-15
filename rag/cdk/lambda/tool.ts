import { BaseRetriever } from '@langchain/core/retrievers';
import * as z from 'zod';

export const createTool = (retriever: BaseRetriever) => {
  return retriever.asTool({
    name: 'retrieve',
    description: 'Retrieve information related to a query.',
    schema: z.string().describe('検索クエリ'),
  });
};
