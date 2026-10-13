import { definePlugin } from '@astrojs/starlight/expressive-code'

interface HastNode {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function focusPres(node: HastNode): void {
  if (node.type === 'element' && node.tagName === 'pre') {
    node.properties = { ...node.properties, tabIndex: 0 }
  }
  node.children?.forEach(focusPres)
}

/**
 * A code block that scrolls sideways must be reachable from the keyboard. Making every block
 * focusable keeps that true whatever the block's width happens to be.
 */
export function focusableCode() {
  return definePlugin({
    name: 'Focusable code blocks',
    hooks: {
      postprocessRenderedBlock: ({ renderData }) => {
        focusPres(renderData.blockAst)
      },
    },
  })
}
