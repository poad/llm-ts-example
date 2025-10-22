import { it } from 'vitest';
import { handle } from '../lambda/handler';
import { stdout } from 'node:process';
import { PassThrough } from 'node:stream';
import { APIGatewayProxyEvent } from 'aws-lambda';

function sleep(time: number) {
  return new Promise<void>((resolve) => {
      setTimeout(() => {
          resolve();
      }, time);
  });
}

it('test', { retry: 0 }, async () => {

  const sessionId = process.env.FIXED_SESSION_ID && process.env.FIXED_SESSION_ID.length > 0 ? process.env.FIXED_SESSION_ID : new Date().getTime().toString()
  const model = process.env.USE_MODEL;
  const output = process.env.DISABLE_STDOUT === 'true' ? new PassThrough() : stdout;
  const question = process.env.QUESTION && process.env.QUESTION.length > 0 ? process.env.QUESTION : '何のドキュメント？';

  await handle({
    body: JSON.stringify({ sessionId: `local-${sessionId}`, question, model }),
    headers: {},
    isBase64Encoded: false,
    requestContext: {
      accountId: '',
      apiId: '',
      protocol: 'HTTPS',
      httpMethod: 'POST',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '',
        user: null,
        userAgent: null,
        userArn: null
      },
      path: '',
      stage: 'default',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
      authorizer: {
      },
      routeKey: '',
    },
  } as APIGatewayProxyEvent, output);
  await sleep(1000);
});
