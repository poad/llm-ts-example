// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tseslint from 'typescript-eslint';
// @ts-expect-error ignore type errors
import importPlugin from 'eslint-plugin-import';

import pluginPromise from 'eslint-plugin-promise'

export default tseslint.config(
  {
    ignores: [
      '**/*.d.ts',
      '*.{js,jsx}',
      'node_modules/**/*',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  pluginPromise.configs['flat/recommended'],
  {
    files: ['index.ts'],
    ...importPlugin.flatConfigs.recommended,
    ...importPlugin.flatConfigs.typescript,
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      '@stylistic/semi': 'error',
      '@stylistic/ts/indent': ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-parens': ['error', 'always'],
      indent: ['error', 2],
      quotes: ['error', 'single'],
    },
  },
);
