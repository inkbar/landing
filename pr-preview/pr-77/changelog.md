# Inkbar changelog

> For AI agents: the full Inkbar documentation index is at https://inkbar.dev/pr-preview/pr-77/llms.txt. Every docs page is also available as Markdown: replace the trailing slash with `.md`, so https://inkbar.dev/pr-preview/pr-77/docs/quickstart/ becomes https://inkbar.dev/pr-preview/pr-77/docs/quickstart.md.

## 0.17.0 (19 November 2026)

This release adds the final step of redaction. You can now apply redaction marks so the content under them is removed from the file for good. Inkbar then checks the saved file to confirm nothing is left behind.

### New

- `doc.applyRedactions()` applies the session's redaction marks. It removes the text, images and drawing under each mark, removes annotations the marks overlap, and cleans the file. That means metadata, attached files, scripts, page thumbnails and private application data. The whole file is rewritten, so no earlier version survives inside it.
- Every apply is checked. Inkbar reads the saved file back, and unless every region is clean, the apply fails and your document stays as it was.
- `doc.redactionPreview()` gives you the counts a confirmation needs. That covers marks, pages, overlapped annotations, earlier locked marks and whether a signature is affected.
- `engine.checkRedaction()` reports what is left under a redaction in any PDF. Pass regions to check specific areas. Without regions, it looks for shapes that resemble a redaction and also reports earlier versions, metadata, attachments, scripts, hidden layers and signatures kept in the file.
- The viewer has an Apply redactions button, `viewer.applyRedactions()` and a confirmation dialog. The dialog says how many marks on how many pages, that removal is permanent, how many annotations go with them and whether a signature will stop verifying.
- After an apply, the viewer reopens on the redacted file. It keeps your page, zoom, mode, rotation, tool, password and file name. Undo history starts afresh, so nothing removed can be brought back.
- `@inkbar/vue`, `@inkbar/react` and `@inkbar/svelte` add an `InkApplyRedactions` control and a `useRedaction()` composable or hook with `canRedact`, `busy` and `apply`.
- `InkRoot` takes `redactionConfirm` so you can replace the dialog. It reports the redacted bytes through `onRedacted`, or the `redacted` event in Vue. In controlled mode, Inkbar proposes your list without the applied marks, with `reason: 'redaction'`.
- New errors `NothingToRedact` and `RedactionFailed` tell you why an apply did not go ahead. `RedactionFailed` includes the stage and the annotations or regions involved.
- Inkbar refuses a mark over content it cannot safely remove, such as tiling patterns, complex gradients, artwork under a detailed soft mask and some Type 3 glyphs. It does this before changing anything. The refused marks are selected, so users can see which ones need attention.
- The redaction messages are in English, with draft French and German translations.
- The READMEs explain the limits, so you can decide whether to rely on redaction. For example, hidden layers are not cleaned, and removed words can remain in bookmarks, other comments, form values and alternate text.

### Improved

- While redactions are being applied, the document takes no input until the redacted file has replaced it. This includes pages, comments, undo and redo, menus, Download, Print and plugin commands. Screen readers announce that redactions are being applied.
- If the marks change while the confirmation dialog is open, the viewer asks again with the new counts.
- Marks with no area are skipped, and the dialog counts only the marks that will be applied.

### Fixed

- Text extraction and search now work in Safari on iOS 26. That includes `doc.text()`, `doc.pageText()`, `doc.search()` and the find bar.
- A host callback that throws after a successful apply no longer leaves the viewer unable to take input.
- A malformed mark is now rejected as bad input instead of stopping the engine's worker.
- The viewer reopens on its own copy of the redacted bytes, so transferring the bytes you receive no longer breaks the reopen.
- In Vue, calling `preventDefault()` in a click handler now stops the apply, as it already did in React and Svelte. A disabled custom control no longer applies.
- In controlled mode, a host that passes its old list late can no longer put removed annotations back.
- A rectangle mark stored with its corners in an unusual order is now applied whole.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.17.0)

## 0.16.0 (18 November 2026)

Inkbar can now save. With the new `@inkbar/engine` package, `doc.save()`, Download and Print give a PDF that holds your annotations and form values, and annotations saved by Inkbar come back editable when the file is opened again.

### New

- `@inkbar/engine` is published. It runs PDFium as WebAssembly in a Web Worker, so long renders and saves don't freeze the page. Bundlers pick up its worker and `.wasm` on their own, and no cross-origin isolation headers are needed.
- To opt in, pass `engine: () => import('@inkbar/engine')` when opening a document. The Vue, React and Svelte roots take an `engine` prop. Without it, nothing changes and no engine code is loaded.
- `doc.save()` resolves with the PDF and your changes. If nothing has changed, you get the opened bytes and the engine isn't loaded. `doc.changed` tells you whether the session differs from the file.
- Annotations are written as standard PDF annotations with their own appearances, so other readers show them as highlights, ink and so on. Only form fields you changed are written.
- A file with a digital signature is saved by appending, so the signature stays valid. Other files are rewritten.
- Annotations Inkbar saved come back editable on reopen with their original ids. If another program has changed or replied to one, it stays locked.
- Download, Print, Ctrl+S and Ctrl+P give the saved copy. The buttons show as busy while it's written. If a write fails, nothing is downloaded or printed, `onError` hears about it, and the user sees a clear message.
- Save errors have their own codes: `EngineUnavailable` when the engine can't load, and `SaveFailed`, which names the annotation that couldn't be written.
- `openDocument` takes a `pictures` option, so hosts that open documents themselves save text exactly as it shows on screen. `createViewer` and the bindings pass it for you.
- Text boxes render in Times or Courier when set to them, not only sans-serif.
- Notes show their own stored colour and an icon for `Comment`, `Note`, `Help`, `Insert`, `Key`, `NewParagraph` and `Paragraph`. `--ink-note` now sets only the colour new notes start with.
- `@inkbar/icons` adds `StickyNote`, `CircleQuestionMark`, `KeyRound`, `ListPlus` and `Pilcrow`.

