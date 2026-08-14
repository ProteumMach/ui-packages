# Bringing DFM rules to `apps/part-viewer`

**Goal:** judge a part against thresholds a shop sets for itself — a band and a
score per feature, the part painted by difficulty, and every verdict traceable
back to the datasheet fields it was read from.

Ported from `tp-ui@pc-feature-picker`, whose rules subsystem is the reference
implementation and whose `docs/rules.md` is its written spec (§6). This plan
follows that spec; where it departs from it, it says so.

Status: **not started.** This document is the proposal.

---

## 1. What exists there, and what it costs to bring over

| Piece                       | There             | Ports how                                                        |
| --------------------------- | ----------------- | ---------------------------------------------------------------- |
| `rules/metrics.ts`          | 1,477 LOC         | Near-verbatim. Reads `feature.datasheet` and nothing else        |
| `rules/rules.ts`            | 1,041 LOC         | Shapes + scoring verbatim; ~200 LOC of it serves the editor only |
| `rules/presets.ts`          | 523 LOC           | Verbatim — 15 shipped rules, and the numbers are the product     |
| `rules/saved-rules.ts`      | 125 LOC           | Verbatim, minus the key name                                     |
| `rules/band-display.ts`     | 283 LOC           | Colours and formatting; our units module already does half       |
| `rules/expression.ts`       | 329 LOC           | Verbatim — the editor needs it                                   |
| `rules/direction-scores.ts` | 109 LOC           | **Not in this plan** — wants setups                              |
| Rules page + editor         | ~2,500 LOC of TSX | Ported, as PRs 7–9 — the largest single piece                    |

The editor is the largest single piece here — roughly half the total — and it
earns that by being the only part that lets a shop disagree with a number, which
is what a rule set is for.

The engine half ports cleanly for one reason: it is
pure arithmetic over the Engine's datasheet: `readMetrics(feature, partContext)`
touches `feature.datasheet` and `feature.machiningDirection`, both of which our
`PartFeature` already carries in the same shape. There is no geometry in it, no
call to the Engine, and no framework.

**What makes this cheap:** the same reason dragging a threshold there recolours
the part instantly is the reason this ports without a rewrite — the rules run on
numbers already in hand.

**What makes it not free:** 1,477 lines of metrics is 1,477 lines of _provenance_
— each metric reports which datasheet fields it read and what they held, which
is what makes a verdict arguable rather than a colour to be taken on trust. That
is the bulk of the port and none of it is clever.

## 2. What we already have that this must not duplicate

- **`app/shared/measurements.ts`** reads the same datasheet for the detail panel
  — reach, feature depth, min radius, L/D, area, diameter. This overlaps
  `metrics.ts` head-on. **Decision: they land side by side, pinned to each other
  by a differential test, and only then does one of them go** (PR 1). A
  big-bang rewrite would ask a reviewer to check a hundred numbers by eye; the
  test checks them against the fixtures, and where the two disagree the
  disagreement is itself the finding — one of them is wrong about the Engine.
  The picker's own note about a card reading 8.28 mm beside 0.326 in is what
  happens without that.
- **`app/shared/units.ts`** already converts and rounds. `band-display.ts`'s
  formatting half collapses into it.
- **`paintWash` / `PaintMode`** already paints the part per feature from a
  colour table. Difficulty is a third mode, not a new mechanism.
- **The selection blue.** Already moved off orange for exactly this: the bands
  are a warm ramp and a selection cannot sit over them in orange.

## 3. What this plan leaves out

- **Direction scores** (§5 of the spec). "Which way up scored best" is a setups
  question, and this app has no setups yet.
- **Machine envelope rules** (`partOverMachine`, `part-size`). They need the
  part's bounding box and a machine on the rule set; both are reachable, neither
  is on the critical path. The metrics come across and simply read `null`.

Everything else in the picker's rules subsystem is in scope, **including the
editor** — which changes two things that would otherwise have been trimmed:

- **Expressions are in** (`expression.ts`, ~330 LOC). No shipped rule uses one,
  but a rule somebody writes usually is one — depth over cutter, area over
  depth — and adding a metric to the app for every idea is a release for every
  idea. Editor in means expressions in.
- **The `range` shape is fully implemented**, not carried as a type. Nothing
  ships as a range, but the editor can convert any rule into one, and a shape
  that evaluates to nothing once converted is worse than one that was never
  offered.

## 3a. Bands are ranks with names on them

A shop that grades work "fine / watch it / call me" is not using a different
scale, it is using different words for the same five steps. So:

- **Five fixed ranks are the model.** `easy` through `no go` stay as the
  canonical ids, and every comparison — worst-band, sorting, scoring — runs on
  the rank. Nothing keys off a name.
- **Names are display, and overridable.** A rule set carries a `bandNames` map,
  defaulting to the shipped five, and a rule may override it where one rule
  really does deserve its own vocabulary.
