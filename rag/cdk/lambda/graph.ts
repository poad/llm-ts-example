import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import {
  StateGraph,
  START,
  END,
  MemorySaver,
  messagesStateReducer,
  Annotation,
} from '@langchain/langgraph';
import { selectEmbeddings } from './embeddings-models';
import { createVectorStore } from './vector-store';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';

 
import { selectLlm } from '@llm-ts-example/common-backend';

// Define the State interface
const GraphAnnotation = Annotation.Root({
  input: Annotation<string>(),
  chat_history: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  context: Annotation<string>(),
  answer: Annotation<string>(),
});

export async function createGraph({
  embeddingType,
  modelType,
}: {
  embeddingType?: string
  modelType?: string,
}) {
  const { indexName, model: embeddings } = selectEmbeddings({
    type: embeddingType ?? 'titan', dataSource: process.env.PINECONE_INDEX ?? '',
  });

  const vectorStore = await createVectorStore({ embeddings, indexName });

  const { platform, model, modelName } = selectLlm(modelType);

  const systemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, say that you don't know.
Use three sentences maximum and keep the answer concise.

{context}`;
  const qaPrompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
  ]);

  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt: qaPrompt,
  });

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    [
      'system',
      'Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is.',
    ],
  ]);

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever: vectorStore.asRetriever(),
    rephrasePrompt: historyAwarePrompt,
  });

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever: historyAwareRetrieverChain,
  });

  // Define the call_model function
  async function callModel(state: typeof GraphAnnotation.State) {
    const response = await retrievalChain.invoke(state);
    return {
      chat_history: [
        new HumanMessage(state.input),
        new AIMessage(response.answer),
      ],
      context: response.context,
      answer: response.answer,
    };
  }

  // Create the workflow
  const workflow = new StateGraph(GraphAnnotation)
    .addNode('model', callModel)
    .addEdge(START, 'model')
    .addEdge('model', END);

  // Compile the graph with a checkpointer object
  const memory = new MemorySaver();
  return {
    platform,
    modelName,
    graph: workflow.compile({ checkpointer: memory }),
  };
}

const { graph } = await createGraph({});
export default graph;