### Improved

- Every annotation is now drawn from one description, so the screen, thumbnails, drag previews and saved files match.
- Text boxes follow their dashes, opacity and underline, stay upright for the page, and turn with the view. The first line no longer jumps when you start or finish editing.
- Text wraps like the browser, including CJK, emoji, Arabic and justified lines with tabs.
- Host stylesheets, even with `!important`, can no longer recolour drawn annotations. You can still style the editor, handles, selection frame and note shadow.
- Thumbnails now show mask dimming and loupe rims.
- Arrowheads on very thin lines keep their size as you zoom, and freehand strokes keep the same shape while drawing and after.
- Stamps and signatures are now SVG images. If you select `img.ink-stamp`, change it to `.ink-stamp` and read `href` in place of `src`.
- `.ink-free-text` now marks only the open editor. Rules on it no longer restyle displayed text boxes.
- A redaction mark is saved as a Redact annotation but not applied. The content under it stays in the file.

### Fixed

- One annotation that fails to draw no longer blanks the page or breaks thumbnails. It's left empty with a console warning.
- Loupes that aren't square no longer spill outside their rim.
- A text box grows to fit its text, so the last line is no longer clipped.
- A line's selection box now fits its arrowheads at every zoom.
- One-point ink strokes can be selected.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.16.0)

## 0.15.0 (16 November 2026)

Inkbar now speaks more than one language. Pass `messages` and `locale` to the viewer and every label, menu and announcement follows. You can switch language live without losing the document, the page or an open menu.

### New

- `InkRoot` in `@inkbar/vue`, `@inkbar/react` and `@inkbar/svelte` takes `messages` and `locale` props. In plain TypeScript, `createViewer` and `mountViewer` take them too, and the viewer gains `setMessages` and `setLocale`.
- French and German ship as drafts at `@inkbar/core/locales/fr` and `@inkbar/core/locales/de`. English is at `@inkbar/core/locales/en`. Import only the languages you need.
- Each message set carries its own language, so `messages={fr}` on its own sets `lang` and formats dates in French. An explicit `locale` still wins.
- Write your own translations with the `template` and `plural` helpers. Any group you leave out falls back to English.
- Labels you pass in can be functions, so they follow a language change. This covers toolbar, panel and thumbnail labels, `handleLabel`, `emptyText`, command labels, `errorStatus`, card titles and mark labels.
- Plugin card `actions` can be an array of `{ label, run }`, so action names can be translated too.
- `viewer.messages` lets standalone pieces such as `createToolbar` follow the viewer's language.
- `--ink-thumbnail-width` now sets the thumbnail width when you pass no `width`. In a list it is capped to fit the sidebar. Only px values count, and default sidebars look the same as before.

### Improved

- A language change relabels everything in place. Open menus stay open, the find bar keeps its query and the scroll position stays put.
- `locale` sets `lang` on the viewer root and formats note dates. English counts of 1,000 or more now group thousands.
- In React, a `messages` object written inline doesn't remount anything, move focus or lose clicks.
- A label or message function that throws, or returns the wrong kind of value, falls back to English or the command id with a warning instead of breaking the viewer.
- Each package README has a new Translations section.

### Fixed

- `lang={undefined}` from a host no longer erases the viewer's `lang`.
- React's `InkSidebar` releases its controller on unmount.

### Breaking

- The old label tables (`TOOL_LABELS`, `COLOR_LABELS`, `SHAPE_LABELS`, `MARKUP_LABELS`, `SIGNATURE_LABELS`, `PASSWORD_LABELS`, `FORM_LABELS`) are removed from `@inkbar/core/dom`. Use `messages` instead.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.15.0)

## 0.14.0 (12 November 2026)

Inkbar now asks for the password when you open a locked PDF. A small dialog replaces the error panel, so readers can unlock the file and carry on. The password goes to PDF.js for that one load and is never stored.

### New

- `createViewer` opens a password dialog when a file needs one. A wrong password keeps the dialog open, clears the field and tells the reader to try again.
- If the reader cancels, presses Escape or clicks outside the dialog, the viewer shows a locked panel with an "Enter password" button.
- A `password` you pass in is still tried first. If it's wrong, the dialog opens with the incorrect password message.
- Set `passwordPrompt: false` to keep the old behaviour: an `error` status with `PasswordRequired`. The `error` event fires once for each failed open.
- `createPasswordDialog` is exported, so you can use the stock dialog even with the automatic prompt turned off.
- `InkStatus` has a new `locked` state with an `incorrect` flag. Hosts that show errors from `status` no longer flash an error behind the dialog.
- `createPasswordPrompt` gives you a small controller for building your own prompt. `PASSWORD_LABELS` holds the dialog's text, ready for translation.
- `@inkbar/vue`, `@inkbar/react` and `@inkbar/svelte` all support the prompt. `InkRoot` takes a `passwordPrompt` prop (on by default), and `InkPasswordDialog` is exported.
- You can replace the locked panel and still reopen the dialog. Use the `locked` slot in Vue, the `locked` prop in React or the `locked` snippet in Svelte. Each receives `{ incorrect, promptPassword }`.
- `@inkbar/theme` styles the password dialog and the locked panel.

