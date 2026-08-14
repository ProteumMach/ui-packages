# Building the Directions page in `apps/part-viewer`

**Goal:** hold the part a way up, say what gets cut from there, and know what is
left — the page a part opens on in the feature picker, rebuilt here in stages
where every stage is a usable app.

The behaviour this app has today is written down in
[`apps/part-viewer/docs/interactions.md`](../apps/part-viewer/docs/interactions.md)
and [`highlighting.md`](../apps/part-viewer/docs/highlighting.md) — read those
to know what is already here, including the five places it knowingly differs
from the picker.

Ported from `tp-ui@pc-feature-picker`, whose
`apps/feature-picker/docs/build/directions.md` is the written spec for this
page: the layout, the thirteen pieces of state, what a click on the part means
in resolution order, and the stage ladder these PRs follow. Read that first;
this document is only how it gets built here, in what order, and at what size.

Status: **not started.** This document is the proposal.

Sits after `viewer-parity-plan.md` (Phases A and B landed, so the viewer is
ready) and beside `rules-plan.md` (which the Difficulty half of this page wants,
and PR 6 is the only place that dependency binds).

---

## 1. What is already here

More than the parity plan assumed, because the app followed each viewer PR
instead of waiting for a cut-over. None of it needs rewriting for this page.

| Piece                          | Where                                  | What it already does                                                  |
| ------------------------------ | -------------------------------------- | --------------------------------------------------------------------- |
| Picking, cycling, multi-select | `app/shared/selection.ts`, `picks.ts`  | Click → owners, ⌘-click intersects, repeated clicks walk the readings |
| Paint modes                    | `app/shared/paint.ts`                  | Plain / Directions / Difficulty, persisted                            |
| Direction arrows               | `app/shared/arrows.ts`                 | All / off, plus the one-arrow-while-selected rule                     |
| Escape, list keys              | `app/shared/escape.ts`, `list-keys.ts` | Clearing, and arrowing a list                                         |
| Bands and rules                | `app/shared/rules.ts`, `bands.ts`      | A band per feature — the input the generators score with              |
| The page frame                 | `app/components/part-inspector.tsx`    | Tabs (Inspector · **Directions** · Rules), panels, the viewport       |
| The viewer                     | `packages/viewer`                      | Region painting, region highlights, arrows, picking, section          |

**The Directions tab exists and is a placeholder** — it prints the focused
feature's machining axis. That tab is the seam every PR below lands in, so the
app has a working Directions page from PR 2 onward and never a broken one.

## 2. What has to come across

`tp-ui` line counts, which are the honest measure of what is being taken on.

| There                                                          | LOC   | Ports how                                                                     |
| -------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------- |
| `setups/setups.ts`                                             | 410   | **Verbatim.** The model, coverage, claiming, `cutOnce`. No React, no three    |
| `setups/directions.ts`                                         | 237   | Verbatim — labels, matching a vector to a candidate                           |
| `setups/leftovers.ts`                                          | 102   | Verbatim                                                                      |
| `setups/saved-plans.ts`                                        | 232   | Verbatim, minus the storage key                                               |
| `setups/generate.ts`                                           | 1,264 | The big one. Generators, `coverFaces`, `inferable`. Splits across PRs 7 and 9 |
| `setups/recognize.ts`                                          | 138   | Verbatim, and only if PR 10 is wanted                                         |
| `rules/direction-scores.ts`                                    | 109   | Verbatim — wants bands, so it follows the rules port                          |
| `components/setups-panel.tsx`                                  | 885   | Rewritten to our components; the behaviour is the spec, not the markup        |
| `components/face-candidates.tsx`                               | 782   | Rewritten. Half of it is the By-direction mode, which is PR 7                 |
| `components/proposal-panel.tsx`                                | 232   | Rewritten, PR 9                                                               |
| `components/generate-directions.tsx`                           | 149   | Rewritten, PR 7                                                               |
| `components/new-direction.tsx`                                 | 245   | Rewritten, PR 10                                                              |
| Tests: `setups`, `directions`, `leftovers`, `direction-scores` | 1,421 | **Port unchanged.** They test pure functions                                  |
| Tests: `setups-panel`, `face-candidates`, `new-direction`      | 756   | Rewritten against our components                                              |

Roughly 3,000 LOC of pure logic that ports as-is, and roughly 2,300 LOC of panel
that gets re-expressed. The pure half is where the correctness lives; the panel
half is where the taste lives.

