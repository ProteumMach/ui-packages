import type { components } from '@toolpath/api'

export type PartFeature = components['schemas']['PartFeature']

export interface FeatureSummary {
  tag: string
  type: string
  direction: string
  regionCount: number
  headline?: string
}

export interface DetailRow {
  label: string
  value: string
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const labelForType = (value: string): string =>
  value
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const directionLabel = ({ x, y, z }: components['schemas']['Vec3']): string => {
  const values: Array<[string, number]> = [
    ['X', x],
    ['Y', y],
    ['Z', z],
  ]
  const nonZero = values.filter(([, value]) => Math.abs(value) > 0.000001)
  if (nonZero.length === 1 && Math.abs(Math.abs(nonZero[0][1]) - 1) < 0.000001) {
    return `${nonZero[0][1] > 0 ? '+' : '−'}${nonZero[0][0]}`
  }
  return `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`
}

const millimeters = (value: number): string => `${value.toFixed(value < 10 ? 2 : 1)} mm`

const facts = (feature: PartFeature): Record<string, unknown> => {
  const sheet = asRecord(feature.datasheet)
  return asRecord(sheet?.facts) ?? {}
}

export const featureHeadline = (feature: PartFeature): string | undefined => {
  const featureFacts = facts(feature)
  const diameter = asNumber(featureFacts.diameter)
  if (diameter !== null) return `⌀ ${millimeters(diameter)}`
  const radius = asNumber(featureFacts.filletRadius)
  if (radius !== null) return `R ${millimeters(radius)}`
  const sheet = asRecord(feature.datasheet)
  const minimum = asNumber(sheet?.zMin ?? sheet?.minDepth)
  const maximum = asNumber(sheet?.zMax ?? sheet?.maxDepth)
  if (minimum !== null && maximum !== null && Math.abs(maximum - minimum) > 0.005) {
    return `Depth ${millimeters(maximum - minimum)}`
  }
  return undefined
}

export const featureSummary = (feature: PartFeature): FeatureSummary => ({
  tag: feature.featureTag,
  type: labelForType(feature.featureType),
  direction: directionLabel(feature.machiningDirection),
  regionCount: feature.regionIdxs.length,
  headline: featureHeadline(feature),
})

export const filterFeatures = (features: readonly PartFeature[], query: string): PartFeature[] => {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return [...features]
  return features.filter((feature) => {
    const summary = featureSummary(feature)
    return [summary.type, summary.direction, summary.tag, summary.headline]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLocaleLowerCase().includes(normalized))
  })
}

export const featureDetailRows = (feature: PartFeature): DetailRow[] => {
  const sheet = asRecord(feature.datasheet)
  const featureFacts = facts(feature)
  const rows: DetailRow[] = [
    { label: 'Feature tag', value: feature.featureTag },
    { label: 'Machining direction', value: directionLabel(feature.machiningDirection) },
    { label: 'Mesh regions', value: String(feature.regionIdxs.length) },
  ]
  const measurements: Array<[string, unknown, (value: number) => string]> = [
    ['Diameter', featureFacts.diameter, millimeters],
    ['Maximum depth', sheet?.maxDepth ?? sheet?.zMax, millimeters],
    ['Minimum depth', sheet?.minDepth ?? sheet?.zMin, millimeters],
    ['Fillet radius', featureFacts.filletRadius, (value) => `R ${millimeters(value)}`],
    ['Tool diameter', asRecord(featureFacts.toolFit)?.toolDiameter, millimeters],
  ]
  for (const [label, raw, format] of measurements) {
    const value = asNumber(raw)
    if (value !== null) rows.push({ label, value: format(value) })
  }
  return rows
}

export const rawDatasheet = (feature: PartFeature): string =>
  JSON.stringify(feature.datasheet ?? {}, null, 2)

export const featureFromTags = (
  features: readonly PartFeature[],
  tags: readonly string[],
): PartFeature[] => {
  const wanted = new Set(tags)
  return features.filter((feature) => wanted.has(feature.featureTag))
}
