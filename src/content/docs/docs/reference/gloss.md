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

## Loupes and masks

The loupe and the mask are Inkbar's own types, not Gloss ones. A Gloss file names them `x-loupe` and `x-mask`, under the prefix Gloss keeps for a viewer's own types. In Inkbar's API they stay `loupe` and `mask`, and import reads either name. Other Gloss readers treat them as unknown annotations, which they may pass through or ignore.

Both carry the fields every Gloss annotation has, plus their own:

| Type      | Field           | Value                                                                         |
| --------- | --------------- | ----------------------------------------------------------------------------- |
| `x-loupe` | `rect`          | The square the loupe's circle is inscribed in.                                |
| `x-loupe` | `magnification` | How many times larger the page under the centre is drawn. Above 1. Default 2. |
| `x-loupe` | `width`         | The rim's width in points. Default 2. `color` is the rim's colour.            |
| `x-mask`  | `shape`         | `rect` or `ellipse`: what stays clear inside `rect`. Required.                |
| `x-mask`  | `dim`           | How strongly the page outside is dimmed, from 0 to 1. Default 0.5.            |
| `x-mask`  | `color`         | The dimming colour.                                                           |

A page holds one mask. Adding a second replaces the first.

```json
{
  "type": "x-mask",
  "id": "0199c1a2-7e3b-7c00-8a11-5d2f4b6e9a10",
  "page": 0,
  "rect": { "x": 72, "y": 400, "width": 300, "height": 200 },
  "color": "#000000",
  "opacity": 1,
  "shape": "ellipse",
  "dim": 0.7,
  "createdAt": "2026-10-19T12:00:00Z",
  "modifiedAt": "2026-10-19T12:00:00Z"
}
```
