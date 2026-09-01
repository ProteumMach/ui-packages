---
'@toolpath/tool-scraper': minor
---

`toRecords` skips a part the vendor left a required dimension blank on, rather
than failing the whole family. It warns naming the part, and every other
refusal still throws.

The rows of a family are mapped together, so until now one incomplete part
ended the conversion and took every good row with it. EMUGE-FRANKEN omits
`overall length l₁` on roughly 175 of its 7,021 end mill variants — the
property is absent from the response, not blank — and both end mill families
therefore produced no records at all.

`columns.required` now raises the new `IncompletePartError`, a subclass of
`VendorResponseError`, and that is the only failure `toRecords` skips past. A
cutting material with no mapping, a column a family stopped mapping, a response
that changed shape: those say the vendor's vocabulary or this package's catalog
has moved, and they still fail the family.

**No kind's contract is relaxed.** `RECORD_GEOMETRY.endmill` still lists `OAL`
under `always`, and every record returned still carries one — a part without it
becomes no record rather than a record with a hole. That is the difference
between this and a drill's `SIG`, which is `sometimes` because the vendor
genuinely never publishes it.

Callers that assumed one record per scraped row should read the returned length.
