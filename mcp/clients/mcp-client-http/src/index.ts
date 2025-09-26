import dotenv from 'dotenv';
import { createMcpClient } from './McpClient';

dotenv.config();

const region = process.env.AWS_REGION ?? 'us-west-2';
const url = process.env.URL ?? 'http://localhost:3000/mcp';

const MODEL_ID = process.env.MODEL_ID ?? 'us.amazon.nova-micro-v1:0';

const modelId = MODEL_ID;
console.log(`use ${modelId}`);

const client = await createMcpClient({ region, url, modelId });
await client.chat();