- **A rename is never a data migration.** Because the id is what is stored, a
  set renamed today still reads against a rule written yesterday, and a rename
  cannot silently re-band a feature.

The shipped names stay `easy`, `alright`, `meh`, `rats`, `no go`. This costs a
map and a lookup in PRs 2–3, and a text field per band in PR 8.

## 4. PR breakdown

Each is independently reviewable and independently landable. The first three are
pure logic with no UI; nothing is visible until PR 4.

### PR 1 — the measurements a rule can read

`app/shared/metrics.ts` — `MetricId`, `METRICS`, `readMetrics`, `partContext`,
and the `Reading` provenance each metric carries.

Ported name for name: a rule set written against the picker mentions
`millingLD` and `requiredCutter`, and renaming those orphans every rule that
does.

**`measurements.ts` is not rewritten here.** The two modules land side by side,
and what goes between them is a **differential test**: for every feature in the
report fixtures, each row `measurements()` produces must equal the metric that
answers the same question —

| Row             | Metric                     |
| --------------- | -------------------------- |
| `depthBelowTop` | `depthBelowPartTop`        |
| `featureDepth`  | `depth`                    |
| `minRadius`     | `minRadius`                |
| `ld`            | `drillingLD` / `millingLD` |
| `area`          | `surfaceArea`              |
| `walls`         | `wallArea`                 |
| `floors`        | `floorArea`                |
| `diameter`      | `holeDiameter`             |
| `floorFillet`   | `floorFilletRadius`        |
| `bevelAngle`    | `chamferAngle`             |

`faces` has no metric — it counts region shape kinds rather than reading the
datasheet — and keeps its own reader, stated rather than quietly special-cased.

That test is what makes the swap safe, and it is worth more than the swap: two
readers of `facts.cd.ignore.min` disagreeing by a factor of two is a bug neither
module's own tests can see, and a review cannot catch it by reading either file.
Where they disagree, **the disagreement is the finding** — one of the two is
wrong about the Engine, and which one is worth knowing before either is deleted.

Only once it is green does `measurements()` become a presentation layer over
`readMetrics` — labels, order, and provenance strings taken from the metric's
own `Reading`. By then that change is a deletion rather than a rewrite, and its
existing tests still pin every row.

~1,500 LOC, mostly declarative. Tests: every metric against a datasheet fixture,
the differential pass above, and the `angleRad` → `angleDeg` kernel change,
where reading the wrong one is an error of 57×.

### PR 2 — the rule shapes, and what they make of a feature

`app/shared/rules.ts` — `Band`, `worstBand`, all five shapes (threshold, range,
match, flag, baseline), `evaluateRule`, `evaluateFeature`, `scoreFeature`,
`scorePart`, the four silences, and `asType` for changing a rule's shape without
losing the rule. Plus `app/shared/expression.ts`, the custom-arithmetic field.

All five and both extras because the editor is in: a shop that wants "corner
radius" as a list of the tools it holds rather than as a sliding scale is not
writing a new rule, and a conversion that lands on a shape which evaluates to
nothing is worse than one that was never offered.

The scoring subtleties are the tests, and they are the reason this is its own
PR: a band is the worst rule's band, but a score interpolates _within_ a band,
so an L/D of 3.7 scores below 3.2 though both are `easy`; the part's score is
weighted by rule rather than by feature; hard limits are reported beside the
score rather than folded into it; and **a rule that did not apply is never
scored as easy** — with a sparse datasheet that single rule is the difference
between a real score and a part that reads `easy` throughout.

~1,050 LOC. Tests are the bulk of the work and the point of it.

### PR 3 — the shipped rules, and keeping a shop's own

`app/shared/rule-presets.ts` and `app/shared/saved-rules.ts`. The 15 default
rules verbatim — their numbers are the product, not an example — and versioned
`localStorage` persistence that drops one unreadable set rather than every set.

~650 LOC, nearly all data. Tests: the shipped set evaluates a fixture part
end-to-end, and a stored set from a future version migrates rather than throwing.

### PR 4 — the part painted by difficulty

A third paint mode beside plain and directions, in the five band colours, with
grey for a feature no rule reached — which is not the colour of `easy`.

Five named bands rather than a gradient: a shade between two of them is a number
the app invented. This is where rules first become visible, and it is a small PR
because `paintWash` already does the painting.

~200 LOC.

### PR 5 — why this feature got that band

The verdict in the feature detail panel: each rule that spoke, its band, and its
working — the metric's formula and the raw datasheet fields behind it, on the
same panel as the datasheet itself. And each rule that _stayed silent_, with
which of the four silences it was, because a shop looking at a feature that
scored well wants to know whether the rules it cares about agreed or never ran.

~400 LOC. This is the PR that makes a score arguable, and it should not be cut.

### PR 6 — what the rules make of the part

The summary in the left panel: the score, how many readings landed in each band,
how many rules spoke, how many features nothing judged. Band chips filter the
feature list, the same way the direction chips and type rows already do.

