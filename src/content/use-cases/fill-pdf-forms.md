---
title: Fill PDF forms in your web app | Inkbar
description: Let people fill in PDF forms in the browser, with the form's own scripts running, and keep the values in your app or in the PDF. Open source and free.
heading: Let people fill in PDF forms inside your app
lede: Text fields, checkboxes, radio buttons, lists and signature fields work in the viewer. The form's own scripts run too, so totals add up and checks work as the form's author intended.
screenshot: ../../assets/use-cases/fill-pdf-forms.png
alt: A sample form in the Inkbar viewer with the full name, email and notes fields filled in, the I agree box ticked and the cursor in the notes field.
guide: forms
label: Fill PDF forms
order: 2
---

## What your users can do

- Type into text fields, tick checkboxes, pick radio buttons and choose from lists, on the page where the form puts them.
- Move through the form with Tab in the order the PDF sets, across pages. Space toggles a checkbox and the arrow keys move through a radio group.
- Press Sign on an empty signature field and choose a saved signature, which stays locked to the field. Signing is visual: it places the signature on the page and does not add a digital signature to the file.

## What your app gets

- Every change as it happens, with the full set of values, so your app can store them as people fill the form in.
- Values set from your own code, such as a name your app already knows.
- With `@inkbar/engine`, Download, Print and `doc.save()` write the changed values into the PDF. Without it, keep the values in your own state, or export them as JSON and load them the next time the document opens.

## The limits

Inkbar fills AcroForm fields. A pure XFA form shows as a static page; a PDF with an AcroForm alongside its XFA fills through the AcroForm. File-select and barcode fields show their appearance but cannot be filled. The [Forms guide](/docs/guides/forms/#not-supported) has the details.

## What it costs

Inkbar is open source under the MIT licence. There is no licence fee and no per-seat price.

## A short example

```ts
import { createViewer } from '@inkbar/core/dom'
import type { FieldValues } from '@inkbar/core'
import { assets } from 'virtual:inkbar-assets'

let values: FieldValues = await loadValues()

const viewer = createViewer(el, {
  source: file,
  assets,
  fields: {
    mode: 'controlled',
    initial: values,
    onChange(next) {
      values = next
      saveValues(next)
    },
  },
})

// Later, to change a value from your app:
viewer.form.get()?.setControlledValue({ ...values, agree: 'Yes' })
```

The same viewer comes as components for [Vue](/docs/frameworks/vue/), [React](/docs/frameworks/react/) and [Svelte](/docs/frameworks/svelte/).
