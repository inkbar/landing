---
title: Annotation format
description: The JSON that exportAnnotations writes and importAnnotations reads, its media type, and how each field maps to XFDF.
---

`exportAnnotations` writes annotations as JSON, and `importAnnotations` reads the same JSON back. The format follows XFDF, the ISO standard for exchanging PDF annotations: the same annotation types, the same coordinates and, where XFDF has a name for a field, the same name. A few fields go beyond XFDF to carry suggested redactions and your own data.

The [JSON Schema](https://inkbar.dev/schema/annotations-v1.json) describes the whole document. Validate against it before you store or accept a payload.

## Media type

Serve and accept the format as `application/vnd.inkbar.annotations+json`. The `+json` suffix lets generic JSON tooling, such as HTTP clients and API gateways, read it without special handling. The version lives in the document, so the media type carries no version parameter.

## Document

```json
{
  "format": "inkbar/annotations",
  "version": 1,
  "documentKey": "contract-2026-10.pdf",
  "annotations": []
}
```

| Field         | Type   | Notes                                                                                 |
| ------------- | ------ | ------------------------------------------------------------------------------------- |
| `format`      | string | Always `inkbar/annotations`.                                                          |
| `version`     | number | Always `1` for this version of the format.                                            |
| `documentKey` | string | Optional. The `doc.key` of the document the annotations belong to.                    |
| `annotations` | array  | The annotations. Import checks each item on its own, so one bad item fails by itself. |

## Coordinates

Every coordinate is in PDF user space: points, origin bottom-left, before the page's `/Rotate`. These are the numbers in the PDF file and in XFDF, so a mark keeps its values at any zoom or rotation. A page's crop box can start away from `0 0`, so read coordinates as raw user space, not as offsets from the page corner.

A `rect` is `{ x, y, width, height }`, where `x` and `y` are the bottom-left corner. A quad is `{ p1, p2, p3, p4 }`, in the corner order PDF uses for `/QuadPoints`: top-left, top-right, bottom-left, bottom-right.

## Fields on every annotation

| Field        | Type    | XFDF           | Notes                                                                 |
| ------------ | ------- | -------------- | --------------------------------------------------------------------- |
| `type`       | string  | element name   | One of the types below.                                               |
| `id`         | string  | `name`         | Unique within the document.                                           |
| `page`       | integer | `page`         | 0-based.                                                              |
| `rect`       | rect    | `rect`         | Bounding box. XFDF writes it as `x1,y1,x2,y2`.                        |
| `color`      | string  | `color`        | `#RRGGBB`.                                                            |
| `opacity`    | number  | `opacity`      | 0 to 1.                                                               |
| `author`     | string  | `title`        | Optional.                                                             |
| `contents`   | string  | `contents`     | Optional, except on `freetext`.                                       |
| `subject`    | string  | `subject`      | Optional. A short label for what the mark is.                         |
| `intent`     | string  | `intent`       | Optional. What the mark is for. A PDF name from the intents below.    |
| `inReplyTo`  | string  | `inreplyto`    | Optional. The `id` of the note this one replies to.                   |
| `createdAt`  | string  | `creationdate` | ISO 8601 date-time. XFDF uses PDF date strings (`D:20261019120000Z`). |
| `modifiedAt` | string  | `date`         | ISO 8601 date-time.                                                   |
| `custom`     | object  | none           | Optional. Your own data. Inkbar keeps it as it is and never reads it. |

## PDF names

Values taken from PDF names use PDF's spelling: `OpenArrow` for a line ending, `Comment` for a note icon, `FreeTextCallout` for an intent. Annotation `type` values stay lowercase, as XFDF element names are.

Each set is open. Any other valid PDF name loads, is kept, and is written back unchanged, so `"icon": "Check"` survives an import and an export. A valid name has no whitespace and none of `( ) < > [ ] { } / %`. Inkbar draws a line ending it does not know as `None`.

| Set          | Fields         | Known values                                                                                                                               |
| ------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Line endings | `head`, `tail` | `None`, `Square`, `Circle`, `Diamond`, `OpenArrow`, `ClosedArrow`, `Butt`, `ROpenArrow`, `RClosedArrow`, `Slash`                           |
| Note icons   | `icon`         | `Comment`, `Note`, `Help`, `Insert`, `Key`, `NewParagraph`, `Paragraph`. A missing icon means `Note`.                                      |
| Intents      | `intent`       | `FreeText`, `FreeTextCallout`, `FreeTextTypeWriter`, `LineArrow`, `LineDimension`, `PolygonCloud`, `PolygonDimension`, `PolyLineDimension` |

## Types

| Type                                              | XFDF element | Fields                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `highlight`, `underline`, `strikeout`, `squiggly` | same name    | `quads` (XFDF `coords`), at least one                                                                                                                                                                                                                                                                                                                                                                           |
| `text`                                            | `text`       | `icon`, a note icon. Defaults to `Note`. The tools and the UI call this a note.                                                                                                                                                                                                                                                                                                                                 |
| `freetext`                                        | `freetext`   | `contents`, the text on the page. `defaultStyle` holds `fontFamily` (default `Helvetica`), `fontSize` (default 12), `color` and `textAlign`, and maps to XFDF `defaultstyle`. `color` on the annotation is the box fill. `width` is the border width in points (default 0, no border), with optional `borderColor` and `dashes`. Optional `fringe`, `callout` and `head` make a [callout](#free-text-callouts). |
| `square`, `circle`                                | same name    | `width` (stroke, default 1), optional `dashes` and `interiorColor` (XFDF `interior-color`). `square` also takes the extension `cornerRadius` in points; `circle` refuses it.                                                                                                                                                                                                                                    |
| `line`                                            | `line`       | `start`, `end`, `width` (default 1), optional `dashes`, `head` and `tail` line endings                                                                                                                                                                                                                                                                                                                          |
| `polyline`, `polygon`                             | same name    | `vertices`, at least two points. `width` (default 1), optional `dashes` and `interiorColor`. `polyline` also takes `head` at the first vertex and `tail` at the last; `polygon` refuses both.                                                                                                                                                                                                                   |
| `ink`                                             | `ink`        | `inklist`, a list of paths, each a list of points. `width` (default 2), optional `dashes`. Optional `pressure`, from 0 to 1 per point, with the same shape as `inklist`.                                                                                                                                                                                                                                        |
| `stamp`                                           | `stamp`      | `imagedata`, a PNG or JPEG `data:` URL (`data:image/png;base64,...`), drawn to fill `rect`. Optional `rotation` of `0`, `90`, `180` or `270` degrees anticlockwise. Image and typed signatures are stamps with `subject` set to `Signature`.                                                                                                                                                                    |
| `loupe`                                           | none         | An extension. A circle inscribed in `rect` that shows the page under its centre, magnified. `magnification` (above 1, default 2) and `width`, the rim (default 2).                                                                                                                                                                                                                                              |
| `mask`                                            | none         | An extension. Dims the page outside `shape` (`rect` or `ellipse`) drawn in `rect`. `dim` from 0 to 1 (default 0.5); `color` is the dimming colour. A page holds one mask.                                                                                                                                                                                                                                       |
| `redact`                                          | `redact`     | `interiorColor`, the fill once applied. Optional `quads` for a text mark, `overlayText` (XFDF `overlay-text`), plus `origin` and `suggestion`                                                                                                                                                                                                                                                                   |

## Free-text callouts

A callout is a free-text annotation with `intent` set to `FreeTextCallout`. It stores the same four things PDF and XFDF store:

- `rect` covers the text box and the leader line together.
- `fringe` is `{ left, top, right, bottom }`: how far in from `rect` the text box starts, in points. It is PDF `/RD` and XFDF `fringe`, in that order. Without it, the text box is `rect`.
- `callout` is the leader line (PDF `/CL`): the tip, an optional bend, then the point on the box. It has two or three points.
- `head` is the line ending at the tip (PDF `/LE`). Without it, the tip has no ending.

```json
{
  "type": "freetext",
  "id": "0199c1a2-7e3b-7c00-8a11-5d2f4b6e9a10",
  "page": 0,
  "rect": { "x": 72, "y": 600, "width": 220, "height": 110 },
  "color": "#FFF3B0",
  "opacity": 1,
  "contents": "Check this clause",
  "width": 0,
  "intent": "FreeTextCallout",
  "fringe": { "left": 80, "top": 0, "right": 0, "bottom": 30 },
  "callout": [
    { "x": 72, "y": 600 },
    { "x": 120, "y": 630 },
    { "x": 152, "y": 630 }
  ],
  "head": "OpenArrow",
  "defaultStyle": {
    "fontFamily": "Helvetica",
    "fontSize": 12,
    "color": "#1A1A1A",
    "textAlign": "left"
  },
  "createdAt": "2026-10-19T12:00:00Z",
  "modifiedAt": "2026-10-19T12:00:00Z"
}
```

Inkbar's speech bubble is a standard callout plus the extension `cornerRadius`, in points. Inkbar draws it as one rounded outline with a wedge to the tip. Other viewers ignore `cornerRadius` and draw a box with a leader line.

## Suggested redactions

XFDF has nothing for a redaction that a detector proposed and a person has not reviewed yet. Two fields on `redact` carry it:

- `origin`: `user` for a mark a person made or accepted, `suggested` for one waiting for review. Defaults to `user`.
- `suggestion`: `confidence` from 0 to 1, with optional `reason`, `explanation`, `recommendation` (`redact`, `review` or `keep`) and `jobId`.

An accepted suggestion keeps its `suggestion`, so you can still tell where it came from. The [redaction guide](/docs/guides/redaction/) covers the review flow.

## What the export leaves out

Annotations embedded in the PDF stay in the file and never appear in an export. In memory, every annotation also carries `source` (`session` or `pdf`) and sometimes `locked`. These describe the viewer, so the export drops them and import ignores them.

## Unknown types

A newer Inkbar may write types this version does not know. Import keeps any item with a string `type`, a string `id` and a numeric `page`, returns it in the result's `unknown` list, and the next export writes it back unchanged. Pass `unknown` to `exportAnnotations` yourself when you call it on a store directly. A document that holds such items validates only against the newer schema that produced them.
