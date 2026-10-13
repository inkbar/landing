---
title: Theme tokens
description: The shadcn-compatible tokens and the annotation colour variables that Inkbar's stylesheet reads.
---

The stylesheet is compatible with shadcn token names. It reads these when your page defines them, and uses its own values when it does not.

| Token                  | What it colours                        |
| ---------------------- | -------------------------------------- |
| `--background`         | Backgrounds                            |
| `--foreground`         | Text                                   |
| `--muted`              | The toolbar and panel surface          |
| `--muted-foreground`   | Secondary text                         |
| `--border`             | Borders                                |
| `--primary`            | The active control                     |
| `--primary-foreground` | Text on the active control             |
| `--ring`               | Focus rings                            |
| `--radius`             | Corner radius (a length, not a colour) |

## Annotation colours

Set these variables on `[data-ink-root]` to change the default colour for new annotations:

| Variable                                                                   | Used for                            |
| -------------------------------------------------------------------------- | ----------------------------------- |
| `--ink-highlight`, `--ink-underline`, `--ink-strikeout`, `--ink-squiggly`  | Text markup                         |
| `--ink-note`, `--ink-free-text`                                            | Notes and text boxes                |
| `--ink-shape`, `--ink-ink`                                                 | Shapes and freehand drawing         |
| `--ink-redact`, `--ink-redact-fill`                                        | Redaction outline and fill          |
| `--ink-suggestion-low`, `--ink-suggestion-medium`, `--ink-suggestion-high` | Suggested redactions, by confidence |

Inkbar reads a colour when you create the annotation and stores it on the annotation, because the colour goes into the PDF. Changing a variable later affects new annotations only.
