import { input } from '@inquirer/prompts';
import dotenv from 'dotenv';
import * as sourceMap from 'source-map-support';
import { createAgent } from './agent.js';
sourceMap.install();

dotenv.config();

try {
  const agent = await createAgent();
  try {
    const content = await input({ message: '' });
    if (content && content !== 'exit' && content !== 'quit') {
      const agentResponse = await agent.invoke(content);
      console.log(agentResponse.messages.reverse()[0].content);
    }
  } finally {
    // Clean up connection
    await agent.close();
  }
} catch (e) {
  console.error(e);
}
