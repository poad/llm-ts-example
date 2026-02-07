'use strict';

// eslint-disable-next-line import/no-unresolved
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';
import { logger } from '@llm-ts-example/common-backend';
import { handle } from './handler';

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent | APIGatewayProxyEventV2, responseStream: NodeJS.WritableStream,
  ) => {
    logger.info('event', { event });
    await handle({ body: event.body }, responseStream);
    responseStream.end();
  });


export default handler;
