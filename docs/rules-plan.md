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
| `rules/expression.ts`       | 329 LOC           | **Not in this plan** — see §3                                    |
| `rules/direction-scores.ts` | 109 LOC           | **Not in this plan** — see §3                                    |
| Rules page + editor         | ~2,500 LOC of TSX | **Not in this plan** — see §3                                    |

The engine half is the part worth having and the part that ports cleanly. It is
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
  `metrics.ts` head-on. **Decision: `metrics.ts` becomes the one reader, and
  `measurements.ts` is rewritten on top of it** (PR 1). Two modules reading
  `facts.cd.ignore.min` and disagreeing by a factor of two is exactly the bug
  this avoids, and the picker's own note about a card reading 8.28 mm beside
  0.326 in is the same lesson.
- **`app/shared/units.ts`** already converts and rounds. `band-display.ts`'s
  formatting half collapses into it.
- **`paintWash` / `PaintMode`** already paints the part per feature from a
  colour table. Difficulty is a third mode, not a new mechanism.
- **The selection blue.** Already moved off orange for exactly this: the bands
  are a warm ramp and a selection cannot sit over them in orange.

## 3. What this plan deliberately leaves out

- **The rules editor and the Rules page** (~2,500 LOC). Live-editing thresholds
  is the thing that makes rules arguable, and it is also most of the work. The
  shipped set is a real answer on its own, and a set nobody can edit is still a
  set that colours the part. Editing is a follow-on, and §7 sizes it.
- **Custom expressions** (`expression.ts`). Nothing in the shipped set uses one:
  of 15 rules, 9 are thresholds, 4 are matches, 1 is a flag and 1 a baseline,
  and the only `against:` is the number `0`. Expressions exist for rules a shop
  writes, which is the editor, which is out.
- **The range shape.** No shipped rule uses it. The type comes across with the
  others so a stored set from the picker still parses, but nothing constructs
  one until the editor does.
- **Direction scores** (§5 of the spec). "Which way up scored best" is a setups
  question, and this app has no setups yet.
- **Machine envelope rules** (`partOverMachine`, `part-size`). They need the
  part's bounding box and a machine on the rule set; both are reachable, neither
  is on the critical path. The metrics come across and simply read `null`.

## 4. PR breakdown

Each is independently reviewable and independently landable. The first three are
pure logic with no UI; nothing is visible until PR 4.

### PR 1 — the measurements a rule can read

`app/shared/metrics.ts` — `MetricId`, `METRICS`, `readMetrics`, `partContext`,
and the `Reading` provenance each metric carries.

Ported name for name: a rule set written against the picker mentions
`millingLD` and `requiredCutter`, and renaming those orphans every rule that
does. Then `measurements.ts` is rewritten to read from it, keeping its current
rows and their `from` strings identical — the existing tests are the check that
it did.

~1,500 LOC, mostly declarative. Tests: every metric against a datasheet fixture,
plus the `angleRad` → `angleDeg` kernel change, where reading the wrong one is
an error of 57×.

### PR 2 — the rule shapes, and what they make of a feature

`app/shared/rules.ts` — `Band`, `worstBand`, the four shapes in the shipped set
(threshold, match, flag, baseline) plus `range` as a type only, `evaluateRule`,
`evaluateFeature`, `scoreFeature`, `scorePart`, and the four silences.

The scoring subtleties are the tests, and they are the reason this is its own
PR: a band is the worst rule's band, but a score interpolates _within_ a band,
so an L/D of 3.7 scores below 3.2 though both are `easy`; the part's score is
weighted by rule rather than by feature; hard limits are reported beside the
score rather than folded into it; and **a rule that did not apply is never
scored as easy** — with a sparse datasheet that single rule is the difference
between a real score and a part that reads `easy` throughout.

~700 LOC. Tests are the bulk of the work and the point of it.

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

## 5. Sequencing

PRs 1–3 are logic and can land in any order after 1. PR 4 needs 3. PRs 5 and 6
need 4 only for the colours to agree. The natural stopping points:

- **After PR 4** the part is coloured by difficulty and nothing explains it.
  Useful, and honest only because the colours are named bands.
- **After PR 6** the feature is complete as a _read-only_ judgement, which is
  the whole of this plan.

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

## 7. What comes after, sized

- **Live rule editing** (~2,500 LOC): the rules page, the impact list, and
  editing a limit against the features it bit on, re-judging on every keystroke.
  This is what turns "the app says rats" into an argument a shop can win.
- **Expressions** (~330 LOC): needed the moment somebody writes their own rule.
- **Direction scores** (~110 LOC): "the easiest way up to open on", which wants
  setups to be worth anything.
- **Machine envelope**: the part's bounding box and a machine on the rule set.
