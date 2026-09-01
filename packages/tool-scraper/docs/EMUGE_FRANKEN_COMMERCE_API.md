# EMUGE-FRANKEN: the SAP Commerce product API

How the endpoint was found, what it answers with, and what was tried first.
Investigated JG 2026-09-01, against the US storefront.

This is the most expensive thing about this vendor to rediscover, so it is
written down before anything else — the same reason `KENNAMETAL_CAD_API.md` and
`REGOFIX_PRODUCTFINDER_API.md` exist.

## 1. Dead ends

**The listing pages carry no product data at all.** Neither the `/c/` category
pages nor the `/a/` article pages the marketing navigation ends at. A category
page is 114 KB of HTML and the only product-shaped thing in it is an empty
custom element:

```html
<category-detail-page search-query="%3Arelevance%3AallCategories%3AFF02..."
                      category-code="ff02"></category-detail-page>
```

`curl` on `/us/en/end-mills/a/End%20Mills` returns 219 KB whose every `href` is
an `hreflang` alternate. The storefront is SAP Commerce (Hybris) — the response
headers say so outright (`Server: accstorefront-…`, `X-SAP-Pad`) — behind a Vue
front end that renders in the browser. There is nothing to parse.

**The `/a/` article pages are marketing, not catalog.** They do carry data, in
base64 `data-string` attributes on `<cms-component-resolver>` elements, and
decoding those is how the category codes below were found: each product-family
page ends at a "View Products" link into `/c/<category>?q=<facet query>`. They
are worth knowing about and they are not a scrape target — they publish teasers
and no parts.

**`GET /products/<code>` 404s.** Per-part detail is only the list form,
`/products?productCodes=a,b,c`.

**CAD is behind a login.** `fields=PRODUCT_DOWNLOADS` returns the download
groups for every part — a 2D PDF, a DXF "as per ISO/DTS 13399-70", a STEP model
"as per DIN 4003 / ISO 13399", and a DIN 4000 properties XML — and every entry
comes back `"anonymousAccess": false` with both `"url"` and `"downloadUrl"`
null. So neither `conventions.CAD_COLUMN` nor `CAD_DXF_COLUMN` is written for
this brand, and `mirror-cad` does not apply to it. The DIN 4000 XML is the same
document REGO-FIX publishes openly; here it is not reachable.

## 2. Where the endpoint is stated

Every page of the site declares it inline:

```html
<script>
  window.appConfig = {}
  window.appConfig.basesiteId = 'emugefrankenUSA'
  window.appConfig.baseUrl = 'https://www.emuge-franken-group.com'
  window.appConfig.apiNodeUrl = 'https://api.emuge-franken-group.com'
</script>
```

and the front-end bundle — `/_ui/patternlab/js/app-vue.js`, which is a one-line
re-export of `/_ui/patternlab/js/main-<hash>.js` — builds its client from the
two:

```js
function rT() {
  return Xn.create({ baseURL: `${Yn.apiNodeUrl}/api/v2/${Yn.basesiteId}` })
}
```

with `lang` and `country` defaulted onto every request. So:

```
BASE = https://api.emuge-franken-group.com/api/v2/emugefrankenUSA
```

It answers anonymously. `emugefrankenUSA` is one of four base sites the bundle
names (`reime`, `frankendental` and `emugefranken` are the others); this package
reads the US one, which is the storefront `/us/en/` serves.

## 3. The three calls

Every one takes `lang=en&country=US`. Without them the API answers in German.

### Grouped products in a category

```
GET {BASE}/search/products
    ?query=:relevance:allCategories:<CAT>:klammerProduct:false
    &currentPage=<n>&pageSize=500
    &searchQueryContext=KLAMMER_GROUPING
```

