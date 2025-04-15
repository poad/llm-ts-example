import { it } from 'vitest';
import { handle } from '../lambda/handler';
import { stdout } from 'node:process';
import { PassThrough } from 'node:stream';

function sleep(time: number) {
  return new Promise<void>((resolve) => {
      setTimeout(() => {
          resolve();
      }, time);
  });
}

// eslint-disable-next-line vitest/expect-expect
it('test', { retry: 0 }, async () => {

  const sessionId = process.env.FIXED_SESSION_ID && process.env.FIXED_SESSION_ID.length > 0 ? process.env.FIXED_SESSION_ID : new Date().getTime().toString()
  const model = process.env.USE_MODEL;
  const output = process.env.DISABLE_STDOUT === 'true' ? new PassThrough() : stdout;
  const question = process.env.QUESTION && process.env.QUESTION.length > 0 ? process.env.QUESTION : 'あなたは誰？';

  await handle(`local-${sessionId}`, {question, model}, output);
  await sleep(1000);
});
