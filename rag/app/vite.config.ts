/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    conditions: ['development', 'browser'],

    // モノレポ用の共通設定
    alias: {
      // パッケージ間の直接参照
      '@llm-ts-example/common-core': resolve(__dirname, '../../common/core/src'),
      '@llm-ts-example/common-backend': resolve(__dirname, '../../common/backend/src')
    }
  },
  server: {
    fs: {
      // モノレポ内のファイルアクセスを許可
      allow: ['..']
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      // ESModuleとして出力
      output: {
        format: 'es'
      }
    }
  },
});
