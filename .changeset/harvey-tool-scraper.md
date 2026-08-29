---
'@toolpath/tool-scraper': minor
---

Add the Harvey Tool vendor adapter: 52 miniature end mill and keyseat cutter families, 12,773 orderable parts, scraped from each product page's inline variant table.

New exports: `@toolpath/tool-scraper/vendors/harvey`, `conventions.CAD_DXF_COLUMN` for a vendor's 2D profile link, and `FamilyFacts.profile` for the end profile a vendor states once per product line. `conventions.IDENTITY_DEVIATIONS` gains a `harvey` entry — Harvey publishes one `Tool #` per part and no catalog designation.

`toolpath-scrape harvey FAMILY.csv` scrapes one family; `toolpath-scrape harvey --catalog` walks the category trees.
