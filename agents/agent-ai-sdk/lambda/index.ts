import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';
import { logger } from '@llm-ts-example/common-backend-core';
import { handle } from './handler.js';

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent | APIGatewayProxyEventV2, responseStream: NodeJS.WritableStream,
  ) => {
    logger.info('event', { event });
    const body = event.body;
    if (!body) {
      logger.error('No body in request');
      responseStream.write('error');
    } else {
      await handle({ body }, responseStream);
    }
    responseStream.end();
  });


export default handler;
