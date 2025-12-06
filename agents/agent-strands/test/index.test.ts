import { test } from 'vitest';
import { stdout } from 'node:process';
import { PassThrough } from 'node:stream';
import { handle } from '../lambda/index.js';

function sleep(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

const model = process.env.USE_MODEL ?? '';
const isDefinedModel = model.length > 0;
test.runIf(isDefinedModel)('test', { retry: 0 }, async () => {

  const output = process.env.DISABLE_STDOUT === 'true' ? new PassThrough() : stdout;
  const message = process.env.QUESTION && process.env.QUESTION.length > 0 ? process.env.QUESTION : 'あなたは誰？質問と同じ言語で答えてください。';

  await handle({message, model}, output);
  await sleep(2000);
});
