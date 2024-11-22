/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import * as dotenv from 'dotenv';

export default defineConfig({
  root: '.',
  test: {
    environment: 'node',
    globals: true,
    isolate: true,
    env: dotenv.config({ path: '.env.test' }).parsed,
    testTimeout: 30000,
  },
  build: {
    target: 'esnext',
  },
  // resolve: {
  //   conditions: ['development'],
  // }
});
