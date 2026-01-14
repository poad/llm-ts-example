import * as z from 'zod';
import { BaseRetriever } from '@langchain/core/retrievers';

export const createTool = (retriever: BaseRetriever) => {
  return retriever.asTool({
    name: 'retrieve',
    description: 'Retrieve information related to a query.',
    schema: z.string().describe("検索クエリ"),
  });
};
