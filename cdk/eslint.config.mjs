// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/*.d.ts',
      '*.{js,jsx}',
      'src/tsconfig.json',
      'src/stories',
      '**/*.css',
      'node_modules/**/*',
      'out',
      'cdk.out',
      'dist',
      '!awslambda.d.ts'
    ],
  },
  {
    files: [
      'bin/*.ts',
      'bin/**/*.ts',
      'lib/*.ts',
      'lib/**/*.ts',
      'lambda/*.ts',
      'lambda/**/*.ts',
    ],
  },
  {
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/ts': stylisticTs,
    },
  },
  {
    rules: {
      semi: 'error',
      quotes: ['error', 'single'],
      '@stylistic/semi': 'error',
      '@stylistic/ts/indent': ['error', 2],
      // 'comma-dangle': ['error', 'as-needed'],
      'arrow-parens': ['error', 'always'],
    },
  }
);
