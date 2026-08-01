// vite.config.ts
import { defineConfig, type Plugin } from 'vite';

function patchBedrockAgentcoreRequire(): Plugin {
  return {
    name: 'patch-bedrock-agentcore-dynamic-require',
    transform(code, id) {
      if (!id.includes('bedrock-agentcore') || !id.endsWith('app.js')) return null;
      if (!code.includes('require$1("@fastify/sse")')) return null;

      const patched = code
        .replace(
          'var fastifySse = require$1("@fastify/sse");',
          'import fastifySse from "@fastify/sse";',
        )
        .replace(
          'var fastifyWebsocket = require$1("@fastify/websocket");',
          'import fastifyWebsocket from "@fastify/websocket";',
        );

      return { code: patched, map: null };
    },
  };
}

export default defineConfig({
  plugins: [patchBedrockAgentcoreRequire()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    outDir: 'dist',
    ssr: true,
    target: 'node22',
    commonjsOptions: { ignoreTryCatch: false },
    rolldownOptions: { external: [] },
  },
  ssr: { noExternal: true },
});
