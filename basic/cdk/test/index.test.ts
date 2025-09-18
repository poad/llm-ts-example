import { test } from 'vitest';
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

const model = process.env.USE_MODEL ?? '';
const isDefiendModel = model.length > 0;
test.runIf(isDefiendModel)('test', { retry: 0 }, async () => {

  const sessionId = process.env.FIXED_SESSION_ID && process.env.FIXED_SESSION_ID.length > 0 ? process.env.FIXED_SESSION_ID : new Date().getTime().toString();
  const output = process.env.DISABLE_STDOUT === 'true' ? new PassThrough() : stdout;
  const question = process.env.QUESTION && process.env.QUESTION.length > 0 ? process.env.QUESTION : 'あなたは誰？質問と同じ言語で答えてください。';

  await handle(`local-${sessionId}`, {question, model}, output);
  await sleep(2000);
});