**Conventions for every PR here**, same as the parity plan: this repo's style
(no semicolons, single quotes, `.js` import specifiers), bring the corresponding
`tp-ui` test across, keep `pnpm check-types` / `test` / `build` green, and leave
the app working.

---

## 3. The PRs

Eleven, grouped into four blocks. Sizes are src-diff LOC excluding tests. Each
one says what a person can do that they could not do before it — a PR that
cannot answer that is a PR that should be folded into its neighbour.

### Block 1 — a plan exists (PRs 1–3)

**PR 1 — the plan model** · `paul/directions-model` · ~450 LOC

Port `setups.ts` and `directions.ts` whole: `Setup`, `SetupPlan`, `Assignment`,
`assign`, `setPass`, `cutOnce`, `claimedRegions`, `cutsFrom`, `coverageOf`.
Nothing renders it yet. Port `tests/setups.test.ts` (1,117 lines) and
`tests/directions.test.ts` unchanged — they are pure and they are the reason the
rest of this plan can move quickly. _Reviewer's eye on:_ `cutsFrom` rather than
`assigned[tag]?.[pass] === setupId`. On an empty plan the naive comparison is
`undefined === undefined`, which reads as "every feature is already cut this
way" and breaks two different things at once.

**PR 2 — the direction list, and assigning by hand** · `paul/directions-panel` ·
~400 LOC

The Directions tab stops being a placeholder. A reading in the feature list gets
R / F / Both; the tab lists the directions and what each one holds; a direction
can be opened, renamed and removed. Plan state lives in `part-inspector.tsx`
beside `selection`, persisted per part (§4, decision 2). **After this PR the
page does its job** — everything later is speed, or scale, or argument.

**PR 3 — the part painted by direction** · `paul/directions-paint` · ~150 LOC

Wire `paintMode === 'directions'` to the plan rather than to each feature's own
machining direction, add the Rough / Finish toggle beside the paint controls,
and give each direction row its colour swatch. One colour in three places — the
part, the arrow, the row — is the whole point of the palette. _Small, and the
first PR where the page looks like the picker's._

### Block 2 — knowing where you are (PRs 4–6)

Independent of each other; any order, or in parallel.

**PR 4 — coverage** · `paul/directions-coverage` · ~250 LOC

`coverageOf` on screen: a bar per pass, by **surface area, de-duplicated**.
Forty tiny fillets mapped and the face they sit on missed is nearly nothing
mapped, and only an area says so — a count of features would report the same
plan as most of the way done.

**PR 5 — not cut yet** · `paul/directions-leftovers` · ~250 LOC

Port `leftovers.ts` and list what is uncovered, one row per patch, each with the
ways up that would reach it. Clicking a row selects the patch on the part. This
is the panel that turns "63% mapped" into a next move.

**PR 6 — how each direction fared** · `paul/directions-scores` · ~150 LOC

Port `direction-scores.ts` and put a band and a score on each direction row.
**Depends on the rules port** (`rules-plan.md`); if rules are not in yet, this
PR is the one to drop — everything else here is indifferent to difficulty.

### Block 3 — the left-to-right workflow (PRs 7–9)

**PR 7 — painting the part by direction** · `paul/directions-painting` · ~450
LOC

The mode switch in Map features (By face / By direction), holding a way up by
pressing its arrow, painting faces by clicking them, the held-direction flag
over the viewport, and the per-direction offers list — "which way up cuts this
group" — with group assignment. Needs `coverFaces` out of `generate.ts`, which
is the half of that file this PR takes. _The behaviours that are easy to miss,
all of them from_ `build/directions.md` §4d and §7: no modifier in this mode; a
click on a painted face takes it off; the faces-painted count appears at two;
painted faces are **outlined**; and the offers list takes the keyboard
**quietly** — it focuses a row without selecting it, and the assign keys fall
back to the row under the keyboard. Skip that last one and the list answers to
the arrows but not to R.

**PR 8 — generators and saved plans** · `paul/directions-generate` · ~400 LOC

The rest of `generate.ts`'s six generators, plus `saved-plans.ts` for named
snapshots. A whole arrangement from one press, and a second one to argue with.
_The rule that decides whether a generator is any good:_ choose a new direction
by the score-weighted **area** it would cover, never by its single best reading
— otherwise the plan buys a re-fixture for one good fillet.

**PR 9 — inference and the standing offer** · `paul/directions-inference` · ~500
LOC