### Fixed

- Focus moves to the right place after a cancel, a wrong password or a new file in every framework, including the first control of a custom locked panel.
- A retry that finishes after you change `src` no longer sends the typed password to the new file.
- A retry still completes when your `onError` handler throws.
- The dialog keeps its spacing when a CSS reset removes paragraph margins.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.14.0)

## 0.13.0 (12 November 2026)

Sidebars now float over the pages when keeping them beside the document would leave it too narrow. Open a sidebar on a small screen and the document keeps its room. The panel closes like a drawer when you tap the pages or press Escape.

### New

- A rail sidebar's panel floats over the pages when the document would drop below 480px wide. It moves back beside the document when there's room again. Tabs and stack sidebars narrow instead of floating.
- The rail stays in place while its panel floats, so the button to reopen it is always there.
- A floating panel closes on a tap or left click on the pages, or on Escape, and focus returns to the rail button. The closing tap does nothing else, so it won't draw, select, follow a link or focus a form field. Scrolling, swiping and pinching leave it open.
- Opening the find bar closes any floating panel, so the bar is never covered.
- `InkRoot` and `createSidebar` take `minDocumentWidth` to set how narrow the document may get. A sidebar's own `minDocumentWidth` wins.
- Resize handles are labelled "Resize left sidebar" and "Resize right sidebar" by default. Pass `handleLabel` to change the label.
- `@inkbar/theme` styles floating panels with a shadow, and keeps popovers and dialogs above them.
- The core README explains how to publish a plugin, and every type a plugin needs from `@inkbar/core` is now exported.

### Improved

- A sidebar with no saved open state starts closed if it would float straight away. `defaultOpen` still opens it.
- With server rendering, sidebars start beside the document. Whether they float is decided in the browser.
- A sidebar's saved width stays the one you chose, even while the panel floats. Dragging it narrow enough brings it back beside the document.
- `aria-valuemax` on the resize handle now reports `maxWidth`. The old cap at half the container width is gone.
- Controlled sidebars report a close through `onOpenChange` and wait for you to set `open`.
- Removed the APIs deprecated in 0.12.0:
  - the `signatures` option and prop. Put signature templates in `storage` under `signatures` instead.
  - `createLocalSignatureStore` and `createRawLocalStorage`.
  - `onFormAction` and its Vue and Svelte equivalents. Use `onAction` instead.
  - the `FormAction` type.
- Vue's `InkContext.signatures` is now a plain `SignatureLibrary` rather than a `ShallowRef`.

### Fixed

- Two signature saves made close together no longer risk losing one. A failed save doesn't block the next.
- The signature dialog says "browser storage is full" only when it really is. Other failures show a general message, with the original error kept as `cause`.
- `createLocalStorage` works where `localStorage` doesn't exist, such as during server rendering, and keeps values in memory.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.13.0)

## 0.12.0 (11 November 2026)

This release brings document navigation to Inkbar: an outline panel, working links and Back and Forward through your jumps. Sidebars can now be resized, and a new storage API lets you choose where the viewer keeps things between visits.

### New

- **Outline.** `InkOutline` in Vue, React and Svelte, and `createOutline(viewer)` for plain TypeScript, show the PDF's outline inside any sidebar panel. It supports full keyboard navigation and marks the current section as you scroll. `doc.outline()` gives you the data if you want to build your own.
- **Links.** Clicking or tapping a link follows it under the Select text and Select tools. Dragging from a link still selects text, and drawing and markup tools ignore links. Keyboard and screen reader users can Tab through links and form fields together in reading order, then press Enter to follow one. `doc.links(page)` lists each page's links.
- **Safe web links.** Web addresses never open by themselves. They reach your `onAction` callback so you decide what happens, and `javascript:` links are refused.
- **Back and Forward.** The viewer remembers jumps from links, outline items and form buttons. Use `InkBack` and `InkForward`, `viewer.back()` and `viewer.forward()`, or `createBack` and `createForward`. History holds 50 entries and clears when another document opens. Inkbar doesn't bind shortcuts, since the usual ones belong to the browser.
- **`viewport.scrollToDestination(dest)`** scrolls to any PDF destination without changing the zoom.
- **Storage.** Pass a `storage` store to the viewer or `InkRoot` to choose where the viewer keeps things between visits. A store can be backed by `localStorage`, your app state, a REST API or anything else with `get`, `set` and `remove`. `createMemoryStorage()` is the default, so Inkbar writes nothing to the browser unless you ask. `createLocalStorage()` copes with private windows and full storage, and `scopeStorage()` puts every key under a prefix.
- **Resizable sidebars.** `InkSidebar` and `createSidebar` have a drag handle that works with mouse, pen, touch and keyboard. Double-click or press Enter to reset it. The width is saved per sidebar in your storage. To control it yourself, use `width` and `onWidthChange` in React, `v-model:width` in Vue or `bind:width` in Svelte.
- **Plugin settings.** Plugins get `ctx.storage` to keep settings between visits, with their own keys kept apart from Inkbar's and other plugins'.
- `--ink-link-hover` sets an optional hover tint for links.
- A `List` icon in `@inkbar/icons`.

### Improved

