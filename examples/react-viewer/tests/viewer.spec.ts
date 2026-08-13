import { expect, test } from '@playwright/test'

test('selects a feature and responds to CAD camera navigation', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  // Measured after the opening frame: before it, the canvas is still at its
  // default 300x150 and every coordinate below would be taken from that.
  await page.waitForTimeout(700)
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Viewer canvas has no bounding box')

  // The section. Driven through its slider rather than by dragging the handle
  // in the viewport: the handle is a dozen pixels across, its position depends
  // on the canvas size, and a drag over software WebGL on CI is slow enough to
  // outlast the timeout. The drag's own maths are unit tested; what this covers
  // is that a cut happens and reports itself.
  const cut = page.locator('p', { hasText: 'Cut:' })
  await page.getByRole('button', { name: 'Section' }).click()
  await expect(cut).toContainText('45%')
  await page.getByRole('slider').fill('0.8')
  await expect(cut).toContainText('80%')
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
  // As a fraction of the canvas rather than in pixels: the arrows are placed
  // against the part's own size, and the canvas is not the same shape on every
  // machine that runs this.
  const arrow = {
    x: box.x + box.width * 0.33,
    y: box.y + box.height * 0.27,
  }
  await page.mouse.click(arrow.x, arrow.y)
  await expect(direction).not.toContainText('all')
  await page.mouse.click(arrow.x, arrow.y)
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
