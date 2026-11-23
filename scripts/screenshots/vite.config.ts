import { inkbar } from '@inkbar/core/vite'
import { defineConfig } from 'vite'

import { fileURLToPath } from 'node:url'

// Serves the capture page, with the sample documents at the root.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: 'documents',
  plugins: [inkbar()],
  server: { port: 5199, strictPort: true },
  logLevel: 'warn',
})
