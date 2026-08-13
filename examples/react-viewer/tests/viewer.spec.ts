import { expect, test } from '@playwright/test'

test('selects a feature and responds to CAD camera navigation', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await page.waitForTimeout(700)

  // The section, while the camera is still at its opening pose: the handle
  // stands on the cap over the part's centre, which is also where an orbit
  // starts, so it is a mode rather than something always on.
  await page.getByRole('button', { name: 'Section' }).click()
  await page.waitForTimeout(700)
  const cut = page.locator('p', { hasText: 'Cut:' })
  const beforeCut = await cut.textContent()
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Viewer canvas has no bounding box')
  // The arrow stands proud of the cap, so it sits a little above the part's
  // centre on screen — and end-on it is only about a dozen pixels across, so
  // these are exact canvas coordinates for the default 1280x720 viewport
  // rather than an approximation of "the middle".
  await page.mouse.move(box.x + 436, box.y + 298)
  await page.mouse.down()
  await page.mouse.move(box.x + 436, box.y + 378, { steps: 15 })
  await page.mouse.up()
  await expect.poll(async () => await cut.textContent()).not.toBe(beforeCut)
  await page.getByRole('button', { name: 'Section' }).click()
  await expect(cut).toContainText('off')

  await canvas.hover({ position: { x: 400, y: 300 } })
  await expect(page.getByText('Hovered:', { exact: false })).not.toContainText('none')

  await canvas.click({ position: { x: 400, y: 300 } })
  await expect(page.getByText('Selected:', { exact: false })).not.toContainText('none')

  // An arrow says "show me only this way up", and pressing it again lets that
  // go. The arrows sit outside the part, so this reaches past its corner.
  const direction = page.locator('p', { hasText: 'Direction:' })
  await expect(direction).toContainText('all')
  await page.mouse.click(box.x + box.width / 2 - 150, box.y + box.height / 2 - 150)
  await expect(direction).not.toContainText('all')
  await page.mouse.click(box.x + box.width / 2 - 150, box.y + box.height / 2 - 150)
  await expect(direction).toContainText('all')

  const beforeOrbit = await canvas.screenshot()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 60)
  await page.mouse.up()
  await expect.poll(async () => Buffer.compare(beforeOrbit, await canvas.screenshot())).not.toBe(0)

  const afterOrbit = await canvas.screenshot()
  await page.getByRole('button', { name: 'Top view' }).click()
  await expect.poll(async () => Buffer.compare(afterOrbit, await canvas.screenshot())).not.toBe(0)

  // The orientation cube sits in the top-right corner and drives the camera
  // through the same path the buttons do. Clicking its centre from the top view
  // hits the TOP panel; clicking below its centre hits a chamfer, which is an
  // edge view and must move the camera.
  const cube = { x: box.width - 80, y: 80 }
  const beforeCube = await canvas.screenshot()
  const selected = await page.getByText('Selected:', { exact: false }).textContent()
  await canvas.click({ position: { x: cube.x, y: cube.y + 34 } })
  await expect.poll(async () => Buffer.compare(beforeCube, await canvas.screenshot())).not.toBe(0)
  // Moving the camera is not picking a feature: if this click had fallen
  // through to the part, the selection would have changed with it.
  await expect(page.getByText('Selected:', { exact: false })).toHaveText(selected ?? '')
})
