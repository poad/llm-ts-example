import { initialize } from './instrumentation';
import { toBaseMessages, toUIMessageStream } from '@ai-sdk/langchain';
import { createAgent } from 'langchain';
import { createUIMessageStreamResponse, UIMessage } from 'ai';
import { ChatBedrockConverse } from '@langchain/aws';

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model: modelId,
  }: {
    messages: UIMessage[];
    model: string;
  } = await req.json();

  await initialize();

  const model = new ChatBedrockConverse({ model: modelId === 'nova-lite' ? 'us.amazon.nova-lite-v1:0' : 'us.amazon.nova-micro-v1:0' });
  const agent = createAgent({
    model,
    // model: 'bedrock_converse:us.amazon.nova-micro-v1:0',
  });

  // Stream the response from the model
  const stream = await agent.stream(
    { messages: await toBaseMessages(messages) },
    { streamMode: ['values', 'messages'] },
  );

  // Convert the LangChain stream to UI message stream
  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
};
