---
title: Theming
description: Import the default stylesheet and restyle it with your own tokens and CSS.
---

`@inkbar/theme` holds the default styles for the Inkbar components: one stylesheet, no JavaScript.

Install it as the [Quickstart](/docs/quickstart/) shows.

Import the stylesheet once in your app:

```ts
import '@inkbar/theme/theme.css'
```

Every rule sits in `@layer inkbar` and inside `:where()`, so each selector has zero specificity. Your unlayered CSS overrides it without `!important`.

## Layer order

Cascade layers win by order, whatever the specificity. The browser orders layers by first appearance, so if your stylesheet declares its own layers before this file loads, `inkbar` comes later and beats them. Declare `inkbar` first, at the top of your main stylesheet:

```css
@layer inkbar, utilities;
```

Put `inkbar` ahead of your own layer names, and your utility classes override the theme.

## Tokens

The stylesheet is compatible with shadcn token names. It reads `--background`, `--foreground`, `--muted`, `--muted-foreground`, `--border`, `--primary`, `--primary-foreground`, `--ring` and `--radius` when your page defines them, and uses its own values when it does not. Dark values apply under `prefers-color-scheme: dark` or inside a `.dark` ancestor. Add `.light` to the root or an ancestor to keep the light values, including inside a `.dark` ancestor.

Colour tokens must hold complete CSS colour values. Tokens written as bare HSL channels (`--muted: 210 40% 96%`) do not work. Write the full colour instead:

```css
--muted: hsl(210 40% 96%);
```

## Layout

The root and viewport fill their parent as a column, and the scroll area takes the remaining height. Give the parent a height and the document scrolls inside it.

## Toolbars

The theme gives each toolbar a background and padding and styles the controls in it. You decide where the toolbar sits and what separates it from the document. `--ink-control-size` and `--ink-icon-size` set the size of a toolbar's controls and icons:

```css
.my-page-bar {
  --ink-control-size: 2rem;
  --ink-icon-size: 1rem;
  border-top: 1px solid var(--border);
}
```

## Annotation colours

The annotation colours have their own variables, such as `--ink-highlight` and `--ink-redact`. The theme declares them on the root element, so set yours there too:

```css
[data-ink-root] {
  --ink-highlight: #e4ff4a;
}
```

[Theme tokens](/docs/reference/theme-tokens/) lists them all, along with the interface tokens.
