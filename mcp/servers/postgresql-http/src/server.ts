import { serve } from '@hono/node-server';
import { app } from './app';

const server = serve(
  { ...app, port: 3000 }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  });

// graceful shutdown
process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
