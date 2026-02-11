import { logger } from '@llm-ts-example/common-backend-core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createAgent } from './agent.js';

export const handle = async ({ message: message = 'こんにちは！', model: model = 'us.amazon.nova-micro-v1:0' }: { message: string, model: string }, output: NodeJS.WritableStream) => {
  const agent = createAgent({ model });
  for await (const event of agent.stream(message)) {
    // console.log('[Event]', event.type);
    if (event.type === 'modelContentBlockDeltaEvent') {
      if (event.delta.type === 'textDelta') {
        output.write(event.delta.text);
      }
    }
  }
};

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent, responseStream: NodeJS.WritableStream,
  ) => {
    logger.debug('event', { event });
    const { message, model } = event.body ? JSON.parse(event.body) : {};
    await handle({ message, model }, responseStream);
    responseStream.end();
  });

export default handler;
