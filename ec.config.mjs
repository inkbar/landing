import { defineEcConfig } from '@astrojs/starlight/expressive-code'

import { focusableCode } from './src/shiki/focusable-code.ts'
import inkbarInk from './src/shiki/inkbar-ink.json' with { type: 'json' }

export default defineEcConfig({
  themes: [inkbarInk],
  plugins: [focusableCode()],
  styleOverrides: { borderRadius: '12px' },
})
