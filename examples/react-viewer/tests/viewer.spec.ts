import { expect, test } from '@playwright/test'

test('selects a feature and responds to CAD camera navigation', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  await canvas.hover({ position: { x: 400, y: 300 } })
  await expect(page.getByText('Hovered:', { exact: false })).not.toContainText('none')

  await canvas.click({ position: { x: 400, y: 300 } })
  await expect(page.getByText('Selected:', { exact: false })).not.toContainText('none')

  const beforeOrbit = await canvas.screenshot()
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Viewer canvas has no bounding box')
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
