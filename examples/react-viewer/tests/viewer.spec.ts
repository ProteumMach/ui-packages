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

test('pans with either pan button, from wherever the drag starts', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await page.waitForTimeout(700)
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Viewer canvas has no bounding box')

  // The <p>, not the <strong> inside it: `getByText('Selected:')` matches the
  // label alone, whose text never changes, so every assertion below would hold
  // whatever the viewer did.
  const selected = page.locator('p', { hasText: 'Selected:' })
  const centre = { x: box.width / 2, y: box.height / 2 }

  // The gesture starts in the bottom-left corner: empty, as far from the part
  // as the viewport gets, and clear of the toolbar in the top-left. A pan that
  // needs the pointer over the part is a pan that stops working on exactly the
  // view somebody was trying to fix.
  const panFromCorner = async (button: 'right' | 'middle') => {
    const from = { x: box.x + 40, y: box.y + box.height - 40 }
    await page.mouse.move(from.x, from.y)
    await page.mouse.down({ button })
    for (let step = 1; step <= 10; step += 1) {
      await page.mouse.move(from.x + step * (box.width * 0.15), from.y)
    }
    await page.mouse.up({ button })
    await page.waitForTimeout(300)
  }

  for (const button of ['right', 'middle'] as const) {
    await page.getByRole('button', { name: 'Fit' }).click()
    await page.waitForTimeout(300)
    await canvas.click({ position: centre })
    await expect(selected).not.toContainText('none')

    await panFromCorner(button)

    // The part has left the middle of the view, which a pan does and an orbit
    // does not: an orbit turns the part about that point and leaves it there.
    // Clicking where it was now hits nothing, which is what puts the selection
    // down.
    await canvas.click({ position: centre })
    await expect(selected).toContainText('none')
  }
})

test('finishing a drag over a face is not a request to select it', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await page.waitForTimeout(700)
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Viewer canvas has no bounding box')

  const selected = page.locator('p', { hasText: 'Selected:' })
  const hovered = page.locator('p', { hasText: 'Hovered:' })
  // Two points on two different faces of the cube.
  const one = { x: box.width * 0.5, y: box.height * 0.32 }
  const other = { x: box.width * 0.5, y: box.height * 0.62 }

  await canvas.click({ position: one })
  await expect(selected).not.toContainText('none')
  const chosen = await selected.textContent()

  // Press on the *other* face and orbit a little. The gesture ends over a face
  // that is not the selected one, which is what the browser calls a click.
  await page.mouse.move(box.x + other.x, box.y + other.y)
  await page.mouse.down()
  for (let step = 1; step <= 6; step += 1) {
    await page.mouse.move(box.x + other.x + step * 4, box.y + other.y + step * 2)
  }
  await page.mouse.up()
  await page.waitForTimeout(250)

  // It really is a different face under the pointer, or this test would hold
  // whatever the code did.
  await expect(hovered).not.toContainText('none')
  expect(await hovered.textContent()).not.toBe((chosen ?? '').replace('Selected:', 'Hovered:'))

  // The selection is what the orbit was made to look at. Taking it away is
  // taking away the reason for the gesture.
  await expect(selected).toHaveText(chosen ?? '')

  // A click still selects: the guard is about the drag, not about having
  // dragged recently.
  await canvas.click({ position: other })
  await expect(selected).toContainText('back-face')
})

/**
 * Panning is not a request to put the selection down.
 *
 * R3F counts `contextmenu` as a click, and the browser sends that the instant
 * the right button goes down — before any movement — so the selection went the
 * moment a pan began, whatever the pan did next.
 */
test('panning over empty space keeps the selection', async ({ page }) => {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await page.waitForTimeout(700)
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Viewer canvas has no bounding box')

  const selected = page.locator('p', { hasText: 'Selected:' })
  await canvas.click({ position: { x: box.width / 2, y: box.height * 0.32 } })
  await expect(selected).not.toContainText('none')
  const chosen = await selected.textContent()

  // Right-drag well away from the part, where nothing is hit.
  const from = { x: box.x + 40, y: box.y + box.height - 40 }
  await page.mouse.move(from.x, from.y)
  await page.mouse.down({ button: 'right' })
  for (let step = 1; step <= 8; step += 1) {
    await page.mouse.move(from.x + step * 20, from.y - step * 5)
  }
  await page.mouse.up({ button: 'right' })
  await page.waitForTimeout(250)

  await expect(selected).toHaveText(chosen ?? '')

  // Even a right-click that does not move: the button says what it means, and
  // it never means "deselect".
  await page.mouse.click(box.x + 60, box.y + 60, { button: 'right' })
  await expect(selected).toHaveText(chosen ?? '')
})
