import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const typedLinting = {
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
    },
  },
};

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,

  // ── POM / spec test files ────────────────────────────────────────────────────
  {
    files: ['tests/**/*.ts'],
    plugins: { playwright },
    ...typedLinting,
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      // POM tests assert inside page object methods (e.g. loginPage.expectLoginPageVisible()).
      // expect-expect cannot statically inspect method bodies, so it fires false positives here.
      'playwright/expect-expect': 'off',
      // Intentionally off: API tests conditionally skip when demo app lacks expected data
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-skipped-test': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // ── Reporters (custom Playwright reporters) ──────────────────────────────────
  // The Jira reporter strips ANSI escape sequences from error messages; \x1b in
  // the regex is intentional and not a bug. Allow it for this directory only.
  {
    files: ['tests/reporters/**/*.ts'],
    rules: {
      'no-control-regex': 'off',
    },
  },

  // ── BDD step definitions ─────────────────────────────────────────────────────
  // playwright-bdd wraps Given/When/Then in its own test context, so expects ARE
  // valid here. networkidle is intentional in navigation steps.
  {
    files: ['steps/**/*.ts'],
    plugins: { playwright },
    ...typedLinting,
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-standalone-expect': 'off',
      'playwright/no-networkidle': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  {
    ignores: [
      '.features-gen/**',
      'node_modules/**',
      'allure-*/**',
      'playwright-report/**',
      'test-results/**',
    ],
  }
);
