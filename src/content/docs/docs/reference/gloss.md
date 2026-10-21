---
title: Gloss format
description: Inkbar exports and imports annotations as Gloss, an open JSON format for PDF annotations. What Inkbar adds to Gloss, what it leaves out, and how to validate an export.
---

`exportAnnotations` writes a [Gloss](https://gloss-format.org) document, and `importAnnotations` reads one. Gloss is an open JSON format for PDF annotations, with the same annotation types and coordinates as XFDF. The [Gloss docs](https://gloss-format.org) describe every field. This page covers what Inkbar does on top of them.

```json
{
  "format": "gloss",
  "version": 1,
  "documentKey": "contract-2026-10.pdf",
  "annotations": []
}
```

`documentKey` is the `doc.key` of the document the annotations belong to.

## Validate in your backend

Validate against the JSON Schema at `https://gloss-format.org/schema/v1.json`, or install the package, which ships the same schema with zod schemas and TypeScript types:

```sh
npm install gloss-format
```

Serve and accept the document as `application/vnd.gloss.annotations+json`.

Gloss accepts more than Inkbar imports. A document that validates against Gloss is well formed, but Inkbar can still turn an item away, as the next section explains.

## What Inkbar adds or leaves out

- **Embedded annotations stay in the file.** Annotations that came from the PDF never appear in an export.
- **Viewer state stays out.** In memory, every annotation carries `source` (`session` or `pdf`) and sometimes `locked`. The export drops them, and import ignores them.
- **Import is stricter than Gloss.** Every annotation needs `rect`, `color`, `opacity`, `createdAt` and `modifiedAt`, a free-text box needs `defaultStyle` with its `color`, and a redaction needs `interiorColor`. Gloss leaves these optional. An item without them comes back in the result's `errors`, and the rest of the document still imports. Inkbar's own exports always include them.
- **Unknown fields are dropped.** On a type Inkbar knows, import keeps the fields Gloss defines and drops the rest. Put your own data in `custom`, which Inkbar keeps as it is.
- **Unknown types are kept.** An item with a type Inkbar doesn't know, a string `id` and a numeric `page` comes back in the result's `unknown` list, and the next export writes it out unchanged. Pass `unknown` to `exportAnnotations` yourself when you call it on a store directly.
- **PDF names are open.** A line ending, note icon or intent Inkbar doesn't know loads and is written back unchanged. Inkbar draws a line ending it doesn't know as `None`.
- **The speech bubble is a callout.** Inkbar's speech bubble is a Gloss free-text callout with `cornerRadius` in points. Inkbar draws it as one rounded outline with a wedge to the tip. Other viewers ignore `cornerRadius` and draw a box with a leader line.

## What Inkbar writes under `custom.inkbar`

Gloss has no loupe, mask, pen pressure or free-text border colour, so Inkbar writes them under `custom.inkbar`. It writes a loupe as a circle and a mask as a circle or square, so other Gloss readers can still draw them. In Inkbar's API they keep their plain names: the `loupe` and `mask` types, `pressure` and `borderColor`.

| In Inkbar                                                  | In the Gloss file                                                                                               |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `ink` with `pressure`                                      | `custom.inkbar.pressure`                                                                                        |
| `freetext` with `borderColor`                              | `custom.inkbar.borderColor`                                                                                     |
| `loupe` with `rect`, `color`, `width`, `magnification`     | `type: "circle"` with `rect`, `color` and `width`, and `custom.inkbar: { "type": "loupe", "magnification": 2 }` |
| `mask` with `shape: "ellipse"` or `"rect"`, `color`, `dim` | `type: "circle"` or `"square"` with `color`, and `custom.inkbar: { "type": "mask", "dim": 0.5 }`                |

A loupe draws the page under its centre `magnification` times larger, inside a circle inscribed in `rect`. `color` and `width` give its rim. A mask dims the page outside its circle or square by `dim`, from 0 to 1, in `color`. A page holds one mask, and adding a second replaces the first.

This mask leaves an ellipse clear:

```json
{
  "type": "circle",
  "id": "0199c1a2-7e3b-7c00-8a11-5d2f4b6e9a10",
  "page": 0,
  "rect": { "x": 72, "y": 400, "width": 300, "height": 200 },
  "color": "#000000",
  "opacity": 1,
  "createdAt": "2026-10-19T12:00:00Z",
  "modifiedAt": "2026-10-19T12:00:00Z",
  "custom": { "inkbar": { "type": "mask", "dim": 0.7 } }
}
```

Inkbar merges its keys into any `custom.inkbar` already on the item, and leaves the rest of `custom` alone. On import it reads back only the keys it wrote. A circle or square without a `custom.inkbar.type` of `loupe` or `mask` stays a plain shape.