A *klammer* product is EMUGE's grouping — `H301025`, "Solid Carbide End Mill
TOP-Cut VAR". The response carries `pagination.totalPages` and a `products`
list; each product has `code`, `articleCode`, `name`, `numberOfMaterials`,
`productListInfo` (one plain-text sentence, the vendor's own description) and a
flat `technicalDetails` list of `{ property, value }` pairs — the product line,
the category, the version, the coating, the cutting material. **No dimensions.**

The response also carries the whole facet index, which is where the closed
vocabularies in `vendors/emuge/records.ts` came from.

### One group's orderable parts

```
GET {BASE}/search/products
    ?query=:relevance:klammerProductCode:<H-code>
    &currentPage=<n>&pageSize=500
    &searchQueryContext=VARIANT_SEARCH&sort=prod-detail-variant
```

Each product here is a part somebody orders: `code` (an 18-digit SAP material
number), `articleCode` (the catalog designation, `2998L.012010`),
`dimensionFeatureValue` (the vendor's own size designation — `Ø1/8 / R0.010`,
`d1=3,0`, `Nr.4-40 UNC-2BX`) and, under `mainDrawing.technicalDetails`, **the
dimension table**. The largest group seen holds 214 variants, so one page covers
every group.

`sort=prod-detail-variant` is the order the vendor's own product page lists
sizes in, which is what makes a re-scrape diff against the last one.

**The grouped product is returned inside its own variant listing**, last, and it
is not a part. It carries `klammerProduct: true`, the base article code with no
size suffix (`TA219744` where its variants are `TA219744.0300`), and no
`mainDrawing` at all. `KLAMMER_GROUPING` queries exclude it with
`:klammerProduct:false` in the query and `VARIANT_SEARCH` queries do not, so the
adapter reads the flag. `totalResults` here is therefore always one more than
the grouped product's own `numberOfMaterials`.

### Per-part detail, batched

```
GET {BASE}/products?productCodes=<up to 30, comma-joined>&fields=FULL
```

Answers a bare JSON **array**, one record per code, 30 for 30. This is the only
call that carries:

| Field | Kind |
| --- | --- |
| `number of flutes Z` | end mills |
| `point angle` | drills |
| `thread symbol`, `pitch [mm]`, `threads per inch`, `nominal size` | taps |
| `applicationMaterials` | all — the vendor's own ISO 513 P/M/K/N/S/H rating |

which is why a scrape is three calls and not two. The grouped product's own
`fields=FULL` record carries `applicationMaterials` but **not** the flute count,
so batching per variant is what a record needs.

## 4. The catalog

| Category | Kind | Grouped products | Orderable variants |
| --- | --- | --- | --- |
| `FF01` | End mill cutters | 554 | 7,021 |
| `FB01` | Twist drills | 17 | 2,670 |
| `FG01` | Machine taps | 414 | 11,566 |
| `FF02` | Tool holders and accessories | 80 | 625 |

`FF02` is not scraped — this package takes EMUGE's cutting tools only.

Milling is split by unit system with the vendor's own facet,
`feature-HYBCL_PRODUKTMERKMALE-AMM_EINHS`: `AMM_EINHS_Z` inch (1,832 variants)
and `AMM_EINHS_M` metric (5,189). Drilling and tapping have no such facet and
need none — every drill and every tap is published in millimetres.

Roughly 1,700 requests cover the three cutting-tool categories: the group
listings, one variant call per group, and `ceil(variants / 30)` detail calls.
At the package's 400 ms pacing that is about twelve minutes.

## 5. What the vendor gets wrong

Warned about, never corrected.

1. **`number of flutes Z` is `999`** on 64 end mill variants — a sentinel, not a
   count. `records.ts` omits it and says so; the CSV keeps it.
2. **`name` comes back German** on the US English storefront — "TOP-Cut VAR
   HM-Schaftfräser / lang Typ N ALCR" with `lang=en&country=US` — while every
   property label and value in the same response is English.
3. **A label's unit tag is unreliable.** `cutting length l₂ [mm]` carries one and
   `overall length l₁` and `neck diameter Ød₃` do not, on the same part in the
   same table. The unit is stated in the *value* (`3 mm`, `1/8 "`), which is what
   `value.ts` reads.
4. **The same property is spelled two ways across categories**: `coating` on a
   milling part, `Coating` on a drill or a tap.
5. **German decimal commas in tolerance text** — `<=0,003 mm`, `± 0,0008 "` —
   where every dimensional value uses a dot.
6. **A variant listing includes the thing being varied.** See §3 — one bogus
   row per group if the flag is not read. This is what the first live drill run
   found: 2,687 rows against a family declaring 2,670, exactly 17 groups' worth,
   caught by `node/receipts.checkRows` and by nothing before it.
7. **A marketing link carries the wrong facet.** The MultiTAP article page's
   "View MultiTAP™ Products" button links to
   `/thread-technology/machine-tap/c/fg01?q=…HYB_BAM_SB_GT:HYB_BAM_SB_GT_25`,
   which is MultiDRILL's geometry facet. This is why `families/emuge.ts` keys off
   category codes verified against the API rather than off the marketing links
   the codes were discovered through.

## 6. What it does not publish at all

**A flute count for a drill or a tap.** Not on the grouped product, the variant
listing, the per-part detail or any facet. The drill families' comes from an
assumed fact — all 17 groups state `Specification: Twist drill`, and
`Number of margins` (2 or 4) is a separate published column, so the 4 there is
not a flute count. The taps' does not come from anywhere: EMUGE's own tap lines
run 2, 3 and 4 flutes across a size range, so no per-family constant could be
true of every row, and `records.RECORD_GEOMETRY.tap` lists `NOF` under
`sometimes` for it.
