'use strict';

import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';
import { logger } from '@llm-ts-example/common-backend';
import { handle } from './handler.js';

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent | APIGatewayProxyEventV2, responseStream: NodeJS.WritableStream,
  ) => {
    logger.info('event', {event});
    await handle(event, responseStream);
    responseStream.end();
  });


export default handler;
