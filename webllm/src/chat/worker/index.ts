// Must be run in a web environment, e.g. a web worker

import { ChatWebLLM } from '@langchain/community/chat_models/webllm';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CallbackHandler } from 'langfuse-langchain';

// Initialize the ChatWebLLM model with the model record and chat options.
// Note that if the appConfig field is set, the list of model records
// must include the selected model record for the engine.

// You can import a list of models available by default here:
// https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
//
// Or by importing it via:
// import { prebuiltAppConfig } from "@mlc-ai/web-llm";

async function chat(prpps: {
  question: string,
  sessionId: string,
}) {
  const {
    question,
    sessionId,
  } = prpps;

  const model = new ChatWebLLM({
    model: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    chatOptions: {
      temperature: 0.1,
    },
  });

  await model.initialize((report: {
    progress: number;
    timeElapsed: number;
    text: string;
  }) => {
    console.log(JSON.stringify(report));
    self.postMessage({
      type: 'chunk',
      data: JSON.stringify(report),
    });
  });

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;

  // Initialize Langfuse callback handler
  const langfuseHandler = publicKey && secretKey ? new CallbackHandler({
    publicKey,
    secretKey,
  }) : undefined;

  const chatTemplate = `Answer the user's question to the best of your ability.
    However, please keep your answers brief and in the same language as the question.

    {question}`;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', chatTemplate],
    ['human', 'question'],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const stream = await chain.streamEvents(
    {
      question,
    },
    {
      version: 'v1',
      configurable: {
        sessionId,
        callbacks: langfuseHandler ? [langfuseHandler] : [],
      },
    },
  );
  for await (const sEvent of stream) {
    if (sEvent.event === 'on_llm_stream') {
      const chunk: string = sEvent.data.chunk.content ?? '';
      if (chunk) {
        self.postMessage({
          type: 'chunk',
          data: chunk,
        });
      }
    }
  }
  self.postMessage({
    type: 'chunk',
    data: '¥n',
  });

  self.postMessage({
    type: 'complete',
    data: 'OK',
  });
}

// Listen for messages from the main thread
self.addEventListener('message', async (event: { data: { question?: string; sessionId?: string } }) => {
  self.postMessage({
    type: 'log',
    data: `Received data! ${JSON.stringify(event)}`,
  });

  if (event.data.question && event.data.sessionId) {
    try {
      await chat({
        question: event.data.question,
        sessionId: event.data.sessionId,
      });
    } catch (e) {
      self.postMessage({
        type: 'error',
        error: e instanceof Error ? e.message : JSON.stringify(e),
      });

    }
  }
});
