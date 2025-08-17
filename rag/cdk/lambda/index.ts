'use strict';

// eslint-disable-next-line import/no-unresolved
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handle } from './handler';
import { v7 as uuidv7 } from 'uuid';

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent, responseStream: NodeJS.WritableStream,
  ) => {
    const { question, model, sessionId } = event.body ? JSON.parse(event.body) : { question: 'あなたは誰？', model: 'gpt', sessionId: uuidv7() };
    await handle(sessionId, { question, model }, responseStream);
    responseStream.end();
  });


export default handler;
