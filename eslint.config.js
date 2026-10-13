import { defineConfig } from 'eslint/config'

import configDefault from '@ecssc/eslint-config/default'
import configTypescript from '@ecssc/eslint-config/typescript'

export default defineConfig(
  configDefault,
  configTypescript,
  { name: 'landing/files-to-lint', files: ['**/*.{ts,mts}'] },
  {
    name: 'landing/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.astro/**',
      '**/*.config.{js,ts,mjs,mts}',
      '**/.prettierrc.mjs',
      'src/content/docs/docs/reference/api/**',
    ],
  },
  {
    name: 'landing/rules',
    settings: { tailwindcss: { config: false } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'tailwindcss/no-custom-classname': 'off',
      // Astro and its integrations provide `astro:` and `virtual:` modules.
      'import-x/no-unresolved': ['error', { ignore: ['^virtual:', '^astro:'] }],
    },
  }
)
