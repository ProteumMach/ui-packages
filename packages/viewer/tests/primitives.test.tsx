import { describe, expect, it } from 'vitest'
import { OrientationCube } from '../src/primitives.js'

describe('OrientationCube', () => {
  it('uses Drei HUD priority 1 so it renders the main viewer scene before the overlay', () => {
    const element = OrientationCube({})
    expect(element.props.renderPriority).toBeUndefined()
  })
})