- Sidebars now start at 320px, up from 280px. They stay between 240px and 480px and never take more than half their container. To change the default, pass `defaultWidth` rather than overriding `--ink-sidebar-width`.
- Signatures are now kept in the viewer's storage. The `signatures` option and `createLocalSignatureStore` still work but are deprecated and will be removed in 0.13.0. Existing saved signatures stay where they are.
- `onFormAction` is now `onAction`, and `FormAction` is now `ViewerAction`. The callback is the `action` event in Vue and the `onaction` prop in Svelte. The old names work until 0.13.0.
- The READMEs are up to date. They cover the new features, and the framework examples now pass `history` so their Undo and Redo buttons work.

### Fixed

- In Svelte, opening another document in the same `InkRoot` now starts at its first page instead of the page you had reached in the previous one.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.12.0)

## 0.11.0 (9 November 2026)

Inkbar now works properly on touch screens and trackpads. Pinching zooms the document rather than the whole page, and the drawing tools follow a single finger or a pen.

### New

- A two-finger pinch zooms the document, not the page around it. The toolbar stays put, and pages re-render sharp when you lift a finger.
- Trackpad pinch zooms the document too, centred on the cursor. Holding ctrl and turning the mouse wheel zooms one small step per notch.
- Set `pinchZoom: false` to leave pinching to the browser. `InkViewport` in `@inkbar/react`, `@inkbar/vue` and `@inkbar/svelte` takes the same `pinchZoom` prop. Changing it keeps the current zoom and page.
- Plugins can react to a tap or a long hold on an empty part of a page with `ctx.onPress` and `ctx.onLongPress`. Each handler gets the page, the point in PDF coordinates and the pointer type, and returns a function that stops listening.
  - These only fire with the text and rectangle select tools. They don't fire when the press lands on an annotation, link or form field.
  - The browser's own long-press behaviour, such as text selection, still happens.
- One finger now works the drawing, shape, free text and area redaction tools instead of scrolling the document. Two fingers still scroll and zoom. Your own tools can opt in with `claimsTouch`.
- A pen that touches down while a palm rests on the screen takes over and draws.

### Improved

- A finger tap with `draw` or `sketch` no longer leaves a dot. A pen tap or mouse click still does.
- A two-finger pan scrolls the document as your fingers move, so pages appear during a long pan.
- Panning with two fingers keeps fit-width and fit-page modes.

### Fixed

- Two-finger scrolling stays in step with your fingers, even when a second finger joins a scroll or your page sets `scroll-behavior: smooth`.
- On iPad, the document no longer scrolls out from under a finger that is drawing.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.11.0)

## 0.10.0 (6 November 2026)

Inkbar now has sidebars, page thumbnails and lists of records and search results, with components for Vue, React and Svelte and controllers for plain TypeScript. You can also download and print the open PDF.

### New

- Sidebars in three layouts: an icon rail, tabs, or a stack of sections. Place them on either side of the document. Use `InkSidebar` and `InkPanel`, or `createSidebar` in plain TypeScript.
- Set `visible` to `false` to hide a sidebar. It keeps its open panel, content and scroll position, so it comes back as it was.
- Page thumbnails that show each page's annotations and plugin marks, and update as you edit or undo. `InkThumbnail` draws a single page.
- `InkThumbnails` lists every page or a chosen set. It follows the current page, goes to a page on click, and only mounts the items near view, so long documents stay fast.
- `InkRecordList` shows any plugin's records as cards. Selecting a card selects its mark on the page, and selecting a mark selects its card. Each card action is one undo step.
- `InkSearchResults` lists search hits as cards. Each card leads with the matched text. `search.select(index)` jumps to any hit.
- `useRecords` and `useRecordSelection` give app code the same records plugins use. Outside the bindings, use `viewer.records(key)`. Each write is one undo step, and `batch` groups them.
- Clicking a plugin mark now selects its record and adds `data-selected` to the mark.
- Download and print the open PDF with `InkDownloadButton` and `InkPrintButton`, or `createDownloadButton` and `createPrintButton` in plain DOM. Inside the viewer, Ctrl or Cmd+S downloads and Ctrl or Cmd+P prints.
- `viewer.download({ filename })` and `viewer.print()`. The file name comes from the opened file or URL, and `doc.fileName` returns it. For now both use the file as it was opened, without this session's annotations.
- Printing opens the browser's own print dialog for the PDF, so text stays sharp. On iOS the PDF opens in a new tab instead.
- Theme classes `.ink-select` for styled `<select>` elements and `.ink-input-group` for inputs with an icon.
- `@inkbar/icons` adds `Info`, `Printer` and `Download`.

### Improved

- The find bar shows a search icon.
- Note icons now fill the note's box and scale with zoom, as in other PDF viewers.
- Notes from the file show a pointer cursor under the select tools, since a click opens their thread.

### Fixed

- Notes in a PDF that have no appearance of their own now show a note icon instead of nothing.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.10.0)

## 0.9.0 (5 November 2026)

Creation tools are now opt-in. A viewer starts with only text selection and the select tool, and you pass the tools you want through `tools`. Tools you leave out drop out of your bundle.

### New

- Pass `allTools()` to get all eight creation tools, or import just the ones you need from `@inkbar/core/dom`.
- `InkToolbarButton` in `@inkbar/react`, `@inkbar/vue` and `@inkbar/svelte` lets you add your own buttons to an `InkToolbar`. They join the toolbar's arrow-key focus and pick up the theme's toolbar button styles. Before, a plain `<button>` was a separate Tab stop that the arrow keys skipped.
- `createViewer` now accepts a controlled annotation list with `annotations: { mode: 'controlled', initial, onChange }`, as it already did for `fields`. Push your list back with `setControlledValue`.

