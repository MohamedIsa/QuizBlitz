import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';

export default [
  // ─────────────────────────────────────────────
  // Base JS rules
  // ─────────────────────────────────────────────
  js.configs.recommended,

  // ─────────────────────────────────────────────
  // TypeScript (only TS files)
  // ─────────────────────────────────────────────
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // ─────────────────────────────────────────────
  // Backend (NestJS / API)
  // ─────────────────────────────────────────────
  {
    files: ['apps/api/**/*.{ts,js}'],
    rules: {
      'no-console': 'error',
    },
  },

  // ─────────────────────────────────────────────
  // Web (React)
  // ─────────────────────────────────────────────
  {
    files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },

  // ─────────────────────────────────────────────
  // Mobile (React Native)
  // ─────────────────────────────────────────────
  {
    files: ['apps/mobile/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...reactNativePlugin.configs.recommended.rules,
    },
  },

  // ─────────────────────────────────────────────
  // Prettier (must be last)
  // ─────────────────────────────────────────────
  prettier,
];