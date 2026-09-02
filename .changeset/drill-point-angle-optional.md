---
'@toolpath/tool-scraper': minor
---

A `drill` record may carry no point angle. `RECORD_GEOMETRY.drill` lists `SIG`
under `sometimes` rather than `always`, so `toolRecord` no longer refuses a
drill whose mapper supplies none, and a consumer cannot read `geometry.SIG` on
a drill without checking for it.

EMUGE-FRANKEN states a point angle on 2,669 of its 2,670 drill variants. The
last, part `000000000010727800`, publishes a single classification feature and
no dimensional properties at all — so its row carries no `SIG` **key**, rather
than a key with an empty value. `SIG` is a mapped column in that adapter rather
than a family fact, and because `toRecords` maps a family's rows together, that
one part refused all 2,670 drills.

The adapter now omits the key and warns, the way it already treats an end mill's
sentinel flute count. A point-angle cell holding something that is not an angle
— a length, a range — still refuses, and so does a family that maps no
point-angle column at all: that is a fact about the map rather than about a row,
so it is asked of the map directly. Reading the two as one is what cost the
family, and it named a column map that was correct.

Kennametal's drills supply `SIG` from a family fact and always carry one.
