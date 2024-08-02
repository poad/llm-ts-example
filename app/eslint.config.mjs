// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import stylisticJsx from '@stylistic/eslint-plugin-jsx';
import tseslint from 'typescript-eslint';
// @ts-expect-error ignore
import eslintImport from 'eslint-plugin-import';
import solid from 'eslint-plugin-solid';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

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
      'dist',
    ],
  },
  {
    files: ['src/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
  },
  {
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/ts': stylisticTs,
      '@stylistic/jsx': stylisticJsx,
    },
    rules: {
      'semi': 'error',
      'quotes': ['error', 'single'],
      '@stylistic/semi': 'error',
      '@stylistic/ts/indent': ['error', 2],
      '@stylistic/jsx/jsx-indent': ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    plugins: {
      import: eslintImport,
      solid,
    },
    extends: [
      ...tseslint.configs.recommended,
      ...compat.config(eslintImport.configs.recommended),
      ...compat.config(eslintImport.configs.typescript),
    ],
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
      'import/namespace': 'off',
      'import/named': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'off',
      'import/default': 'off',
      'import/export': 'off',
    },
  },
  {
    rules: {
      semi: ['error', 'always'],
    },
  },
);
