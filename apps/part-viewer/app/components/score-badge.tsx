import { GaugeIcon } from '@phosphor-icons/react'
import { bandCss } from '../shared/bands'
import type { FeatureScore } from '../shared/feature-score'
import { bandName } from '../shared/rules'

/**
 * How hard a feature is, small enough to sit at the end of any row.
 *
 * A gauge in the band's colour with the score beside it. Two things in the
 * space of one, because they answer different questions: the colour says how
 * hard the worst rule found it, the number says how it did across everything
 * that looked at it — so a wall that failed one rule of six reads differently
 * from one that failed all six, which a coloured dot alone cannot say.
 *
 * Quiet on purpose. It sits at the end of every row in the app, and something
 * that small and that repeated has to be readable when looked at and invisible
 * when not — a filled pill at the end of two hundred rows is a column of
 * badges rather than a list of features.
 *
 * The feature picker painted the part by band and left the score on the detail
 * panel, so the ranking a shop actually sorts by was one click away from every
 * list. This is that number, everywhere a feature is named.
 *
 * A feature no rule reached shows nothing at all. An empty gauge would be a
 * verdict, and "nobody looked" is not one.
 */
export const ScoreBadge = ({ score }: { score: FeatureScore | undefined }) => {
  if (!score || score.band === null || score.score === null) return null

  const colour = bandCss(score.band)

  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5 text-3xs tabular-nums opacity-80"
      style={{ color: colour }}
      title={`${bandName(score.band)} — scores ${score.score} across the rules that applied`}
    >
      <GaugeIcon aria-hidden="true" className="size-3" />
      {score.score}
    </span>
  )
}
