---
title: Theme tokens
description: The shadcn-compatible tokens and the annotation colour variables that Inkbar's stylesheet reads.
---

The stylesheet is compatible with shadcn token names. It reads these when your page defines them, and uses its own values when it does not:

- `--background`
- `--foreground`
- `--muted`
- `--muted-foreground`
- `--border`
- `--primary`
- `--primary-foreground`
- `--ring`
- `--radius`

Dark values apply under `prefers-color-scheme: dark` or inside a `.dark` ancestor. Add `.light` to the root or an ancestor to keep the light values, including inside a `.dark` ancestor.

Colour tokens must hold complete CSS colour values. Tokens written as bare HSL channels (`--muted: 210 40% 96%`) do not work. Write the full colour instead:

```css
--muted: hsl(210 40% 96%);
```

## Interface tokens

The stylesheet maps those names onto its own tokens. Set these on `[data-ink-root]` to style Inkbar without touching the rest of your page:

| Variable               | Reads                  | Used for                                          |
| ---------------------- | ---------------------- | ------------------------------------------------- |
| `--ink-bg`             | `--muted`              | The area around the pages and status messages     |
| `--ink-fg`             | `--foreground`         | Text                                              |
| `--ink-muted-fg`       | `--muted-foreground`   | Secondary text                                    |
| `--ink-surface`        | `--background`         | Toolbar, popovers, cards and resize handles       |
| `--ink-border`         | `--border`             | Borders                                           |
| `--ink-accent`         | `--primary`            | Active tools, selection boxes and primary buttons |
| `--ink-accent-fg`      | `--primary-foreground` | Text on the accent colour                         |
| `--ink-ring`           | `--ring`               | Focus rings                                       |
| `--ink-radius`         | `--radius`             | Corner radius                                     |
| `--ink-page-shadow`    |                        | The shadow under each page                        |
| `--ink-text-selection` |                        | Text selection on the page                        |

The thread popover renders outside the root, so it reads the same tokens from `[data-ink-thread-popover]`, and so does a panel from `createPopover`, from `[data-ink-popover]`. The zoom select's list does the same from `[data-ink-select-content]`.

## Control sizes

Set these on an `InkToolbar`, or any ancestor, to size its controls:

| Variable             | Default    | Used for                                      |
| -------------------- | ---------- | --------------------------------------------- |
| `--ink-control-size` | `2.25rem`  | Height of buttons, fields and the zoom select |
| `--ink-icon-size`    | `1.125rem` | Size of the icons inside them                 |

## Form fields

Set these on `[data-ink-root]` to style fillable fields:

| Variable                   | Used for                                       |
| -------------------------- | ---------------------------------------------- |
| `--ink-form-field-bg`      | The tint on fillable fields                    |
| `--ink-form-field-focus`   | The focus ring and a signature field's Sign    |
| `--ink-form-field-invalid` | The outline on a field whose value was refused |

Fields sit on the white page, so these keep similar values in dark mode. To turn the tint off, pass `formHighlight: false`. See [Forms](/docs/guides/forms/#theming).

## Annotation colours

Set these variables on `[data-ink-root]` to change the default colour for new annotations:

| Variable                                                                  | Used for                           |
| ------------------------------------------------------------------------- | ---------------------------------- |
| `--ink-highlight`, `--ink-underline`, `--ink-strikeout`, `--ink-squiggly` | Text markup                        |
| `--ink-note`, `--ink-free-text`                                           | Notes and text boxes               |
| `--ink-shape`, `--ink-ink`                                                | Shapes, lines and freehand drawing |
| `--ink-redact`, `--ink-redact-fill`                                       | Redaction outline and fill         |

The theme declares these on `[data-ink-root]` itself, so a value on `:root` or another ancestor does not reach them. Target `[data-ink-root]`, or pass colours through the `defaults` option on `InkRoot` or `createViewer`.

Inkbar reads a colour when you create the annotation and stores it on the annotation, because the colour will be written into the PDF. Changing a variable later affects new annotations only, and dark mode does not change annotation colours.

## Search highlights

Set these on `[data-ink-root]` to colour the matches of a [search](/docs/guides/search/):

| Variable               | Used for          |
| ---------------------- | ----------------- |
| `--ink-search-hit`     | Every match       |
| `--ink-search-current` | The current match |

The theme draws the matches in a layer that multiplies with the page, so the text shows through the colour. Pages stay white in dark mode, so one pair of values serves both.
