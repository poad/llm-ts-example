import { APIGatewayProxyEvent } from 'aws-lambda';
import { handle } from './handler';
import { v7 as uuidv7 } from 'uuid';

import { logger } from '@llm-ts-example/common-backend';

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent, responseStream: NodeJS.WritableStream,
  ) => {
    logger.debug('event', {event});
    const { question, model, sessionId } = event.body ? JSON.parse(event.body) : { question: 'あなたは誰？', model: 'gpt', sessionId: uuidv7() };
    await handle(sessionId, { question, model }, responseStream);
    responseStream.end();
  });


export default handler;
