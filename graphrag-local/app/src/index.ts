import { ChatLlamaCpp } from '@langchain/community/chat_models/llama_cpp';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import {
  AIMessage,
  HumanMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import {
  StateGraph,
  START,
  END,
  MemorySaver,
  messagesStateReducer,
  Annotation,
} from '@langchain/langgraph';
import { v7 as uuidv7 } from 'uuid';
import { createVectorStore } from './vector-store';
import 'dotenv/config';

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

export async function run() {
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: 'nomic-ai/nomic-embed-text-v1.5',
  });

  const embeddingsType = process.env.EMBEDDINGS_TYPE;
  const indexName = `${embeddingsType}-${process.env.INDEX ?? ''}`;

  const vectorstore = createVectorStore({ embeddings, indexName });

  const model = new ChatLlamaCpp({
    modelPath: './models/RakutenAI-7B-chat-q2_K.gguf',
    // modelPath: './models/RakutenAI-7B-chat-q8_0.gguf',
  });
  const responseChainPrompt = ChatPromptTemplate.fromMessages<{
    context: string;
    chat_history: BaseMessage[];
    question: string;
  }>([
    ['system', `You are an experienced researcher, expert at interpreting and answering questions based on provided sources. Using the provided context, answer the user's question to the best of your ability using the resources provided.
Generate a concise answer for a given question based solely on the provided search results. You must only use information from the provided search results. Use an unbiased and journalistic tone. Combine search results together into a coherent answer. Do not repeat text.
If there is nothing in the context relevant to the question at hand, just say "Hmm, I'm not sure." Don't try to make up an answer.
Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user.

{context}

REMEMBER: If there is no relevant information within the context, just say "Hmm, I'm not sure." Don't try to make up an answer. Anything between the preceding 'context' html blocks is retrieved from a knowledge bank, not part of the conversation with the user.`],
    ['placeholder', '{chat_history}'],
    ['user', '{input}'],
  ]);

  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt: responseChainPrompt,
    documentPrompt: PromptTemplate.fromTemplate(
      '\n{page_content}\n',
    ),
  });

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ['placeholder', '{chat_history}'],
    ['user', '{input}'],
    [
      'user',
      'Given the above conversation, generate a natural language search query to look up in order to get information relevant to the conversation. Do not respond with anything except the query.',
    ],
  ]);

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever: vectorstore.asRetriever(),
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
  const app = workflow.compile({ checkpointer: memory });

  const threadId = uuidv7();
  const config = { configurable: { thread_id: threadId } };

  console.info('start RAG invoke');
  const events = await app.streamEvents({ input: 'RAG を作りたい。' }, { version: 'v1', ...config });
  for await (const ev of events) {
    const eventType = ev.event;
    // console.info(JSON.stringify(ev));
    if (eventType === 'on_llm_stream') {
      console.info(ev.data.chunk?.content ?? '');
      // } else if (eventType === 'on_chain_end' && ev.name === 'RunnableMap') {
      //   console.info(`\t${ev.data.input?.context.metadata.source}`);
    }
  }
}

try {
  await run().catch((e) => console.error('error', e));
} catch (e) {
  console.error('error', e);
}