`inferable` and the second-hearing loop, the offer painted per face in violet,
pruning by clicking a face off, re-covering what remains, the green "this one"
inside the offer, and accepting by pressing a pass. The single hardest gesture
in the app and the one with its own spec page (`docs/inference.md` there). **The
most droppable large PR in this plan** — everything else works without it.

### Block 4 — the edges (PRs 10–11)

**PR 10 — a way up the Engine never reported** · `paul/directions-naming` · ~350
LOC

Name a direction by clicking the face that points that way — the face's **own
normal**, not the feature that owns it — and get back the faces and walls
`recognize.ts` can work out, badged as ours rather than the Engine's. Droppable,
and honest about its limit: full recognition is an Engine ask.

**PR 11 — the page in one piece** · `paul/directions-polish` · ~200 LOC

The layout the picker arrived at: left column what a plan is _made of_, right
column what is being _worked on_, the part between them, and the right column
split with the datasheet below. Plus the state flags over the viewport and the
click-folds-the-direction-list rule. Mostly moving what exists, and worth doing
last rather than guessing at it in PR 2.

---

## 4. Decisions to make before PR 1

1. **Does this app want a planning page at all?** The parity plan's open
   question 1, still open. The part viewer is a report-inspection app; a plan is
   a decision record. If the answer is "not really", stop this plan at PR 3 —
   direction colours, arrows and a list of what is cut where is most of the
   value at a fifth of the work.
2. **Where the plan lives.** The picker writes it to `localStorage` per part,
   continuously, with no Save button — a plan is built by dozens of small
   decisions and the one somebody forgets to press is the one that loses the
   afternoon. This app has a server. Recommend matching the picker for PRs 1–9
   (same shape, `part-viewer.plan.<partId>`) and treating "plans on the server,
   shared between people" as its own plan afterwards, because it is an API
   question, not a page question.
3. **Rough and finish, or one pass?** Collapsing to one removes a whole axis of
   state and roughly a fifth of this plan. It is a **one-way door**: every
   invariant in the spec is written per pass, and splitting them later means
   revisiting all of them. Recommend keeping the split.
4. **Tab or route?** The page is deep enough to deserve a URL —
   `?tab=directions` at least, so a plan can be linked to. Cheap in PR 2,
   awkward in PR 11.

## 5. Sequencing

- **PRs 1–3 are the spine** and are strictly serial. Everything after them is
  optional in the sense that the page works without it.
- **PRs 4, 5 and 6 are parallel** and touch nothing each other touches.
- **PR 7 is the one to spend review time on.** It is where the page stops being
  a list with a picture beside it, and it carries five behaviours that read as
  polish and are actually the interaction.
- **PRs 8, 9, 10 are each droppable whole.** If scope shrinks, drop 9 first
  (biggest), then 10, then 8.
- Stop points that leave a coherent app: after PR 3, after PR 7, after PR 11.

## 6. What will bite

From the picker's own trap list — these are mistakes already made once, and a
rewrite is where they come back.

- **Assigning everything a direction can reach**, which machines every wall from
  four ways up. `claimedRegions` is the guard, and cut-once is the invariant
  users will not report as a bug — they will just stop trusting the estimate.
- **Two `setState` calls from one plan.** "Both" fires two updates computed from
  the same snapshot and only one lands. Pass a _list_ of passes, apply once.
- **Offers built largest-first.** A profile covering eight faces can only be
  taken or left. Build smallest-first, then a second pass for the faces the
  small readings blocked, or work goes missing.
- **The app's guess looking like a decision.** A focus the app chose after a
  face click paints nothing. Our `selection.ts` already keeps "what was clicked"
  and "what is being read" apart, which is most of the fix.
- **A filter set from the part and cleared only from another view.** Whatever
  scopes a click has to carry a flag with a Clear on it, over the viewport.
- **Focus that selects, in a mode where the hand is on the part** — PR 7's quiet
  focus. It reads as a keyboard bug and is a highlighting bug.

## 7. Open questions

1. **Is Difficulty a requirement here, or a nice-to-have?** PR 6 is the only
   hard dependency on the rules port, but the _generators_ (PR 8) score readings
   by band, and without one they fall back to geometry alone — which is a
   different and worse product. Worth deciding before PR 8 rather than during.
2. **Does the offer (PR 9) belong in an inspection app at all?** It is the app
   proposing work, which is a stronger claim than anything else this app makes.
3. **Whose plan is it?** Once plans are on the server, two people editing one
   part need an answer — last write wins, per-person plans, or a lock. Not a
   blocker for any PR here, and a blocker for the one after.
