import { type Page, expect, test } from '@playwright/test'

const readyEvent = {
  status: 'ready',
  report: {
    partId: 'part-1',
    reportId: 'report-1',
    jobId: 'job-1',
    kernelVersion: 'test',
    units: { length: 'mm', angle: 'rad' },
    regions: [],
    candidateDirections: [],
    meshPointCount: 0,
    meshTriangleCount: 0,
    hasMeshGlb: false,
    hasMeshStl: false,
    hasThumbnail: false,
    downloadMs: 1,
    analysisMs: 2,
    totalMs: 3,
    features: [
      {
        featureTag: 'hole-1',
        featureType: 'blind_hole',
        regionIdxs: [0],
        machiningDirection: { x: 0, y: 0, z: 1 },
        axis: { x: 0, y: 0, z: 1 },
        // A datasheet with enough on it for a rule to have an opinion: 25.4 deep
        // in a 6.35 bore is 4:1, which the shipped set calls `alright`.
        datasheet: {
          facts: { kind: 'Hole', diameter: 6.35 },
          zMax: 0,
          zMin: -25.4,
          partZMax: 0,
        },
      },
    ],
  },
}

/**
 * The viewport has to receive a drag that starts at its own edge.
 *
 * The panel dividers are one pixel wide and carry a wider invisible grab strip,
 * which used to reach five pixels over the canvas along its whole height. A pan
 * begun in that strip reached nothing — the resizer ignores every button but
 * the primary one — so the edges and corners of the viewport were dead, and
 * nothing on screen said why.
 */
/** Connects, uploads and lands on the inspector with a report the server mocked. */
export const openInspector = async (page: Page) => {
  let connected = false
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/session') {
      if (request.method() === 'GET') return route.fulfill({ json: { connected } })
      if (request.method() === 'POST') {
        connected = true
        return route.fulfill({ status: 201, json: { connected: true } })
      }
      connected = false
      return route.fulfill({ status: 204 })
    }
    if (url.pathname === '/api/parts' && request.method() === 'POST')
      return route.fulfill({
        status: 201,
        json: { partId: 'part-1', uploadUrl: 'https://upload.test/source' },
      })
    if (url.pathname === '/api/parts/part-1/analyze' && request.method() === 'POST')
      return route.fulfill({ status: 202, json: { partId: 'part-1', jobId: 'job-1' } })
    if (url.pathname === '/api/parts/part-1/events')
      return route.fulfill({
        contentType: 'text/event-stream',
        body: `event: analysis\ndata: ${JSON.stringify(readyEvent)}\n\n`,
      })
    return route.fallback()
  })
  await page.route('https://upload.test/source', (route) => route.fulfill({ status: 200 }))

  await page.goto('/')
  await page.getByLabel('Toolpath Engine API key').fill('tp_key')
  await page.getByRole('button', { name: 'Connect' }).click()
  await page.getByLabel('CAD file').setInputFiles({
    name: 'fixture.step',
    mimeType: 'model/step',
    buffer: Buffer.from('STEP fixture'),
  })
  const analyze = page.getByRole('button', { name: 'Analyze part' })
  await expect(analyze).toBeEnabled()
  await analyze.click()
  await expect(page).toHaveURL(/\/parts\/part-1/)
  await expect(page.getByRole('button', { name: 'Section' })).toBeVisible()
}

test('takes a pointer at its own edges and corners', async ({ page }) => {
  await openInspector(page)

  // Whatever the browser would hand a pointerdown to, at each edge and corner
  // of the viewer panel. Three pixels in: closer than anybody aims, and inside
  // the old dead strip.
  const owners = await page.evaluate(() => {
    const viewer = document.querySelector('section.relative')
    if (!viewer) throw new Error('no viewer section')
    const box = viewer.getBoundingClientRect()
    const inset = 3
    const spots: Record<string, [number, number]> = {
      'top-left': [inset, inset],
      'top-right': [box.width - inset, inset],
      'bottom-left': [inset, box.height - inset],
      'bottom-right': [box.width - inset, box.height - inset],
      'left-edge': [inset, box.height / 2],
      'right-edge': [box.width - inset, box.height / 2],
      'bottom-edge': [box.width / 2, box.height - inset],
    }
    const result: Record<string, boolean> = {}
    for (const [name, [dx, dy]] of Object.entries(spots)) {
      const at = document.elementFromPoint(box.x + dx, box.y + dy)
      result[name] = at !== null && viewer.contains(at)
    }
    return result
  })

  expect(Object.entries(owners).filter(([, mine]) => !mine)).toEqual([])
})

/**
 * The first thing the rules put on screen.
 *
 * The engine underneath it is tested in node; what this covers is that the
 * mode is reachable, that it holds, and that it is remembered — a preference
 * that resets on every part is a chore rather than a preference.
 */
test('paints the part by difficulty, and remembers that it was asked to', async ({ page }) => {
  await openInspector(page)

  const difficulty = page.getByRole('button', { name: 'Difficulty' })
  await expect(difficulty).toHaveAttribute('aria-pressed', 'false')

  await difficulty.click()
  await expect(difficulty).toHaveAttribute('aria-pressed', 'true')

  await page.reload()
  await expect(page.getByRole('button', { name: 'Difficulty' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

/**
 * The colours on the part are a verdict, and a verdict from nowhere is one
 * nobody can argue with. Both halves of saying where it came from: the limits
 * in force, and what they made of the feature being read.
 */
test('shows the limits it judges by, and what they made of a feature', async ({ page }) => {
  await openInspector(page)

  await page.getByRole('tab', { name: 'Rules' }).click()
  await expect(page.getByRole('heading', { name: 'Toolpath defaults' })).toBeVisible()
  await expect(page.getByText('Drilling L/D ratio')).toBeVisible()
  // The bands a measurement is judged against, in the same words the part uses.
  await expect(page.getByText('0.00:1 – 3.00:1').first()).toBeVisible()

  await page.getByRole('tab', { name: 'Inspector' }).click()
  await page.getByRole('button', { name: /Blind hole/ }).click()
  await page
    .getByRole('button', { name: /hole-1/ })
    .first()
    .click()

  await expect(page.getByRole('heading', { name: 'Difficulty' })).toBeVisible()

  // The working, a hover away: the arithmetic, the datasheet fields behind it,
  // and the limits with the band it landed in. A verdict saying "L/D is 4"
  // cannot be checked; one that names its fields can be argued with.
  await page.getByRole('button', { name: /How Drilling L\/D ratio is worked out/ }).hover()

  // The arithmetic, then the fields it read and what each held. A ratio's
  // inputs are lengths, so they carry no ":1" — that would be a unit the
  // Engine never reported.
  await expect(page.getByText('partZMax − zMin ÷ facts.diameter')).toBeVisible()
  await expect(page.getByText('6.35 mm', { exact: true }).last()).toBeVisible()
  await expect(page.getByText('8.00:1 – ∞')).toBeVisible()
  // A rule that agreed and a rule that never ran read identically on a feature
  // that scored well, so the silent ones are counted rather than dropped.
  await expect(page.getByText(/rules? said nothing/)).toBeVisible()
})