### Improved

- **Breaking:** `builtinTools` and `BuiltinToolId` are gone. Use `allTools()` and the new `CoreToolId` type instead. In every binding, `InkRoot` now takes creation tools only from `tools`.
- Tool buttons and the highlight, shape and signature menus hide themselves for a tool the viewer doesn't have.
- If you remove the active tool, the viewer falls back to `select-text` and tells you once through `update:tool` or `onToolChange`.
- An unknown tool id no longer throws. It logs an `UnknownTool` error and keeps the current tool.
- Form fields can still be signed without the signature tool registered.
- The free text tool is now called "Text box" and the signature tool "Signature". The shape tool has a new shapes icon.
- Tool buttons only load their own icon, which keeps bundles smaller.

### Fixed

- In Svelte, a click straight after saving a signature is no longer lost.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.9.0)

## 0.8.0 (23 October 2026)

Inkbar now fills PDF forms. Text fields, checkboxes, radios, choice lists, buttons and signature fields all work on the page, and form scripts run in a locked-down sandbox so they can't reach the browser or the network.

### New

- Fill text fields on the page, including multi-line, password, comb, max length and auto-size fields, in the field's own font and alignment. Untouched fields keep the PDF's own look.
- Checkboxes, radios, combo boxes, list boxes and push buttons, drawn with the PDF's own on and off appearances.
- Click an empty signature field to open the signature menu and place a signature inside the box. Deleting it clears the field. Certificate-signed and locked fields stay read-only.
- `doc.form` holds field values in memory, with `set` and `reset`, validation, and `fields` in import and export. Nothing is written into the PDF.
- Use controlled fields in every package: `v-model:fields` in `@inkbar/vue`, `fields` with `onFieldsChange` in `@inkbar/react`, and `bind:fields` in `@inkbar/svelte`. Each also adds `useForm` and a `formHighlight` option.
- Form scripts for keystroke, format, validate and calculate work as they do in other viewers. They run in PDF.js's sandbox, which loads only for documents that have scripts.
- Submit, mail, open-link and print requests from a form reach your app as form action events (`onFormAction`, `form-action`, `onformaction`) instead of running on their own. Links are limited to http, https, mailto and tel.
- Script alerts show in a small dialog.
- Tab moves through fields in the page's own order and carries on across pages.
- Undo and redo from the keyboard: Ctrl or Cmd with Z to undo, and Ctrl or Cmd with Shift and Z, or Ctrl with Y, to redo. Inside a text field the keys keep their usual behaviour.

### Improved

- A form page renders once, and ticking a box or editing a field no longer repaints the page.
- A change and the calculations it triggers make one undo step. Script writes, such as timers or calculated totals, don't fill the undo stack.
- `formHighlight` can be switched on a mounted viewer with `setFormHighlight`.
- Form errors raised while a document opens reach `onError` after `onReady`.

### Fixed

- Escape puts back a text field's last committed text, and fields that don't scroll refuse text that would overflow.
- When a script refuses a value, the typed text stays so it can be corrected.
- Read-only combo and list boxes no longer open.
- Buttons follow named destinations and run chained actions in order. If the sandbox fails to load, a script button falls back to its link.
- Arrow keys skip hidden and read-only radios, and radios draw round with any colours and sizes set by scripts.
- The signature menu closes when its field leaves the page, including inside a shadow root, and focus returns to the viewer.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.8.0)

## 0.7.0 (23 October 2026)

This release adds text search. You can find text in a document from code, and every package now ships a find bar with highlighted matches.

### New

- `doc.search()` finds text across a document's pages. It takes a string or a regular expression and returns hits page by page, with positions, highlight boxes and surrounding context.
- String searches ignore case, accents and quote style by default. Options cover `matchCase`, `wholeWord`, which pages to search and in what order, and cancelling with a `signal`.
- Each hit has an `exact` flag. It is `false` when the boxes are estimated, for example in right-to-left or vertical text. Pad those boxes before using them to cover text.
- A find bar for the viewer. Ctrl/Cmd+F opens it when focus is inside the viewer, filled in with any short text you have selected. It shows a running match count, steps through matches with Enter and Shift+Enter, and has a match-case toggle. Escape closes it and returns focus to where it was.
- `InkFindBar`, `InkSearchButton` and `useSearch` in `@inkbar/vue`, `@inkbar/react` and `@inkbar/svelte`. For plain TypeScript, use `createSearchBar` and `createSearchButton`. Build your own controls with `useSearch` or `viewer.search`.
- Plugins can read and drive the same search state through `ctx.search`.
- Matches are highlighted on the page behind the text, so it looks marked rather than covered. Highlights follow zoom and rotation, and clicks pass through them. You can restyle them with the `--ink-search-hit` and `--ink-search-current` theme tokens.
- If no find bar is mounted, Ctrl/Cmd+F is left to the browser's own find.

### Improved

- `pageText` now joins text the way the page reads. A word split across two fonts comes back as `Invoice` rather than `Inv oice`. Spaces appear only at line ends and real gaps, including between right-to-left words.
- Highlight boxes line up with the glyphs the PDF's own fonts draw, including spacing and kerning.
- Search stays responsive on long documents. Results arrive a page at a time and pages without matches are scanned quickly.
- Screen readers hear the match position, a running count during a scan, and "No results".
- The find bar fits phone-width screens.
- The Vue find bar passes `class` and other attributes through to the bar element.

