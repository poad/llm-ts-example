// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import eslintImport from 'eslint-plugin-import';

import vitest from '@vitest/eslint-plugin';

import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

const config = tseslint.config(
  includeIgnoreFile(gitignorePath),
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
  eslintImport.flatConfigs.recommended,
  eslintImport.flatConfigs.typescript,
  {
    files: ['{bin,lib,lambda}/**/*.{ts,tsx}'],
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
      '@stylistic/indent': ['error', 2],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quotes': ['error', 'single'],
    },
  },
  {
    files: ['test/**'], // or any other pattern
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
      'vitest/max-nested-describe': ['error', { 'max': 3 }] // you can also modify rules' behavior using option like this
    },
  },
);

export default config;
