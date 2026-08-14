import { bandCss } from '../shared/bands'
import type { FeatureScore } from '../shared/feature-score'
import { bandName } from '../shared/rules'

/**
 * How hard a feature is, small enough to sit at the end of any row.
 *
 * A ring in the band's colour with the score inside it. Two things in the space
 * of one, because they answer different questions: the colour says how hard the
 * worst rule found it, the number says how it did across everything that looked
 * at it — so a wall that failed one rule of six reads differently from one that
 * failed all six, which a coloured dot alone cannot say.
 *
 * The feature picker painted the part by band and left the score on the detail
 * panel, so the ranking a shop actually sorts by was one click away from every
 * list. This is that number, everywhere a feature is named.
 *
 * A feature no rule reached shows nothing at all. An empty ring would be a
 * verdict, and "nobody looked" is not one.
 */
export const ScoreBadge = ({ score }: { score: FeatureScore | undefined }) => {
  if (!score || score.band === null || score.score === null) return null

  const colour = bandCss(score.band)

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-px text-3xs font-semibold tabular-nums"
      style={{ background: `${colour}22`, color: colour }}
      title={`${bandName(score.band)} — scores ${score.score} across the rules that applied`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: colour }} />
      {score.score}
    </span>
  )
}
