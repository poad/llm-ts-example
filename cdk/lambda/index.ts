'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handle } from './handler';

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent, responseStream: NodeJS.WritableStream
  ) => {
    const question = event.body ? JSON.parse(event.body).question : 'あなたは誰？';
    await handle(event.requestContext.requestId, question, responseStream);
    responseStream.end();
  });


export default handler;
