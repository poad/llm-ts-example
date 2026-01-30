import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { configs, parser } from 'typescript-eslint';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'components/ai-elements/**',
    'components/ui/**',
  ]),
  eslint.configs.recommended,
  ...configs.strict,
  ...configs.stylistic,
  {
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig-eslint.json'],
      },
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quotes': ['error', 'single'],
    },
  },
]);

export default eslintConfig;