Every number is a press that finds what it counts — a summary that cannot be
followed back into the list is one to be taken on trust.

~400 LOC.

### PR 7 — a rule set you can hold and change

`app/shared/use-rules.ts` — the working copy. Which set is in force, the edits
made to it that are not yet saved, saving as a new set, and re-judging on every
change. The state layer the editor needs, with no editor on it yet.

Re-judging is pure arithmetic over numbers already in hand, which is what lets
every keystroke recolour the part. Nothing here calls the Engine, ever.

~450 LOC.

### PR 8 — one rule, with every part of it editable

The rule editor: what the rule reads, which feature types it judges, the shape
of the scale, where every band ends, the refusal, the weight, whether it applies
at all — and what the five bands are called (§3a).

Every part of it, because a panel that only moved four threshold numbers makes
the other shapes read as decoration — a range with no visible spans and a match
with no visible sizes look like rules nobody finished writing. The range draws
as nine segments, refused through the wanted band and out again, so read left to
right it is the shape of the rule.

Numbers are shown in whichever unit the header is set to and stored in
millimetres. That is what lets an inch shop and a metric shop trade a set.

~900 LOC.

### PR 9 — arguing with a rule where its consequences are

The rules page: the summary on the left — the score, the band counts, how many
rules spoke, which set is in force — and on the right the impact, every limit
with the features it actually bit on and their datasheets underneath.

Band chips and a type filter, because "what is making this part hard" and "what
do the rules say about my pockets" are the two questions anybody arrives with,
and neither is answerable across twenty rules and two hundred readings. With a
filter on, a rule that caught nothing drops out — a filter is a question about
what it selects.

Pressing a rule's name opens its numbers in place and every keystroke re-judges,
so the features underneath re-sort as the limit moves past their measurements.
Only the numbers are editable there; names, audiences and expressions stay on
the rules page, because this is for "that limit is wrong".

It sat in the feature panel first there, which put a limit applying to a hundred
features beside one feature's verdict. It should not go there again.

~950 LOC.

## 5. Sequencing

PRs 1–3 are logic and land in order. PR 4 needs 3. PRs 5 and 6 need 4 only for
the colours to agree. PRs 7–9 are the editor and need 6.

The honest stopping points, if this has to stop:

- **After PR 4** the part is coloured by difficulty and nothing explains it.
  Useful, and honest only because the colours are named bands.
- **After PR 6** the judgement is complete and read-only: a shop can see what
  the rules make of a part and follow every number back to a datasheet field,
  but cannot disagree with one.
- **After PR 9** a shop can disagree, which is the point of rules.

## 6. Risks and the things I expect to get wrong

1. **Sparse datasheets.** The picker's own docs call this out: the Engine says
   nothing about most fields for most types, and a rule that scores silence as
   `easy` puts the whole part in green. PR 2's silence handling is the guard,
   and PR 5 is what makes a silent rule visible. Both are load-bearing.
2. **`measurements.ts` drifting during the rewrite.** The existing rows and
   their `from` provenance strings are pinned by tests; those tests stay
   untouched through PR 1, which is what makes the swap safe.
3. **Numbers that are opinions.** The 15 thresholds encode a shop's judgement.
   Porting them verbatim is right; _adjusting_ one because it looks odd on a
   fixture is not, and I will not.
4. **`no go` is not a score.** "This part scores 0.72" and "one feature cannot be
   cut at all" are different things to know, and folding the second into the
   first is the easy mistake.
5. **I cannot see this app.** The same constraint as everything else here: the
   logic is tested in node, and the colouring needs your eyes on a real part.

## 6a. What directions will change here

Once confirmed machining directions exist, they feed this page rather than sit
beside it: the lists are filled from the work each confirmed direction actually
holds, and the colouring follows from that rather than from every reading the
Engine offered.

The difference matters for the score. A part scored over every reading is scored
over readings nobody chose — the same face counted as an awkward wall from one
way up _and_ an easy face from another. Once a plan exists, the summary covers
the work that plan runs, and the caveat on the card says which it is.

## 7. What comes after, sized

- **Direction scores** (~110 LOC): "the easiest way up to open on", which wants
  setups to be worth anything.
- **Machine envelope**: the part's bounding box and a machine on the rule set,
  which is what `partOverMachine` and the shipped `part-size` rule need.
- **Rule sets are per browser.** A shop cannot share, publish or inherit a set —
  a set is copied, and then it drifts. The picker's own docs list this first
  among the things a team will ask for.
- **No provenance on a number.** Nothing records who set 5:1 or why, which is
  the most-requested thing when a shop disagrees with a score.

## 8. Bumping the shipped version

When a shipped rule's numbers change, `SHIPPED_VERSION` goes up with it — or
every existing session keeps its stale copy and the fix looks like it never
landed. Worth stating because it is invisible in review and obvious only once.
