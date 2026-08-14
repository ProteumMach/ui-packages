import { describe, expect, it } from 'vitest'
import { TAP_SLOP, movedFar } from '../src/render/tap.js'

/**
 * The whole distinction the viewport rests on: a press that ends where it
 * started is a click on a face, and one that travelled is the end of an orbit.
 */
describe('movedFar', () => {
  const at = (clientX: number, clientY: number) => ({ clientX, clientY })

  it('lets a hand shake without turning a click into a drag', () => {
    expect(movedFar(at(100, 100), at(102, 101))).toBe(false)
  })

  it('calls a real drag a drag, in any direction', () => {
    expect(movedFar(at(100, 100), at(140, 100))).toBe(true)
    expect(movedFar(at(100, 100), at(100, 60))).toBe(true)
    expect(movedFar(at(100, 100), at(70, 70))).toBe(true)
  })

  it('measures the distance rather than either axis', () => {
    // Three pixels each way is more than four pixels of travel, and a slop that
    // compared axes separately would call this a click.
    expect(movedFar(at(0, 0), at(3, 3))).toBe(true)
    expect(TAP_SLOP).toBeGreaterThan(0)
  })
})
