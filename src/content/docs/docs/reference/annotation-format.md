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
| `inReplyTo`  | string  | `inreplyto`    | Optional. The `id` of the note this one replies to.                   |
| `createdAt`  | string  | `creationdate` | ISO 8601 date-time. XFDF uses PDF date strings (`D:20261019120000Z`). |
| `modifiedAt` | string  | `date`         | ISO 8601 date-time.                                                   |
| `custom`     | object  | none           | Optional. Your own data. Inkbar keeps it as it is and never reads it. |

Enumerated values use camelCase where XFDF uses PDF names: `openArrow` for `OpenArrow`, `comment` for `Comment`.

## Types

| Type                                              | XFDF element | Fields                                                                                                                                                                                                   |
| ------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `highlight`, `underline`, `strikeout`, `squiggly` | same name    | `quads` (XFDF `coords`), at least one                                                                                                                                                                    |
| `text`                                            | `text`       | `icon`: `comment`, `note`, `help`, `insert`, `key` or `paragraph`. Defaults to `comment`. The tools and the UI call this a note.                                                                         |
| `freetext`                                        | `freetext`   | `contents`, the text on the page. `fontSize` (default 12), `fontFamily` (default `Helvetica`) and `align` (`left`, `center` or `right`) map to XFDF `defaultstyle`. Optional `callout` of 2 or 3 points. |
| `square`, `circle`                                | same name    | `width` (stroke, default 1), optional `interiorColor` (XFDF `interior-color`)                                                                                                                            |
| `line`                                            | `line`       | `start`, `end`, `width` (default 1), optional `head` and `tail` line endings                                                                                                                             |
| `polyline`, `polygon`                             | same name    | `vertices`, at least two points. `width` (default 1), optional `interiorColor`                                                                                                                           |
| `ink`                                             | `ink`        | `inklist`, a list of paths, each a list of points. `width` (default 2)                                                                                                                                   |
| `redact`                                          | `redact`     | `interiorColor`, the fill once applied. Optional `quads` for a text mark, `overlayText` (XFDF `overlay-text`), plus `origin` and `suggestion`                                                            |

Line endings are `none`, `openArrow`, `closedArrow`, `square`, `circle`, `diamond`, `butt` and `slash`.

## Suggested redactions

XFDF has nothing for a redaction that a detector proposed and a person has not reviewed yet. Two fields on `redact` carry it:

- `origin`: `user` for a mark a person made or accepted, `suggested` for one waiting for review. Defaults to `user`.
- `suggestion`: `confidence` from 0 to 1, with optional `reason`, `explanation`, `recommendation` (`redact`, `review` or `keep`) and `jobId`.

An accepted suggestion keeps its `suggestion`, so you can still tell where it came from. The [redaction guide](/docs/guides/redaction/) covers the review flow.

## What the export leaves out

Annotations embedded in the PDF stay in the file and never appear in an export. In memory, every annotation also carries `source` (`session` or `pdf`) and sometimes `locked`. These describe the viewer, so the export drops them and import ignores them.

## Unknown types

A newer Inkbar may write types this version does not know. Import keeps any item with a string `type`, a string `id` and a numeric `page`, returns it in the result's `unknown` list, and the next export writes it back unchanged. Pass `unknown` to `exportAnnotations` yourself when you call it on a store directly. A document that holds such items validates only against the newer schema that produced them.
