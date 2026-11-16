// Points each docs page at its Markdown twin, for agents that read the head.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data'

import { siteUrl, twinPath } from './lib/markdown-twin'

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute
  // The 404 page is not in the docs collection, so it has no twin.
  if (route.entry.id !== 'docs' && !route.entry.id.startsWith('docs/')) return
  route.head.push({
    tag: 'link',
    attrs: {
      rel: 'alternate',
      type: 'text/markdown',
      href: siteUrl(import.meta.env.BASE_URL) + twinPath(route.entry.id),
    },
  })
})