### Fixed

- Whitespace-only queries no longer start a search.
- The first step now lands on the first match at or after the page in view, rather than skipping it.
- Ctrl/Cmd+F works on non-Latin keyboard layouts.
- Case-insensitive matching no longer depends on the browser's locale.
- Search buttons and find bars clean up when the viewer is destroyed.
- `InkSearchButton` keeps its own label and title, and stays disabled until a document is open.
- Pressing Escape in the find bar no longer reaches your own key handlers.
- The Svelte find bar now moves into the viewer root. Keep it out of a keyed `{#each}` block.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.7.0)

## 0.6.0 (22 October 2026)

This release adds a plugin system. Plugins can add their own commands, tools, marks and cards, keep their own data per document, and undo together with annotation edits. They work the same in Vue, React, Svelte and plain TypeScript.

### New

- Write a plugin with `definePlugin(id, setup)` from `@inkbar/core`. Pass plugins to `InkRoot` with the `plugins` prop, or to `createViewer({ plugins })`.
- Place a plugin command in your toolbar with `<InkCommand id="…">`, or build your own control with `useCommand(id)`. In plain TypeScript, use `createCommandButton(viewer, id)`.
- `plugin.records(name)` gives a plugin its own data that follows the open document. Every change is one undo step, and `plugin.batch` groups several into one.
- `plugin.command(id, label, run)` adds a command with a status message. It is cancelled when the document changes, and errors show a status instead of breaking the viewer.
- `records.annotates(…)` links records to the annotations they create. The link survives export and import, and the plugin hears when the user removes a linked annotation.
- `plugin.marks(…)` draws a button for each record on its page. Marks follow zoom and undo, keep focus across redraws, and work with Enter and Space.
- Marks can open a card with a title, body and actions. `@inkbar/theme` styles it, so a plugin needs no CSS.
- Chain `.scrollToFirst()` onto `plugin.marks(…)` to bring new marks into view. It respects reduced motion.
- For more control, plugins can draw their own layer on each page, decorate annotations, and call `ctx.redecorate()` or `ctx.scrollTo(page, rect)`.
- Plugin tools appear in `InkToolButton` with their own label and icon.
- New helpers: `quadsFromRect`, `rectFromQuads` and `doc.pageText(page)`.
- The annotation store has a new `edit` event that fires before an add, update or remove applies.

### Improved

- Undo and redo restore plugin data along with annotations, in both controlled and uncontrolled mode.
- Plugin setup runs only in the browser, so server rendering is safe. React sets plugins up before the first paint.
- An unknown command id now logs a clear error naming the commands that do exist. The rest of the viewer keeps working.
- Invalid plugin ids and empty command labels throw a typed `InkError`.

### Fixed

- Command buttons keep keyboard focus while their command runs.
- Svelte toolbar menus no longer jump back to their first item after you move with the arrow keys.
- `InkPageInput` no longer scrolls the page to the top when it loses focus after you press Enter.
- Resetting a plugin's data no longer clears unrelated annotation undo steps.
- If one plugin's setup fails, plugins already set up are cleaned up.
- Plugin tools written as classes with private fields now work.
- Plugin marks take presses even without `@inkbar/theme`.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.6.0)

## 0.5.0 (21 October 2026)

Annotations now save and load as Gloss documents, and creation tools hand control back to Select text once you've made something. Apps can also decorate annotation elements and open their own popovers, so suggested redactions have moved out of Inkbar and into app code.

### New

- Export and import use the Gloss format. `exportAnnotations` writes `format: "gloss"`, and Inkbar's own data goes under `custom.inkbar`. `ANNOTATION_FORMAT` and `ANNOTATION_VERSION` are now `GLOSS_FORMAT` and `GLOSS_VERSION`. `GLOSS_SCHEMA_ID` and `GLOSS_MEDIA_TYPE` replace `ANNOTATION_SCHEMA_ID`, and `@inkbar/core/schema.json` is gone. Old `inkbar/annotations` files no longer import.
- Loupes and masks are saved as plain circles or squares, so other readers can still draw them. Inkbar restores them as loupes and masks when it loads the file again.
- Imported PDF annotations now keep text box callouts, line ends, note icons and fonts. This doesn't slow down opening a document. Encrypted files load as before.
- `decorateAnnotation` lets your app add data attributes, classes and an `aria-description` to annotation elements. `InkRoot` takes it as a prop in `@inkbar/react`, `@inkbar/vue` and `@inkbar/svelte`. Call `redecorate()` to apply it again.
- `Viewer.activated` and `Viewer.setActivated` let you follow and set the active annotation.
- `createPopover` and `placePanel` are exported from `@inkbar/core/dom` so you can build your own popovers. Popovers pick up the theme's tokens.
- Suggested redactions have been removed. This includes `InkSuggestionCard`, `acceptSuggestion`, `accept` and `dismiss` on `useAnnotations`, the `suggestions` option and the confidence colours. Redaction marks stay, and you can keep review data in `custom` and build your own review card.

### Improved

- Shape, area redaction, text box, note and signature tools switch back to Select text after use. While the tool is still on, you can move, resize or delete what you just made. Pen and highlight tools stay on.
- Under Select text, clicking empty page clears the annotation selection.
- Click inside a text box to edit it with the caret where you clicked. Drag it by its edge.
- Thin lines and unfilled shapes are easier to grab.
- Cursors now show what a press will do: move, text or crosshair.
- The highlight, shape and signature buttons look like one control, with clearer hover and active states.
- The highlight menu's colour row shows the colour your next markup will get.

