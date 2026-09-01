---
'@toolpath/tool-scraper': minor
---

A `drill` record may carry no point angle. `RECORD_GEOMETRY.drill` lists `SIG`
under `sometimes` rather than `always`, so `toolRecord` no longer refuses a
drill whose mapper supplies none, and a consumer cannot read `geometry.SIG` on
a drill without checking for it.

EMUGE-FRANKEN publishes a point angle on 2,669 of its 2,670 drill variants and
leaves the cell empty on the last. `SIG` is a mapped column in that adapter
rather than a family fact, so the one blank cell refused the row — and because
`toRecords` maps a family's rows together, it took the other 2,669 drills with
it. The adapter now omits the key and warns, the way it already treats an
end mill's sentinel flute count, while a point-angle cell holding something
that is not an angle — a length, a range — still refuses.

Kennametal's drills supply `SIG` from a family fact and always carry one.
