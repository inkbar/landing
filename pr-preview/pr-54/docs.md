# Introduction

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-54/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-54/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-54/docs/quickstart.md.

What Inkbar does today, what comes next, which packages it ships and where to start.

Inkbar is a PDF viewer and editor for the browser, with form filling, annotations and redaction. It is written in TypeScript, built on PDF.js and released under the MIT licence.

To see it before you install anything, open the [sandbox](https://sandbox.inkbar.dev). It runs the Vue, React, Svelte and plain DOM viewers on a sample document, and you can drop in your own PDF. The file stays in your browser.

## What it does today

| Area              | Available now                                                                                                                                                                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Viewing           | Canvas rendering with a selectable text layer, zoom, pinch zoom on touch screens and trackpads, fit to width or page, continuous or single-page layout, page navigation                                                                                                                      |
| Search            | A find bar and Ctrl/Cmd+F in the viewer, and `doc.search` for code. See [Search](https://inkbar.dev/pr-preview/pr-54/docs/guides/search.md)                                                                                                                                                                                       |
| Outline and links | The document's bookmarks as a tree, links on the page that Tab reaches, and Back and Forward after a jump. See [Outline and links](https://inkbar.dev/pr-preview/pr-54/docs/guides/outline-and-links.md)                                                                                                                          |
| Sidebars          | Panels of thumbnails, search results or your own content beside the pages, resizable by drag or keyboard, with widths kept in the [storage](https://inkbar.dev/pr-preview/pr-54/docs/guides/storage.md) you choose. A rail panel floats over the pages when the document runs out of room. See [Sidebars](https://inkbar.dev/pr-preview/pr-54/docs/guides/sidebars.md) |
| Forms             | Text, checkbox, radio, choice and signature fields, with the form's scripts, and `doc.form` for code. See [Forms](https://inkbar.dev/pr-preview/pr-54/docs/guides/forms.md)                                                                                                                                                       |
| Signatures        | Draw, type or upload a signature, save it and place it on any page or in a signature field. See [Signatures](https://inkbar.dev/pr-preview/pr-54/docs/guides/signatures.md)                                                                                                                                                       |
| Markup            | Highlights, underlines, strikeouts and squiggly underlines from a text selection                                                                                                                                                                                                             |
| Notes             | Notes with reply threads                                                                                                                                                                                                                                                                     |
| Redaction         | Text and area redaction marks. With `@inkbar/engine`, applying them removes the content under them and the file's metadata, attached files and scripts, then checks the result. See [Redaction](https://inkbar.dev/pr-preview/pr-54/docs/guides/redaction.md)                                                                     |
| Drawing           | Freehand ink, shapes, lines, arrows, speech bubbles, loupes, masks and text boxes, with colour and line style menus. See [Drawing](https://inkbar.dev/pr-preview/pr-54/docs/guides/drawing.md)                                                                                                                                    |
| Annotations       | JSON export and import, and annotations from other programs shown as locked                                                                                                                                                                                                                  |
| History           | Undo and redo with grouped steps, from the toolbar or Ctrl/Cmd+Z, whether Inkbar or your app holds the annotations. Field edits undo too                                                                                                                                                     |
| Files             | Download and print the open PDF, from a button or Ctrl/Cmd+S and +P                                                                                                                                                                                                                          |
| Saving            | With `@inkbar/engine`, annotations and form values are written into the PDF, and come back editable when the file is reopened. See [Saving](https://inkbar.dev/pr-preview/pr-54/docs/guides/saving.md)                                                                                                                            |
| Locked files      | A password dialog for encrypted PDFs, or your own flow. See [Locked files](https://inkbar.dev/pr-preview/pr-54/docs/guides/locked-files.md)                                                                                                                                                                                       |
| Toolbars          | Composable controls for tools, undo and redo, pages and zoom, with icons you can swap for your own                                                                                                                                                                                           |
| Keyboard          | Zoom, page and annotation shortcuts, and `Enter` to apply the active tool. See [Tools and keyboard](https://inkbar.dev/pr-preview/pr-54/docs/guides/annotations.md#tools-and-keyboard)                                                                                                                                            |
| Touch             | Pinch to zoom the document, not the page. One finger draws with the drawing tools and two fingers scroll. Plugins can listen for presses and long presses. See [Presses](https://inkbar.dev/pr-preview/pr-54/docs/guides/writing-a-plugin.md#presses)                                                                             |
| Translations      | French and German built in, or your own strings for any language. Switch language without a remount. See [Translations](https://inkbar.dev/pr-preview/pr-54/docs/guides/translations.md)                                                                                                                                          |

You build the toolbars from Inkbar's controls and place them where they fit your app. There are buttons for the tools, menus for shapes, highlights, signatures, colours, line style and text style, buttons for undo and redo, and previous and next page, plus a page number field, the page count and zoom controls. [Toolbars](https://inkbar.dev/pr-preview/pr-54/docs/guides/toolbars.md) lists them all.

## Not there yet

- **Redacting every kind of content.** Inkbar refuses a mark over patterned fills, some gradients or some soft-masked artwork, since it cannot remove that content from the file. It does not clean hidden layers, and it does not look for the removed words elsewhere in the file, such as in bookmark titles. [Redaction](https://inkbar.dev/pr-preview/pr-54/docs/guides/redaction.md#limits) lists every limit.
- **XFA forms.** A form built only in XFA shows as a static page.

## Packages

| Package          | Purpose                                                                            |
| ---------------- | ---------------------------------------------------------------------------------- |
| `@inkbar/core`   | Document model, rendering, annotations and tools, with no framework dependency.    |
| `@inkbar/vue`    | Vue 3 components and composables to build your viewer.                             |
| `@inkbar/react`  | React 19 components and hooks to build your viewer.                                |
| `@inkbar/svelte` | Svelte 5 components and hooks to build your viewer.                                |
| `@inkbar/theme`  | Default stylesheet. Zero specificity, compatible with shadcn token names.          |
| `@inkbar/icons`  | The icons the toolbar controls show, as data, for use on your own buttons.         |
| `@inkbar/engine` | Optional. Writes annotations and form values into the PDF, and applies redactions. |

The packages are released together and share one version number. The framework packages take `@inkbar/core` as a peer dependency, so your app installs one copy of it.

## Where to start

Follow the [Quickstart](https://inkbar.dev/pr-preview/pr-54/docs/quickstart.md) to put a document on screen with a toolbar.
