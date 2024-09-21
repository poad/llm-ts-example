import { it } from 'vitest';
import { handle } from '../lambda/handler';
import { stdout } from 'node:process';

console.log(import.meta.env.AZURE_OPENAI_API_KEY);
console.log(import.meta.env.AZURE_OPENAI_API_INSTANCE_NAME);
console.log(import.meta.env.AZURE_OPENAI_API_DEPLOYMENT_NAME);
console.log(import.meta.env.AZURE_OPENAI_API_VERSION);

it('test', async () => {
  await handle(new Date().getTime().toString(), 'あなたは誰？', stdout);
});
