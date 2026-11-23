---
title: Sign PDFs in your web app | Inkbar
description: Let people draw, type or upload a signature and place it on any page or in a signature field of a PDF, in the browser. Open source and free.
heading: Let people [sign] PDFs in your app
mark: signature
summary: Draw, type or upload a signature, then place it on a page or in a signature field.
focus: 35% 72%
address: app.example.com/letters/tenancy-renewal/sign
lede: People draw their signature, type their name in a handwriting font or upload a scan. They save it once and place it on any page, or in a form's signature field.
screenshot: ../../assets/use-cases/sign-pdfs.png
alt: A tenancy letter in the Inkbar viewer with a drawn signature placed and selected between Yours sincerely and the sender's printed name.
guide: signatures
label: Sign PDFs
order: 3
users:
  - Create a signature in a dialog. Draw it, type it, or upload an image of a scan.
  - Place it with a click, then move and resize it. It keeps its shape and reads upright on a rotated page.
  - Choose from their saved signatures next time, or remove ones they no longer use.
  - Sign a form's signature field, where the signature stays locked to the field.
app:
  - Saved signatures kept in the store you choose, from memory to the browser's local storage to your own server.
  - Signatures placed from your own code, at a point and width you set.
  - With `@inkbar/engine`, Download, Print and `doc.save()` write the placed signatures into the PDF.
notes:
  - heading: What kind of signature this is
    text: |-
      Inkbar puts the signature on the page as a mark. It does not sign the file with a certificate, so this is an electronic signature, not a certificate-based digital signature.

      When a file already carries a digital signature, Inkbar saves by appending its changes after the signed bytes, so that signature still verifies. Other viewers then report that the file changed after signing.
example: |
  import { createLocalStorage } from '@inkbar/core'
  import {
    createSignatureMenu,
    createToolbar,
    createToolButton,
    createViewer,
    signatureTool,
  } from '@inkbar/core/dom'
  import { assets } from 'virtual:inkbar-assets'

  const viewer = createViewer(el, {
    source: file,
    assets,
    tools: [signatureTool()],
    storage: createLocalStorage('my-app'),
    signatureFonts: ['Dancing Script'],
  })

  const tools = createToolbar()
  tools.append(
    createToolButton(viewer, 'select'),
    createSignatureMenu(viewer)
  )
  viewer.element.prepend(tools)
---
