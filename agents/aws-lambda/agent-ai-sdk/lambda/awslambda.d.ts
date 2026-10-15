'use strict';

import { Stream } from 'stream';

import { APIGatewayProxyEvent, APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';

export type Event = APIGatewayProxyEvent | APIGatewayProxyEventV2;

export class HttpResponseStream {
  static from(underlyingStream: any, prelude: any): any;
}

export type RequestHandler = (
  event: Event,
  streamResponse: Stream.WritableStream,
  ctx?: Context,
  callback?: Callback<any>,
) => any | Promise<any>;

declare global {
  namespace awslambda {
    function streamifyResponse(handler: RequestHandler, option?: any): RequestHandler;
    let HttpResponseStream: HttpResponseStream;
  }
}
