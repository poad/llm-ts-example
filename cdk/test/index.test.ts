import { it } from 'poku';
import { handle } from '../lambda/handler';
import { stdout } from 'node:process';

it('test', async () => {
  await handle(new Date().getTime().toString(), 'あなたは誰？', stdout);
});
