'use strict';

import { handle } from './handler.js';

import { logger } from '@llm-ts-example/common-backend-core';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';

export const handler = awslambda.streamifyResponse(
  async (
    event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
    responseStream: NodeJS.WritableStream,
  ) => {
    logger.info('event', { event });
    await handle({ body: event.body }, responseStream);
    responseStream.end();
  },
);

export default handler;
