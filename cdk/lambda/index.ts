'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handle } from './handler';

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent, responseStream: NodeJS.WritableStream,
  ) => {
    const { question, model } = event.body ? JSON.parse(event.body) : { question: 'あなたは誰？', model: 'gpt' };
    await handle(event.requestContext.requestId, { question, model }, responseStream);
    responseStream.end();
  });


export default handler;
