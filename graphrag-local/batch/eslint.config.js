// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tseslint from 'typescript-eslint';
// @ts-expect-error ignore type errors
import eslintImport from "eslint-plugin-import";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: [
      '**/*.d.ts',
      '*.{js,jsx}',
      'src/tsconfig.json',
      'src/stories',
      '**/*.css',
      'node_modules/**/*',
      './.next/*',
      'out',
      '.storybook',
      'dist',
      '.vinxi',
      '.output',
    ],
  },
  {
    files: ['src/**/*.ts'],
    ...eslintImport.flatConfigs.recommended,
    ...eslintImport.flatConfigs.typescript,
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/ts': stylisticTs,
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
      '@stylistic/semi': ["error", "always"],
      '@stylistic/ts/indent': ['error', 2],
      'comma-dangle': ["error", "always-multiline"],
      semi: ["error", "always"],
      quotes: ["error", "single"],
      indent: ['error', 2]
    },
  },
);
