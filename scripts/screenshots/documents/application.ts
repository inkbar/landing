// Writes application.pdf, the short membership form the forms screenshot fills in:
//
//   node scripts/screenshots/documents/application.ts
//
// The club is made up, and the footer says so. Each field carries a tooltip (/TU), which the
// viewer uses as the field's accessible name.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  PDFDocument,
  PDFHexString,
  PDFName,
  StandardFonts,
  rgb,
  type PDFField,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib'

const INK = rgb(0.051, 0.063, 0.149)
const MUTED = rgb(0.33, 0.35, 0.45)
const LINE = rgb(0.8, 0.81, 0.86)
const FIELD = { borderColor: rgb(0.54, 0.56, 0.66), borderWidth: 1 }
const LEFT = 56
const WIDTH = 483
const HALF = 235

const doc = await PDFDocument.create()
// A fixed date, so a rerun writes the same bytes.
const made = new Date('2026-11-24T00:00:00Z')
doc.setTitle('Membership application')
doc.setCreationDate(made)
doc.setModificationDate(made)
const page = doc.addPage([595, 842])
const regular = await doc.embedFont(StandardFonts.Helvetica)
const bold = await doc.embedFont(StandardFonts.HelveticaBold)
const form = doc.getForm()

function text(
  on: PDFPage,
  value: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont = regular,
  color = INK
): void {
  on.drawText(value, { x, y, size, font, color })
}

function named<T extends PDFField>(field: T, label: string): T {
  field.acroField.dict.set(PDFName.of('TU'), PDFHexString.fromText(label))
  return field
}

function textField(
  name: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height = 22
): void {
  text(page, label, x, y + height + 6, 9.5, regular, MUTED)
  const field = named(form.createTextField(name), label)
  field.addToPage(page, {
    x,
    y,
    width,
    height,
    font: regular,
    ...FIELD,
  })
  // A fixed size: auto-sized text swells to fill the box.
  field.setFontSize(11)
}

function checkBox(name: string, label: string, y: number): void {
  named(form.createCheckBox(name), label).addToPage(page, {
    x: LEFT,
    y,
    width: 13,
    height: 13,
    ...FIELD,
  })
  text(page, label, LEFT + 22, y + 2.5, 10.5)
}

text(page, 'Marlowby Rowing Club', LEFT, 786, 11, bold, MUTED)
text(page, 'Membership application', LEFT, 750, 24, bold)
text(
  page,
  'Fill in this form to join for the 2027 season. We reply within a week.',
  LEFT,
  726,
  10.5
)
page.drawLine({
  start: { x: LEFT, y: 708 },
  end: { x: LEFT + WIDTH, y: 708 },
  thickness: 1,
  color: LINE,
})

text(page, 'About you', LEFT, 680, 13, bold)
textField('name', 'Full name', LEFT, 630, WIDTH)
textField('email', 'Email', LEFT, 580, HALF)
textField('phone', 'Phone', LEFT + WIDTH - HALF, 580, HALF)
textField('born', 'Date of birth', LEFT, 530, 150)

text(page, 'Membership', LEFT, 490, 13, bold)
const membership = named(form.createRadioGroup('membership'), 'Membership')
const options: [string, string, number][] = [
  ['Adult', 'Adult, £180 a year', LEFT],
  ['Junior', 'Junior, £60', LEFT + 170],
  ['Family', 'Family, £320', LEFT + 290],
]
for (const [value, label, x] of options) {
  membership.addOptionToPage(value, page, { x, y: 462, width: 13, height: 13, ...FIELD })
  text(page, label, x + 20, 464.5, 10.5)
}
checkBox('rack', 'Add a rack space for my own boat, £40 a year', 436)

text(page, 'Emergency contact', LEFT, 396, 13, bold)
textField('contact', 'Contact name', LEFT, 346, HALF)
textField('contactPhone', 'Contact phone', LEFT + WIDTH - HALF, 346, HALF)

textField('notes', 'Anything we should know', LEFT, 240, WIDTH, 72)
form.getTextField('notes').enableMultiline()
checkBox('agree', 'I agree to the club rules and the privacy notice.', 206)

text(
  page,
  'A sample form made for inkbar.dev. Marlowby Rowing Club is not a real club.',
  LEFT,
  48,
  8.5,
  regular,
  MUTED
)

const out = fileURLToPath(new URL('application.pdf', import.meta.url))
writeFileSync(out, await doc.save())
console.log(`Wrote ${out}`)
