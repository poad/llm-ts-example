// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import eslintImport from "eslint-plugin-import";

import vitest from "@vitest/eslint-plugin";

const config = tseslint.config(
  {
    ignores: [
      '**/*.d.ts',
      '**/*.js',
      'node_modules/**/*',
      'out',
      'dist',
      'cdk.out',
      '.output',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['{bin,lib,lambda}/**/*.{ts,tsx}'],
    ...eslintImport.flatConfigs.recommended,
    ...eslintImport.flatConfigs.typescript,
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/ts': stylistic,
    },
    settings: {
      'import/internal-regex': '^~/',
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/ts/indent': ['error', 2],
      'comma-dangle': ["error", "always-multiline"],
      '@stylistic/quotes': ['error', 'single'],
    },
  },
  {
    files: ["test/**"], // or any other pattern
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
      "vitest/max-nested-describe": ["error", { "max": 3 }] // you can also modify rules' behavior using option like this
    },
  },
);

export default config;
