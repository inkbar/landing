# Icons

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-66/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-66/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-66/docs/quickstart.md.

The 52 icons the toolbar controls show, which control shows each one, and how to use them on your own buttons.

The toolbar controls show icons from `@inkbar/icons`: 52 icons from [Lucide](https://lucide.dev), stored as plain data so the package has no dependencies.

| Icon | Shown by |
| ---- | -------- |
| `TextCursor` | Select text tool |
| `SquareDashedMousePointer` | Rectangle select tool |
| `Highlighter` | Highlight tool, and the highlight menu |
| `Underline` | Highlight menu, and the text style menu |
| `Strikethrough` | Highlight menu |
| `SpellCheck2` | Highlight menu, for squiggly |
| `Square` | Mark for redaction tool, and the rectangle shape |
| `MessageSquare` | Add note tool |
| `MessageSquareText` | Note icon on the page |
| `Shapes` | Shape tool |
| `Slash` | Line shape |
| `MoveUpRight` | Arrow shape |
| `RectangleHorizontal` | Rounded rectangle shape |
| `Circle` | Ellipse shape |
| `MessageCircle` | Speech bubble shape |
| `Star` | Star shape |
| `Hexagon` | Polygon shape |
| `Search` | Loupe shape, the Find button and search fields |
| `SquareDashed` | Mask shape |
| `CircleDashed` | Oval mask shape |
| `Type` | Text box tool |
| `PenLine` | Draw tool |
| `PenTool` | Sketch tool |
| `Signature` | Signature tool and menu |
| `Trash2` | Signature menu, to delete a saved signature |
| `Plus` | Signature menu, to add one, and Increase font size |
| `Minus` | Line style menu, and Decrease font size |
| `ALargeSmall` | Text style menu |
| `Bold` | Text style menu |
| `Italic` | Text style menu |
| `AlignLeft` | Text style menu |
| `AlignCenter` | Text style menu |
| `AlignRight` | Text style menu |
| `AlignJustify` | Text style menu |
| `Undo2` | Undo |
| `Redo2` | Redo |
| `ZoomIn` | Zoom in |
| `ZoomOut` | Zoom out |
| `ChevronLeft` | Previous page |
| `ChevronRight` | Next page |
| `ArrowLeft` | Back |
| `ArrowRight` | Forward |
| `ChevronDown` | Menu triggers, the zoom select, and Next match |
| `ChevronUp` | Previous match |
| `CaseSensitive` | Match case |
| `X` | Close find |
| `Check` | Beside the chosen colour, line style or zoom level |
| `Download` | Download |
| `Printer` | Print |
| `MoveRight` | No control: for your own buttons |
| `List` | No control: for your own buttons |
| `Info` | No control: for your own buttons |

The core `createZoomSelect` is a native `<select>`. Inside a toolbar, the theme draws the `ChevronDown` shape on it in CSS, and it has no `Check`.

## Using an icon on your own button

The controls bring their icons with them. Install `@inkbar/icons` only when you want the same icons on your own buttons, so they match the rest of the toolbar:

```sh
pnpm add @inkbar/icons
```

Each framework package has an `InkIcon` component that draws one. Without a framework, `createIcon` from `@inkbar/core/dom` returns the `<svg>` element.

**Vue**

```vue
<script setup lang="ts">
import { Check } from '@inkbar/icons'
import { InkIcon } from '@inkbar/vue'
</script>

<template>
  <button type="button" aria-label="Finish review">
    <InkIcon :icon="Check" />
  </button>
</template>
```

**React**

```tsx
import { Check } from '@inkbar/icons'
import { InkIcon } from '@inkbar/react'

export function FinishButton() {
  return (
    <button type="button" aria-label="Finish review">
      <InkIcon icon={Check} />
    </button>
  )
}
```

**Svelte**

```svelte
<script lang="ts">
  import { Check } from '@inkbar/icons'
  import { InkIcon } from '@inkbar/svelte'
</script>

<button type="button" aria-label="Finish review">
  <InkIcon icon={Check} />
</button>
```

**Plain DOM**

```ts
import { Check } from '@inkbar/icons'
import { createIcon } from '@inkbar/core/dom'

const finish = document.createElement('button')
finish.type = 'button'
finish.setAttribute('aria-label', 'Finish review')
finish.append(createIcon(Check))
```

The icon is hidden from screen readers, so give the button its own name, as `aria-label` does here. `InkIcon` sets its width and height from `size`, which defaults to 18. With the theme loaded, CSS sizes every icon to `--ink-icon-size` (default `1.125rem`) instead, so set that variable on the button or an ancestor to change the size.

## Replacing a control's icon

Give a control your own content and it shows that instead of its icon. Its accessible name stays the same. In Vue, use the default slot; in React and Svelte, pass `children`. A control from `@inkbar/core/dom` is an ordinary element, so replace its children: `undo.replaceChildren(yourSvg)`.

[Toolbars](https://inkbar.dev/pr-preview/pr-66/docs/guides/toolbars.md#icons-and-labels) has an example in each framework.

## Drawing an icon yourself

Each icon is an array of `[tag, attributes]` pairs. To draw one without `InkIcon` or `createIcon`, create each element inside an `<svg>` that has the attributes in `ICON_ATTRIBUTES`, plus a `width` and `height`.

## Licence

The icons come from Lucide under the ISC licence, and some of them derive from Feather under the MIT licence. The `@inkbar/icons` package carries both notices in its `LICENSE` file.
