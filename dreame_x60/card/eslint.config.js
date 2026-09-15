// ESLint flat config: TypeScript strict für src/ und tests/unit/, Node-ESM-Regeln für E2E, tools und build.mjs.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const browserGlobals = { window: 'readonly', document: 'readonly', customElements: 'readonly', HTMLElement: 'readonly', CustomEvent: 'readonly', history: 'readonly', location: 'readonly', getComputedStyle: 'readonly', console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', requestAnimationFrame: 'readonly' };
const nodeGlobals = { process: 'readonly', console: 'readonly', URL: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', ...browserGlobals };

export default tseslint.config(
  { ignores: ['node_modules/**', 'tests/e2e/out/**', '../../ha/www/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/unit/**/*.ts'],
    languageOptions: { globals: { ...browserGlobals, HP_VERSION: 'readonly' } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error', // any nur an der HA-Grenze, dort mit eslint-disable-next-line begründen
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },
  {
    files: ['tests/*.js', 'tests/e2e/**/*.js', 'tools/**/*.js', 'tools/**/*.mjs', 'build.mjs', 'eslint.config.js'],
    languageOptions: { sourceType: 'module', globals: nodeGlobals },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
);