### Fixed

- Stars and polygons now fill the box you drag.
- New lines and arrows follow the arrowhead choice in the line style menu.
- Split button menus line up under the whole button, and vanilla menus no longer open against the left edge of the window.
- In Svelte, closing a note's popover by clicking the page no longer stops the text selection.
- Fixed several edge cases when switching tools, including with a controlled host that refuses a new annotation.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.5.0)

## 0.4.0 (20 October 2026)

This release turns Inkbar into a full annotation editor, with new tools for shapes, text boxes, freehand drawing, sketching, highlights with comments, signatures, loupes and masks. It also adds shared style menus that work across Vue, React, Svelte and plain TypeScript.

### New

- **Custom tools.** Register your own tools with `tools` on `mountViewer`, `createViewer` and `InkRoot`, merged over the built-ins by id. Tools take options through `tools.set(id, options)`, `tools.setOptions(id, patch)` and `tools.options(id)`, and keep them for the life of the viewer.
- **Shared tool style.** `ToolStyle` holds the current style for shapes, ink, text, markup and redaction. Changing it also updates the selected annotations in one undo step. Use the new `useToolStyle()` and `useToolOptions(id)` hooks in Vue, React and Svelte.
- **`select-text` tool.** It replaces `view`. It selects text and also selects, moves and resizes annotations. `select` is now rectangle select. Lines get endpoint handles, Shift locks the aspect ratio, and a multi-selection moves together.
- **Style menus.** `InkLineStyleMenu` sets weight, dashes and arrowheads. `InkColorMenu` sets border, fill or text colour from a built-in palette, exported as `PALETTE`. `InkTextStyleMenu` sets font, size, colour, bold, italic, underline and alignment. Each menu works on the selection or the active tool and shows mixed values.
- **Shapes tool.** The `shape` tool draws lines, arrows, rectangles, rounded rectangles, ellipses, stars, polygons and speech bubbles. `InkShapeMenu` picks the kind, or set it yourself with `tools.set('shape', { kind })`. All shapes are standard PDF annotations.
- **Text boxes.** The `freetext` tool places a box you type straight into. Double-click or press Enter to edit it again. Pass `fonts` to choose the font list. The default is Helvetica, Times and Courier.
- **Speech bubbles.** Bubbles are stored as standard free-text callouts, so other viewers show them as a box with a leader line. The tail follows the text as it grows and has its own handle.
- **Draw tool.** The `draw` tool makes smooth freehand ink that thins and thickens with pen pressure. Pressure is stored in a new `pressure` field.
- **Sketch tool.** The `sketch` tool turns rough strokes into clean lines, arrows, rectangles, ellipses, polygons and stars. One undo brings your original stroke back. You can also call the recogniser yourself with `recogniseStroke(points)`.
- **Comments on highlights.** Highlights, underlines, strikeouts and squiggles can now start a comment thread. `InkHighlightMenu` picks the kind and colour.
- **Signatures.** The `signature` tool places saved visual signatures. They are not cryptographic signatures. `InkSignatureDialog` lets users draw, type or upload one. You choose where signatures are kept with a `SignatureStore`. Core includes memory and local storage stores. Image signatures use the new `stamp` annotation type.
- **Loupe.** A `loupe` annotation magnifies the page under it, rendered sharply with PDF.js.
- **Mask.** A `mask` annotation dims the page outside a rectangle or oval, so the eye lands on what it frames.

### Improved

- Line endings now render, including reversed arrows, and `dashes` works on more shape types.
- PDF names such as line endings, note icons and intents keep their PDF spelling. Unknown values are kept and written back unchanged, so annotations from other software load and save cleanly.
- Callouts made in other software now draw as they do there. Editing them keeps them standard.
- PDF import keeps intents, note icons and all line ending names.
- Replies stay in the thread popover and off the page, so they never cover a highlight.

### Fixed

- Style menus follow the active tool, so picking a new tool no longer restyles the wrong annotation.
- Undo grouping now works for hosts that hold the annotation list themselves.
- Signature saves fail with a visible error when browser storage is full, instead of vanishing on reload.
- Host `onkeydown`, `onclick` and `disabled` props now combine with menu triggers in every binding. The Vue `fonts` prop now reaches the viewer.
- Signatures show up in the dark theme, and the loupe re-renders when the pixel ratio changes.

**Breaking changes:**

- The `view` tool is now `select-text`.
- `InkNotePopover` is now `InkThreadPopover`, and the `createViewer` option `notes` is now `threads`.
- Text boxes follow XFDF: `color` is now the fill, and text styling moves into `defaultStyle`.
- Line endings, note icons and intents now use PDF spelling, such as `OpenArrow` and `FreeTextCallout`.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.4.0)

## 0.3.0 (19 October 2026)

Annotation JSON now uses XFDF field names, so an export reads as XFDF with Inkbar's extensions on top. This renames several fields, so check any code that reads or writes annotation data.

### Improved

