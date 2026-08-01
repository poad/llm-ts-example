import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from "node:process";
import { createAgent } from './agent.js';
import { logger } from './logger.js';

const session = crypto.randomUUID();
const rl = readline.createInterface({ input, output });

const agent = await createAgent({ model: 'global.amazon.nova-2-lite-v1:0', session });
while (true) {
  const line = await rl.question("prompt or command: ");
  if (line.trim() === '/exit' || line.trim() === '/quit') {
    agent.cancel();
    console.log("Bye!");
    process.exit(0);
  }
  for await (const event of agent.stream(line)) {
    logger.trace('[Event]', event.type);
    if (event.type === 'modelStreamUpdateEvent') {
      if (event.event.type === 'modelContentBlockDeltaEvent' &&
        event.event.delta.type === 'textDelta') {
        if (event.event.delta.type === 'textDelta') {
          console.log({ event: 'message', data: { text: event.event.delta.text } });
        }
      }
    }
  }
};
