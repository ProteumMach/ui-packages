---
'@toolpath/tool-support': minor
---

Take ownership of the stickout, the holding rules and the tool-to-feature fit.

**The stickout is the reason this package exists.** How far a tool stands out of
its holder was worked out in four unconnected places and they disagreed by a
factor of two on an ordinary tool: a details table printed one number and the
drawing beside it drew another, so the dimension line ran past the holder nose
into the holder body. `stickoutRange` owns the quantity, and every other number
is that same call with more arguments — `setupStickout` is `geometry.LBH`,
`stickoutCeiling` is the ceiling a reach check asks for, and `min ≤ setup ≤ max`
holds by construction.

- `stickoutRange`, `minStickout`, `setupStickout`, `stickoutCeiling`, and
  `StickoutRange`, `StickoutRequest`, `StickoutPolicy`, `StickoutLimit`,
  `StickoutTool`, `HELD_SHARE`, `DEFAULT_STICKOUT_POLICY`. The three caps — a
  shop's clamping length, the hold share, and a collet's published grip — are
  compared in one place and the tightest wins and says its name. They used to be
  a ceiling each in a different file.
- `clampWanted`, `clampShortfall`, `heldDiameter`, `headLength`, `ClampingRule`
  and `DEFAULT_CLAMPING`. Reads the manufacturer's own `LSCN` first and falls
  back to a multiple of the **shank** diameter, which is what the holder grips.
- `colletFitsHolder`, `gripsShank`, `holderTakesTool`, `maxStickout`,
  `holdBand`, `stickoutLimits`, `defaultStickout`, `gripRanges`,
  `gripsAnyShank`, `canHold`, and `Clamping`, `GripRanges`, `HoldBand`.
- `fitAgainst`, `fitTools`, `DRILLING_FORMS`, `FitFailure` and `ToolFit`.

`Holder` gains `clamping`, `boreDiameter` and `taper`, all **optional**: a
consumer that hands over nine numbers to get a drawing must not have to invent a
clamping mode. Absent means nobody has said, and nobody-has-said refuses — a
holder that does not state how it clamps takes no tool, offers no grip range and
matches no taper.

Two rules point opposite ways on purpose. `holderTakesTool` refuses a tool whose
shank nobody stated, because the unchecked case is a cutter falling out of a
spindle. `fitAgainst` passes a demand nobody stated, because what is not stated
is not claimed.

One deliberate refinement: which tools are bounded by a hole's bore rather than
by what can helix down it is now stated over `ToolForm` as `DRILLING_FORMS`. The
coarse vocabulary it replaces had one word, `drill`, for a drill, a centre drill
and a spot drill, so a stated spot drill could not be recognised as going in
bore-first. All four forms are in the set.