- Annotation types `note` and `freeText` are now `text` and `freetext`. The Note tool keeps the id `note`, and the UI still says "Note".
- On shapes, polygons and redactions, `fill` is now `interiorColor`.
- `strokeWidth` is now `width`.
- `endings: [head, tail]` is now two separate fields, `head` and `tail`.
- `paths` is now `inklist`.
- A freetext annotation's displayed text moves from `text` to `contents`.
- `id`, `author`, `createdAt`, `modifiedAt`, `rect` and `quads` keep their current names and shapes.
- Exports no longer include `source` or `locked`, as these describe the viewer's state rather than the annotation. Import ignores them if they are present.
- `createdAt` and `modifiedAt` must be ISO 8601 date-times. The JSON schema now rejects bad dates even in validators that skip format checks.
- The package READMEs are more accurate:
  - The toolbar samples now include the View tool, so users can switch back to it.
  - The keyboard notes are clearer: area redactions need a pointer.
  - The `asChild` docs list every control that supports it.
  - The core README covers `{ data, key }` sources and when `doc.key` is stable.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.3.0)

## 0.2.0 (15 October 2026)

Inkbar no longer ships a default toolbar. `DefaultToolbar` is gone from `@inkbar/vue`, `@inkbar/react` and `@inkbar/svelte`, and you now build toolbars from small components in your own markup, so each app keeps only the controls it needs and places them where they fit.

### New

- New toolbar controls in the Vue, React and Svelte packages: `InkPrevPage`, `InkNextPage`, `InkUndo`, `InkRedo`, `InkToolbarSeparator` and `InkIcon`. Use them alongside `InkToolbar`, `InkToolButton`, the zoom controls and the page controls.
- Matching controls for plain TypeScript in `@inkbar/core`, such as `createToolbar`, `createToolButton`, `createUndo`, `createZoomSelect` and `createPageInput`. Each one follows its viewer and disables itself until a document is ready.
- `viewer.viewport` and `viewer.tools` stay up to date when the viewer rebuilds, so your own controls can rely on them.
- A new `@inkbar/icons` package holds the icons the controls use, with no runtime dependencies. Every button shows its icon unless you pass your own.
- New `--ink-control-size` and `--ink-icon-size` theme variables set the size of a bar's controls and icons.

### Improved

- The zoom select in the framework packages is now a styled dropdown that matches shadcn, in place of a native `<select>`. In `@inkbar/core/dom`, `createViewer` keeps a native select and gets the same chevron.
- `createViewer` now renders just the document and popovers, leaving the toolbar up to you.
- The theme styles toolbar controls but no longer adds borders or dividers, so your app decides where a bar sits and how it is separated from the document.
- The framework packages no longer depend on a separate icon library.

### Fixed

- The Vue, React, Svelte and theme packages now include their licence file, with the notices for the icons they use.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.2.0)

## 0.1.1 (15 October 2026)

This is the first release of Inkbar you can install. Publishing 0.1.0 failed before any package went out, so 0.1.1 is the first version available for all five packages.

### Fixed

- All five packages now publish properly, so you can install them as normal.
- Each package now lists its source repository, homepage and bug tracker, so you can find the code and report issues straight from the package page.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.1.1)

## 0.1.0 (15 October 2026)

Inkbar's first release is an open-source PDF viewer and annotator you can drop into a web app. It renders pages with PDF.js, lets people highlight, redact and leave notes, and keeps every annotation as plain data your app owns. It comes as `@inkbar/core` for plain TypeScript, with `@inkbar/react`, `@inkbar/vue` and `@inkbar/svelte` on top, plus `@inkbar/theme` for default styles. All packages share one version.

- Open PDFs, including password-protected ones, and scroll through them smoothly. Only the pages near the view are rendered, so long documents stay quick.
- Pages render sharply on high-density screens, respect the page's UserUnit, and show a clear error slot if a single page fails, without breaking the rest.
- Select and copy text from the page, with blank lines kept in multi-line selections.
- Highlight text, mark redactions and add notes with the built-in tools. Notes open in a popover with a full thread.
- Suggested redactions appear as cards the reader can accept or dismiss, so your app can propose redactions and let a person decide.
- Annotations already embedded in a PDF are imported and shown. Ink, shapes and lines display from imported data, though you can't draw them yet.
- Import and export annotations as JSON, with a published JSON schema so you can validate what you store.
- Keep annotations in your own state if you prefer. Pass a controlled list in and Inkbar proposes changes for you to apply.
- Undo and redo work out of the box, for controlled lists too. `history.batch(fn)`, also returned from `useHistory()`, turns many changes into one undo step, so a bulk action can be undone with a single Undo.
- Move, resize and edit annotations from the keyboard as well as the mouse. Toolbar buttons share one Tab stop with arrow keys, Home and End, and popovers keep focus where people expect it.
- Use the ready-made toolbar for tools, zoom and page, or build your own from the toolbar primitives. Each package has `InkRoot`, `InkViewport`, `InkPage` and `InkAnnotation`, plus hooks or composables for the document, annotations, tools, zoom, page and history.
- Render your own annotation markup through slots and snippets. Changing the gap, buffer or annotation slot keeps the reader's scroll position.
- No framework? `createViewer` in `@inkbar/core/dom` gives you a complete viewer with toolbar and popovers in a few lines. `mountViewer` gives you the same wiring without the default UI, and leaves the toolbar code out of your bundle.
- `@inkbar/theme` styles everything with zero-specificity CSS, so your own styles win without a fight. It supports light and dark, including light sections inside a dark page.
- A Vite plugin serves the PDF.js assets from your own origin, with no extra setup.
- Framework packages take `@inkbar/core` as a peer dependency, so your app gets one copy of core and of PDF.js.
- Try it all in the sandbox at sandbox.inkbar.dev, with React, Vue, Svelte and plain TypeScript versions of the same viewer and their source alongside.

[Full changelog on GitHub](https://github.com/inkbar/inkbar/releases/tag/v0.1.0)
