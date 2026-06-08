import { app } from './app.js';
import { handle } from 'hono/aws-lambda';

// Start the server
export const handler = handle(app);
